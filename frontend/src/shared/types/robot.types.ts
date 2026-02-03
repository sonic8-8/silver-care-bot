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
