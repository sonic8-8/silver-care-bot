import { useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { notificationKeys } from '@/features/notification/queryKeys';
import { useSubscription } from '@/shared/websocket/useSubscription';
import { useWebSocket } from '@/shared/websocket/useWebSocket';
import type {
    NotificationItem,
    NotificationType,
    UnreadCountPayload,
} from '@/shared/types';
import type { WebSocketEnvelope } from '@/shared/websocket/types';

type NotificationSocketPayload = {
    id: number;
    type: string;
    title: string;
    message: string;
    elderId?: number;
    targetPath?: string;
};

const parseNotificationType = (value: string): NotificationType => {
    if (value === 'EMERGENCY') return 'EMERGENCY';
    if (value === 'MEDICATION') return 'MEDICATION';
    if (value === 'SCHEDULE') return 'SCHEDULE';
    if (value === 'ACTIVITY') return 'ACTIVITY';
    return 'SYSTEM';
};

const toNotificationItem = (
    envelope: WebSocketEnvelope<NotificationSocketPayload>
): NotificationItem => ({
    id: envelope.payload.id,
    type: parseNotificationType(envelope.payload.type),
    title: envelope.payload.title,
    message: envelope.payload.message,
    elderId: envelope.payload.elderId ?? null,
    targetPath: envelope.payload.targetPath ?? null,
    isRead: false,
    createdAt: envelope.timestamp ?? new Date().toISOString(),
    readAt: null,
});

export const useNotificationRealtime = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
    const receivedIdsRef = useRef<Set<number>>(new Set());

    const destination = useMemo(() => {
        if (!user?.id) {
            return '';
        }
        return `/topic/user/${user.id}/notifications`;
    }, [user?.id]);

    const { client, isConnected } = useWebSocket({
        token,
        autoConnect: Boolean(user?.id && token),
        maxReconnectAttempts: 10,
        reconnectDelayMs: 3000,
    });

    const handleMessage = useCallback(
        (payload: WebSocketEnvelope<NotificationSocketPayload>) => {
            const item = toNotificationItem(payload);
            if (receivedIdsRef.current.has(item.id)) {
                return;
            }
            receivedIdsRef.current.add(item.id);

            queryClient.setQueryData(notificationKeys.recent, (oldData: NotificationItem[] | undefined) => {
                const existing = oldData ?? [];
                const deduped = existing.filter((notification) => notification.id !== item.id);
                return [item, ...deduped].slice(0, 5);
            });

            queryClient.setQueryData(
                notificationKeys.unreadCount,
                (oldData: UnreadCountPayload | undefined) => ({
                    unreadCount: (oldData?.unreadCount ?? 0) + 1,
                })
            );

            void queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
        },
        [queryClient]
    );

    useSubscription<WebSocketEnvelope<NotificationSocketPayload>>({
        client,
        destination,
        enabled: Boolean(destination),
        isConnected,
        onMessage: handleMessage,
    });
};
