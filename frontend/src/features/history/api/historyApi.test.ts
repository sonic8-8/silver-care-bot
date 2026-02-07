import { describe, expect, it } from 'vitest';
import {
    formatDate,
    isHistoryDependencyFallbackError,
    toWeekStartDate,
} from './historyApi';

describe('historyApi helpers', () => {
    it('formats date as YYYY-MM-DD', () => {
        const date = new Date(2026, 1, 8);
        expect(formatDate(date)).toBe('2026-02-08');
    });

    it('resolves monday as week start date', () => {
        const sunday = new Date(2026, 1, 8);
        const monday = toWeekStartDate(sunday);

        expect(formatDate(monday)).toBe('2026-02-02');
    });

    it('allows fallback only for 404 and 501', () => {
        const error404 = { isAxiosError: true, response: { status: 404 } };
        const error501 = { isAxiosError: true, response: { status: 501 } };
        const error403 = { isAxiosError: true, response: { status: 403 } };

        expect(isHistoryDependencyFallbackError(error404)).toBe(true);
        expect(isHistoryDependencyFallbackError(error501)).toBe(true);
        expect(isHistoryDependencyFallbackError(error403)).toBe(false);
        expect(isHistoryDependencyFallbackError(new Error('network'))).toBe(false);
    });
});
