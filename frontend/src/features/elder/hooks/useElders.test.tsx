import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import { useElders } from './useElders';
import * as elderApi from '../api/elderApi';
import type { ElderListPayload } from '@/shared/types';

vi.mock('../api/elderApi', () => ({
    getElders: vi.fn(),
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

describe('useElders', () => {
    it('fetches elders list', async () => {
        const payload: ElderListPayload = {
            elders: [
                {
                    id: 1,
                    name: '김옥분',
                    age: 80,
                    status: 'SAFE',
                    lastActivity: '2026-01-29T10:23:00+09:00',
                    location: '거실',
                    robotConnected: true,
                },
            ],
            summary: {
                total: 1,
                safe: 1,
                warning: 0,
                danger: 0,
            },
        };

        const getEldersMock = elderApi.getElders as Mock;
        getEldersMock.mockResolvedValue(payload);

        const { result } = renderHook(() => useElders(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(payload);
    });
});
