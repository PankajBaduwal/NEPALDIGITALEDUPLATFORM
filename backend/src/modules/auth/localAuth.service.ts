/**
 * LocalAuthService — Demo account authentication using a local JSON file.
 *
 * Used as a fallback when MongoDB is unavailable (no MONGODB_URI configured
 * or connection fails). All demo accounts are stored in:
 *   src/data/localDemoAccounts.json
 *
 * Passwords are bcrypt-hashed. In development, the DEMO_MODE blanket passwords
 * also work (Nepal@1234, Password123!, etc.)
 */

import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { TokenUtil } from '../../common/utils/token.util';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DemoInstitution {
  id: string;
  emisCode: string;
  name: string;
  nameNepali?: string;
  type: string;
  province: string;
  district: string;
  localLevel: string;
  ward?: number;
  address?: string;
  email?: string;
  phone?: string;
  status: string;
}

interface DemoUser {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  role: string;
  fullName: string;
  fullNameNepali?: string;
  phone?: string;
  institutionId: string | null;
  status: string;
  demoPassword?: string;
}

interface DemoData {
  institution: DemoInstitution;
  users: DemoUser[];
}

// ─── Blanket demo passwords accepted in development ──────────────────────────

const DEMO_PASSWORDS = [
  'Nepal@1234',
  'Nepal@123',
  'NepalSuperAdmin@2081',
  'DemoPass123!',
  'Password123!',
  'password',
  '123456',
  'admin',
  'admin123',
  'nepal123',
];

const USERNAME_ALIASES: Record<string, string> = {
  admin: 'school_admin',
  dhambojhi_admin: 'school_admin',
  admin_kmss: 'school_admin',
  principal: 'principal',
  dhambojhi_principal: 'principal',
  principal_kmss: 'principal',
  dhambojhi_t_01: 'teacher_bishnu',
  dhambojhi_t_15: 'teacher_bishnu',
  dhambojhi_t_17: 'teacher_bishnu',
  dhambojhi_t_29: 'teacher_sarita',
  dhambojhi_t_30: 'teacher_sarita',
  teacher_ramesh: 'teacher_bishnu',
  teacher_sita: 'teacher_sarita',
  teacher: 'teacher_bishnu',
  dhambojhi_s_002: 'student_aarav',
  dhambojhi_s_003: 'student_priya',
  dhambojhi_s_163: 'student_aarav',
  student_aarav: 'student_aarav',
  student: 'student_aarav',
  superadmin: 'superadmin',
  super_admin: 'superadmin',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFilePath(): string {
  // Support both src/data and dist/data or direct relative resolution
  const candidates = [
    path.resolve(__dirname, '../../data/localDemoAccounts.json'),
    path.resolve(process.cwd(), 'src/data/localDemoAccounts.json'),
    path.resolve(process.cwd(), 'data/localDemoAccounts.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function loadDemoData(): DemoData {
  const filePath = getFilePath();
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as DemoData;
}

function buildUserSession(user: DemoUser, institution: DemoInstitution | null) {
  return {
    id: user.id,
    username: user.username,
    role: user.role as any,
    fullName: user.fullName,
    fullNameNepali: user.fullNameNepali,
    email: user.email,
    phone: user.phone,
    institutionId: user.institutionId ?? undefined,
    institutionName: institution?.name,
    institutionCode: institution?.emisCode,
    isDemo: true,
    activePackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
  };
}

function signToken(user: DemoUser) {
  return TokenUtil.sign({
    userId: user.id,
    username: user.username,
    role: user.role as any,
    institutionId: user.institutionId ?? undefined,
  });
}

// ─── LocalAuthService ─────────────────────────────────────────────────────────

export class LocalAuthService {
  /**
   * Returns true when local demo data is available (file exists and is readable).
   */
  static isAvailable(): boolean {
    try {
      const filePath = getFilePath();
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Authenticate with username + password against local demo accounts.
   */
  static async login(identifier: string, password: string) {
    const { users, institution } = loadDemoData();

    // Case-insensitive match on username, email, fullName, or alias
    const id = identifier.trim().toLowerCase();
    const resolvedUsername = USERNAME_ALIASES[id] || id;

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === resolvedUsername.toLowerCase() ||
        u.username.toLowerCase() === id ||
        (u.email && u.email.toLowerCase() === id) ||
        u.fullName.toLowerCase() === id
    );

    if (!user) {
      throw { status: 401, message: 'Invalid credentials. User not found in demo accounts.', code: 'INVALID_CREDENTIALS' };
    }

    if (user.status !== 'ACTIVE') {
      throw { status: 403, message: 'Account is inactive.', code: 'ACCOUNT_INACTIVE' };
    }

    // Verify password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } catch {
      isMatch = false;
    }

    // Also accept blanket demo passwords
    if (!isMatch && DEMO_PASSWORDS.includes(password.trim())) {
      isMatch = true;
    }

    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials. Password did not match.', code: 'INVALID_CREDENTIALS' };
    }

    const inst = user.institutionId ? institution : null;
    const userSession = buildUserSession(user, inst);
    const token = signToken(user);

    return { token, accessToken: token, user: userSession };
  }

  /**
   * Demo login by role — returns first matching user for the given role.
   */
  static async demoLogin(requestedRole: string) {
    const { users, institution } = loadDemoData();

    const roleMap: Record<string, string[]> = {
      SUPER_ADMIN: ['superadmin'],
      SCHOOL_ADMIN: ['school_admin'],
      PRINCIPAL: ['principal'],
      CLASS_TEACHER: ['teacher_bishnu'],
      HOD: ['teacher_sarita'],
      TEACHER: ['teacher_bishnu', 'teacher_sarita'],
      STUDENT: ['student_aarav', 'student_priya'],
    };

    const roleKey = requestedRole.toUpperCase();
    const candidates = roleMap[roleKey] || [];

    let user: DemoUser | undefined;

    // Check alias first
    const resolvedFromAlias = USERNAME_ALIASES[requestedRole.toLowerCase()];
    if (resolvedFromAlias) {
      user = users.find((u) => u.username === resolvedFromAlias);
    }

    // 1. Try to find by username directly
    if (!user) {
      user = users.find((u) => u.username === requestedRole);
    }

    // 2. Try candidates list
    if (!user) {
      for (const candidate of candidates) {
        user = users.find((u) => u.username === candidate);
        if (user) break;
      }
    }

    // 3. Fall back to any user with matching role
    if (!user) {
      user = users.find((u) => u.role === roleKey);
    }

    if (!user) {
      throw { status: 404, message: `No demo account found for role: ${requestedRole}`, code: 'DEMO_USER_NOT_FOUND' };
    }

    const inst = user.institutionId ? institution : null;
    const userSession = buildUserSession(user, inst);
    const token = signToken(user);

    return { token, accessToken: token, user: userSession };
  }

  /**
   * Get user profile by ID for /auth/me
   */
  static getMe(userId: string) {
    const { users, institution } = loadDemoData();
    const user = users.find((u) => u.id === userId || u.username === userId);
    if (!user) {
      throw { status: 404, message: 'User not found in demo accounts', code: 'USER_NOT_FOUND' };
    }
    const inst = user.institutionId ? institution : null;
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      fullNameNepali: user.fullNameNepali,
      email: user.email,
      role: user.role,
      phone: user.phone,
      institutionId: user.institutionId ?? undefined,
      institution: inst
        ? {
            id: inst.id,
            emisCode: inst.emisCode,
            name: inst.name,
            nameNepali: inst.nameNepali,
            type: inst.type,
            status: inst.status,
            activePackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
          }
        : null,
      isDemo: true,
      activePackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
    };
  }

  /**
   * Returns all demo users (without passwordHash) for display.
   */
  static listAccounts() {
    const { users, institution } = loadDemoData();
    return {
      institution,
      users: users.map(({ passwordHash: _ph, ...u }) => u),
    };
  }
}
