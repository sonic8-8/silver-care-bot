export type ElderStatus = 'SAFE' | 'WARNING' | 'DANGER';
export type Gender = 'MALE' | 'FEMALE';

export type EmergencyType = 'FALL_DETECTED' | 'NO_RESPONSE' | 'SOS_BUTTON' | 'UNUSUAL_PATTERN';

export interface EmergencyContact {
    id: number;
    name: string;
    phone: string;
    relation?: string;
    priority?: number;
}

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
    birthDate?: string | null;
    gender?: Gender | null;
    address?: string | null;
    status: ElderStatus;
    lastActivity: string;
    location?: string | null;
    robotConnected?: boolean;
    emergencyType?: EmergencyType;
    emergencyContacts?: EmergencyContact[];
}
