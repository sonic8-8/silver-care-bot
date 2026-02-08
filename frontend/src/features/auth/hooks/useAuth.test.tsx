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

    it('uses user.elderId when family jwt elderId claim is missing', async () => {
        const accessToken = createToken({ sub: '12', role: 'FAMILY' });
        const tokens: AuthTokens = {
            accessToken,
            refreshToken: 'refresh',
            user: {
                id: 12,
                role: 'FAMILY',
                elderId: 42,
            },
        };
        vi.mocked(authApi.login).mockResolvedValue(tokens);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login({ email: 'family42@test.com', password: 'password123' });
        });

        expect(navigateMock).toHaveBeenCalledWith('/elders/42');
    });

    it('uses user contract when jwt role claim is missing', async () => {
        const accessToken = createToken({ sub: '3' });
        const tokens: AuthTokens = {
            accessToken,
            refreshToken: 'refresh',
            user: {
                id: 3,
                role: 'WORKER',
                email: 'worker3@test.com',
            },
        };
        vi.mocked(authApi.login).mockResolvedValue(tokens);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login({ email: 'worker3@test.com', password: 'password123' });
        });

        expect(navigateMock).toHaveBeenCalledWith('/elders');
        expect(useAuthStore.getState().user?.role).toBe('WORKER');
        expect(useAuthStore.getState().user?.id).toBe(3);
    });

    it('uses robot contract when jwt claims are missing', async () => {
        const accessToken = createToken({});
        const tokens: AuthTokens = {
            accessToken,
            robot: {
                id: 99,
                serialNumber: 'ROBOT-2026-X99',
                elderId: 2,
            },
        };
        vi.mocked(authApi.robotLogin).mockResolvedValue(tokens);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.robotLogin({ serialNumber: 'ROBOT-2026-X99', authCode: '9999' });
        });

        expect(navigateMock).toHaveBeenCalledWith('/robots/99/lcd');
        expect(useAuthStore.getState().user?.role).toBe('ROBOT');
        expect(useAuthStore.getState().user?.id).toBe(99);
    });
});
