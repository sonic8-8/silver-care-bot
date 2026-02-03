import type { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

type GuardianAppContainerProps = {
    title: string;
    description?: string;
    children: ReactNode;
    showBottomNav?: boolean;
};

function GuardianAppContainer({ title, description, children, showBottomNav = true }: GuardianAppContainerProps) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Silver Care
                    </span>
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                    {description ? (
                        <p className="text-sm text-gray-500">{description}</p>
                    ) : null}
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
