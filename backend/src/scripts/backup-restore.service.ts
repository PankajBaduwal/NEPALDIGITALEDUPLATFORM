import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface BackupCollectionManifest {
  name: string;
  documentCount: number;
  sha256: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface BackupManifest {
  version: string;
  timestamp: string;
  sourceDatabase: string;
  totalCollections: number;
  totalDocuments: number;
  collections: BackupCollectionManifest[];
}

export class BackupRestoreService {
  /**
   * Exports all collections from the active database to a timestamped backup directory.
   */
  static async exportBackup(outputDir?: string): Promise<{ backupDir: string; manifest: BackupManifest }> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = outputDir || path.resolve(process.cwd(), 'backups', `snapshot-${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });

    const collections = await db.listCollections().toArray();
    const manifestCollections: BackupCollectionManifest[] = [];
    let totalDocs = 0;

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Skip system collections
      if (colName.startsWith('system.')) continue;

      const col = db.collection(colName);
      const docs = await col.find({}).toArray();
      const docCount = docs.length;
      totalDocs += docCount;

      const jsonContent = JSON.stringify(docs, null, 2);
      // Case-insensitive filesystem safe naming (Windows/macOS)
      const colHash = crypto.createHash('md5').update(colName).digest('hex').substring(0, 8);
      const fileName = `${colName.toLowerCase()}_${colHash}.json`;
      const filePath = path.join(backupDir, fileName);

      fs.writeFileSync(filePath, jsonContent, 'utf-8');

      const fileBuffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const stats = fs.statSync(filePath);

      manifestCollections.push({
        name: colName,
        documentCount: docCount,
        sha256: hash,
        fileName,
        fileSizeBytes: stats.size,
      });
    }

    const manifest: BackupManifest = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      sourceDatabase: db.databaseName,
      totalCollections: manifestCollections.length,
      totalDocuments: totalDocs,
      collections: manifestCollections,
    };

    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

    return { backupDir, manifest };
  }

  /**
   * Safely restores a snapshot into an isolated test namespace to verify backup integrity.
   * Completely preserves the live database by operating solely on targetDbName.
   */
  static async restoreToTestNamespace(
    backupDir: string,
    targetDbName = 'nepal_edu_ecosystem_recovery_test',
    mongoUri = 'mongodb://localhost:27017'
  ): Promise<{
    success: boolean;
    collectionsRestored: number;
    documentsRestored: number;
    verifiedCollections: { name: string; expectedCount: number; restoredCount: number; match: boolean }[];
  }> {
    const manifestPath = path.join(backupDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Backup manifest not found at ${manifestPath}`);
    }

    const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Create separate connection for the recovery namespace
    const recoveryConn = await mongoose.createConnection(`${mongoUri}/${targetDbName}`).asPromise();
    const targetDb = recoveryConn.db;
    if (!targetDb) {
      throw new Error('Recovery DB connection could not be established');
    }

    // Clear any previous test artifacts in the recovery namespace
    const existingCollections = await targetDb.listCollections().toArray();
    for (const ec of existingCollections) {
      if (!ec.name.startsWith('system.')) {
        await targetDb.collection(ec.name).drop();
      }
    }

    let docsRestoredTotal = 0;
    const verificationResults: {
      name: string;
      expectedCount: number;
      restoredCount: number;
      match: boolean;
    }[] = [];

    for (const colEntry of manifest.collections) {
      const colFilePath = path.join(backupDir, colEntry.fileName);
      if (!fs.existsSync(colFilePath)) {
        throw new Error(`Collection file missing: ${colEntry.fileName}`);
      }

      const fileBuffer = fs.readFileSync(colFilePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      if (fileHash !== colEntry.sha256) {
        throw new Error(
          `SHA-256 Checksum mismatch for ${colEntry.fileName}: expected ${colEntry.sha256}, got ${fileHash}`
        );
      }

      const fileContent = fileBuffer.toString('utf-8');
      const docs: any[] = JSON.parse(fileContent);
      const targetCol = targetDb.collection(colEntry.name);

      if (docs.length > 0) {
        // Convert string $oid to ObjectId if needed
        await targetCol.insertMany(docs);
      }

      const countInTarget = await targetCol.countDocuments();
      docsRestoredTotal += countInTarget;

      verificationResults.push({
        name: colEntry.name,
        expectedCount: colEntry.documentCount,
        restoredCount: countInTarget,
        match: countInTarget === colEntry.documentCount,
      });
    }

    // Drop the recovery database after validation to leave no clutter
    await targetDb.dropDatabase();
    await recoveryConn.close();

    const allMatched = verificationResults.every((v) => v.match);

    return {
      success: allMatched,
      collectionsRestored: manifest.collections.length,
      documentsRestored: docsRestoredTotal,
      verifiedCollections: verificationResults,
    };
  }
}
