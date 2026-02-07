import type { ElderStatus } from '@/shared/types/elder.types';
import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';

export type NotificationType = 'EMERGENCY' | 'MEDICATION' | 'SCHEDULE' | 'ACTIVITY' | 'SYSTEM';

export interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    elderId?: number | null;
    elderName?: string | null;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string | null;
}

export interface NotificationListPayload {
    unreadCount: number;
    notifications: NotificationItem[];
}

export type ScheduleType = 'HOSPITAL' | 'MEDICATION' | 'PERSONAL' | 'FAMILY' | 'OTHER';
export type ScheduleSource = 'MANUAL' | 'VOICE' | 'SYSTEM';
export type ScheduleStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface ScheduleItem {
    id: number;
    title: string;
    description?: string | null;
    scheduledAt: string;
    datetime?: string;
    location?: string | null;
    type: ScheduleType;
    source: ScheduleSource;
    status: ScheduleStatus;
    remindBefore?: number | null;
    remindBeforeMinutes?: number | null;
    voiceOriginal?: string | null;
}

export interface ScheduleListPayload {
    schedules: ScheduleItem[];
}

export type ActivityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'UNKNOWN';

export interface DashboardTodaySummary {
    wakeUpTime?: string | null;
    medicationStatus: {
        taken: number;
        total: number;
        morningTaken?: number;
        morningTotal?: number;
        eveningTaken?: number;
        eveningTotal?: number;
        summaryText?: string | null;
    };
    activityLevel: ActivityLevel;
}

export interface DashboardCalendarEvent {
    id: number;
    title: string;
    time: string;
    type: ScheduleType;
}

export interface DashboardCalendarDay {
    date: string;
    dayLabel: string;
    events: DashboardCalendarEvent[];
}

export interface DashboardRobotStatus {
    id: number;
    serialNumber?: string;
    batteryLevel: number;
    networkStatus: RobotConnectionStatus;
    currentLocation?: string;
    lcdMode?: RobotLcdMode;
    lastUpdatedAt?: string;
}

export type PatrolOverallStatus = 'SAFE' | 'WARNING';
export type PatrolTarget = 'GAS_VALVE' | 'DOOR' | 'OUTLET' | 'WINDOW' | 'MULTI_TAP';
export type PatrolItemStatus = 'ON' | 'OFF' | 'NORMAL' | 'LOCKED' | 'UNLOCKED' | 'NEEDS_CHECK';

export interface DashboardPatrolItem {
    id: number;
    target: PatrolTarget;
    label?: string | null;
    status: PatrolItemStatus;
    confidence?: number | null;
    imageUrl?: string | null;
    checkedAt?: string | null;
}

export interface DashboardLatestPatrol {
    patrolResultId?: number | null;
    patrolId?: string | null;
    overallStatus?: PatrolOverallStatus | null;
    lastPatrolAt?: string | null;
    items: DashboardPatrolItem[];
}

export interface DashboardData {
    elderName?: string;
    elderStatus?: ElderStatus;
    todaySummary: DashboardTodaySummary | null;
    recentNotifications: NotificationItem[];
    weeklyCalendar: DashboardCalendarDay[];
    robotStatus: DashboardRobotStatus | null;
    latestPatrol: DashboardLatestPatrol | null;
}
