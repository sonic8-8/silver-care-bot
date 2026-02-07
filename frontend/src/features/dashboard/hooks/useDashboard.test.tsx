import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryClientWrapper } from '@/test/utils';
import type { DashboardData } from '../types';
import { useDashboard } from './useDashboard';
import { getDashboardData } from '../api/dashboardApi';

vi.mock('../api/dashboardApi', () => ({
    getDashboardData: vi.fn(),
}));

const mockedGetDashboardData = vi.mocked(getDashboardData);

describe('useDashboard', () => {
    beforeEach(() => {
        mockedGetDashboardData.mockReset();
    });

    it('fetches dashboard data successfully', async () => {
        const dashboardData: DashboardData = {
            elderName: '김옥분',
            todaySummary: {
                wakeUpTime: '07:30',
                medicationStatus: {
                    taken: 1,
                    total: 2,
                },
                activityLevel: 'NORMAL',
            },
            recentNotifications: [],
            weeklyCalendar: [],
            robotStatus: {
                id: 1,
                batteryLevel: 85,
                networkStatus: 'CONNECTED',
                currentLocation: '거실',
            },
            latestPatrol: null,
        };

        mockedGetDashboardData.mockResolvedValue(dashboardData);

        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useDashboard(1), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedGetDashboardData).toHaveBeenCalledWith(1);
        expect(result.current.data?.elderName).toBe('김옥분');
    });

    it('does not run query when elder id is missing', () => {
        const wrapper = createQueryClientWrapper();
        renderHook(() => useDashboard(undefined), { wrapper });

        expect(mockedGetDashboardData).not.toHaveBeenCalled();
    });
});
