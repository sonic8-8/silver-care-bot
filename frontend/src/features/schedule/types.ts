export type ScheduleType = 'HOSPITAL' | 'MEDICATION' | 'PERSONAL' | 'FAMILY' | 'OTHER';
export type ScheduleSource = 'MANUAL' | 'VOICE' | 'SYSTEM';
export type ScheduleStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface ScheduleItem {
    id: number;
    elderId?: number;
    title: string;
    description?: string | null;
    scheduledAt: string;
    location?: string | null;
    type: ScheduleType;
    source: ScheduleSource;
    voiceOriginal?: string | null;
    status: ScheduleStatus;
    remindBeforeMinutes?: number | null;
}

export interface ScheduleListPayload {
    schedules: ScheduleItem[];
}

export type CreateSchedulePayload = {
    title: string;
    description?: string | null;
    scheduledAt: string;
    location?: string | null;
    type: ScheduleType;
    remindBeforeMinutes?: number | null;
};

export type UpdateSchedulePayload = {
    title?: string;
    description?: string | null;
    scheduledAt?: string;
    location?: string | null;
    type?: ScheduleType;
    remindBeforeMinutes?: number | null;
};
