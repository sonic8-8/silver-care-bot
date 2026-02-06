export const notificationKeys = {
    all: ['notifications'] as const,
    list: (isRead: boolean | undefined, pageSize: number) =>
        ['notifications', 'list', { isRead, pageSize }] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    recent: ['notifications', 'recent'] as const,
    settings: ['users', 'me', 'settings'] as const,
};
