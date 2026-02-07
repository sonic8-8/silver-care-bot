import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@/test/utils';
import { useNotifications, useUnreadCount } from './useNotifications';

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
