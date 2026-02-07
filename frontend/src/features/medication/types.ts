export type MedicationFrequency = 'MORNING' | 'EVENING' | 'BOTH';
export type MedicationIntakeStatus = 'TAKEN' | 'MISSED' | 'PENDING';

export interface WeeklyMedicationStatus {
    taken: number;
    missed: number;
    total: number;
    rate: number;
}

export interface DailyMedicationStatus {
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    morning: MedicationIntakeStatus;
    evening: MedicationIntakeStatus;
}

export interface MedicationItem {
    id: number;
    name: string;
    dosage: string;
    frequency: MedicationFrequency;
    timing?: string | null;
    color?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export interface MedicationDispenserStatus {
    remaining: number;
    capacity: number;
    needsRefill: boolean;
    daysUntilEmpty?: number | null;
}

export interface MedicationOverview {
    weeklyStatus: WeeklyMedicationStatus;
    dailyStatus: DailyMedicationStatus[];
    medications: MedicationItem[];
    dispenser?: MedicationDispenserStatus | null;
}

export interface CreateMedicationPayload {
    name: string;
    dosage: string;
    frequency: MedicationFrequency;
    timing?: string;
    startDate: string;
    endDate?: string | null;
}

export interface UpdateMedicationPayload {
    name?: string;
    dosage?: string;
    frequency?: MedicationFrequency;
    timing?: string;
    startDate?: string;
    endDate?: string | null;
}
