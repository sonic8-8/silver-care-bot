import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, List, MapPin, Mic2, PenLine, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import { ScheduleFormModal } from '@/features/schedule/components/ScheduleFormModal';
import {
    useCreateSchedule,
    useSchedules,
    useUpdateSchedule,
} from '@/features/schedule/hooks/useSchedules';
import type { CreateSchedulePayload, ScheduleItem, ScheduleType } from '@/features/schedule/types';

const scheduleTypeLabelMap: Record<ScheduleType, string> = {
    HOSPITAL: '병원',
    MEDICATION: '복약',
    PERSONAL: '개인',
    FAMILY: '가족',
    OTHER: '기타',
};

const scheduleTypeClassMap: Record<ScheduleType, string> = {
    HOSPITAL: 'border-blue-200 bg-blue-50 text-blue-700',
    MEDICATION: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    PERSONAL: 'border-violet-200 bg-violet-50 text-violet-700',
    FAMILY: 'border-orange-200 bg-orange-50 text-orange-700',
    OTHER: 'border-gray-200 bg-gray-100 text-gray-700',
};

type ViewMode = 'calendar' | 'list';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    }).format(date);
};

const formatMonthLabel = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
    }).format(date);
};

const formatScheduleTime = (scheduledAt: string) => {
    const parsed = new Date(scheduledAt);
    if (!Number.isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(parsed);
    }

    return scheduledAt.slice(11, 16);
};

const toStartOfWeek = (date: Date) => {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = localDate.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    localDate.setDate(localDate.getDate() + distance);
    return localDate;
};

const createWeekDates = (weekStart: Date) => {
    return Array.from({ length: 7 }, (_, index) => {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + index);
        return currentDate;
    });
};

function ScheduleScreen() {
    const { elderId } = useParams();
    const parsedElderId = Number(elderId);
    const isValidElderId = Number.isFinite(parsedElderId);

    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [currentWeekStart, setCurrentWeekStart] = useState(() => toStartOfWeek(new Date()));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const weekDates = useMemo(() => createWeekDates(currentWeekStart), [currentWeekStart]);
    const weekStartDate = formatDate(weekDates[0]);
    const weekEndDate = formatDate(weekDates[6]);

    const scheduleQuery = useSchedules(
        isValidElderId ? parsedElderId : undefined,
        {
            startDate: weekStartDate,
            endDate: weekEndDate,
        }
    );

    const createMutation = useCreateSchedule(isValidElderId ? parsedElderId : undefined);
    const updateMutation = useUpdateSchedule(isValidElderId ? parsedElderId : undefined);

    const schedules = useMemo(() => {
        return (scheduleQuery.data?.schedules ?? [])
            .slice()
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }, [scheduleQuery.data?.schedules]);

    const schedulesByDate = useMemo(() => {
        const grouped = new Map<string, ScheduleItem[]>();
        schedules.forEach((item) => {
            const dateKey = item.scheduledAt.slice(0, 10);
            const list = grouped.get(dateKey) ?? [];
            list.push(item);
            grouped.set(dateKey, list);
        });

        return grouped;
    }, [schedules]);

    const totalCount = schedules.length;

    const openCreateModal = () => {
        setEditingSchedule(null);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: ScheduleItem) => {
        setEditingSchedule(schedule);
        setSubmitError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
        setSubmitError(null);
    };

    const moveWeek = (step: number) => {
        setCurrentWeekStart((previous) => {
            const next = new Date(previous);
            next.setDate(previous.getDate() + step * 7);
            return next;
        });
    };

    const handleSubmit = async (payload: CreateSchedulePayload) => {
        try {
            setSubmitError(null);
            if (editingSchedule) {
                await updateMutation.mutateAsync({
                    scheduleId: editingSchedule.id,
                    payload,
                });
            } else {
                await createMutation.mutateAsync(payload);
            }
            closeModal();
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
                return;
            }

            setSubmitError('일정을 저장하지 못했습니다.');
        }
    };

    if (!isValidElderId) {
        return (
            <GuardianAppContainer title="일정" description="주간 일정을 관리합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    잘못된 어르신 정보입니다. 경로를 다시 확인해 주세요.
                </div>
            </GuardianAppContainer>
        );
    }

    return (
        <GuardianAppContainer title="일정" description="주간 캘린더와 리스트로 일정을 관리합니다.">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-gray-500">이번 주 일정</p>
                        <h2 className="text-lg font-semibold text-gray-900">{formatMonthLabel(currentWeekStart)}</h2>
                        <p className="text-xs text-gray-500">총 {totalCount}건</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'calendar' ? 'primary' : 'white'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                        >
                            <CalendarDays size={14} /> 캘린더
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'white'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List size={14} /> 리스트
                        </Button>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <Button size="sm" variant="white" onClick={() => moveWeek(-1)}>
                        <ChevronLeft size={14} /> 이전
                    </Button>
                    <p className="text-sm font-semibold text-gray-700">
                        {formatDateLabel(weekDates[0])} - {formatDateLabel(weekDates[6])}
                    </p>
                    <Button size="sm" variant="white" onClick={() => moveWeek(1)}>
                        다음 <ChevronRight size={14} />
                    </Button>
                </div>

                {scheduleQuery.isLoading ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-28 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                    </div>
                ) : scheduleQuery.isError ? (
                    <div className="mt-4 rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
                        <p>일정 목록을 불러오지 못했습니다.</p>
                        <Button size="sm" className="mt-3" onClick={() => scheduleQuery.refetch()}>
                            다시 시도
                        </Button>
                    </div>
                ) : viewMode === 'calendar' ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                        {weekDates.map((date) => {
                            const dateKey = formatDate(date);
                            const daySchedules = schedulesByDate.get(dateKey) ?? [];
                            const isToday = dateKey === formatDate(new Date());

                            return (
                                <article
                                    key={dateKey}
                                    className={`rounded-xl border p-3 ${isToday ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-gray-500">{formatDateLabel(date)}</p>
                                        <span className="text-xs text-gray-400">{daySchedules.length}건</span>
                                    </div>
                                    {daySchedules.length === 0 ? (
                                        <p className="mt-3 text-xs text-gray-400">일정 없음</p>
                                    ) : (
                                        <ul className="mt-3 space-y-2">
                                            {daySchedules.map((schedule) => (
                                                <li
                                                    key={schedule.id}
                                                    className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs ${scheduleTypeClassMap[schedule.type]}`}
                                                    onClick={() => openEditModal(schedule)}
                                                >
                                                    <p className="truncate font-semibold">{schedule.title}</p>
                                                    <p className="mt-0.5 text-[11px] opacity-80">{formatScheduleTime(schedule.scheduledAt)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {weekDates.map((date) => {
                            const dateKey = formatDate(date);
                            const daySchedules = schedulesByDate.get(dateKey) ?? [];

                            return (
                                <section key={dateKey}>
                                    <h3 className="text-sm font-semibold text-gray-700">{formatDateLabel(date)}</h3>
                                    {daySchedules.length === 0 ? (
                                        <p className="mt-2 text-sm text-gray-400">등록된 일정이 없습니다.</p>
                                    ) : (
                                        <ul className="mt-2 space-y-2">
                                            {daySchedules.map((schedule) => (
                                                <li key={schedule.id} className="rounded-xl border border-gray-200 bg-white p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <span
                                                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${scheduleTypeClassMap[schedule.type]}`}
                                                            >
                                                                {scheduleTypeLabelMap[schedule.type]}
                                                            </span>
                                                            <p className="mt-2 text-sm font-semibold text-gray-900">{schedule.title}</p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Clock3 size={12} /> {formatScheduleTime(schedule.scheduledAt)}
                                                                </span>
                                                                {schedule.location ? (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <MapPin size={12} /> {schedule.location}
                                                                    </span>
                                                                ) : null}
                                                                {schedule.source === 'VOICE' ? (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <Mic2 size={12} /> 음성 등록
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {schedule.description ? (
                                                                <p className="mt-2 text-xs text-gray-600">{schedule.description}</p>
                                                            ) : null}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="white"
                                                            className="shrink-0"
                                                            onClick={() => openEditModal(schedule)}
                                                        >
                                                            <PenLine size={12} /> 수정
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6">
                    <Button fullWidth onClick={openCreateModal}>
                        <Plus size={16} /> 일정 추가
                    </Button>
                    {submitError ? <p className="mt-2 text-xs text-danger">{submitError}</p> : null}
                </div>
            </section>

            <ScheduleFormModal
                open={isModalOpen}
                mode={editingSchedule ? 'edit' : 'create'}
                initialSchedule={editingSchedule}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onClose={closeModal}
                onSubmit={(payload) => void handleSubmit(payload)}
            />
        </GuardianAppContainer>
    );
}

export default ScheduleScreen;
