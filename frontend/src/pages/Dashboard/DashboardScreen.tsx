import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Activity,
    Battery,
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Pill,
    Router,
} from 'lucide-react';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useDashboardRealtime } from '@/features/dashboard/hooks/useDashboardRealtime';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ActivityLevel, NotificationType } from '@/features/dashboard/types';
import type { ElderStatus } from '@/shared/types/elder.types';

const activityLabelMap: Record<ActivityLevel, string> = {
    LOW: '낮음',
    NORMAL: '보통',
    HIGH: '높음',
    UNKNOWN: '미확인',
};

const elderStatusLabelMap: Record<ElderStatus, string> = {
    SAFE: '안전',
    WARNING: '주의',
    DANGER: '위험',
};

const elderStatusClassMap: Record<ElderStatus, string> = {
    SAFE: 'bg-safe-bg text-safe',
    WARNING: 'bg-warning-bg text-warning',
    DANGER: 'bg-danger-bg text-danger',
};

const notificationTypeLabelMap: Record<NotificationType, string> = {
    EMERGENCY: '긴급',
    MEDICATION: '복약',
    SCHEDULE: '일정',
    ACTIVITY: '활동',
    SYSTEM: '시스템',
};

const notificationTypeClassMap: Record<NotificationType, string> = {
    EMERGENCY: 'bg-danger-bg text-danger',
    MEDICATION: 'bg-primary-50 text-primary-600',
    SCHEDULE: 'bg-warning-bg text-warning',
    ACTIVITY: 'bg-safe-bg text-safe',
    SYSTEM: 'bg-gray-100 text-gray-600',
};

const ensureElderStatus = (value: string | undefined): ElderStatus | undefined => {
    if (value === 'SAFE' || value === 'WARNING' || value === 'DANGER') {
        return value;
    }

    return undefined;
};

const formatRelativeTime = (dateTime: string) => {
    const target = new Date(dateTime).getTime();
    if (Number.isNaN(target)) {
        return '-';
    }

    const diff = Date.now() - target;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return '방금 전';
    }
    if (diff < hour) {
        return `${Math.max(1, Math.floor(diff / minute))}분 전`;
    }
    if (diff < day) {
        return `${Math.floor(diff / hour)}시간 전`;
    }

    return `${Math.floor(diff / day)}일 전`;
};

function DashboardScreen() {
    const { elderId } = useParams();
    const parsedElderId = Number(elderId);
    const isValidElderId = Number.isFinite(parsedElderId);

    const dashboardQuery = useDashboard(isValidElderId ? parsedElderId : undefined);
    const token = useAuthStore((state) => state.tokens?.accessToken ?? null);

    const realtime = useDashboardRealtime({
        token,
        elderId: isValidElderId ? parsedElderId : null,
        robotId: dashboardQuery.data?.robotStatus?.id ?? null,
        enabled: isValidElderId,
    });

    const errorMessage = useMemo(() => {
        if (dashboardQuery.error instanceof Error) {
            return dashboardQuery.error.message;
        }
        return '알 수 없는 오류가 발생했습니다.';
    }, [dashboardQuery.error]);

    const dashboardData = dashboardQuery.data;
    const elderName = dashboardData?.elderName;
    const elderStatus = dashboardData?.elderStatus;
    const todaySummary = dashboardData?.todaySummary ?? null;
    const recentNotifications = dashboardData?.recentNotifications ?? [];
    const weeklyCalendar = dashboardData?.weeklyCalendar ?? [];
    const robotStatus = dashboardData?.robotStatus ?? null;

    const activeRealtimeRobotStatus = useMemo(() => {
        if (!realtime.robotStatus) {
            return null;
        }
        if (robotStatus && realtime.robotStatus.robotId !== robotStatus.id) {
            return null;
        }
        if (realtime.robotStatus.elderId !== null && realtime.robotStatus.elderId !== parsedElderId) {
            return null;
        }

        return realtime.robotStatus;
    }, [parsedElderId, realtime.robotStatus, robotStatus]);

    const activeRealtimeElderStatus = useMemo(() => {
        if (!realtime.elderStatus || realtime.elderStatus.elderId !== parsedElderId) {
            return undefined;
        }

        return ensureElderStatus(realtime.elderStatus.status);
    }, [parsedElderId, realtime.elderStatus]);

    const mergedRobotStatus = robotStatus
        ? {
            ...robotStatus,
            batteryLevel: activeRealtimeRobotStatus?.batteryLevel ?? robotStatus.batteryLevel,
            networkStatus: activeRealtimeRobotStatus?.networkStatus ?? robotStatus.networkStatus,
            currentLocation: activeRealtimeRobotStatus?.currentLocation ?? robotStatus.currentLocation,
            lcdMode: activeRealtimeRobotStatus?.lcdMode ?? robotStatus.lcdMode,
        }
        : null;
    const mergedElderStatus = activeRealtimeElderStatus ?? elderStatus;

    if (!isValidElderId) {
        return (
            <GuardianAppContainer title="대시보드" description="오늘의 상태 요약을 확인합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    잘못된 어르신 정보입니다. 경로를 다시 확인해 주세요.
                </div>
            </GuardianAppContainer>
        );
    }

    if (dashboardQuery.isLoading) {
        return (
            <GuardianAppContainer title="대시보드" description="오늘의 상태 요약을 확인합니다.">
                <div className="space-y-4">
                    <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
                    <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
                    <div className="h-56 animate-pulse rounded-2xl bg-gray-200" />
                </div>
            </GuardianAppContainer>
        );
    }

    if (dashboardQuery.isError || !dashboardData) {
        return (
            <GuardianAppContainer title="대시보드" description="오늘의 상태 요약을 확인합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    <p>대시보드 정보를 불러오지 못했습니다.</p>
                    <p className="mt-1 text-xs">{errorMessage}</p>
                    <Button className="mt-3" size="sm" onClick={() => dashboardQuery.refetch()}>다시 시도</Button>
                </div>
            </GuardianAppContainer>
        );
    }

    return (
        <GuardianAppContainer
            title="대시보드"
            description={elderName ? `${elderName} 어르신의 오늘 상태 요약` : '오늘의 상태 요약을 확인합니다.'}
        >
            <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-500">오늘의 요약</h2>
                        {mergedElderStatus ? (
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${elderStatusClassMap[mergedElderStatus]}`}>
                                {elderStatusLabelMap[mergedElderStatus]}
                            </span>
                        ) : null}
                    </div>

                    {todaySummary ? (
                        <div className="mt-4 grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Clock3 size={14} />
                                    기상 시간
                                </span>
                                <span className="font-semibold text-gray-900">{todaySummary.wakeUpTime ?? '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Pill size={14} />
                                    복약 현황
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {todaySummary.medicationStatus.taken}/{todaySummary.medicationStatus.total} 복용
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">아침</span>
                                    <span className="font-semibold text-gray-900">
                                        {todaySummary.medicationStatus.morningTaken ?? 0}/{todaySummary.medicationStatus.morningTotal ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">저녁</span>
                                    <span className="font-semibold text-gray-900">
                                        {todaySummary.medicationStatus.eveningTaken ?? 0}/{todaySummary.medicationStatus.eveningTotal ?? 0}
                                    </span>
                                </div>
                            </div>
                            {todaySummary.medicationStatus.summaryText ? (
                                <p className="text-xs text-gray-500">{todaySummary.medicationStatus.summaryText}</p>
                            ) : null}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Activity size={14} />
                                    활동 상태
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {activityLabelMap[todaySummary.activityLevel]}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">오늘의 요약 데이터가 없습니다.</p>
                    )}
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-500">로봇 상태</h2>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${realtime.isConnected ? 'text-safe' : 'text-gray-500'}`}>
                            <CheckCircle2 size={12} /> {realtime.isConnected ? '실시간 연결됨' : '실시간 연결 대기'}
                        </span>
                    </div>
                    {mergedRobotStatus ? (
                        <div className="mt-4 grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Battery size={14} />
                                    배터리
                                </span>
                                <span className="font-semibold text-gray-900">{mergedRobotStatus.batteryLevel}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Router size={14} />
                                    연결 상태
                                </span>
                                <span className={`font-semibold ${mergedRobotStatus.networkStatus === 'CONNECTED' ? 'text-safe' : 'text-danger'}`}>
                                    {mergedRobotStatus.networkStatus === 'CONNECTED' ? '연결됨' : '연결 끊김'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={14} />
                                    현재 위치
                                </span>
                                <span className="font-semibold text-gray-900">{mergedRobotStatus.currentLocation ?? '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">LCD 모드</span>
                                <span className="font-semibold text-gray-900">{mergedRobotStatus.lcdMode ?? '-'}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">로봇 상태 데이터가 없습니다.</p>
                    )}
                </article>
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-500">최근 알림 5개</h2>
                    <Bell size={16} className="text-gray-400" />
                </div>

                {recentNotifications.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">최근 알림이 없습니다.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {recentNotifications.map((notification) => (
                            <li key={notification.id} className="rounded-xl border border-gray-200 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${notificationTypeClassMap[notification.type]}`}
                                        >
                                            {notificationTypeLabelMap[notification.type]}
                                        </span>
                                        <p className="mt-2 text-sm font-semibold text-gray-900">{notification.title}</p>
                                        <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-500">주간 캘린더</h2>
                    <CalendarDays size={16} className="text-gray-400" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                    {weeklyCalendar.map((day) => (
                        <article key={day.date} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">{day.dayLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">{day.date.slice(5)}</p>
                            {day.events.length === 0 ? (
                                <p className="mt-3 text-xs text-gray-400">일정 없음</p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {day.events.slice(0, 2).map((event) => (
                                        <li key={event.id} className="rounded-md border border-gray-200 bg-white px-2 py-1.5">
                                            <p className="truncate text-xs font-semibold text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-500">{event.time}</p>
                                        </li>
                                    ))}
                                    {day.events.length > 2 ? (
                                        <li className="text-xs text-gray-400">+{day.events.length - 2}개 더 있음</li>
                                    ) : null}
                                </ul>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </GuardianAppContainer>
    );
}

export default DashboardScreen;
