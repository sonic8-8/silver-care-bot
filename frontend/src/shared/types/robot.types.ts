export type RobotConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export type RobotLcdMode =
    | 'IDLE'
    | 'GREETING'
    | 'MEDICATION'
    | 'SCHEDULE'
    | 'LISTENING'
    | 'EMERGENCY'
    | 'SLEEP';

export interface RobotPatrolTimeRange {
    start: string;
    end: string;
}

export interface RobotSettings {
    morningMedicationTime?: string;
    eveningMedicationTime?: string;
    ttsVolume?: number;
    patrolTimeRange?: RobotPatrolTimeRange;
}

export interface UpdateRobotSettingsPayload {
    morningMedicationTime?: string;
    eveningMedicationTime?: string;
    ttsVolume?: number;
    patrolTimeRange?: RobotPatrolTimeRange;
}

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
    settings?: RobotSettings;
}
