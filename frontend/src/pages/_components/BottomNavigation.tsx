import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

const LAST_ELDER_ID_KEY = 'lastElderId';

type NavigationItem = {
    label: string;
    resolvePath: (elderId?: number) => string;
    isActive: (pathname: string, elderId?: number) => boolean;
};

const resolveElderIdFromPath = (pathname: string): number | undefined => {
    const matched = pathname.match(/^\/elders\/(\d+)(?:\/|$)/);
    if (!matched) {
        return undefined;
    }
    const parsed = Number(matched[1]);
    return Number.isNaN(parsed) ? undefined : parsed;
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

function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const authElderId = useAuthStore((state) => state.user?.elderId);

    const elderIdFromPath = useMemo(
        () => resolveElderIdFromPath(location.pathname),
        [location.pathname]
    );
    const activeElderId = elderIdFromPath ?? authElderId ?? readLastElderId();

    useEffect(() => {
        if (typeof window === 'undefined' || typeof elderIdFromPath !== 'number') {
            return;
        }
        window.localStorage.setItem(LAST_ELDER_ID_KEY, String(elderIdFromPath));
    }, [elderIdFromPath]);

    const navigationItems: NavigationItem[] = useMemo(() => ([
        {
            label: '대시보드',
            resolvePath: (elderId) => (elderId ? `/elders/${elderId}` : '/elders'),
            isActive: (pathname, elderId) => (
                elderId ? pathname === `/elders/${elderId}` : pathname === '/elders'
            ),
        },
        {
            label: '일정',
            resolvePath: (elderId) => (elderId ? `/elders/${elderId}/schedule` : '/elders'),
            isActive: (pathname, elderId) => (
                Boolean(elderId && pathname.startsWith(`/elders/${elderId}/schedule`))
            ),
        },
        {
            label: '약 관리',
            resolvePath: (elderId) => (elderId ? `/elders/${elderId}/medications` : '/elders'),
            isActive: (pathname, elderId) => (
                Boolean(elderId && pathname.startsWith(`/elders/${elderId}/medications`))
            ),
        },
        {
            label: '로봇',
            resolvePath: (elderId) => (elderId ? `/elders/${elderId}/robot` : '/elders'),
            isActive: (pathname, elderId) => (
                Boolean(elderId && pathname.startsWith(`/elders/${elderId}/robot`))
            ),
        },
        {
            label: '설정',
            resolvePath: () => '/settings',
            isActive: (pathname) => pathname === '/settings',
        },
    ]), []);

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-1 px-4 py-2">
                {navigationItems.map((item) => {
                    const isActive = item.isActive(location.pathname, activeElderId);
                    return (
                        <button
                            key={item.label}
                            type="button"
                            className={`min-h-[48px] flex-1 rounded-lg px-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary-500'
                            }`}
                            onClick={() => navigate(item.resolvePath(activeElderId))}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default BottomNavigation;
