import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import { updateSchedule } from './scheduleApi';

vi.mock('@/shared/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('scheduleApi', () => {
    const putMock = vi.mocked(api.put);

    beforeEach(() => {
        putMock.mockReset();
    });

    it('keeps nullable fields when updating schedule and strips only undefined', async () => {
        putMock.mockResolvedValue({
            data: {
                success: true,
                data: {
                    id: 17,
                    elderId: 1,
                    title: '수정 일정',
                    scheduledAt: '2026-02-10T09:00:00',
                    type: 'OTHER',
                    source: 'MANUAL',
                    status: 'UPCOMING',
                    description: null,
                    location: null,
                    remindBeforeMinutes: null,
                },
                timestamp: '2026-02-07T16:30:00+09:00',
            },
        });

        await updateSchedule(1, 17, {
            title: undefined,
            description: null,
            location: null,
            remindBeforeMinutes: null,
        });

        expect(putMock).toHaveBeenCalledWith('/elders/1/schedules/17', {
            description: null,
            location: null,
            remindBeforeMinutes: null,
        });
    });
});
