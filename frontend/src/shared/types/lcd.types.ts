import type { RobotLcdMode } from './robot.types';

export const ROBOT_LCD_MODES = [
    'IDLE',
    'GREETING',
    'MEDICATION',
    'SCHEDULE',
    'LISTENING',
    'EMERGENCY',
    'SLEEP',
] as const;

export const ROBOT_LCD_EMOTIONS = ['neutral', 'happy', 'sleep'] as const;

export type RobotLcdEmotion = (typeof ROBOT_LCD_EMOTIONS)[number];

export interface RobotLcdNextSchedule {
    label: string;
    time: string;
}

export interface RobotLcdStatePayload {
    mode: RobotLcdMode;
    emotion: RobotLcdEmotion;
    message: string;
    subMessage: string;
    nextSchedule: RobotLcdNextSchedule | null;
    lastUpdatedAt: string | null;
}

export interface RobotLcdModeChangeRequest {
    mode: RobotLcdMode;
    emotion: RobotLcdEmotion;
    message: string;
    subMessage: string;
}

export interface RobotLcdModeChangeResponse extends RobotLcdModeChangeRequest {
    updatedAt: string;
}

export const ROBOT_EVENT_TYPES = [
    'WAKE_UP',
    'SLEEP',
    'OUT_DETECTED',
    'RETURN_DETECTED',
    'BUTTON',
] as const;

export type RobotEventType = (typeof ROBOT_EVENT_TYPES)[number];

export const ROBOT_EVENT_ACTIONS = ['TAKE', 'LATER', 'CONFIRM', 'EMERGENCY'] as const;

export type RobotEventAction = (typeof ROBOT_EVENT_ACTIONS)[number];

const ROBOT_EVENT_TYPE_ALIASES: Partial<Record<string, RobotEventType>> = {
    LCD_BUTTON: 'BUTTON',
};

export interface RobotEventPayload {
    type: RobotEventType;
    detectedAt: string;
    location: string | null;
    confidence: number | null;
    action: RobotEventAction | null;
    medicationId: number | null;
}

export interface RobotEventsRequest {
    events: RobotEventPayload[];
}

export interface RobotEventsResponse {
    accepted: number;
    receivedAt: string;
}

export interface RobotLcdRealtimePayload {
    robotId: number;
    mode: RobotLcdMode;
    emotion: RobotLcdEmotion;
    message: string;
    subMessage: string;
    nextSchedule: RobotLcdNextSchedule | null;
    updatedAt: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readString = (value: unknown, field: string): string => {
    if (typeof value !== 'string') {
        throw new Error(`[contract] ${field} must be string`);
    }
    return value;
};

const readNumber = (value: unknown, field: string): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`[contract] ${field} must be number`);
    }
    return value;
};

const readNullableString = (value: unknown, field: string): string | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readString(value, field);
};

const readNullableNumber = (value: unknown, field: string): number | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readNumber(value, field);
};

const readEnum = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
    const text = readString(value, field);
    if (!allowed.includes(text as T)) {
        throw new Error(`[contract] ${field} must be one of ${allowed.join(', ')}`);
    }
    return text as T;
};

const normalizeContractEnumText = (value: string): string => {
    return value.trim().toUpperCase();
};

const parseRobotEventType = (value: unknown): RobotEventType => {
    const normalized = normalizeContractEnumText(readString(value, 'robotEvent.type'));
    const aliased = ROBOT_EVENT_TYPE_ALIASES[normalized] ?? normalized;
    return readEnum(aliased, ROBOT_EVENT_TYPES, 'robotEvent.type');
};

const parseRobotEventAction = (value: unknown): RobotEventAction => {
    const normalized = normalizeContractEnumText(readString(value, 'robotEvent.action'));
    return readEnum(normalized, ROBOT_EVENT_ACTIONS, 'robotEvent.action');
};

const parseRobotLcdNextSchedule = (value: unknown, field: string): RobotLcdNextSchedule => {
    if (!isRecord(value)) {
        throw new Error(`[contract] ${field} must be object`);
    }

    return {
        label: readString(value.label, `${field}.label`),
        time: readString(value.time, `${field}.time`),
    };
};

export const parseRobotLcdStatePayload = (value: unknown): RobotLcdStatePayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] lcd state must be object');
    }

    const nextSchedule = value.nextSchedule === undefined || value.nextSchedule === null
        ? null
        : parseRobotLcdNextSchedule(value.nextSchedule, 'lcdState.nextSchedule');

    return {
        mode: readEnum(value.mode, ROBOT_LCD_MODES, 'lcdState.mode'),
        emotion: readEnum(value.emotion, ROBOT_LCD_EMOTIONS, 'lcdState.emotion'),
        message: readString(value.message, 'lcdState.message'),
        subMessage: readString(value.subMessage, 'lcdState.subMessage'),
        nextSchedule,
        lastUpdatedAt: readNullableString(
            value.lastUpdatedAt ?? value.updatedAt,
            'lcdState.lastUpdatedAt'
        ),
    };
};

export const parseRobotLcdModeChangeRequest = (value: unknown): RobotLcdModeChangeRequest => {
    if (!isRecord(value)) {
        throw new Error('[contract] lcdModeChange request must be object');
    }

    return {
        mode: readEnum(value.mode, ROBOT_LCD_MODES, 'lcdModeChangeRequest.mode'),
        emotion: readEnum(value.emotion, ROBOT_LCD_EMOTIONS, 'lcdModeChangeRequest.emotion'),
        message: readString(value.message, 'lcdModeChangeRequest.message'),
        subMessage: readString(value.subMessage, 'lcdModeChangeRequest.subMessage'),
    };
};

export const parseRobotLcdModeChangeResponse = (value: unknown): RobotLcdModeChangeResponse => {
    if (!isRecord(value)) {
        throw new Error('[contract] lcdModeChange response must be object');
    }

    const requestShape = parseRobotLcdModeChangeRequest(value);

    return {
        ...requestShape,
        updatedAt: readString(value.updatedAt, 'lcdModeChangeResponse.updatedAt'),
    };
};

const parseRobotEventPayload = (value: unknown): RobotEventPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] robot event must be object');
    }

    const type = parseRobotEventType(value.type);
    const detectedAt = value.detectedAt ?? value.timestamp;
    if (detectedAt === undefined) {
        throw new Error('[contract] robotEvent.detectedAt is required');
    }

    const actionText = readNullableString(value.action, 'robotEvent.action');
    const action =
        actionText === null
            ? null
            : parseRobotEventAction(actionText);
    const medicationId = readNullableNumber(value.medicationId, 'robotEvent.medicationId');

    if (type === 'BUTTON' && action === null) {
        throw new Error('[contract] robotEvent.action is required for BUTTON');
    }
    if (action === 'TAKE' && medicationId === null) {
        throw new Error('[contract] robotEvent.medicationId is required for TAKE');
    }

    return {
        type,
        detectedAt: readString(detectedAt, 'robotEvent.detectedAt'),
        location: readNullableString(value.location, 'robotEvent.location'),
        confidence: readNullableNumber(value.confidence, 'robotEvent.confidence'),
        action,
        medicationId,
    };
};

export const parseRobotEventsRequest = (value: unknown): RobotEventsRequest => {
    if (!isRecord(value)) {
        throw new Error('[contract] robot events request must be object');
    }
    if (!Array.isArray(value.events)) {
        throw new Error('[contract] robotEvents.events must be array');
    }

    return {
        events: value.events.map((event) => parseRobotEventPayload(event)),
    };
};

export const parseRobotEventsResponse = (value: unknown): RobotEventsResponse => {
    if (!isRecord(value)) {
        throw new Error('[contract] robot events response must be object');
    }

    return {
        accepted: readNumber(value.accepted, 'robotEventsResponse.accepted'),
        receivedAt: readString(value.receivedAt, 'robotEventsResponse.receivedAt'),
    };
};

export const parseRobotLcdRealtimePayload = (value: unknown): RobotLcdRealtimePayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] lcd realtime payload must be object');
    }

    const nextSchedule = value.nextSchedule === undefined || value.nextSchedule === null
        ? null
        : parseRobotLcdNextSchedule(value.nextSchedule, 'lcdRealtime.nextSchedule');

    return {
        robotId: readNumber(value.robotId, 'lcdRealtime.robotId'),
        mode: readEnum(value.mode, ROBOT_LCD_MODES, 'lcdRealtime.mode'),
        emotion: readEnum(value.emotion, ROBOT_LCD_EMOTIONS, 'lcdRealtime.emotion'),
        message: readString(value.message, 'lcdRealtime.message'),
        subMessage: readString(value.subMessage, 'lcdRealtime.subMessage'),
        nextSchedule,
        updatedAt: readNullableString(
            value.updatedAt ?? value.lastUpdatedAt ?? value.timestamp,
            'lcdRealtime.updatedAt'
        ),
    };
};
