export type ElderStatus = 'SAFE' | 'WARNING' | 'DANGER';

export type EmergencyType = 'FALL_DETECTED' | 'NO_RESPONSE' | 'SOS_BUTTON' | 'UNUSUAL_PATTERN';

export interface ElderSummary {
    id: number;
    name: string;
    age: number;
    status: ElderStatus;
    lastActivity: string;
    location?: string;
    robotConnected?: boolean;
    emergencyType?: EmergencyType;
}

export interface ElderListSummary {
    total: number;
    safe: number;
    warning: number;
    danger: number;
}

export interface ElderListPayload {
    elders: ElderSummary[];
    summary: ElderListSummary;
}

export interface ElderDetail {
    id: number;
    name: string;
    age: number;
    status: ElderStatus;
    lastActivity: string;
    location?: string;
    robotConnected?: boolean;
    emergencyType?: EmergencyType;
}
