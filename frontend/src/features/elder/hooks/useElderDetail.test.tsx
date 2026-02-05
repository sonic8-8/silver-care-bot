import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';

import { useElderDetail } from './useElderDetail';
import * as elderApi from '../api/elderApi';
import type { ElderDetail } from '@/shared/types';

vi.mock('../api/elderApi', () => ({
    getElderDetail: vi.fn(),
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

describe('useElderDetail', () => {
    it('fetches elder detail', async () => {
        const payload: ElderDetail = {
            id: 1,
            name: '김옥분',
            age: 80,
            status: 'SAFE',
            lastActivity: '2026-01-29T10:23:00+09:00',
        };

        const getElderDetailMock = elderApi.getElderDetail as Mock;
        getElderDetailMock.mockResolvedValue(payload);

        const { result } = renderHook(() => useElderDetail(1), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(payload);
        expect(getElderDetailMock).toHaveBeenCalledWith(1);
    });
});
