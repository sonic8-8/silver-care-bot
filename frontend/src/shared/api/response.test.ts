import { describe, expect, it } from 'vitest';
import { ApiError, isApiResponse, isErrorResponse, unwrapApiResponse } from './response';
import type { ApiResponse, ErrorResponse } from '@/shared/types';

describe('api response helpers', () => {
    it('detects success responses', () => {
        const response: ApiResponse<{ id: number }> = {
            success: true,
            data: { id: 1 },
            timestamp: '2026-02-03T09:00:00+09:00',
        };

        expect(isApiResponse(response)).toBe(true);
        expect(isErrorResponse(response)).toBe(false);
    });

    it('detects error responses', () => {
        const response: ErrorResponse = {
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            },
            timestamp: '2026-02-03T09:00:00+09:00',
        };

        expect(isApiResponse(response)).toBe(false);
        expect(isErrorResponse(response)).toBe(true);
    });

    it('unwraps data from success responses', () => {
        const response: ApiResponse<{ name: string }> = {
            success: true,
            data: { name: 'silver' },
            timestamp: '2026-02-03T09:00:00+09:00',
        };

        expect(unwrapApiResponse(response)).toEqual({ name: 'silver' });
    });

    it('throws ApiError for error responses', () => {
        const response: ErrorResponse = {
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Access denied',
                details: { reason: 'role' },
            },
            timestamp: '2026-02-03T09:00:00+09:00',
        };

        expect(() => unwrapApiResponse(response)).toThrow(ApiError);
        try {
            unwrapApiResponse(response);
        } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.code).toBe('FORBIDDEN');
            expect(apiError.details).toEqual({ reason: 'role' });
        }
    });
});
