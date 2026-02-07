import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Home,
    MessageCircle,
    Moon,
    Pill,
    ShieldCheck,
    Sun,
    UserRound,
} from 'lucide-react';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import { formatDate, toWeekStartDate } from '@/features/history/api/historyApi';
import { useActivities, useWeeklyReport } from '@/features/history/hooks/useHistory';
import type { ActivityType, WeeklyReportSource } from '@/features/history/types';

type TabKey = 'activity' | 'report';

const activityTypeLabelMap: Record<ActivityType, string> = {
    WAKE_UP: '기상',
    SLEEP: '취침',
    MEDICATION_TAKEN: '복약 완료',
    MEDICATION_MISSED: '복약 누락',
    PATROL_COMPLETE: '순찰 완료',
    OUT_DETECTED: '외출 감지',
    RETURN_DETECTED: '귀가 감지',
    CONVERSATION: '대화',
    EMERGENCY: '긴급',
    UNKNOWN: '기타',
};

const reportSourceLabelMap: Record<WeeklyReportSource, string> = {
    CALCULATED: '실시간 계산',
    STORED: 'AI 저장 리포트',
    UNKNOWN: '연동 대기',
};

const activityTypeStyleMap: Record<ActivityType, string> = {
    WAKE_UP: 'bg-amber-50 text-amber-700 border-amber-200',
    SLEEP: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDICATION_TAKEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDICATION_MISSED: 'bg-danger-bg text-danger border-danger/30',
    PATROL_COMPLETE: 'bg-blue-50 text-blue-700 border-blue-200',
    OUT_DETECTED: 'bg-violet-50 text-violet-700 border-violet-200',
    RETURN_DETECTED: 'bg-primary-50 text-primary-700 border-primary-200',
    CONVERSATION: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    EMERGENCY: 'bg-danger-bg text-danger border-danger/30',
    UNKNOWN: 'bg-gray-100 text-gray-700 border-gray-200',
};

const activityTypeIconMap: Record<ActivityType, typeof Sun> = {
    WAKE_UP: Sun,
    SLEEP: Moon,
    MEDICATION_TAKEN: Pill,
    MEDICATION_MISSED: AlertTriangle,
    PATROL_COMPLETE: ShieldCheck,
    OUT_DETECTED: UserRound,
    RETURN_DETECTED: Home,
    CONVERSATION: MessageCircle,
    EMERGENCY: AlertTriangle,
    UNKNOWN: CalendarDays,
};

const keywordClassNames = [
    'bg-primary-50 text-primary-700 text-sm',
    'bg-emerald-50 text-emerald-700 text-xs',
    'bg-orange-50 text-orange-700 text-base',
    'bg-cyan-50 text-cyan-700 text-sm',
    'bg-violet-50 text-violet-700 text-xs',
];

const formatDateLabel = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    }).format(parsed);
};

const formatDateTimeLabel = (dateTime: string) => {
    const parsed = new Date(dateTime);
    if (Number.isNaN(parsed.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(parsed);
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

function HistoryScreen() {
    const { elderId } = useParams();
    const parsedElderId = Number(elderId);
    const isValidElderId = Number.isFinite(parsedElderId);

    const [activeTab, setActiveTab] = useState<TabKey>('activity');
    const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
    const [reportBaseDate, setReportBaseDate] = useState(() => toWeekStartDate(new Date()));

    const weekStartDate = useMemo(() => formatDate(reportBaseDate), [reportBaseDate]);
    const weekEndDate = useMemo(() => {
        const end = new Date(reportBaseDate);
        end.setDate(end.getDate() + 6);
        return formatDate(end);
    }, [reportBaseDate]);

    const activityQuery = useActivities(
        isValidElderId ? parsedElderId : undefined,
        selectedDate,
        activeTab === 'activity'
    );
    const reportQuery = useWeeklyReport(
        isValidElderId ? parsedElderId : undefined,
        weekStartDate,
        activeTab === 'report'
    );

    const activities = activityQuery.data?.activities ?? [];
    const reportData = reportQuery.data;
    const medicationRate = reportData?.medicationRate ?? 0;
    const activityGoal = 14;
    const activityProgressRatio = Math.min(100, Math.round(((reportData?.activityCount ?? 0) / activityGoal) * 100));

    const moveReportWeek = (step: number) => {
        setReportBaseDate((previous) => {
            const next = new Date(previous);
            next.setDate(previous.getDate() + step * 7);
            return toWeekStartDate(next);
        });
    };

    if (!isValidElderId) {
        return (
            <GuardianAppContainer title="기록" description="활동 로그와 리포트를 확인합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    잘못된 어르신 정보입니다. 경로를 다시 확인해 주세요.
                </div>
            </GuardianAppContainer>
        );
    }

    return (
        <GuardianAppContainer title="기록" description="활동 로그와 주간 AI 리포트를 확인합니다.">
            <section className="rounded-2xl border border-gray-200 bg-white p-2 shadow-card">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('activity')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'activity' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        활동 로그
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('report')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'report' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        AI 리포트
                    </button>
                </div>
            </section>

            {activeTab === 'activity' ? (
                <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold text-gray-500">일일 타임라인</p>
                            <h2 className="text-lg font-semibold text-gray-900">{formatDateLabel(selectedDate)}</h2>
                            <p className="text-xs text-gray-500">{activities.length}건 기록</p>
                        </div>
                        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                            <CalendarDays size={14} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) => setSelectedDate(event.target.value)}
                                className="bg-transparent text-sm outline-none"
                            />
                        </label>
                    </div>

                    {activityQuery.isLoading ? (
                        <div className="mt-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                            ))}
                        </div>
                    ) : activityQuery.isError ? (
                        <div className="mt-4 rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
                            <p>활동 로그를 불러오지 못했습니다.</p>
                            <p className="mt-1 text-xs">{getErrorMessage(activityQuery.error, '알 수 없는 오류가 발생했습니다.')}</p>
                            <Button size="sm" className="mt-3" onClick={() => activityQuery.refetch()}>
                                다시 시도
                            </Button>
                        </div>
                    ) : activities.length === 0 ? (
                        <p className="mt-4 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                            선택한 날짜의 활동 로그가 없습니다.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {activities.map((activity) => {
                                const Icon = activityTypeIconMap[activity.type];
                                const typeLabel = activityTypeLabelMap[activity.type];
                                const typeStyle = activityTypeStyleMap[activity.type];

                                return (
                                    <li
                                        key={`${activity.id}-${activity.detectedAt}`}
                                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <span className={`rounded-lg border p-2 ${typeStyle}`}>
                                                    <Icon size={16} />
                                                </span>
                                                <div>
                                                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${typeStyle}`}>
                                                        {typeLabel}
                                                    </span>
                                                    <p className="mt-2 text-sm font-semibold text-gray-900">
                                                        {activity.title ?? typeLabel}
                                                    </p>
                                                    {activity.description ? (
                                                        <p className="mt-1 text-xs text-gray-600">{activity.description}</p>
                                                    ) : null}
                                                    {activity.location ? (
                                                        <p className="mt-1 text-xs text-gray-500">위치: {activity.location}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">
                                                {formatDateTimeLabel(activity.detectedAt)}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            ) : (
                <section className="mt-4 space-y-4">
                    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-500">주간 범위</p>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {formatDateLabel(weekStartDate)} - {formatDateLabel(weekEndDate)}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="white" onClick={() => moveReportWeek(-1)}>
                                    <ArrowLeft size={14} /> 이전 주
                                </Button>
                                <Button size="sm" variant="white" onClick={() => moveReportWeek(1)}>
                                    다음 주 <ArrowRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </article>

                    {reportQuery.isLoading ? (
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                ))}
                            </div>
                        </article>
                    ) : reportQuery.isError || !reportData ? (
                        <article className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger shadow-card">
                            <p>주간 리포트를 불러오지 못했습니다.</p>
                            <p className="mt-1 text-xs">{getErrorMessage(reportQuery.error, '알 수 없는 오류가 발생했습니다.')}</p>
                            <Button size="sm" className="mt-3" onClick={() => reportQuery.refetch()}>
                                다시 시도
                            </Button>
                        </article>
                    ) : (
                        <>
                            <article className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-card">
                                    <p className="text-xs font-semibold text-emerald-700">복약률</p>
                                    <p className="mt-2 text-3xl font-bold text-emerald-800">{medicationRate.toFixed(1)}%</p>
                                    <div className="mt-3 h-2 rounded-full bg-white/70">
                                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${medicationRate}%` }} />
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-card">
                                    <p className="text-xs font-semibold text-blue-700">활동량</p>
                                    <p className="mt-2 text-3xl font-bold text-blue-800">{reportData.activityCount}건</p>
                                    <div className="mt-3 h-2 rounded-full bg-white/70">
                                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${activityProgressRatio}%` }} />
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700">대화 키워드</h3>
                                    <span className="text-xs text-gray-500">{reportData.conversationKeywords.length}개</span>
                                </div>
                                {reportData.conversationKeywords.length === 0 ? (
                                    <p className="mt-4 text-sm text-gray-500">이번 주 키워드 데이터가 없습니다.</p>
                                ) : (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {reportData.conversationKeywords.map((keyword, index) => (
                                            <span
                                                key={`${keyword}-${index}`}
                                                className={`rounded-full px-3 py-1 font-semibold ${keywordClassNames[index % keywordClassNames.length]}`}
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700">AI 추천사항</h3>
                                    <span className="text-xs text-gray-500">
                                        {reportSourceLabelMap[reportData.source]}
                                        {reportData.generatedAt ? ` · ${formatDateTimeLabel(reportData.generatedAt)}` : ''}
                                    </span>
                                </div>
                                {reportData.recommendations.length === 0 ? (
                                    <p className="mt-4 text-sm text-gray-500">추천사항이 없습니다.</p>
                                ) : (
                                    <ul className="mt-4 space-y-3">
                                        {reportData.recommendations.map((recommendation, index) => (
                                            <li
                                                key={`${recommendation}-${index}`}
                                                className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3"
                                            >
                                                <CheckCircle2 size={16} className="mt-0.5 text-primary-600" />
                                                <p className="text-sm text-gray-700">{recommendation}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        </>
                    )}
                </section>
            )}
        </GuardianAppContainer>
    );
}

export default HistoryScreen;
