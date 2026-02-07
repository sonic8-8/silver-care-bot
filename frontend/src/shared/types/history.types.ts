export const ACTIVITY_TYPES = [
    'WAKE_UP',
    'SLEEP',
    'MEDICATION_TAKEN',
    'MEDICATION_MISSED',
    'PATROL_COMPLETE',
    'OUT_DETECTED',
    'RETURN_DETECTED',
    'CONVERSATION',
    'EMERGENCY',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityItem {
    id: number;
    elderId: number | null;
    robotId: number | null;
    type: ActivityType;
    title: string | null;
    description: string | null;
    location: string | null;
    detectedAt: string;
    createdAt: string | null;
}

export interface ActivityListPayload {
    date: string;
    activities: ActivityItem[];
}

export const WEEKLY_REPORT_SOURCES = ['CALCULATED', 'STORED'] as const;

export type WeeklyReportSource = (typeof WEEKLY_REPORT_SOURCES)[number];

export interface WeeklyReportPayload {
    weekStartDate: string;
    weekEndDate: string;
    medicationRate: number;
    activityCount: number;
    conversationKeywords: string[];
    recommendations: string[];
    generatedAt: string;
    source: WeeklyReportSource;
}

export const PATROL_TARGETS = [
    'GAS_VALVE',
    'DOOR',
    'OUTLET',
    'WINDOW',
    'APPLIANCE',
    'MULTI_TAP',
] as const;

type PatrolTargetInput = (typeof PATROL_TARGETS)[number];

export type PatrolTarget = Exclude<PatrolTargetInput, 'APPLIANCE'> | 'MULTI_TAP';

export const PATROL_ITEM_STATUSES = [
    'NORMAL',
    'LOCKED',
    'UNLOCKED',
    'ON',
    'OFF',
    'NEEDS_CHECK',
] as const;

export type PatrolItemStatus = (typeof PATROL_ITEM_STATUSES)[number];

export interface PatrolItem {
    id: number;
    target: PatrolTarget;
    label: string;
    status: PatrolItemStatus;
    checkedAt: string;
    imageUrl: string | null;
}

export interface PatrolLatestPayload {
    lastPatrolAt: string | null;
    items: PatrolItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readString = (value: unknown, field: string): string => {
    if (typeof value !== 'string') {
        throw new Error(`[contract] ${field} must be string`);
    }
    return value;
};

const readNumber = (value: unknown, field: string): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`[contract] ${field} must be number`);
    }
    return value;
};

const readNullableString = (value: unknown, field: string): string | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readString(value, field);
};

const readNullableNumber = (value: unknown, field: string): number | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readNumber(value, field);
};

const readStringArray = (value: unknown, field: string): string[] => {
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        throw new Error(`[contract] ${field} must be string[]`);
    }
    return value;
};

const readEnum = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
    const text = readString(value, field);
    if (!allowed.includes(text as T)) {
        throw new Error(`[contract] ${field} must be one of ${allowed.join(', ')}`);
    }
    return text as T;
};

export const parseActivityItem = (value: unknown): ActivityItem => {
    if (!isRecord(value)) {
        throw new Error('[contract] activity must be object');
    }

    const detectedAt = value.detectedAt ?? value.timestamp;
    if (detectedAt === undefined) {
        throw new Error('[contract] activity.detectedAt is required');
    }

    return {
        id: readNumber(value.id, 'activity.id'),
        elderId: readNullableNumber(value.elderId, 'activity.elderId'),
        robotId: readNullableNumber(value.robotId, 'activity.robotId'),
        type: readEnum(value.type, ACTIVITY_TYPES, 'activity.type'),
        title: readNullableString(value.title, 'activity.title'),
        description: readNullableString(value.description, 'activity.description'),
        location: readNullableString(value.location, 'activity.location'),
        detectedAt: readString(detectedAt, 'activity.detectedAt'),
        createdAt: readNullableString(value.createdAt, 'activity.createdAt'),
    };
};

export const parseActivityListPayload = (value: unknown): ActivityListPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] activityList must be object');
    }
    if (!Array.isArray(value.activities)) {
        throw new Error('[contract] activityList.activities must be array');
    }

    return {
        date: readString(value.date, 'activityList.date'),
        activities: value.activities.map((item) => parseActivityItem(item)),
    };
};

export const parseWeeklyReportPayload = (value: unknown): WeeklyReportPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] weeklyReport must be object');
    }

    return {
        weekStartDate: readString(value.weekStartDate, 'weeklyReport.weekStartDate'),
        weekEndDate: readString(value.weekEndDate, 'weeklyReport.weekEndDate'),
        medicationRate: readNumber(value.medicationRate, 'weeklyReport.medicationRate'),
        activityCount: readNumber(value.activityCount, 'weeklyReport.activityCount'),
        conversationKeywords: readStringArray(value.conversationKeywords, 'weeklyReport.conversationKeywords'),
        recommendations: readStringArray(value.recommendations, 'weeklyReport.recommendations'),
        generatedAt: readString(value.generatedAt, 'weeklyReport.generatedAt'),
        source: readEnum(value.source, WEEKLY_REPORT_SOURCES, 'weeklyReport.source'),
    };
};

export const parsePatrolItem = (value: unknown): PatrolItem => {
    if (!isRecord(value)) {
        throw new Error('[contract] patrolItem must be object');
    }

    const target = readEnum(value.target, PATROL_TARGETS, 'patrolItem.target');

    return {
        id: readNumber(value.id, 'patrolItem.id'),
        target: target === 'APPLIANCE' ? 'MULTI_TAP' : target,
        label: readString(value.label, 'patrolItem.label'),
        status: readEnum(value.status, PATROL_ITEM_STATUSES, 'patrolItem.status'),
        checkedAt: readString(value.checkedAt, 'patrolItem.checkedAt'),
        imageUrl: readNullableString(value.imageUrl, 'patrolItem.imageUrl'),
    };
};

export const parsePatrolLatestPayload = (value: unknown): PatrolLatestPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] patrolLatest must be object');
    }
    if (!Array.isArray(value.items)) {
        throw new Error('[contract] patrolLatest.items must be array');
    }

    return {
        lastPatrolAt: readNullableString(value.lastPatrolAt, 'patrolLatest.lastPatrolAt'),
        items: value.items.map((item) => parsePatrolItem(item)),
    };
};
