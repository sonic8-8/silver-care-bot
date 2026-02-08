import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { useEmergency as useEmergencyHook } from '@/features/emergency/hooks/useEmergency';
import type { EmergencyDetail } from '@/shared/types';

const { useEmergencyMock, getContactsMock } = vi.hoisted(() => ({
    useEmergencyMock: vi.fn(),
    getContactsMock: vi.fn(),
}));

vi.mock('@/features/emergency/hooks/useEmergency', () => ({
    useEmergency: useEmergencyMock,
}));

vi.mock('@/features/elder/api/elderApi', () => ({
    getContacts: getContactsMock,
}));

vi.mock('@/features/emergency/components/EmergencyAlert', () => ({
    EmergencyAlert: () => <div>긴급 알림 카드</div>,
}));

vi.mock('@/features/emergency/components/ResolveDialog', () => ({
    ResolveDialog: ({ open }: { open: boolean }) => (open ? <div>해제 다이얼로그</div> : null),
}));

import EmergencyScreen from './EmergencyScreen';

type UseEmergencyResult = ReturnType<typeof useEmergencyHook>;

const baseEmergencyDetail: EmergencyDetail = {
    emergencyId: 1,
    elderId: 7,
    robotId: 1,
    type: 'FALL_DETECTED',
    location: '거실',
    confidence: 0.92,
    resolution: 'PENDING',
    note: null,
    detectedAt: '2026-01-29T10:23:00+09:00',
    resolvedAt: null,
};

const createHookResult = (
    overrides: Partial<UseEmergencyResult> = {}
): UseEmergencyResult =>
    ({
        detailQuery: {
            data: baseEmergencyDetail,
            isLoading: false,
            isError: false,
            ...overrides.detailQuery,
        },
        resolveMutation: {
            isPending: false,
            mutate: vi.fn(),
            ...overrides.resolveMutation,
        },
        ...overrides,
    }) as unknown as UseEmergencyResult;

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/emergency/1']}>
                <Routes>
                    <Route path="/emergency/:id" element={children} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('EmergencyScreen', () => {
    beforeEach(() => {
        useEmergencyMock.mockReset();
        getContactsMock.mockReset();
        useEmergencyMock.mockReturnValue(createHookResult());
    });

    it('renders emergency contacts with call links', async () => {
        getContactsMock.mockResolvedValue([
            { id: 1, name: '김보호자', phone: '010-1111-2222', relation: '딸' },
            { id: 2, name: '이복지사', phone: '010-2222-3333', relation: '복지사' },
        ]);

        render(<EmergencyScreen />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(getContactsMock).toHaveBeenCalledWith(7);
        });

        await waitFor(() => {
            expect(screen.getByText('김보호자')).toBeInTheDocument();
        });
        expect(screen.getByText('이복지사')).toBeInTheDocument();
        const links = screen.getAllByRole('link', { name: '전화하기' });
        expect(links[0]).toHaveAttribute('href', 'tel:01011112222');
        expect(links[1]).toHaveAttribute('href', 'tel:01022223333');
    });

    it('renders empty state when no emergency contacts exist', async () => {
        getContactsMock.mockResolvedValue([]);

        render(<EmergencyScreen />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('등록된 긴급 연락처가 없습니다.')).toBeInTheDocument();
        });
    });

    it('renders error state when contact fetch fails', async () => {
        getContactsMock.mockRejectedValue(new Error('network error'));

        render(<EmergencyScreen />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText('연락처를 불러오지 못했습니다.')).toBeInTheDocument();
        });
    });
});
