import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationAsRead } from '@/features/notification/api/notificationApi';
import {
    useRecentNotifications,
    useUnreadCount,
} from '@/features/notification/hooks/useNotifications';
import { notificationKeys } from '@/features/notification/queryKeys';
import type { NotificationItem } from '@/shared/types';

const toRelativeText = (createdAt: string) => {
    const created = new Date(createdAt);
    const diffMs = Date.now() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}일 전`;
};

const resolveTargetPath = (notification: NotificationItem) => {
    if (notification.targetPath && notification.targetPath.length > 0) {
        return notification.targetPath;
    }
    if (notification.elderId) {
        return `/elders/${notification.elderId}`;
    }
    return '/notifications';
};

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const unreadCountQuery = useUnreadCount();
    const recentQuery = useRecentNotifications();

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            if (!rootRef.current) {
                return;
            }
            if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocumentClick);
        return () => document.removeEventListener('mousedown', onDocumentClick);
    }, []);

    const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
    const recent = recentQuery.data ?? [];

    const onClickNotification = async (notification: NotificationItem) => {
        if (!notification.isRead) {
            await markAsReadMutation.mutateAsync(notification.id);
        }
        setIsOpen(false);
        navigate(resolveTargetPath(notification));
    };

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-600"
                aria-label="알림 보기"
            >
                <Bell size={18} />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : null}
            </button>

            {isOpen ? (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">최근 알림</h3>
                        <button
                            type="button"
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/notifications');
                            }}
                        >
                            전체 보기
                        </button>
                    </div>
                    {recent.length === 0 ? (
                        <p className="rounded-xl bg-gray-50 px-3 py-5 text-center text-sm text-gray-500">
                            최근 알림이 없습니다.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {recent.map((notification) => (
                                <li key={notification.id}>
                                    <button
                                        type="button"
                                        className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                                            notification.isRead
                                                ? 'border-gray-200 bg-white'
                                                : 'border-primary-200 bg-primary-50/40'
                                        }`}
                                        onClick={() => void onClickNotification(notification)}
                                    >
                                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                                            {notification.title}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-[11px] text-gray-400">
                                            {toRelativeText(notification.createdAt)}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}
        </div>
    );
}
