/** Error type used by the Virtual Lab service (carries an HTTP status for the platform's error middleware). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(message = 'The request could not be processed.', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static forbidden(message = 'You do not have permission to do this.') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
}
