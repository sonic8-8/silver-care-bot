import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type {
    RobotLcdMode,
    RobotSettings,
    RobotStatus,
    UpdateRobotSettingsPayload,
} from '@/shared/types/robot.types';

export type RobotCommandType =
    | 'MOVE_TO'
    | 'START_PATROL'
    | 'RETURN_TO_DOCK'
    | 'SPEAK'
    | 'CHANGE_LCD_MODE';

export type RobotCommandStatus =
    | 'PENDING'
    | 'RECEIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';

export interface RobotCommandRequest {
    command: RobotCommandType;
    params?: Record<string, unknown>;
}

export interface RobotCommandResponse {
    commandId: string;
    robotId: number;
    command: RobotCommandType;
    params?: Record<string, unknown> | null;
    status: RobotCommandStatus;
    issuedAt: string;
}

export interface RobotLcdResponse {
    mode: RobotLcdMode;
    emotion: string;
    message?: string;
    subMessage?: string;
    nextSchedule?: {
        label: string;
        time: string;
    };
    lastUpdatedAt?: string;
}

interface DashboardRobotStatusPayload {
    robotId?: number | null;
}

interface ElderDashboardResponse {
    robotStatus?: DashboardRobotStatusPayload | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const ensureData = <T>(data: T | null, message: string): T => {
    if (!data) {
        throw new Error(message);
    }
    return data;
};

const parseRobotSettings = (value: unknown): RobotSettings => {
    if (!isRecord(value)) {
        throw new Error('Robot settings response is empty');
    }

    if (isRecord(value.settings)) {
        return value.settings as RobotSettings;
    }

    return value as RobotSettings;
};

export const robotApi = {
    async getStatus(robotId: number): Promise<RobotStatus> {
        const response = await api.get<ApiResult<RobotStatus>>(`/robots/${robotId}/status`);
        return ensureData(unwrapApiResponse(response.data), 'Robot status is empty');
    },

    async sendCommand(robotId: number, request: RobotCommandRequest): Promise<RobotCommandResponse> {
        const response = await api.post<ApiResult<RobotCommandResponse>>(`/robots/${robotId}/commands`, request);
        return ensureData(unwrapApiResponse(response.data), 'Robot command response is empty');
    },

    async getLcd(robotId: number): Promise<RobotLcdResponse> {
        const response = await api.get<ApiResult<RobotLcdResponse>>(`/robots/${robotId}/lcd`);
        return ensureData(unwrapApiResponse(response.data), 'Robot LCD response is empty');
    },

    async getRobotIdByElder(elderId: number): Promise<number | null> {
        const response = await api.get<ApiResult<ElderDashboardResponse>>(`/elders/${elderId}/dashboard`);
        const data = unwrapApiResponse(response.data);
        return typeof data?.robotStatus?.robotId === 'number' ? data.robotStatus.robotId : null;
    },

    async updateSettings(robotId: number, payload: UpdateRobotSettingsPayload): Promise<RobotSettings> {
        const response = await api.patch<ApiResult<RobotSettings | RobotStatus>>(
            `/robots/${robotId}/settings`,
            payload
        );
        return parseRobotSettings(unwrapApiResponse(response.data));
    },
};
