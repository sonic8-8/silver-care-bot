import axios from 'axios';
import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import { getElderDetail } from '@/features/elder/api/elderApi';
import { robotApi } from '@/features/robot-control/api/robotApi';
import type { ApiResult, ElderStatus } from '@/shared/types';
import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';
import type {
    ActivityLevel,
    DashboardCalendarDay,
    DashboardData,
    DashboardLatestPatrol,
    DashboardPatrolItem,
    DashboardRobotStatus,
    DashboardTodaySummary,
    NotificationItem,
    NotificationListPayload,
    PatrolItemStatus,
    PatrolOverallStatus,
    PatrolTarget,
    ScheduleItem,
    ScheduleListPayload,
    ScheduleSource,
    ScheduleStatus,
    ScheduleType,
} from '../types';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface ElderDetailForDashboard {
    name: string;
    status?: ElderStatus;
    todaySummary?: {
        wakeUpTime?: string | null;
        medicationStatus?: unknown;
        activityLevel?: ActivityLevel;
    };
    robot?: {
        id: number;
        serialNumber?: string;
        batteryLevel?: number;
        networkStatus?: RobotConnectionStatus;
        currentLocation?: string;
    };
}

type RawScheduleItem = {
    id: number;
    title: string;
    description?: string | null;
    scheduledAt?: string;
    datetime?: string;
    location?: string | null;
    type?: string;
    source?: string;
    status?: string;
    remindBefore?: number | null;
    remindBeforeMinutes?: number | null;
    voiceOriginal?: string | null;
};

interface RawScheduleListPayload {
    schedules: RawScheduleItem[];
}

interface RawPatrolItem {
    id?: number;
    target?: string;
    label?: string | null;
    status?: string;
    confidence?: number | null;
    imageUrl?: string | null;
    checkedAt?: string | null;
}

interface RawPatrolLatestPayload {
    patrolResultId?: number | null;
    patrolId?: string | null;
    overallStatus?: string | null;
    lastPatrolAt?: string | null;
    items?: RawPatrolItem[];
}

const ensureActivityLevel = (value: string | null | undefined): ActivityLevel => {
    if (value === 'LOW' || value === 'NORMAL' || value === 'HIGH') {
        return value;
    }
    return 'UNKNOWN';
};

const ensureConnectionStatus = (value: string | null | undefined): RobotConnectionStatus => {
    return value === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED';
};

const ensureLcdMode = (value: string | null | undefined): RobotLcdMode | undefined => {
    if (
        value === 'IDLE'
        || value === 'GREETING'
        || value === 'MEDICATION'
        || value === 'SCHEDULE'
        || value === 'LISTENING'
        || value === 'EMERGENCY'
        || value === 'SLEEP'
    ) {
        return value;
    }
    return undefined;
};

const ensureScheduleType = (value: string | undefined): ScheduleType => {
    if (value === 'HOSPITAL' || value === 'MEDICATION' || value === 'PERSONAL' || value === 'FAMILY') {
        return value;
    }

    return 'OTHER';
};

const ensureScheduleSource = (value: string | undefined): ScheduleSource => {
    if (value === 'VOICE' || value === 'SYSTEM') {
        return value;
    }

    return 'MANUAL';
};

const ensureScheduleStatus = (value: string | undefined): ScheduleStatus => {
    if (value === 'COMPLETED' || value === 'CANCELLED') {
        return value;
    }

    return 'UPCOMING';
};

const ensurePatrolOverallStatus = (value: string | null | undefined): PatrolOverallStatus | null => {
    if (value === 'SAFE' || value === 'WARNING') {
        return value;
    }
    return null;
};

const ensurePatrolTarget = (value: string | undefined): PatrolTarget => {
    if (value === 'GAS_VALVE' || value === 'DOOR' || value === 'OUTLET' || value === 'WINDOW') {
        return value;
    }
    return 'MULTI_TAP';
};

const ensurePatrolItemStatus = (value: string | undefined): PatrolItemStatus => {
    if (value === 'ON' || value === 'OFF' || value === 'NORMAL' || value === 'LOCKED' || value === 'UNLOCKED') {
        return value;
    }
    return 'NEEDS_CHECK';
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    if (Number.isNaN(date.getTime())) {
        return '--:--';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const timestampOf = (dateTime: string) => {
    const time = new Date(dateTime).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const buildWeekRange = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6);

    return {
        startDate: formatDate(start),
        endDate: formatDate(end),
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toNonNegativeNumber = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return Math.max(0, Math.trunc(value));
};

const resolveDoseCounts = (value: unknown) => {
    if (!isRecord(value)) {
        return {
            taken: undefined,
            total: undefined,
        };
    }

    return {
        taken: toNonNegativeNumber(value.taken),
        total: toNonNegativeNumber(value.total),
    };
};

const normalizeMedicationStatus = (value: unknown) => {
    if (typeof value === 'string') {
        return {
            taken: 0,
            total: 0,
            morningTaken: 0,
            morningTotal: 0,
            eveningTaken: 0,
            eveningTotal: 0,
            summaryText: value,
        };
    }

    if (!isRecord(value)) {
        return {
            taken: 0,
            total: 0,
            morningTaken: 0,
            morningTotal: 0,
            eveningTaken: 0,
            eveningTotal: 0,
            summaryText: null,
        };
    }

    const directTaken = toNonNegativeNumber(value.taken);
    const directTotal = toNonNegativeNumber(value.total);

    const nestedMorning = resolveDoseCounts(value.morning);
    const nestedEvening = resolveDoseCounts(value.evening);

    const morningTaken =
        toNonNegativeNumber(value.morningTaken)
        ?? toNonNegativeNumber(value.morningTakenCount)
        ?? nestedMorning.taken
        ?? 0;
    const morningTotal =
        toNonNegativeNumber(value.morningTotal)
        ?? toNonNegativeNumber(value.morningTotalCount)
        ?? nestedMorning.total
        ?? 0;

    const eveningTaken =
        toNonNegativeNumber(value.eveningTaken)
        ?? toNonNegativeNumber(value.eveningTakenCount)
        ?? nestedEvening.taken
        ?? 0;
    const eveningTotal =
        toNonNegativeNumber(value.eveningTotal)
        ?? toNonNegativeNumber(value.eveningTotalCount)
        ?? nestedEvening.total
        ?? 0;

    const totalTaken = directTaken ?? (morningTaken + eveningTaken);
    const totalCount = directTotal ?? (morningTotal + eveningTotal);

    const summaryText =
        typeof value.summaryText === 'string'
            ? value.summaryText
            : typeof value.statusText === 'string'
                ? value.statusText
                : typeof value.label === 'string'
                    ? value.label
                    : null;

    return {
        taken: totalTaken,
        total: totalCount,
        morningTaken,
        morningTotal,
        eveningTaken,
        eveningTotal,
        summaryText,
    };
};

const resolveScheduleDateTime = (item: Pick<RawScheduleItem, 'scheduledAt' | 'datetime'>): string => {
    return item.scheduledAt ?? item.datetime ?? '';
};

const normalizeSchedule = (item: RawScheduleItem): ScheduleItem => {
    return {
        id: item.id,
        title: item.title,
        description: item.description ?? null,
        scheduledAt: resolveScheduleDateTime(item),
        datetime: item.datetime,
        location: item.location ?? null,
        type: ensureScheduleType(item.type),
        source: ensureScheduleSource(item.source),
        status: ensureScheduleStatus(item.status),
        remindBefore: item.remindBefore ?? item.remindBeforeMinutes ?? null,
        remindBeforeMinutes: item.remindBeforeMinutes ?? item.remindBefore ?? null,
        voiceOriginal: item.voiceOriginal ?? null,
    };
};

const buildWeeklyCalendar = (schedules: ScheduleItem[]): DashboardCalendarDay[] => {
    const schedulesByDate = new Map<string, ScheduleItem[]>();

    schedules.forEach((item) => {
        const dateTime = resolveScheduleDateTime(item);
        const date = new Date(dateTime);
        if (Number.isNaN(date.getTime())) {
            return;
        }

        const dateKey = formatDate(date);
        const list = schedulesByDate.get(dateKey) ?? [];
        list.push(item);
        schedulesByDate.set(dateKey, list);
    });

    const days: DashboardCalendarDay[] = [];
    const baseDate = new Date();

    for (let index = 0; index < 7; index += 1) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + index);

        const dateKey = formatDate(targetDate);
        const events = (schedulesByDate.get(dateKey) ?? [])
            .slice()
            .sort((a, b) => resolveScheduleDateTime(a).localeCompare(resolveScheduleDateTime(b)))
            .map((event) => ({
                id: event.id,
                title: event.title,
                time: formatTime(resolveScheduleDateTime(event)),
                type: event.type,
            }));

        days.push({
            date: dateKey,
            dayLabel: dayLabels[targetDate.getDay()],
            events,
        });
    }

    return days;
};

const getDashboardNotifications = async (elderId: number) => {
    const response = await api.get<ApiResult<NotificationListPayload>>('/notifications', {
        params: {
            elderId,
            unreadOnly: false,
        },
    });

    return unwrapApiResponse(response.data);
};

const getWeeklySchedules = async (elderId: number): Promise<ScheduleListPayload> => {
    const { startDate, endDate } = buildWeekRange();
    const response = await api.get<ApiResult<RawScheduleListPayload>>(`/elders/${elderId}/schedules`, {
        params: {
            startDate,
            endDate,
        },
    });

    const payload = unwrapApiResponse(response.data);
    return {
        schedules: (payload?.schedules ?? []).map(normalizeSchedule),
    };
};

const getLatestPatrol = async (elderId: number) => {
    const response = await api.get<ApiResult<RawPatrolLatestPayload>>(`/elders/${elderId}/patrol/latest`);
    return unwrapApiResponse(response.data);
};

export const selectRecentNotifications = (notifications: NotificationItem[], limit = 5) => {
    return notifications
        .slice()
        .sort((a, b) => timestampOf(b.createdAt) - timestampOf(a.createdAt))
        .slice(0, limit);
};

export const isDependencyFallbackError = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const status = error.response?.status;
    return status === 404 || status === 501;
};

const withDependencyFallback = async <T>(request: Promise<T>) => {
    try {
        return await request;
    } catch (error) {
        if (isDependencyFallbackError(error)) {
            return null;
        }

        throw error;
    }
};

const buildTodaySummary = (summary?: ElderDetailForDashboard['todaySummary']): DashboardTodaySummary | null => {
    if (!summary) {
        return null;
    }

    return {
        wakeUpTime: summary.wakeUpTime ?? null,
        medicationStatus: normalizeMedicationStatus(summary.medicationStatus),
        activityLevel: ensureActivityLevel(summary.activityLevel),
    };
};

const buildFallbackRobotStatus = (robot?: ElderDetailForDashboard['robot']): DashboardRobotStatus | null => {
    if (!robot) {
        return null;
    }

    return {
        id: robot.id,
        serialNumber: robot.serialNumber,
        batteryLevel: robot.batteryLevel ?? 0,
        networkStatus: ensureConnectionStatus(robot.networkStatus),
        currentLocation: robot.currentLocation,
    };
};

const normalizePatrolItem = (item: RawPatrolItem): DashboardPatrolItem => {
    return {
        id: item.id ?? 0,
        target: ensurePatrolTarget(item.target),
        label: item.label ?? null,
        status: ensurePatrolItemStatus(item.status),
        confidence: typeof item.confidence === 'number' ? item.confidence : null,
        imageUrl: item.imageUrl ?? null,
        checkedAt: item.checkedAt ?? null,
    };
};

const buildLatestPatrol = (payload: RawPatrolLatestPayload | null): DashboardLatestPatrol | null => {
    if (!payload) {
        return null;
    }

    return {
        patrolResultId: payload.patrolResultId ?? null,
        patrolId: payload.patrolId ?? null,
        overallStatus: ensurePatrolOverallStatus(payload.overallStatus),
        lastPatrolAt: payload.lastPatrolAt ?? null,
        items: (payload.items ?? []).map(normalizePatrolItem),
    };
};

export const getDashboardData = async (elderId: number): Promise<DashboardData> => {
    const elderDetailResponse = await getElderDetail(elderId);
    if (!elderDetailResponse) {
        throw new Error('Elder detail is empty');
    }

    const elderDetail = elderDetailResponse as ElderDetailForDashboard;

    const notificationsResult = await withDependencyFallback(getDashboardNotifications(elderId));
    const schedulesResult = await withDependencyFallback(getWeeklySchedules(elderId));
    const patrolResult = await withDependencyFallback(getLatestPatrol(elderId));

    const robotId = elderDetail.robot?.id;
    let robotStatus = buildFallbackRobotStatus(elderDetail.robot);

    if (typeof robotId === 'number') {
        try {
            const status = await robotApi.getStatus(robotId);
            robotStatus = {
                id: status.id,
                serialNumber: status.serialNumber,
                batteryLevel: status.batteryLevel,
                networkStatus: ensureConnectionStatus(status.networkStatus),
                currentLocation: status.currentLocation,
                lcdMode: ensureLcdMode(status.lcdMode),
                lastUpdatedAt: status.lastSyncAt,
            };
        } catch {
            // Keep fallback data if robot status fetch fails.
        }
    }

    return {
        elderName: elderDetail.name,
        elderStatus: elderDetail.status,
        todaySummary: buildTodaySummary(elderDetail.todaySummary),
        recentNotifications: selectRecentNotifications(notificationsResult?.notifications ?? []),
        weeklyCalendar: buildWeeklyCalendar(schedulesResult?.schedules ?? []),
        robotStatus,
        latestPatrol: buildLatestPatrol(patrolResult),
    };
};
