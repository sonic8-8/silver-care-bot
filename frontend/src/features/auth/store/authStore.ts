import { create } from 'zustand';
import type { AuthTokens } from '@/shared/types/user.types';
import { parseJwtPayload } from '@/features/auth/utils/jwt';
import type { AuthRole, AuthUser } from '@/features/auth/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthState {
    user: AuthUser | null;
    tokens: AuthTokens | null;
    setTokens: (tokens: AuthTokens | null) => void;
    setUser: (user: AuthUser | null) => void;
    logout: () => void;
}

const getStoredTokens = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) return null;
    return {
        accessToken,
    };
};

const persistTokens = (tokens: AuthTokens | null) => {
    if (typeof window === 'undefined') return;
    if (!tokens?.accessToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const buildUserFromTokens = (tokens: AuthTokens | null): AuthUser | null => {
    if (!tokens?.accessToken) return null;
    const payload = parseJwtPayload(tokens.accessToken);
    if (payload?.sub) {
        const role = payload.role as AuthRole | undefined;
        if (role) {
            const userId = Number(payload.sub);
            if (!Number.isNaN(userId)) {
                return {
                    id: userId,
                    role,
                    email: typeof payload.email === 'string' ? payload.email : undefined,
                    elderId: typeof payload.elderId === 'number' ? payload.elderId : undefined,
                };
            }
        }
    }

    if (tokens.robot) {
        return {
            id: tokens.robot.id,
            role: 'ROBOT',
            elderId: tokens.robot.elderId,
        };
    }

    if (tokens.user) {
        return {
            id: tokens.user.id,
            role: tokens.user.role,
            email: tokens.user.email,
            elderId: tokens.user.elderId,
        };
    }

    return null;
};

const initialTokens = getStoredTokens();
const initialUser = buildUserFromTokens(initialTokens);

export const useAuthStore = create<AuthState>()((set) => ({
    user: initialUser,
    tokens: initialTokens,
    setTokens: (tokens) => {
        persistTokens(tokens);
        set({ tokens, user: buildUserFromTokens(tokens) });
    },
    setUser: (user) => set({ user }),
    logout: () => {
        persistTokens(null);
        set({ tokens: null, user: null });
    },
}));
