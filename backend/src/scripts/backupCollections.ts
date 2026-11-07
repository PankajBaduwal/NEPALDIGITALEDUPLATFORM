/** JSON (Extended JSON) backup of selected collections, for use where mongodump is unavailable. */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { EJSON } from 'bson';
import { connectDB, disconnectDB } from '../config/db';

const names = process.argv.slice(2);
(async () => {
  await connectDB();
  const dir = path.resolve(process.cwd(), 'backups', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(dir, { recursive: true });
  for (const n of names) {
    const docs = await mongoose.connection.db!.collection(n).find().toArray();
    fs.writeFileSync(path.join(dir, `${n}.json`), EJSON.stringify(docs, undefined, 0, { relaxed: false }));
    console.log(`${n}: ${docs.length}`);
  }
  console.log(`Backup written to ${dir}`);
  await disconnectDB();
})();
