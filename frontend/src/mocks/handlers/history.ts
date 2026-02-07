import { http, HttpResponse } from 'msw';
import type { ActivityItem, ActivityListPayload, PatrolLatestPayload, WeeklyReportPayload } from '@/shared/types';
import {
    parseActivityListPayload,
    parsePatrolLatestPayload,
    parseWeeklyReportPayload,
} from '@/shared/types';

const activityTimelineByDate: Record<string, Omit<ActivityListPayload, 'date'>> = {
    '2026-02-07': {
        activities: [
            {
                id: 1201,
                elderId: 1,
                robotId: 1,
                type: 'WAKE_UP',
                title: '기상 감지',
                description: '침실에서 움직임을 감지했습니다.',
                location: '침실',
                detectedAt: '2026-02-07T07:24:00+09:00',
                createdAt: '2026-02-07T07:24:03+09:00',
            },
            {
                id: 1202,
                elderId: 1,
                robotId: 1,
                type: 'MEDICATION_TAKEN',
                title: '아침 복약 완료',
                description: '디스펜서에서 아침 복약이 확인되었습니다.',
                location: '주방',
                detectedAt: '2026-02-07T08:06:00+09:00',
                createdAt: '2026-02-07T08:06:04+09:00',
            },
            {
                id: 1203,
                elderId: 1,
                robotId: 1,
                type: 'PATROL_COMPLETE',
                title: '순찰 완료',
                description: '가스밸브와 콘센트가 정상 상태입니다.',
                location: '거실',
                detectedAt: '2026-02-07T09:35:00+09:00',
                createdAt: '2026-02-07T09:35:04+09:00',
            },
        ],
    },
    '2026-02-06': {
        activities: [
            {
                id: 1101,
                elderId: 1,
                robotId: 1,
                type: 'OUT_DETECTED',
                title: '외출 감지',
                description: '현관문 개방 후 이동을 감지했습니다.',
                location: '현관',
                detectedAt: '2026-02-06T10:01:00+09:00',
                createdAt: '2026-02-06T10:01:02+09:00',
            },
            {
                id: 1102,
                elderId: 1,
                robotId: 1,
                type: 'RETURN_DETECTED',
                title: '귀가 감지',
                description: '현관문 닫힘 및 거실 진입을 감지했습니다.',
                location: '거실',
                detectedAt: '2026-02-06T11:18:00+09:00',
                createdAt: '2026-02-06T11:18:02+09:00',
            },
        ],
    },
};

const weeklyReportMock: WeeklyReportPayload = {
    weekStartDate: '2026-02-02',
    weekEndDate: '2026-02-08',
    medicationRate: 92.8,
    activityCount: 31,
    conversationKeywords: ['산책', '혈압', '수분', '점심'],
    recommendations: [
        '아침 복약 직후 물 섭취를 한 컵 이상 유도하세요.',
        '오후 3시 전후로 10분 내외 실내 보행을 권장합니다.',
    ],
    generatedAt: '2026-02-09T00:05:00+09:00',
    source: 'CALCULATED',
};

const patrolLatestMock: PatrolLatestPayload = {
    lastPatrolAt: '2026-02-07T09:35:00+09:00',
    items: [
        {
            id: 1,
            target: 'GAS_VALVE',
            label: '가스밸브',
            status: 'NORMAL',
            checkedAt: '2026-02-07T09:31:00+09:00',
            imageUrl: null,
        },
        {
            id: 2,
            target: 'DOOR',
            label: '현관문',
            status: 'LOCKED',
            checkedAt: '2026-02-07T09:33:00+09:00',
            imageUrl: null,
        },
        {
            id: 3,
            target: 'OUTLET',
            label: '멀티탭',
            status: 'OFF',
            checkedAt: '2026-02-07T09:34:00+09:00',
            imageUrl: null,
        },
    ],
};

const toWeekStartDate = (candidate: string | null) => {
    if (!candidate) {
        return weeklyReportMock.weekStartDate;
    }
    return candidate;
};

export const historyHandlers = [
    http.get('/api/elders/:elderId/activities', ({ request, params }) => {
        const query = new URL(request.url).searchParams;
        const date = query.get('date') ?? '2026-02-07';
        const elderId = Number(params.elderId);

        const base = activityTimelineByDate[date] ?? { activities: [] };
        const payload = parseActivityListPayload({
            date,
            activities: base.activities.map((activity) => ({
                ...activity,
                elderId,
            })),
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.post('/api/robots/:robotId/activities', async ({ request, params }) => {
        const body = await request.json() as Record<string, unknown>;
        const robotId = Number(params.robotId);
        const now = new Date().toISOString();

        const payload = parseActivityItemForCreate({
            id: Date.now(),
            elderId: typeof body.elderId === 'number' ? body.elderId : 1,
            robotId,
            type: body.type,
            title: body.title,
            description: body.description,
            location: body.location,
            detectedAt: body.detectedAt ?? now,
            createdAt: now,
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/elders/:elderId/reports/weekly', ({ request }) => {
        const query = new URL(request.url).searchParams;
        const weekStartDate = toWeekStartDate(query.get('weekStartDate'));

        const payload = parseWeeklyReportPayload({
            ...weeklyReportMock,
            weekStartDate,
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/elders/:elderId/patrol/latest', () => {
        const payload = parsePatrolLatestPayload(patrolLatestMock);

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),
];

const parseActivityItemForCreate = (value: unknown): ActivityItem => {
    const parsed = parseActivityListPayload({
        date: '2026-02-07',
        activities: [value],
    });

    const first = parsed.activities[0];
    if (!first) {
        throw new Error('[contract] failed to create activity payload');
    }

    return first;
};
