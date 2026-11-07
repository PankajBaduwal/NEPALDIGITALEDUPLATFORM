import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  institutionId?: string | null;
  isDemo?: boolean;
  /** Set when a Super Admin is viewing the platform as this user. */
  impersonatedBy?: string;
  impersonatedByUsername?: string;
}

export class TokenUtil {
  static sign(payload: TokenPayload, expiresIn: string = ENV.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn } as jwt.SignOptions);
  }

  static verify(token: string): TokenPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  }
}

