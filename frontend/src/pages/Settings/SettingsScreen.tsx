import { useMemo } from 'react';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotificationSettings } from '@/features/notification/hooks/useNotificationSettings';
import type { NotificationSettings, ThemeMode } from '@/shared/types';

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

function SettingsScreen() {
    const user = useAuthStore((state) => state.user);
    const { settingsQuery, updateSettings, isUpdating } = useNotificationSettings();
    const settings = settingsQuery.data;

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
