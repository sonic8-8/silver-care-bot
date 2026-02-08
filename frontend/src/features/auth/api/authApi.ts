import { api } from '@/shared/api/axios';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type { AuthTokens, AuthRobotProfile, AuthUserProfile, UserRole } from '@/shared/types/user.types';

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RobotLoginPayload {
    serialNumber: string;
    authCode: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const toUserProfile = (value: unknown): AuthUserProfile | undefined => {
    if (!isRecord(value)) {
        return undefined;
    }
    if (typeof value.id !== 'number' || typeof value.role !== 'string') {
        return undefined;
    }
    return {
        id: value.id,
        role: value.role as UserRole,
        name: typeof value.name === 'string' ? value.name : undefined,
        email: typeof value.email === 'string' ? value.email : undefined,
        phone: typeof value.phone === 'string' ? value.phone : undefined,
        elderId: typeof value.elderId === 'number' ? value.elderId : undefined,
    };
};

const toRobotProfile = (value: unknown): AuthRobotProfile | undefined => {
    if (!isRecord(value)) {
        return undefined;
    }
    if (typeof value.id !== 'number' || typeof value.serialNumber !== 'string') {
        return undefined;
    }
    return {
        id: value.id,
        serialNumber: value.serialNumber,
        elderId: typeof value.elderId === 'number' ? value.elderId : undefined,
        elderName: typeof value.elderName === 'string' ? value.elderName : undefined,
    };
};

const parseAuthTokens = (payload: unknown, message: string): AuthTokens => {
    if (!isRecord(payload) || typeof payload.accessToken !== 'string') {
        throw new Error(message);
    }
    return {
        accessToken: payload.accessToken,
        refreshToken: typeof payload.refreshToken === 'string' ? payload.refreshToken : undefined,
        expiresIn: typeof payload.expiresIn === 'number' ? payload.expiresIn : undefined,
        user: toUserProfile(payload.user),
        robot: toRobotProfile(payload.robot),
    };
};

export const authApi = {
    async signup(payload: SignupPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/signup', payload);
        return parseAuthTokens(unwrapApiResponse(response.data), 'Invalid signup response');
    },

    async login(payload: LoginPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/login', payload);
        return parseAuthTokens(unwrapApiResponse(response.data), 'Invalid login response');
    },

    async refresh(): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/refresh');
        return parseAuthTokens(unwrapApiResponse(response.data), 'Invalid refresh response');
    },

    async robotLogin(payload: RobotLoginPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/robot/login', payload);
        return parseAuthTokens(unwrapApiResponse(response.data), 'Invalid robot login response');
    },
};
