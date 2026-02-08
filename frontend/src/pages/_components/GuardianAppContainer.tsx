import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { useNotificationRealtime } from '@/features/notification/hooks/useNotificationRealtime';
import { NotificationBell } from '@/shared/ui';
import { useAuthStore } from '@/features/auth/store/authStore';

type GuardianAppContainerProps = {
    title: string;
    description?: string;
    children: ReactNode;
    showBottomNav?: boolean;
    showNotificationBell?: boolean;
};

function GuardianAppContainer({
    title,
    description,
    children,
    showBottomNav = true,
    showNotificationBell = true,
}: GuardianAppContainerProps) {
    useNotificationRealtime();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="mx-auto w-full max-w-5xl px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                동행
                            </span>
                            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                            {description ? (
                                <p className="text-sm text-gray-500">{description}</p>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                            {showNotificationBell ? <NotificationBell /> : null}
                            <button
                                type="button"
                                className="min-h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                                onClick={() => {
                                    logout();
                                    navigate('/login', { replace: true });
                                }}
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-5xl px-6 py-6 pb-24">
                {children}
            </main>
            {showBottomNav ? <BottomNavigation /> : null}
        </div>
    );
}

export default GuardianAppContainer;
