import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import type { NotificationItem } from '@/shared/types';

type NotificationFilter = 'all' | 'unread' | 'read';

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

const resolveReadFilter = (filter: NotificationFilter): boolean | undefined => {
    if (filter === 'all') return undefined;
    return filter === 'read';
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

function NotificationScreen() {
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const isRead = useMemo(() => resolveReadFilter(filter), [filter]);
    const navigate = useNavigate();
    const loadMoreTargetRef = useRef<HTMLDivElement | null>(null);
    const loadLockRef = useRef(false);

    const {
        listQuery,
        notifications,
        markAsRead,
        markAllAsRead,
        isMarkingRead,
        isMarkingAllRead,
    } = useNotifications({ isRead, pageSize: 10 });

    const fetchNextPage = useCallback(async () => {
        if (!listQuery.hasNextPage || listQuery.isFetchingNextPage || loadLockRef.current) {
            return;
        }

        loadLockRef.current = true;
        try {
            await listQuery.fetchNextPage();
        } finally {
            loadLockRef.current = false;
        }
    }, [listQuery]);

    useEffect(() => {
        if (!loadMoreTargetRef.current || !listQuery.hasNextPage || listQuery.isLoading || listQuery.isError) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void fetchNextPage();
                }
            },
            {
                rootMargin: '200px 0px',
            }
        );

        observer.observe(loadMoreTargetRef.current);

        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, listQuery.hasNextPage, listQuery.isError, listQuery.isLoading]);

    const onNotificationClick = async (notification: NotificationItem) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        navigate(resolveTargetPath(notification));
    };

    return (
        <GuardianAppContainer title="알림" description="최근 알림을 확인합니다." showNotificationBell={false}>
            <section className="mb-4 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    전체
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('unread')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        filter === 'unread' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    안읽음
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('read')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        filter === 'read' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    읽음
                </button>
                <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    disabled={isMarkingAllRead}
                    className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    전체 읽음
                </button>
            </section>

            {listQuery.isLoading ? (
                <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-card">
                    알림을 불러오는 중입니다...
                </p>
            ) : null}

            {listQuery.isError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-card">
                    알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
            ) : null}

            <div className="space-y-3">
                {notifications.map((item) => (
                    <article
                        key={item.id}
                        className={`cursor-pointer rounded-2xl border p-5 shadow-card transition-colors ${
                            item.isRead
                                ? 'border-gray-200 bg-white'
                                : 'border-primary-200 bg-primary-50/40'
                        }`}
                        onClick={() => void onNotificationClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                void onNotificationClick(item);
                            }
                        }}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            {!item.isRead ? (
                                <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
                                    NEW
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{item.message}</p>
                        <p className="mt-2 text-xs text-gray-400">{toRelativeText(item.createdAt)}</p>
                    </article>
                ))}
            </div>

            {!listQuery.isLoading && notifications.length === 0 ? (
                <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-card">
                    표시할 알림이 없습니다.
                </p>
            ) : null}

            {listQuery.hasNextPage ? (
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => void fetchNextPage()}
                        disabled={listQuery.isFetchingNextPage || isMarkingRead}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {listQuery.isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                    </button>
                    <div ref={loadMoreTargetRef} className="h-1 w-full" aria-hidden />
                </div>
            ) : null}

            {!listQuery.isLoading && notifications.length > 0 && !listQuery.hasNextPage ? (
                <p className="mt-4 text-center text-xs text-gray-400">모든 알림을 확인했습니다.</p>
            ) : null}
        </GuardianAppContainer>
    );
}

export default NotificationScreen;
