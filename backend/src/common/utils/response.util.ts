import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null,
    });
  }

  static error(res: Response, message = 'Internal server error', statusCode = 500, errorCode = 'SERVER_ERROR', details: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: {
        code: errorCode,
        details,
      },
    });
  }
}

