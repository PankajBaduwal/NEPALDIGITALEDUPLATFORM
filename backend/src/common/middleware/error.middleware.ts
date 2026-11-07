import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled Application Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred';
  const code = err.code || 'INTERNAL_ERROR';

  return ApiResponse.error(res, message, statusCode, code, err.details ?? (process.env.NODE_ENV === 'development' ? err.stack : undefined));
}

