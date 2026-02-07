import axios from 'axios';
import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import { getElderDetail } from '@/features/elder/api/elderApi';
import { robotApi } from '@/features/robot-control/api/robotApi';
import type { ApiResult } from '@/shared/types';
import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';
import type {
    ActivityLevel,
    DashboardCalendarDay,
    DashboardData,
    DashboardRobotStatus,
    DashboardTodaySummary,
    NotificationItem,
    NotificationListPayload,
    ScheduleItem,
    ScheduleListPayload,
} from '../types';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface ElderDetailForDashboard {
    name: string;
    todaySummary?: {
        wakeUpTime?: string | null;
        medicationStatus?: {
            taken: number;
            total: number;
        };
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

const buildWeeklyCalendar = (schedules: ScheduleItem[]): DashboardCalendarDay[] => {
    const schedulesByDate = new Map<string, ScheduleItem[]>();

    schedules.forEach((item) => {
        const date = new Date(item.datetime);
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
            .sort((a, b) => a.datetime.localeCompare(b.datetime))
            .map((event) => ({
                id: event.id,
                title: event.title,
                time: formatTime(event.datetime),
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

const getWeeklySchedules = async (elderId: number) => {
    const { startDate, endDate } = buildWeekRange();
    const response = await api.get<ApiResult<ScheduleListPayload>>(`/elders/${elderId}/schedules`, {
        params: {
            startDate,
            endDate,
        },
    });

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
        medicationStatus: {
            taken: summary.medicationStatus?.taken ?? 0,
            total: summary.medicationStatus?.total ?? 0,
        },
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

export const getDashboardData = async (elderId: number): Promise<DashboardData> => {
    const elderDetailResponse = await getElderDetail(elderId);
    if (!elderDetailResponse) {
        throw new Error('Elder detail is empty');
    }

    const elderDetail = elderDetailResponse as ElderDetailForDashboard;

    const notificationsResult = await withDependencyFallback(getDashboardNotifications(elderId));
    const schedulesResult = await withDependencyFallback(getWeeklySchedules(elderId));

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
        todaySummary: buildTodaySummary(elderDetail.todaySummary),
        recentNotifications: selectRecentNotifications(notificationsResult?.notifications ?? []),
        weeklyCalendar: buildWeeklyCalendar(schedulesResult?.schedules ?? []),
        robotStatus,
    };
};
