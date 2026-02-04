export type ErrorCode =
    | 'INVALID_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'INTERNAL_ERROR';

export interface ApiResponse<T> {
    success: true;
    data: T | null;
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        code: ErrorCode | string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ErrorResponse;
