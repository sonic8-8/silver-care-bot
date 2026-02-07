import type { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import { useNotificationRealtime } from '@/features/notification/hooks/useNotificationRealtime';
import { NotificationBell } from '@/shared/ui';

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
                        {showNotificationBell ? <NotificationBell /> : null}
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
