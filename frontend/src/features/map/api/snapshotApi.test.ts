import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import { getPatrolSnapshots, isSnapshotDependencyFallbackError } from './snapshotApi';

vi.mock('@/shared/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('snapshotApi', () => {
    const getMock = vi.mocked(api.get);

    beforeEach(() => {
        getMock.mockReset();
    });

    it('supports object payload and sorts snapshots by capturedAt desc', async () => {
        getMock.mockResolvedValue({
            data: {
                success: true,
                data: {
                    snapshots: [
                        {
                            id: 2,
                            imageUrl: 'https://example.com/2.jpg',
                            capturedAt: '2026-02-07T09:31:00+09:00',
                        },
                        {
                            id: 1,
                            imageUrl: 'https://example.com/1.jpg',
                            capturedAt: '2026-02-07T09:35:00+09:00',
                        },
                    ],
                },
                timestamp: '2026-02-07T10:00:00+09:00',
            },
        });

        const result = await getPatrolSnapshots('patrol-20260207-0930');

        expect(result.patrolId).toBe('patrol-20260207-0930');
        expect(result.snapshots.map((item) => item.id)).toEqual(['1', '2']);
    });

    it('returns empty snapshots when dependency endpoint is not ready', async () => {
        getMock.mockRejectedValue({
            isAxiosError: true,
            response: { status: 501 },
        });

        const result = await getPatrolSnapshots('patrol-missing');

        expect(result).toEqual({
            patrolId: 'patrol-missing',
            snapshots: [],
        });
    });

    it('allows fallback only for 404 and 501', () => {
        expect(isSnapshotDependencyFallbackError({ isAxiosError: true, response: { status: 404 } })).toBe(true);
        expect(isSnapshotDependencyFallbackError({ isAxiosError: true, response: { status: 501 } })).toBe(true);
        expect(isSnapshotDependencyFallbackError({ isAxiosError: true, response: { status: 400 } })).toBe(false);
        expect(isSnapshotDependencyFallbackError(new Error('network'))).toBe(false);
    });
});
