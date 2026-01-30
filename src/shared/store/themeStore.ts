import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    setMode: (mode: ThemeMode) => void;
    updateResolvedTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

// localStorage에서 초기 테마 로드
const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }
    return 'system';
};

const initialMode = getInitialMode();
const initialResolved = initialMode === 'system' ? getSystemTheme() : initialMode;

// 초기 테마 적용
if (typeof document !== 'undefined') {
    applyTheme(initialResolved);
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
    mode: initialMode,
    resolvedTheme: initialResolved,
    setMode: (mode: ThemeMode) => {
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
        applyTheme(resolvedTheme);
        localStorage.setItem('theme-mode', mode);
        set({ mode, resolvedTheme });
    },
    updateResolvedTheme: () => {
        const { mode } = get();
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
    },
}));

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const state = useThemeStore.getState();
        if (state.mode === 'system') {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
            useThemeStore.setState({ resolvedTheme: newTheme });
        }
    });
}
