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
    elderId?: number;
    batteryLevel?: number;
    networkStatus?: string;
    currentLocation?: string;
    lcdMode?: string;
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
    lastActivity?: string;
    location?: string;
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
