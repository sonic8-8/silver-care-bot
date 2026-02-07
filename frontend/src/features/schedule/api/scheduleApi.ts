import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type {
    CreateSchedulePayload,
    ScheduleItem,
    ScheduleListPayload,
    ScheduleSource,
    ScheduleStatus,
    ScheduleType,
    UpdateSchedulePayload,
} from '../types';

type RawScheduleItem = {
    id: number;
    elderId?: number;
    title: string;
    description?: string | null;
    scheduledAt?: string;
    datetime?: string;
    location?: string | null;
    type?: string;
    source?: string;
    voiceOriginal?: string | null;
    status?: string;
    remindBeforeMinutes?: number | null;
    remindBefore?: number | null;
};

type RawScheduleListPayload = {
    schedules?: RawScheduleItem[];
};

const toScheduleType = (value: string | undefined): ScheduleType => {
    if (value === 'HOSPITAL' || value === 'MEDICATION' || value === 'PERSONAL' || value === 'FAMILY') {
        return value;
    }

    return 'OTHER';
};

const toScheduleSource = (value: string | undefined): ScheduleSource => {
    if (value === 'VOICE' || value === 'SYSTEM') {
        return value;
    }

    return 'MANUAL';
};

const toScheduleStatus = (value: string | undefined): ScheduleStatus => {
    if (value === 'COMPLETED' || value === 'CANCELLED') {
        return value;
    }

    return 'UPCOMING';
};

const normalizeSchedule = (item: RawScheduleItem): ScheduleItem => {
    const scheduledAt = item.scheduledAt ?? item.datetime;
    if (!scheduledAt) {
        throw new Error('Schedule dateTime is empty');
    }

    return {
        id: item.id,
        elderId: item.elderId,
        title: item.title,
        description: item.description ?? null,
        scheduledAt,
        location: item.location ?? null,
        type: toScheduleType(item.type),
        source: toScheduleSource(item.source),
        voiceOriginal: item.voiceOriginal ?? null,
        status: toScheduleStatus(item.status),
        remindBeforeMinutes: item.remindBeforeMinutes ?? item.remindBefore ?? null,
    };
};

const normalizeScheduleList = (payload: RawScheduleListPayload | null): ScheduleListPayload => ({
    schedules: (payload?.schedules ?? []).map(normalizeSchedule),
});

const stripUndefined = <T extends Record<string, unknown>>(value: T): Partial<T> => {
    return Object.fromEntries(
        Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
    ) as Partial<T>;
};

export const getSchedules = async (
    elderId: number,
    params?: {
        startDate?: string;
        endDate?: string;
        type?: ScheduleType;
    }
) => {
    const response = await api.get<ApiResult<RawScheduleListPayload>>(`/elders/${elderId}/schedules`, {
        params,
    });

    return normalizeScheduleList(unwrapApiResponse(response.data));
};

export const createSchedule = async (elderId: number, payload: CreateSchedulePayload) => {
    const response = await api.post<ApiResult<RawScheduleItem>>(`/elders/${elderId}/schedules`, payload);

    const item = unwrapApiResponse(response.data);
    if (!item) {
        throw new Error('Created schedule is empty');
    }

    return normalizeSchedule(item);
};

export const updateSchedule = async (
    elderId: number,
    scheduleId: number,
    payload: UpdateSchedulePayload
) => {
    const response = await api.put<ApiResult<RawScheduleItem>>(
        `/elders/${elderId}/schedules/${scheduleId}`,
        stripUndefined(payload)
    );

    const item = unwrapApiResponse(response.data);
    if (!item) {
        throw new Error('Updated schedule is empty');
    }

    return normalizeSchedule(item);
};

export const deleteSchedule = async (elderId: number, scheduleId: number) => {
    const response = await api.delete<ApiResult<null>>(`/elders/${elderId}/schedules/${scheduleId}`);
    return unwrapApiResponse(response.data);
};
