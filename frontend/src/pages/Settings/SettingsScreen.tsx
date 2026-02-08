import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationSettings } from '@/features/notification/hooks/useNotificationSettings';
import { useRobotStatus } from '@/features/robot-control/hooks/useRobotStatus';
import { robotApi } from '@/features/robot-control/api/robotApi';
import type { NotificationSettings, ThemeMode } from '@/shared/types';
import type { RobotSettings, RobotStatus, UpdateRobotSettingsPayload } from '@/shared/types/robot.types';
import { Button } from '@/shared/ui/Button';

const notificationLabels: Array<{ key: keyof NotificationSettings; label: string }> = [
    { key: 'emergencyEnabled', label: '긴급 알림' },
    { key: 'medicationEnabled', label: '복약 알림' },
    { key: 'scheduleEnabled', label: '일정 알림' },
    { key: 'activityEnabled', label: '활동 알림' },
    { key: 'systemEnabled', label: '시스템 알림' },
    { key: 'realtimeEnabled', label: '실시간 알림' },
];

const themeLabels: Record<ThemeMode, string> = {
    SYSTEM: '시스템',
    LIGHT: '라이트',
    DARK: '다크',
};

const LAST_ELDER_ID_KEY = 'lastElderId';
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type RobotSettingsForm = {
    morningMedicationTime: string;
    eveningMedicationTime: string;
    patrolStart: string;
    patrolEnd: string;
    ttsVolume: string;
};

const readLastElderId = (): number | undefined => {
    if (typeof window === 'undefined') {
        return undefined;
    }
    const stored = window.localStorage.getItem(LAST_ELDER_ID_KEY);
    if (!stored) {
        return undefined;
    }
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const createRobotForm = (settings?: RobotSettings): RobotSettingsForm => ({
    morningMedicationTime: settings?.morningMedicationTime ?? '08:00',
    eveningMedicationTime: settings?.eveningMedicationTime ?? '19:00',
    patrolStart: settings?.patrolTimeRange?.start ?? '09:00',
    patrolEnd: settings?.patrolTimeRange?.end ?? '18:00',
    ttsVolume: typeof settings?.ttsVolume === 'number' ? String(settings.ttsVolume) : '70',
});

const validateRobotForm = (form: RobotSettingsForm): string | null => {
    if (!TIME_PATTERN.test(form.morningMedicationTime)) {
        return '아침 복약 시간은 HH:mm 형식으로 입력해주세요.';
    }
    if (!TIME_PATTERN.test(form.eveningMedicationTime)) {
        return '저녁 복약 시간은 HH:mm 형식으로 입력해주세요.';
    }
    if (!TIME_PATTERN.test(form.patrolStart) || !TIME_PATTERN.test(form.patrolEnd)) {
        return '순찰 시간은 HH:mm 형식으로 입력해주세요.';
    }
    if (form.patrolStart >= form.patrolEnd) {
        return '순찰 시작 시간은 종료 시간보다 빨라야 합니다.';
    }
    const volume = Number(form.ttsVolume);
    if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
        return '음성 볼륨은 0~100 사이 정수여야 합니다.';
    }
    return null;
};

function SettingsScreen() {
    const user = useAuthStore((state) => state.user);
    const { settingsQuery, updateSettings, isUpdating } = useNotificationSettings();
    const queryClient = useQueryClient();
    const settings = settingsQuery.data;
    const resolvedElderId = useMemo(
        () => user?.elderId ?? readLastElderId(),
        [user?.elderId]
    );
    const [robotForm, setRobotForm] = useState<RobotSettingsForm>(createRobotForm());
    const [robotError, setRobotError] = useState<string | null>(null);
    const [robotSuccess, setRobotSuccess] = useState<string | null>(null);

    const robotIdQuery = useQuery({
        queryKey: ['elder', 'robot', resolvedElderId],
        queryFn: () => robotApi.getRobotIdByElder(resolvedElderId as number),
        enabled: typeof resolvedElderId === 'number' && !Number.isNaN(resolvedElderId),
    });
    const robotId = robotIdQuery.data ?? undefined;
    const robotStatusQuery = useRobotStatus(robotId);

    useEffect(() => {
        if (!robotStatusQuery.data?.settings) {
            return;
        }
        setRobotForm(createRobotForm(robotStatusQuery.data.settings));
    }, [robotStatusQuery.data?.settings]);

    const updateRobotSettingsMutation = useMutation({
        mutationFn: async (payload: UpdateRobotSettingsPayload) => {
            if (typeof robotId !== 'number') {
                throw new Error('등록된 로봇이 없습니다.');
            }
            return robotApi.updateSettings(robotId, payload);
        },
        onSuccess: async (nextSettings) => {
            if (typeof robotId === 'number') {
                queryClient.setQueryData<RobotStatus | undefined>(
                    ['robot', 'status', robotId],
                    (previous) => (previous ? { ...previous, settings: nextSettings } : previous)
                );
                await queryClient.invalidateQueries({ queryKey: ['robot', 'status', robotId] });
            }
            setRobotError(null);
            setRobotSuccess('로봇 설정을 저장했습니다.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : '로봇 설정 저장에 실패했습니다.';
            setRobotError(message);
            setRobotSuccess(null);
        },
    });

    const activeTheme = useMemo(() => settings?.theme ?? 'SYSTEM', [settings?.theme]);

    const onToggleNotification = async (key: keyof NotificationSettings) => {
        if (!settings) return;
        await updateSettings({
            notificationSettings: {
                [key]: !settings.notificationSettings[key],
            },
        });
    };

    const onUpdateTheme = async (theme: ThemeMode) => {
        await updateSettings({ theme });
    };

    const onChangeRobotField = (key: keyof RobotSettingsForm, value: string) => {
        setRobotForm((previous) => ({ ...previous, [key]: value }));
    };

    const onSubmitRobotSettings = async () => {
        setRobotSuccess(null);
        const validationMessage = validateRobotForm(robotForm);
        if (validationMessage) {
            setRobotError(validationMessage);
            return;
        }
        setRobotError(null);

        const payload: UpdateRobotSettingsPayload = {
            morningMedicationTime: robotForm.morningMedicationTime,
            eveningMedicationTime: robotForm.eveningMedicationTime,
            patrolTimeRange: {
                start: robotForm.patrolStart,
                end: robotForm.patrolEnd,
            },
            ttsVolume: Number(robotForm.ttsVolume),
        };
        await updateRobotSettingsMutation.mutateAsync(payload);
    };

    return (
        <GuardianAppContainer title="설정" description="알림 및 로봇 설정을 관리합니다.">
            <section className="space-y-4">
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">계정</h2>
                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>이름</span>
                            <span className="font-semibold text-gray-900">
                                {user?.email?.split('@')[0] ?? '미설정'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>이메일</span>
                            <span className="font-semibold text-gray-900">{user?.email ?? '미설정'}</span>
                        </div>
                    </div>
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">알림</h2>
                    <div className="mt-4 space-y-2">
                        {notificationLabels.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                disabled={!settings || isUpdating}
                                onClick={() => void onToggleNotification(key)}
                                className={`flex min-h-[48px] w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                                    settings?.notificationSettings[key]
                                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 bg-white text-gray-700'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <span>{label}</span>
                                <span>{settings?.notificationSettings[key] ? 'ON' : 'OFF'}</span>
                            </button>
                        ))}
                    </div>
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">로봇 설정</h2>
                    {typeof resolvedElderId !== 'number' ? (
                        <p className="mt-4 text-sm text-gray-500">
                            어르신 화면을 먼저 선택하면 로봇 설정을 변경할 수 있습니다.
                        </p>
                    ) : robotIdQuery.isLoading || robotStatusQuery.isLoading ? (
                        <p className="mt-4 text-sm text-gray-500">로봇 설정을 불러오는 중...</p>
                    ) : robotIdQuery.isError || robotStatusQuery.isError ? (
                        <p className="mt-4 text-sm text-danger">로봇 설정을 불러오지 못했습니다.</p>
                    ) : typeof robotId !== 'number' ? (
                        <p className="mt-4 text-sm text-gray-500">연결된 로봇이 없습니다.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="text-sm text-gray-600">
                                    아침 복약 시간
                                    <input
                                        type="time"
                                        value={robotForm.morningMedicationTime}
                                        onChange={(event) => onChangeRobotField('morningMedicationTime', event.target.value)}
                                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-gray-900"
                                    />
                                </label>
                                <label className="text-sm text-gray-600">
                                    저녁 복약 시간
                                    <input
                                        type="time"
                                        value={robotForm.eveningMedicationTime}
                                        onChange={(event) => onChangeRobotField('eveningMedicationTime', event.target.value)}
                                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-gray-900"
                                    />
                                </label>
                                <label className="text-sm text-gray-600">
                                    순찰 시작
                                    <input
                                        type="time"
                                        value={robotForm.patrolStart}
                                        onChange={(event) => onChangeRobotField('patrolStart', event.target.value)}
                                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-gray-900"
                                    />
                                </label>
                                <label className="text-sm text-gray-600">
                                    순찰 종료
                                    <input
                                        type="time"
                                        value={robotForm.patrolEnd}
                                        onChange={(event) => onChangeRobotField('patrolEnd', event.target.value)}
                                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-gray-900"
                                    />
                                </label>
                            </div>
                            <label className="text-sm text-gray-600">
                                음성 볼륨 (0~100)
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={robotForm.ttsVolume}
                                    onChange={(event) => onChangeRobotField('ttsVolume', event.target.value)}
                                    className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-gray-900"
                                />
                            </label>
                            {robotError ? (
                                <p className="text-sm text-danger">{robotError}</p>
                            ) : null}
                            {robotSuccess ? (
                                <p className="text-sm text-green-600">{robotSuccess}</p>
                            ) : null}
                            <Button
                                fullWidth
                                onClick={() => void onSubmitRobotSettings()}
                                disabled={updateRobotSettingsMutation.isPending}
                            >
                                {updateRobotSettingsMutation.isPending ? '저장 중...' : '로봇 설정 저장'}
                            </Button>
                        </div>
                    )}
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">테마</h2>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {(Object.keys(themeLabels) as ThemeMode[]).map((theme) => (
                            <button
                                key={theme}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => void onUpdateTheme(theme)}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                    activeTheme === theme
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : 'border-gray-200 bg-white text-gray-700'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                {themeLabels[theme]}
                            </button>
                        ))}
                    </div>
                </article>
            </section>
        </GuardianAppContainer>
    );
}

export default SettingsScreen;
