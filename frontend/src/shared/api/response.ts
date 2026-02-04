import type { ApiResponse, ApiResult, ErrorResponse } from '@/shared/types';

export class ApiError extends Error {
    code: string;
    details?: unknown;

    constructor(error: ErrorResponse['error']) {
        super(error.message);
        this.name = 'ApiError';
        this.code = error.code;
        this.details = error.details;
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const hasValidTimestamp = (value: unknown): value is string => {
    return typeof value === 'string';
};

const isErrorPayload = (value: unknown): value is ErrorResponse['error'] => {
    return (
        isRecord(value)
        && typeof value.code === 'string'
        && typeof value.message === 'string'
    );
};

export const isApiResult = (response: unknown): response is ApiResult<unknown> => {
    if (!isRecord(response) || typeof response.success !== 'boolean' || !hasValidTimestamp(response.timestamp)) {
        return false;
    }

    if (response.success === true) {
        return 'data' in response;
    }

    return isErrorPayload(response.error);
};

export const isApiResponse = <T>(response: ApiResult<T>): response is ApiResponse<T> => {
    return response.success === true;
};

export const isErrorResponse = <T>(response: ApiResult<T>): response is ErrorResponse => {
    return response.success === false;
};

export const unwrapApiResponse = <T>(response: ApiResult<T>): T | null => {
    if (isApiResponse(response)) {
        return response.data;
    }
    throw new ApiError(response.error);
};
