import axios from 'axios';
import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type {
    ActivityItem,
    ActivityListData,
    ActivityType,
    WeeklyReportData,
    WeeklyReportSource,
} from '../types';

const activityTypes: ActivityType[] = [
    'WAKE_UP',
    'SLEEP',
    'MEDICATION_TAKEN',
    'MEDICATION_MISSED',
    'PATROL_COMPLETE',
    'OUT_DETECTED',
    'RETURN_DETECTED',
    'CONVERSATION',
    'EMERGENCY',
];

const weeklyReportSources: WeeklyReportSource[] = ['CALCULATED', 'STORED'];

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return fallback;
};

const toNullableNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return null;
};

const toNullableString = (value: unknown) => {
    return typeof value === 'string' ? value : null;
};

const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is string => typeof item === 'string');
};

const ensureActivityType = (value: unknown): ActivityType => {
    if (typeof value !== 'string') {
        return 'UNKNOWN';
    }
    return activityTypes.includes(value as ActivityType) ? (value as ActivityType) : 'UNKNOWN';
};

const ensureReportSource = (value: unknown): WeeklyReportSource => {
    if (typeof value !== 'string') {
        return 'UNKNOWN';
    }
    return weeklyReportSources.includes(value as WeeklyReportSource) ? (value as WeeklyReportSource) : 'UNKNOWN';
};

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const toWeekStartDate = (baseDate: Date) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const day = date.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + distanceToMonday);
    return date;
};

const buildWeekEndDate = (weekStartDate: string) => {
    const parsed = new Date(weekStartDate);
    if (Number.isNaN(parsed.getTime())) {
        return weekStartDate;
    }
    const endDate = new Date(parsed);
    endDate.setDate(parsed.getDate() + 6);
    return formatDate(endDate);
};

const normalizeActivity = (raw: unknown): ActivityItem => {
    const item = isRecord(raw) ? raw : {};

    return {
        id: Math.trunc(toFiniteNumber(item.id, 0)),
        elderId: toNullableNumber(item.elderId),
        robotId: toNullableNumber(item.robotId),
        type: ensureActivityType(item.type),
        title: toNullableString(item.title),
        description: toNullableString(item.description),
        location: toNullableString(item.location),
        detectedAt: typeof item.detectedAt === 'string' ? item.detectedAt : '',
        createdAt: toNullableString(item.createdAt),
    };
};

const normalizeActivityList = (raw: unknown, requestedDate: string): ActivityListData => {
    const payload = isRecord(raw) ? raw : {};
    const activities = Array.isArray(payload.activities) ? payload.activities.map(normalizeActivity) : [];
    return {
        date: typeof payload.date === 'string' ? payload.date : requestedDate,
        activities: activities
            .slice()
            .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()),
    };
};

const normalizeWeeklyReport = (raw: unknown, weekStartDate: string): WeeklyReportData => {
    const payload = isRecord(raw) ? raw : {};

    return {
        weekStartDate: typeof payload.weekStartDate === 'string' ? payload.weekStartDate : weekStartDate,
        weekEndDate:
            typeof payload.weekEndDate === 'string'
                ? payload.weekEndDate
                : buildWeekEndDate(weekStartDate),
        medicationRate: Math.max(0, Math.min(100, Number(toFiniteNumber(payload.medicationRate, 0).toFixed(1)))),
        activityCount: Math.max(0, Math.trunc(toFiniteNumber(payload.activityCount, 0))),
        conversationKeywords: toStringArray(payload.conversationKeywords),
        recommendations: toStringArray(payload.recommendations),
        generatedAt: toNullableString(payload.generatedAt),
        source: ensureReportSource(payload.source),
    };
};

export const isHistoryDependencyFallbackError = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const status = error.response?.status;
    return status === 404 || status === 501;
};

export const getActivities = async (elderId: number, date: string): Promise<ActivityListData> => {
    try {
        const response = await api.get<ApiResult<unknown>>(`/elders/${elderId}/activities`, {
            params: { date },
        });
        const payload = unwrapApiResponse(response.data);
        return normalizeActivityList(payload, date);
    } catch (error) {
        if (isHistoryDependencyFallbackError(error)) {
            return {
                date,
                activities: [],
            };
        }
        throw error;
    }
};

export const getWeeklyReport = async (elderId: number, weekStartDate: string): Promise<WeeklyReportData> => {
    try {
        const response = await api.get<ApiResult<unknown>>(`/elders/${elderId}/reports/weekly`, {
            params: { weekStartDate },
        });
        const payload = unwrapApiResponse(response.data);
        return normalizeWeeklyReport(payload, weekStartDate);
    } catch (error) {
        if (isHistoryDependencyFallbackError(error)) {
            return normalizeWeeklyReport({}, weekStartDate);
        }
        throw error;
    }
};
