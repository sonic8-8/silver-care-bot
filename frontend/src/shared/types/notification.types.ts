export type NotificationType = 'EMERGENCY' | 'MEDICATION' | 'SCHEDULE' | 'ACTIVITY' | 'SYSTEM';

export interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    elderId?: number | null;
    targetPath?: string | null;
    isRead: boolean;
    createdAt: string;
    readAt?: string | null;
}

export interface NotificationListPayload {
    notifications: NotificationItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

export interface UnreadCountPayload {
    unreadCount: number;
}

export interface ReadAllPayload {
    updatedCount: number;
}

export type NotificationSettings = {
    emergencyEnabled: boolean;
    medicationEnabled: boolean;
    scheduleEnabled: boolean;
    activityEnabled: boolean;
    systemEnabled: boolean;
    realtimeEnabled: boolean;
};

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface MySettingsPayload {
    theme: ThemeMode;
    notificationSettings: NotificationSettings;
}

export type UpdateMySettingsPayload = {
    theme?: ThemeMode;
    notificationSettings?: Partial<NotificationSettings>;
};
