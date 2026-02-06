import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import { useEmergency } from './useEmergency';
import * as emergencyApi from '../api/emergencyApi';
import type { EmergencyDetail } from '@/shared/types';

vi.mock('../api/emergencyApi', () => ({
    getEmergency: vi.fn(),
    resolveEmergency: vi.fn(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useEmergency', () => {
    it('fetches emergency detail', async () => {
        const payload: EmergencyDetail = {
            emergencyId: 1,
            elderId: 1,
            robotId: 1,
            type: 'FALL_DETECTED',
            location: '거실',
            confidence: 0.92,
            resolution: 'PENDING',
            note: null,
            detectedAt: '2026-01-29T10:23:00+09:00',
            resolvedAt: null,
        };

        const getEmergencyMock = emergencyApi.getEmergency as Mock;
        getEmergencyMock.mockResolvedValue(payload);

        const { result } = renderHook(() => useEmergency(1), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.detailQuery.isSuccess).toBe(true));
        expect(result.current.detailQuery.data).toEqual(payload);
    });
});
