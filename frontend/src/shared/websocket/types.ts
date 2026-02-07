import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';

export type WebSocketMessageType =
    | 'ROBOT_STATUS_UPDATE'
    | 'LCD_MODE_CHANGE'
    | 'EMERGENCY_ALERT'
    | 'NOTIFICATION'
    | 'ELDER_STATUS_UPDATE';

export type WebSocketEnvelope<TPayload> = {
    type: WebSocketMessageType;
    payload: TPayload;
    timestamp?: string;
};

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export type RobotStatusPayload = {
    robotId: number;
    elderId?: number | null;
    batteryLevel?: number | null;
    networkStatus?: RobotConnectionStatus | string | null;
    currentLocation?: string | null;
    lcdMode?: RobotLcdMode | string | null;
};

export type LcdModePayload = {
    robotId: number;
    mode: string;
    emotion?: string;
    message?: string;
    subMessage?: string;
};

export type ElderStatusPayload = {
    elderId: number;
    status: string;
    lastActivity?: string | null;
    location?: string | null;
};

export type NotificationPayload = {
    id: number;
    type: string;
    title: string;
    message: string;
    elderId?: number;
    targetPath?: string;
};

export type EmergencyPayload = {
    emergencyId: number;
    elderId: number;
    elderName?: string;
    type: string;
    location?: string;
    detectedAt?: string;
};

export type DashboardRobotRealtimeState = {
    robotId: number;
    elderId: number | null;
    batteryLevel: number | null;
    networkStatus: RobotConnectionStatus | null;
    currentLocation: string | null;
    lcdMode: RobotLcdMode | null;
    timestamp?: string;
};

export type DashboardElderRealtimeState = {
    elderId: number;
    status: string;
    lastActivity: string | null;
    location: string | null;
    timestamp?: string;
};
