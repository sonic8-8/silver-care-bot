import type { ApiResponse, ErrorResponse } from '@/shared/types';

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

export const isApiResponse = <T>(response: ApiResponse<T> | ErrorResponse): response is ApiResponse<T> => {
    return response.success === true;
};

export const isErrorResponse = <T>(response: ApiResponse<T> | ErrorResponse): response is ErrorResponse => {
    return response.success === false;
};

export const unwrapApiResponse = <T>(response: ApiResponse<T> | ErrorResponse): T => {
    if (isApiResponse(response)) {
        return response.data;
    }
    throw new ApiError(response.error);
};
