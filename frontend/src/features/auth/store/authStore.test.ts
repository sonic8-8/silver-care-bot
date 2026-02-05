import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthTokens } from '@/shared/types/user.types';

const createToken = (payload: Record<string, unknown>) => {
    const header = { alg: 'none', typ: 'JWT' };
    const encode = (value: Record<string, unknown>) => {
        const json = JSON.stringify(value);
        const base64 = btoa(json);
        return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };
    return `${encode(header)}.${encode(payload)}.`;
};

beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
});

describe('authStore', () => {
    it('persists access token and derives user from access token', () => {
        const accessToken = createToken({ sub: '10', role: 'WORKER', email: 'worker@test.com' });
        const tokens: AuthTokens = { accessToken };

        useAuthStore.getState().setTokens(tokens);

        const state = useAuthStore.getState();
        expect(state.tokens?.accessToken).toBe(accessToken);
        expect(state.user?.role).toBe('WORKER');
        expect(localStorage.getItem('accessToken')).toBe(accessToken);
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('clears tokens on logout', () => {
        const accessToken = createToken({ sub: '11', role: 'WORKER' });
        useAuthStore.getState().setTokens({ accessToken });

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.tokens).toBeNull();
        expect(state.user).toBeNull();
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });
});
