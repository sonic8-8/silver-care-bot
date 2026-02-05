import { api } from '@/shared/api/axios';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type { AuthTokens, UserRole } from '@/shared/types/user.types';

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

export const authApi = {
    async signup(payload: SignupPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/signup', payload);
        const data = unwrapApiResponse(response.data);
        if (!data?.accessToken) {
            return { accessToken: '' };
        }
        return data;
    },

    async login(payload: LoginPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/login', payload);
        const data = unwrapApiResponse(response.data);
        if (!data?.accessToken) {
            throw new Error('Invalid login response');
        }
        return data;
    },

    async refresh(): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/refresh');
        const data = unwrapApiResponse(response.data);
        if (!data?.accessToken) {
            throw new Error('Invalid refresh response');
        }
        return data;
    },

    async robotLogin(payload: RobotLoginPayload): Promise<AuthTokens> {
        const response = await api.post<ApiResult<AuthTokens>>('/auth/robot/login', payload);
        const data = unwrapApiResponse(response.data);
        if (!data?.accessToken) {
            throw new Error('Invalid robot login response');
        }
        return data;
    },
};
