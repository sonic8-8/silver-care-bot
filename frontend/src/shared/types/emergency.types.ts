import type { EmergencyType } from './elder.types';

export type EmergencyResolution =
    | 'PENDING'
    | 'FALSE_ALARM'
    | 'RESOLVED'
    | 'EMERGENCY_CALLED'
    | 'FAMILY_CONTACTED';

export interface EmergencyDetail {
    emergencyId: number;
    elderId: number;
    robotId?: number | null;
    type: EmergencyType;
    location?: string | null;
    confidence?: number | null;
    resolution: EmergencyResolution;
    note?: string | null;
    detectedAt: string;
    resolvedAt?: string | null;
}

export interface EmergencyListPayload {
    emergencies: EmergencyDetail[];
}
