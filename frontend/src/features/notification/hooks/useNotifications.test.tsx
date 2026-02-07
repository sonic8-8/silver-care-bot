import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@/test/utils';
import type { NotificationListPayload } from '@/shared/types';
import { mergeUniqueNotifications, useNotifications, useUnreadCount } from './useNotifications';

describe('useNotifications', () => {
    it('loads notification list', async () => {
        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useNotifications({ pageSize: 5 }), { wrapper });

        await waitFor(() => {
            expect(result.current.listQuery.isSuccess).toBe(true);
        });

        expect(result.current.notifications.length).toBeGreaterThan(0);
    });

    it('marks all notifications as read', async () => {
        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useNotifications({ pageSize: 10 }), { wrapper });

        await waitFor(() => {
            expect(result.current.listQuery.isSuccess).toBe(true);
        });

        await result.current.markAllAsRead();

        await waitFor(() => {
            expect(result.current.notifications.every((notification) => notification.isRead)).toBe(true);
        });
    });
});

describe('useUnreadCount', () => {
    it('returns unread count', async () => {
        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useUnreadCount(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect((result.current.data?.unreadCount ?? 0)).toBeGreaterThanOrEqual(0);
    });
});

describe('mergeUniqueNotifications', () => {
    it('keeps first item when duplicated by notification id', () => {
        const pages: NotificationListPayload[] = [
            {
                notifications: [
                    {
                        id: 1,
                        type: 'SYSTEM',
                        title: '첫 번째',
                        message: 'A',
                        isRead: false,
                        createdAt: '2026-02-07T09:00:00+09:00',
                        readAt: null,
                    },
                ],
                page: 0,
                size: 1,
                totalElements: 2,
                totalPages: 2,
                hasNext: true,
            },
            {
                notifications: [
                    {
                        id: 1,
                        type: 'SYSTEM',
                        title: '중복',
                        message: 'B',
                        isRead: false,
                        createdAt: '2026-02-07T08:59:00+09:00',
                        readAt: null,
                    },
                ],
                page: 1,
                size: 1,
                totalElements: 2,
                totalPages: 2,
                hasNext: false,
            },
        ];

        const result = mergeUniqueNotifications(pages);

        expect(result).toHaveLength(1);
        expect(result[0]?.title).toBe('첫 번째');
    });
});
