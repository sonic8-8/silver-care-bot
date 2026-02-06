import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';
import type { AuthTokens } from '@/shared/types/user.types';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/features/auth/api/authApi', () => ({
    authApi: {
        login: vi.fn(),
        signup: vi.fn(),
        refresh: vi.fn(),
        robotLogin: vi.fn(),
    },
}));

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
    navigateMock.mockClear();
});

describe('useAuth', () => {
    it('logs in and redirects worker to /elders', async () => {
        const accessToken = createToken({ sub: '1', role: 'WORKER', email: 'worker@test.com' });
        const tokens: AuthTokens = { accessToken, refreshToken: 'refresh' };
        vi.mocked(authApi.login).mockResolvedValue(tokens);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login({ email: 'worker@test.com', password: 'password123' });
        });

        expect(navigateMock).toHaveBeenCalledWith('/elders');
        expect(useAuthStore.getState().tokens?.accessToken).toBe(accessToken);
        expect(useAuthStore.getState().user?.role).toBe('WORKER');
    });

    it('logs in and redirects family to elder dashboard when elderId exists', async () => {
        const accessToken = createToken({ sub: '2', role: 'FAMILY', elderId: 7 });
        const tokens: AuthTokens = { accessToken, refreshToken: 'refresh' };
        vi.mocked(authApi.login).mockResolvedValue(tokens);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login({ email: 'family@test.com', password: 'password123' });
        });

        expect(navigateMock).toHaveBeenCalledWith('/elders/7');
    });
});
