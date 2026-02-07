import { api } from '@/shared/api/axios';
import { unwrapApiResponse } from '@/shared/api/response';
import type {
    ApiResult,
    MySettingsPayload,
    NotificationItem,
    NotificationListPayload,
    ReadAllPayload,
    UnreadCountPayload,
    UpdateMySettingsPayload,
} from '@/shared/types';

export type GetNotificationsParams = {
    page?: number;
    size?: number;
    isRead?: boolean;
};

export const getNotifications = async (params: GetNotificationsParams = {}) => {
    const response = await api.get<ApiResult<NotificationListPayload>>('/notifications', { params });
    const data = unwrapApiResponse(response.data);
    return data ?? {
        notifications: [],
        page: params.page ?? 0,
        size: params.size ?? 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
    };
};

export const getUnreadCount = async () => {
    const response = await api.get<ApiResult<UnreadCountPayload>>('/notifications/unread-count');
    const data = unwrapApiResponse(response.data);
    return data ?? { unreadCount: 0 };
};

export const markNotificationAsRead = async (notificationId: number) => {
    const response = await api.patch<ApiResult<NotificationItem>>(`/notifications/${notificationId}/read`);
    const data = unwrapApiResponse(response.data);
    if (!data) {
        throw new Error('Notification payload is missing');
    }
    return data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.patch<ApiResult<ReadAllPayload>>('/notifications/read-all');
    const data = unwrapApiResponse(response.data);
    return data ?? { updatedCount: 0 };
};

export const getMySettings = async () => {
    const response = await api.get<ApiResult<MySettingsPayload>>('/users/me/settings');
    const data = unwrapApiResponse(response.data);
    if (!data) {
        throw new Error('Settings payload is missing');
    }
    return data;
};

export const updateMySettings = async (payload: UpdateMySettingsPayload) => {
    const response = await api.patch<ApiResult<MySettingsPayload>>('/users/me/settings', payload);
    const data = unwrapApiResponse(response.data);
    if (!data) {
        throw new Error('Settings payload is missing');
    }
    return data;
};
