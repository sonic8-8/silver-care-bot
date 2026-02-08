import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthTokens } from '@/shared/types/user.types';
import { authApi, type LoginPayload, type RobotLoginPayload, type SignupPayload } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { parseJwtPayload } from '@/features/auth/utils/jwt';

const resolvePostLoginPath = (tokens: AuthTokens): string => {
    const payload = parseJwtPayload(tokens.accessToken);
    const role = payload?.role ?? tokens.user?.role ?? (tokens.robot ? 'ROBOT' : undefined);
    const subject = payload?.sub ?? (tokens.robot ? String(tokens.robot.id) : undefined);

    if (role === 'WORKER') {
        return '/elders';
    }
    if (role === 'FAMILY') {
        const elderId =
            typeof payload?.elderId === 'number'
                ? payload.elderId
                : (typeof tokens.user?.elderId === 'number' ? tokens.user.elderId : null);
        return elderId ? `/elders/${elderId}` : '/elders';
    }
    if (role === 'ROBOT') {
        return subject ? `/robots/${subject}/lcd` : '/login';
    }
    return '/';
};

export const useAuth = () => {
    const navigate = useNavigate();
    const { user, tokens, setTokens, logout } = useAuthStore();

    const login = useCallback(async (payload: LoginPayload) => {
        const result = await authApi.login(payload);
        setTokens(result);
        navigate(resolvePostLoginPath(result));
        return result;
    }, [navigate, setTokens]);

    const signup = useCallback(async (payload: SignupPayload) => {
        const result = await authApi.signup(payload);
        if (result.accessToken) {
            setTokens(result);
            navigate(resolvePostLoginPath(result));
        } else {
            navigate('/login');
        }
        return result;
    }, [navigate, setTokens]);

    const refresh = useCallback(async () => {
        const result = await authApi.refresh();
        setTokens(result);
        return result;
    }, [setTokens]);

    const robotLogin = useCallback(async (payload: RobotLoginPayload) => {
        const result = await authApi.robotLogin(payload);
        setTokens(result);
        navigate(resolvePostLoginPath(result));
        return result;
    }, [navigate, setTokens]);

    return {
        user,
        tokens,
        login,
        signup,
        refresh,
        robotLogin,
        logout,
    };
};
