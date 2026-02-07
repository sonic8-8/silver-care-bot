import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
    formatDate,
    getWeekEndDate,
    isHistoryDependencyFallbackError,
    parseLocalDateString,
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

    it('parses YYYY-MM-DD as local date without timezone offset shift', () => {
        const parsed = parseLocalDateString('2026-02-08');
        expect(parsed).not.toBeNull();
        expect(formatDate(parsed as Date)).toBe('2026-02-08');
    });

    it('calculates week end date from local week start date', () => {
        expect(getWeekEndDate('2026-02-02')).toBe('2026-02-08');
    });

    it('keeps local date/weekly range under UTC-negative timezone regression scenario', () => {
        const script = `
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
};
const parseLocalDateString = (dateString) => {
  const matched = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dateString);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }
  return parsed;
};
const parsed = parseLocalDateString('2026-02-08');
const weekStart = parseLocalDateString('2026-02-02');
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);
process.stdout.write(JSON.stringify({
  parsed: formatDate(parsed),
  weekEnd: formatDate(weekEnd),
  native: formatDate(new Date('2026-02-08'))
}));
`;
        const output = execFileSync(process.execPath, ['-e', script], {
            env: {
                ...process.env,
                TZ: 'America/Los_Angeles',
            },
        }).toString();
        const result = JSON.parse(output) as {
            parsed: string;
            weekEnd: string;
            native: string;
        };

        expect(result.parsed).toBe('2026-02-08');
        expect(result.weekEnd).toBe('2026-02-08');
        expect(result.native).toBe('2026-02-07');
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
