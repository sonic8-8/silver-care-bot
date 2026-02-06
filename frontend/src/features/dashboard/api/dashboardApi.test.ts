import { describe, expect, it } from 'vitest';
import { isDependencyFallbackError, selectRecentNotifications } from './dashboardApi';

describe('dashboardApi helpers', () => {
    it('sorts notifications by createdAt desc and returns latest 5', () => {
        const notifications = [
            { id: 1, createdAt: '2026-02-06T08:00:00+09:00' },
            { id: 2, createdAt: '2026-02-06T08:15:00+09:00' },
            { id: 3, createdAt: '2026-02-06T07:59:00+09:00' },
            { id: 4, createdAt: '2026-02-06T08:05:00+09:00' },
            { id: 5, createdAt: '2026-02-06T08:10:00+09:00' },
            { id: 6, createdAt: '2026-02-06T08:20:00+09:00' },
        ].map((item) => ({
            ...item,
            type: 'SYSTEM' as const,
            title: `알림-${item.id}`,
            message: '테스트',
            isRead: false,
        }));

        const result = selectRecentNotifications(notifications);

        expect(result.map((item) => item.id)).toEqual([6, 2, 5, 4, 1]);
    });

    it('allows fallback only for 404 and 501', () => {
        const error404 = { isAxiosError: true, response: { status: 404 } };
        const error501 = { isAxiosError: true, response: { status: 501 } };
        const error401 = { isAxiosError: true, response: { status: 401 } };
        const error500 = { isAxiosError: true, response: { status: 500 } };
        const networkError = { isAxiosError: true };

        expect(isDependencyFallbackError(error404)).toBe(true);
        expect(isDependencyFallbackError(error501)).toBe(true);

        expect(isDependencyFallbackError(error401)).toBe(false);
        expect(isDependencyFallbackError(error500)).toBe(false);
        expect(isDependencyFallbackError(networkError)).toBe(false);
        expect(isDependencyFallbackError(new Error('unknown'))).toBe(false);
    });
});
