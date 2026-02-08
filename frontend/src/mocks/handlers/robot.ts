import { http, HttpResponse } from 'msw';
import {
    parseRobotCommandAckRequest,
    parseRobotCommandAckResponse,
    parseRobotEventsRequest,
    parseRobotEventsResponse,
    parseRobotLcdModeChangeRequest,
    parseRobotLcdModeChangeResponse,
    parseRobotLcdStatePayload,
    parseRobotSyncPayload,
    type RobotEventPayload,
    type RobotLcdStatePayload,
} from '@/shared/types';

const resolveRobotId = (value: string | readonly string[] | undefined): number => {
    const robotId = Number(value);
    if (Number.isNaN(robotId)) {
        return 1;
    }
    return robotId;
};

const createDefaultLcdState = (): RobotLcdStatePayload => {
    return {
        mode: 'IDLE',
        emotion: 'neutral',
        message: '',
        subMessage: '',
        nextSchedule: {
            label: '병원 방문',
            time: '14:00',
        },
        lastUpdatedAt: '2026-01-29T10:23:00+09:00',
    };
};

const lcdStateByRobotId = new Map<number, RobotLcdStatePayload>([
    [1, createDefaultLcdState()],
]);

type PendingCommand = {
    commandId: string;
    command: string;
    params: Record<string, unknown> | null;
    issuedAt: string;
};

const pendingCommandsByRobotId = new Map<number, PendingCommand[]>();
let commandSequence = 120;

const getLcdState = (robotId: number): RobotLcdStatePayload => {
    const current = lcdStateByRobotId.get(robotId);
    if (current) {
        return current;
    }

    const initial = createDefaultLcdState();
    lcdStateByRobotId.set(robotId, initial);
    return initial;
};

const getPendingCommands = (robotId: number): PendingCommand[] => {
    const current = pendingCommandsByRobotId.get(robotId);
    if (current) {
        return current;
    }
    const initial: PendingCommand[] = [];
    pendingCommandsByRobotId.set(robotId, initial);
    return initial;
};

const badRequest = (message: string) => {
    return HttpResponse.json(
        {
            success: false,
            error: {
                code: 'INVALID_REQUEST',
                message,
            },
            timestamp: new Date().toISOString(),
        },
        {
            status: 400,
        }
    );
};

const applyButtonEvent = (
    current: RobotLcdStatePayload,
    event: RobotEventPayload,
    at: string
): RobotLcdStatePayload => {
    if (event.type !== 'BUTTON' || event.action === null) {
        return current;
    }

    if (event.action === 'TAKE') {
        return parseRobotLcdStatePayload({
            ...current,
            mode: 'IDLE',
            emotion: 'happy',
            message: '',
            subMessage: `복약 확인 완료 (medicationId: ${event.medicationId})`,
            lastUpdatedAt: at,
        });
    }

    if (event.action === 'LATER') {
        return parseRobotLcdStatePayload({
            ...current,
            mode: 'SCHEDULE',
            emotion: 'neutral',
            message: '알겠어요. 잠시 후 다시 알려드릴게요.',
            subMessage: '다음 알림을 준비 중이에요.',
            lastUpdatedAt: at,
        });
    }

    if (event.action === 'EMERGENCY') {
        return parseRobotLcdStatePayload({
            ...current,
            mode: 'EMERGENCY',
            emotion: 'neutral',
            message: '보호자에게 긴급 연락을 보내고 있어요.',
            subMessage: '잠시만 기다려 주세요.',
            lastUpdatedAt: at,
        });
    }

    if (event.action === 'CONFIRM') {
        return parseRobotLcdStatePayload({
            ...current,
            mode: 'IDLE',
            emotion: 'neutral',
            message: '확인했어요.',
            subMessage: '필요하면 다시 불러 주세요.',
            lastUpdatedAt: at,
        });
    }

    return parseRobotLcdStatePayload({
        ...current,
        mode: 'IDLE',
        emotion: 'neutral',
        message: '',
        subMessage: '',
        lastUpdatedAt: at,
    });
};

// 로봇 관련 Mock 핸들러
export const robotHandlers = [
    // GET /api/robots/:robotId/status - 로봇 상태 조회
    http.get('/api/robots/:robotId/status', ({ params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const lcdState = getLcdState(resolvedRobotId);
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: {
                id: resolvedRobotId,
                serialNumber: 'ROBOT-2026-X82',
                batteryLevel: 85,
                isCharging: false,
                networkStatus: 'CONNECTED',
                currentLocation: '거실',
                lcdMode: lcdState.mode,
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
        const resolvedRobotId = resolveRobotId(params.robotId);
        const body = await request.json() as { command: string; params?: Record<string, unknown> };
        const commandId = `cmd-${commandSequence++}`;
        const queuedCommand: PendingCommand = {
            commandId,
            command: body.command,
            params: body.params ?? null,
            issuedAt: timestamp,
        };
        getPendingCommands(resolvedRobotId).push(queuedCommand);

        return HttpResponse.json({
            success: true,
            data: {
                commandId,
                robotId: resolvedRobotId,
                command: body.command,
                params: body.params ?? null,
                status: 'PENDING',
                issuedAt: timestamp,
            },
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/sync - 상태 동기화 및 대기 작업 수신
    http.post('/api/robots/:robotId/sync', async ({ params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const timestamp = new Date().toISOString();

        const payload = parseRobotSyncPayload({
            pendingCommands: getPendingCommands(resolvedRobotId),
            scheduleReminders: [
                {
                    scheduleId: 1,
                    title: '병원 방문',
                    datetime: '2026-01-29T14:00:00+09:00',
                    remindAt: '2026-01-29T12:00:00+09:00',
                },
            ],
            medications: [
                {
                    medicationId: 2,
                    scheduledAt: '2026-01-29T19:00:00+09:00',
                    name: '저녁약 (당뇨)',
                },
            ],
            serverTime: timestamp,
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/commands/:commandId/ack - 명령 응답 보고
    http.post('/api/robots/:robotId/commands/:commandId/ack', async ({ request, params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const timestamp = new Date().toISOString();
        const commandId = String(params.commandId ?? '');
        if (!commandId) {
            return badRequest('commandId is required');
        }

        let parsedRequest: ReturnType<typeof parseRobotCommandAckRequest>;
        try {
            parsedRequest = parseRobotCommandAckRequest(await request.json());
        } catch (error) {
            return badRequest(error instanceof Error ? error.message : 'Invalid request');
        }

        const commandQueue = getPendingCommands(resolvedRobotId);
        if (
            parsedRequest.status === 'COMPLETED'
            || parsedRequest.status === 'FAILED'
            || parsedRequest.status === 'CANCELLED'
        ) {
            pendingCommandsByRobotId.set(
                resolvedRobotId,
                commandQueue.filter((command) => command.commandId !== commandId)
            );
        }

        const response = parseRobotCommandAckResponse({
            commandId,
            status: parsedRequest.status,
            receivedAt: parsedRequest.completedAt ?? timestamp,
            result: parsedRequest.result,
        });

        return HttpResponse.json({
            success: true,
            data: response,
            timestamp,
        });
    }),

    // GET /api/robots/:robotId/lcd - LCD 미러링 상태 조회
    http.get('/api/robots/:robotId/lcd', ({ params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const lcdState = parseRobotLcdStatePayload(getLcdState(resolvedRobotId));
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: lcdState,
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/lcd-mode - LCD 모드 변경
    http.post('/api/robots/:robotId/lcd-mode', async ({ request, params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const timestamp = new Date().toISOString();

        let parsedRequest: ReturnType<typeof parseRobotLcdModeChangeRequest>;
        try {
            parsedRequest = parseRobotLcdModeChangeRequest(await request.json());
        } catch (error) {
            return badRequest(error instanceof Error ? error.message : 'Invalid request');
        }

        const current = getLcdState(resolvedRobotId);
        const nextState = parseRobotLcdStatePayload({
            ...current,
            ...parsedRequest,
            lastUpdatedAt: timestamp,
        });
        lcdStateByRobotId.set(resolvedRobotId, nextState);

        const response = parseRobotLcdModeChangeResponse({
            ...parsedRequest,
            updatedAt: timestamp,
        });

        return HttpResponse.json({
            success: true,
            data: response,
            timestamp,
        });
    }),

    // POST /api/robots/:robotId/events - LCD 이벤트 보고
    http.post('/api/robots/:robotId/events', async ({ request, params }) => {
        const resolvedRobotId = resolveRobotId(params.robotId);
        const timestamp = new Date().toISOString();

        let parsedRequest: ReturnType<typeof parseRobotEventsRequest>;
        try {
            parsedRequest = parseRobotEventsRequest(await request.json());
        } catch (error) {
            return badRequest(error instanceof Error ? error.message : 'Invalid request');
        }

        const current = getLcdState(resolvedRobotId);
        const nextState = parsedRequest.events.reduce((state, event) => {
            return applyButtonEvent(state, event, timestamp);
        }, current);
        lcdStateByRobotId.set(resolvedRobotId, nextState);

        const response = parseRobotEventsResponse({
            accepted: parsedRequest.events.length,
            receivedAt: timestamp,
        });

        return HttpResponse.json({
            success: true,
            data: response,
            timestamp,
        });
    }),
];
