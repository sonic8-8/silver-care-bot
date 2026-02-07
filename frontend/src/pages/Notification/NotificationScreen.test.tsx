import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { useNotifications as useNotificationsHook } from '@/features/notification/hooks/useNotifications';

const { useNotificationsMock } = vi.hoisted(() => ({
    useNotificationsMock: vi.fn(),
}));

vi.mock('@/features/notification/hooks/useNotifications', () => ({
    useNotifications: useNotificationsMock,
}));

vi.mock('@/pages/_components/GuardianAppContainer', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import NotificationScreen from './NotificationScreen';

type UseNotificationsResult = ReturnType<typeof useNotificationsHook>;

const createListQuery = (
    overrides: Partial<UseNotificationsResult['listQuery']> = {}
): UseNotificationsResult['listQuery'] =>
    ({
        hasNextPage: true,
        isFetchingNextPage: false,
        isLoading: false,
        isError: false,
        fetchNextPage: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    }) as unknown as UseNotificationsResult['listQuery'];

const createHookResult = (
    overrides: Partial<UseNotificationsResult> = {}
): UseNotificationsResult =>
    ({
        listQuery: createListQuery(),
        notifications: [],
        markAsRead: vi.fn().mockResolvedValue(undefined),
        markAllAsRead: vi.fn().mockResolvedValue(undefined),
        isMarkingRead: false,
        isMarkingAllRead: false,
        ...overrides,
    }) as UseNotificationsResult;

const renderScreen = () =>
    render(
        <MemoryRouter>
            <NotificationScreen />
        </MemoryRouter>
    );

type Deferred = {
    promise: Promise<void>;
    resolve: () => void;
};

const createDeferred = (): Deferred => {
    let resolve!: () => void;
    const promise = new Promise<void>((resolver) => {
        resolve = resolver;
    });
    return { promise, resolve };
};

describe('NotificationScreen', () => {
    let intersectionCallback: IntersectionObserverCallback | null = null;

    beforeEach(() => {
        intersectionCallback = null;
        useNotificationsMock.mockReset();
        class IntersectionObserverMock implements IntersectionObserver {
            readonly root = null;
            readonly rootMargin = '';
            readonly thresholds = [];

            constructor(callback: IntersectionObserverCallback) {
                intersectionCallback = callback;
            }

            disconnect = vi.fn();

            observe = vi.fn();

            takeRecords = vi.fn(() => []);

            unobserve = vi.fn();
        }

        vi.stubGlobal(
            'IntersectionObserver',
            IntersectionObserverMock
        );
    });

    it('loads next page when observer target intersects viewport', async () => {
        const fetchNextPage = vi.fn().mockResolvedValue(undefined);
        useNotificationsMock.mockReturnValue(
            createHookResult({
                listQuery: createListQuery({ fetchNextPage }),
            })
        );

        renderScreen();

        intersectionCallback?.(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        );

        await waitFor(() => {
            expect(fetchNextPage).toHaveBeenCalledTimes(1);
        });
    });

    it('prevents duplicated fetch when manual load and observer trigger overlap', async () => {
        const deferred = createDeferred();
        const fetchNextPage = vi.fn().mockImplementation(
            () => deferred.promise
        );

        useNotificationsMock.mockReturnValue(
            createHookResult({
                listQuery: createListQuery({ fetchNextPage }),
            })
        );

        renderScreen();
        fireEvent.click(screen.getByRole('button', { name: '더 보기' }));

        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        intersectionCallback?.(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        );

        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        deferred.resolve();
        await waitFor(() => {
            expect(fetchNextPage).toHaveBeenCalledTimes(1);
        });
    });
});
