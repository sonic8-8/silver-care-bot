import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import {
    getNotifications,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from '@/features/notification/api/notificationApi';
import { notificationKeys } from '@/features/notification/queryKeys';
import type { NotificationItem, NotificationListPayload, UnreadCountPayload } from '@/shared/types';

export const mergeUniqueNotifications = (pages: NotificationListPayload[] | undefined): NotificationItem[] => {
    if (!pages) {
        return [];
    }

    const seen = new Set<number>();
    const merged: NotificationItem[] = [];

    pages.forEach((page) => {
        page.notifications.forEach((notification) => {
            if (seen.has(notification.id)) {
                return;
            }

            seen.add(notification.id);
            merged.push(notification);
        });
    });

    return merged;
};

const patchReadInPages = (
    oldData: InfiniteData<NotificationListPayload> | undefined,
    notificationId: number,
    removeReadItems: boolean
) => {
    if (!oldData) return oldData;
    return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications
                .map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            isRead: true,
                            readAt: new Date().toISOString(),
                        }
                        : notification
                )
                .filter((notification) => (removeReadItems ? !notification.isRead : true)),
        })),
    };
};

const patchReadAllInPages = (
    oldData: InfiniteData<NotificationListPayload> | undefined,
    removeReadItems: boolean
) => {
    if (!oldData) return oldData;
    const now = new Date().toISOString();
    return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications
                .map((notification) => ({
                    ...notification,
                    isRead: true,
                    readAt: notification.readAt ?? now,
                }))
                .filter((notification) => (removeReadItems ? !notification.isRead : true)),
        })),
    };
};

type UseNotificationsOptions = {
    isRead?: boolean;
    pageSize?: number;
};

export const useNotifications = ({ isRead, pageSize = 10 }: UseNotificationsOptions = {}) => {
    const queryClient = useQueryClient();
    const isUnreadFilter = isRead === false;
    const currentListKey = notificationKeys.list(isRead, pageSize);

    const listQuery = useInfiniteQuery({
        queryKey: currentListKey,
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            getNotifications({
                page: pageParam as number,
                size: pageSize,
                isRead,
            }),
        getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    });

    const notifications = useMemo(
        () => mergeUniqueNotifications(listQuery.data?.pages),
        [listQuery.data?.pages]
    );

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onMutate: async (notificationId) => {
            queryClient.setQueryData(
                currentListKey,
                (oldData: InfiniteData<NotificationListPayload> | undefined) =>
                    patchReadInPages(oldData, notificationId, isUnreadFilter)
            );
            queryClient.setQueryData(
                notificationKeys.recent,
                (oldData: NotificationItem[] | undefined) =>
                    oldData?.map((notification) =>
                        notification.id === notificationId
                            ? {
                                ...notification,
                                isRead: true,
                                readAt: new Date().toISOString(),
                            }
                            : notification
                    )
            );
            queryClient.setQueryData(
                notificationKeys.unreadCount,
                (oldData: UnreadCountPayload | undefined) => {
                    if (!oldData) return oldData;
                    return {
                        unreadCount: Math.max(0, oldData.unreadCount - 1),
                    };
                }
            );
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onMutate: async () => {
            queryClient.setQueryData(
                currentListKey,
                (oldData: InfiniteData<NotificationListPayload> | undefined) =>
                    patchReadAllInPages(oldData, isUnreadFilter)
            );
            queryClient.setQueryData(
                notificationKeys.recent,
                (oldData: NotificationItem[] | undefined) => {
                    if (!oldData) return oldData;
                    const now = new Date().toISOString();
                    return oldData.map((notification) => ({
                        ...notification,
                        isRead: true,
                        readAt: notification.readAt ?? now,
                    }));
                }
            );
            queryClient.setQueryData(notificationKeys.unreadCount, { unreadCount: 0 });
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });

    return {
        listQuery,
        notifications,
        markAsRead: markAsReadMutation.mutateAsync,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
        isMarkingRead: markAsReadMutation.isPending,
        isMarkingAllRead: markAllAsReadMutation.isPending,
    };
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: notificationKeys.unreadCount,
        queryFn: getUnreadCount,
        refetchInterval: 30_000,
    });
};

export const useRecentNotifications = () => {
    return useQuery({
        queryKey: notificationKeys.recent,
        queryFn: async () => {
            const payload = await getNotifications({ page: 0, size: 5 });
            return payload.notifications;
        },
    });
};
