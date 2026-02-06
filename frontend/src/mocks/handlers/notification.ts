import { http, HttpResponse } from 'msw';
import type { NotificationItem, NotificationSettings, ThemeMode } from '@/shared/types';

const notifications: NotificationItem[] = [
    {
        id: 101,
        type: 'EMERGENCY',
        title: '긴급 상황 감지',
        message: '거실에서 넘어짐 감지가 발생했습니다.',
        elderId: 1,
        targetPath: '/emergency/101',
        isRead: false,
        createdAt: '2026-02-06T08:40:00+09:00',
        readAt: null,
    },
    {
        id: 102,
        type: 'MEDICATION',
        title: '복약 알림',
        message: '아침 약 복용 시간이 지났습니다.',
        elderId: 1,
        targetPath: '/elders/1/medications',
        isRead: false,
        createdAt: '2026-02-06T08:10:00+09:00',
        readAt: null,
    },
    {
        id: 103,
        type: 'ACTIVITY',
        title: '로봇 오프라인',
        message: '로봇이 오프라인 상태로 전환되었습니다.',
        elderId: 1,
        targetPath: '/elders/1/robot',
        isRead: true,
        createdAt: '2026-02-06T07:30:00+09:00',
        readAt: '2026-02-06T07:31:10+09:00',
    },
    {
        id: 104,
        type: 'SCHEDULE',
        title: '일정 알림',
        message: '10:00 병원 진료 일정이 30분 후 시작됩니다.',
        elderId: 1,
        targetPath: '/elders/1/schedule',
        isRead: true,
        createdAt: '2026-02-06T07:10:00+09:00',
        readAt: '2026-02-06T07:12:10+09:00',
    },
    {
        id: 105,
        type: 'SYSTEM',
        title: '시스템 점검 안내',
        message: '오늘 23:00부터 10분간 점검이 예정되어 있습니다.',
        elderId: null,
        targetPath: '/notifications',
        isRead: false,
        createdAt: '2026-02-05T20:10:00+09:00',
        readAt: null,
    },
];

let currentTheme: ThemeMode = 'SYSTEM';
let currentSettings: NotificationSettings = {
    emergencyEnabled: true,
    medicationEnabled: true,
    scheduleEnabled: true,
    activityEnabled: true,
    systemEnabled: true,
    realtimeEnabled: true,
};

export const notificationHandlers = [
    http.get('/api/notifications', ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? '0');
        const size = Number(url.searchParams.get('size') ?? '20');
        const isReadParam = url.searchParams.get('isRead');

        const filtered = notifications
            .filter((item) => {
                if (isReadParam === null) return true;
                return item.isRead === (isReadParam === 'true');
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const start = page * size;
        const pageItems = filtered.slice(start, start + size);
        const totalPages = Math.max(1, Math.ceil(filtered.length / size));

        return HttpResponse.json({
            success: true,
            data: {
                notifications: pageItems,
                page,
                size,
                totalElements: filtered.length,
                totalPages,
                hasNext: start + size < filtered.length,
            },
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/notifications/unread-count', () => {
        const unreadCount = notifications.filter((item) => !item.isRead).length;
        return HttpResponse.json({
            success: true,
            data: { unreadCount },
            timestamp: new Date().toISOString(),
        });
    }),

    http.patch('/api/notifications/:id/read', ({ params }) => {
        const id = Number(params.id);
        const target = notifications.find((item) => item.id === id);
        if (!target) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Notification not found',
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }
        target.isRead = true;
        target.readAt = target.readAt ?? new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: target,
            timestamp: new Date().toISOString(),
        });
    }),

    http.patch('/api/notifications/read-all', () => {
        let updatedCount = 0;
        notifications.forEach((item) => {
            if (!item.isRead) {
                item.isRead = true;
                item.readAt = new Date().toISOString();
                updatedCount += 1;
            }
        });
        return HttpResponse.json({
            success: true,
            data: { updatedCount },
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/users/me/settings', () => {
        return HttpResponse.json({
            success: true,
            data: {
                theme: currentTheme,
                notificationSettings: currentSettings,
            },
            timestamp: new Date().toISOString(),
        });
    }),

    http.patch('/api/users/me/settings', async ({ request }) => {
        const body = await request.json() as {
            theme?: ThemeMode;
            notificationSettings?: Partial<NotificationSettings>;
        };
        if (body.theme) {
            currentTheme = body.theme;
        }
        if (body.notificationSettings) {
            currentSettings = {
                ...currentSettings,
                ...body.notificationSettings,
            };
        }

        return HttpResponse.json({
            success: true,
            data: {
                theme: currentTheme,
                notificationSettings: currentSettings,
            },
            timestamp: new Date().toISOString(),
        });
    }),
];
