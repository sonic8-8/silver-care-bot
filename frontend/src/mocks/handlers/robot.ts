import { http, HttpResponse } from 'msw';

// 로봇 관련 Mock 핸들러
export const robotHandlers = [
    // GET /api/robots/:robotId/status - 로봇 상태 조회
    http.get('/api/robots/:robotId/status', ({ params }) => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: {
                id: Number(params.robotId),
                serialNumber: 'ROBOT-2026-X82',
                batteryLevel: 85,
                isCharging: false,
                networkStatus: 'CONNECTED',
                currentLocation: '거실',
                lcdMode: 'IDLE',
                lastSyncAt: '2026-01-29T10:23:00+09:00',
                dispenser: {
                    remaining: 3,
                    capacity: 7,
                    daysUntilEmpty: 2,
                },
                settings: {
                    morningMedicationTime: '08:00',
                    eveningMedicationTime: '19:00',
                    ttsVolume: 70,
                    patrolTimeRange: {
                        start: '09:00',
                        end: '18:00',
                    },
                },
            },
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/commands - 로봇 명령 전송
    http.post('/api/robots/:robotId/commands', async ({ request, params }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { command: string; params?: Record<string, unknown> };

        return HttpResponse.json({
            success: true,
            data: {
                commandId: 100,
                robotId: Number(params.robotId),
                command: body.command,
                params: body.params ?? null,
                status: 'QUEUED',
            },
            timestamp,
        });
    }),

    // GET /api/robots/:robotId/lcd - LCD 미러링 상태 조회
    http.get('/api/robots/:robotId/lcd', ({ params }) => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: {
                robotId: Number(params.robotId),
                mode: 'IDLE',
                emotion: 'neutral',
                message: '',
                subMessage: '',
                nextSchedule: {
                    label: '병원 방문',
                    time: '14:00',
                },
                lastUpdatedAt: '2026-01-29T10:23:00+09:00',
            },
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/lcd-mode - LCD 모드 변경
    http.post('/api/robots/:robotId/lcd-mode', async ({ request, params }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as {
            mode: string;
            emotion?: string;
            message?: string;
            subMessage?: string;
        };

        return HttpResponse.json({
            success: true,
            data: {
                robotId: Number(params.robotId),
                ...body,
            },
            timestamp,
        });
    }),
];
