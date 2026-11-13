/** Every failure from the API layer is an ApiError, so the UI handles one error shape. */
export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // HTTP status, or 0 when no response was received
    this.details = details; // parsed JSON body from the server, if any
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** DRF reports problems as { "detail": "..." }; field errors have other shapes. */
  static fromResponse(status, payload) {
    const detail = payload && typeof payload === 'object' ? payload.detail : null;
    const message = typeof detail === 'string' ? detail : `The server responded with an error (${status}).`;
    return new ApiError(message, { status, details: payload });
  }

  static unreachable(reason) {
    return new ApiError(reason);
  }
}

export const isAbortError = (error) => error?.name === 'AbortError';
