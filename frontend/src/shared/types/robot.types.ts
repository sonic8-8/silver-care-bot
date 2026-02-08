export type RobotConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export type RobotLcdMode =
    | 'IDLE'
    | 'GREETING'
    | 'MEDICATION'
    | 'SCHEDULE'
    | 'LISTENING'
    | 'EMERGENCY'
    | 'SLEEP';

export interface RobotStatus {
    id: number;
    serialNumber: string;
    batteryLevel: number;
    isCharging: boolean;
    networkStatus: RobotConnectionStatus;
    currentLocation?: string;
    lcdMode?: RobotLcdMode;
    lastSyncAt?: string;
    dispenser?: {
        remaining: number;
        capacity: number;
        daysUntilEmpty?: number;
    };
    settings?: {
        morningMedicationTime?: string;
        eveningMedicationTime?: string;
        ttsVolume?: number;
        patrolTimeRange?: {
            start: string;
            end: string;
        };
    };
}

export const ROBOT_COMMAND_ACK_STATUSES = [
    'RECEIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
] as const;

export type RobotCommandAckStatus = (typeof ROBOT_COMMAND_ACK_STATUSES)[number];

export interface RobotSyncPendingCommand {
    commandId: string;
    command: string;
    params: Record<string, unknown> | null;
    issuedAt: string;
}

export interface RobotSyncScheduleReminder {
    scheduleId: number;
    title: string;
    datetime: string;
    remindAt: string;
}

export interface RobotSyncMedicationReminder {
    medicationId: number;
    scheduledAt: string;
    name: string;
}

export interface RobotSyncPayload {
    pendingCommands: RobotSyncPendingCommand[];
    scheduleReminders: RobotSyncScheduleReminder[];
    medications: RobotSyncMedicationReminder[];
    serverTime: string | null;
}

export interface RobotCommandAckRequest {
    status: RobotCommandAckStatus;
    completedAt: string | null;
    result: Record<string, unknown> | null;
}

export interface RobotCommandAckResponse {
    commandId: string;
    status: RobotCommandAckStatus;
    receivedAt: string | null;
    result: Record<string, unknown> | null;
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

const readStringLike = (value: unknown, field: string): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    throw new Error(`[contract] ${field} must be string`);
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

const readNullableRecord = (value: unknown, field: string): Record<string, unknown> | null => {
    if (value === undefined || value === null) {
        return null;
    }
    if (!isRecord(value)) {
        throw new Error(`[contract] ${field} must be object`);
    }
    return value;
};

const readEnum = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
    const text = readString(value, field);
    if (!allowed.includes(text as T)) {
        throw new Error(`[contract] ${field} must be one of ${allowed.join(', ')}`);
    }
    return text as T;
};

const parseSyncPendingCommand = (value: unknown): RobotSyncPendingCommand => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotSync.pendingCommand must be object');
    }

    return {
        commandId: readStringLike(value.commandId, 'robotSync.pendingCommand.commandId'),
        command: readString(value.command, 'robotSync.pendingCommand.command'),
        params: readNullableRecord(value.params, 'robotSync.pendingCommand.params'),
        issuedAt: readString(value.issuedAt, 'robotSync.pendingCommand.issuedAt'),
    };
};

const parseSyncScheduleReminder = (value: unknown): RobotSyncScheduleReminder => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotSync.scheduleReminder must be object');
    }

    return {
        scheduleId: readNumber(value.scheduleId, 'robotSync.scheduleReminder.scheduleId'),
        title: readString(value.title, 'robotSync.scheduleReminder.title'),
        datetime: readString(value.datetime, 'robotSync.scheduleReminder.datetime'),
        remindAt: readString(value.remindAt, 'robotSync.scheduleReminder.remindAt'),
    };
};

const parseSyncMedicationReminder = (value: unknown): RobotSyncMedicationReminder => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotSync.medication must be object');
    }

    return {
        medicationId: readNumber(value.medicationId, 'robotSync.medication.medicationId'),
        scheduledAt: readString(value.scheduledAt, 'robotSync.medication.scheduledAt'),
        name: readString(value.name, 'robotSync.medication.name'),
    };
};

export const parseRobotSyncPayload = (value: unknown): RobotSyncPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotSync must be object');
    }

    const pendingCommandsValue = value.pendingCommands ?? [];
    const scheduleRemindersValue = value.scheduleReminders ?? [];
    const medicationsValue = value.medications ?? [];

    if (!Array.isArray(pendingCommandsValue)) {
        throw new Error('[contract] robotSync.pendingCommands must be array');
    }
    if (!Array.isArray(scheduleRemindersValue)) {
        throw new Error('[contract] robotSync.scheduleReminders must be array');
    }
    if (!Array.isArray(medicationsValue)) {
        throw new Error('[contract] robotSync.medications must be array');
    }

    return {
        pendingCommands: pendingCommandsValue.map((item) => parseSyncPendingCommand(item)),
        scheduleReminders: scheduleRemindersValue.map((item) => parseSyncScheduleReminder(item)),
        medications: medicationsValue.map((item) => parseSyncMedicationReminder(item)),
        serverTime: readNullableString(
            value.serverTime ?? value.timestamp,
            'robotSync.serverTime'
        ),
    };
};

export const parseRobotCommandAckRequest = (value: unknown): RobotCommandAckRequest => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotCommandAck request must be object');
    }

    return {
        status: readEnum(value.status, ROBOT_COMMAND_ACK_STATUSES, 'robotCommandAckRequest.status'),
        completedAt: readNullableString(value.completedAt, 'robotCommandAckRequest.completedAt'),
        result: readNullableRecord(value.result, 'robotCommandAckRequest.result'),
    };
};

export const parseRobotCommandAckResponse = (value: unknown): RobotCommandAckResponse => {
    if (!isRecord(value)) {
        throw new Error('[contract] robotCommandAck response must be object');
    }

    return {
        commandId: readStringLike(value.commandId, 'robotCommandAckResponse.commandId'),
        status: readEnum(value.status, ROBOT_COMMAND_ACK_STATUSES, 'robotCommandAckResponse.status'),
        receivedAt: readNullableString(
            value.receivedAt ?? value.serverTime ?? value.completedAt ?? value.timestamp,
            'robotCommandAckResponse.receivedAt'
        ),
        result: readNullableRecord(value.result, 'robotCommandAckResponse.result'),
    };
};
