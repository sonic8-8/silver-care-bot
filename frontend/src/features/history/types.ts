export type ActivityType =
    | 'WAKE_UP'
    | 'SLEEP'
    | 'MEDICATION_TAKEN'
    | 'MEDICATION_MISSED'
    | 'PATROL_COMPLETE'
    | 'OUT_DETECTED'
    | 'RETURN_DETECTED'
    | 'CONVERSATION'
    | 'EMERGENCY'
    | 'UNKNOWN';

export interface ActivityItem {
    id: number;
    elderId?: number | null;
    robotId?: number | null;
    type: ActivityType;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    detectedAt: string;
    createdAt?: string | null;
}

export interface ActivityListData {
    date: string;
    activities: ActivityItem[];
}

export type WeeklyReportSource = 'CALCULATED' | 'STORED' | 'UNKNOWN';

export interface WeeklyReportData {
    weekStartDate: string;
    weekEndDate: string;
    medicationRate: number;
    activityCount: number;
    conversationKeywords: string[];
    recommendations: string[];
    generatedAt?: string | null;
    source: WeeklyReportSource;
}
