import { describe, expect, it } from 'vitest';
import { toLocalDateInputValue } from './date';

describe('toLocalDateInputValue', () => {
    it('formats date in yyyy-mm-dd using local date parts', () => {
        const date = new Date(2026, 1, 6, 9, 30);
        expect(toLocalDateInputValue(date)).toBe('2026-02-06');
    });

    it('handles UTC boundary input using local timezone date components', () => {
        const utcBoundaryDate = new Date('2026-02-06T23:30:00.000Z');
        const expected = `${utcBoundaryDate.getFullYear()}-${String(utcBoundaryDate.getMonth() + 1).padStart(2, '0')}-${String(utcBoundaryDate.getDate()).padStart(2, '0')}`;

        expect(toLocalDateInputValue(utcBoundaryDate)).toBe(expected);
    });

    it('does not depend on toISOString', () => {
        const fakeDate = {
            getFullYear: () => 2026,
            getMonth: () => 1,
            getDate: () => 7,
            toISOString: () => {
                throw new Error('toISOString must not be used');
            },
        } as unknown as Date;

        expect(toLocalDateInputValue(fakeDate)).toBe('2026-02-07');
    });
});
