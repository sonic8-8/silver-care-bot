import axios from 'axios';
import { ApiError, isApiResult, isErrorResponse, unwrapApiResponse } from './response';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
});

const ACCESS_TOKEN_KEY = 'accessToken';

type AuthFailureHandler = () => void;

let authFailureHandler: AuthFailureHandler | null = null;

export const setAuthFailureHandler = (handler: AuthFailureHandler | null) => {
    authFailureHandler = handler;
};

const getStoredAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const setStoredAccessToken = (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const clearStoredTokens = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
};

let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null) => {
    pendingQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        } else {
            prom.reject(new Error('Access token missing'));
        }
    });
    pendingQueue = [];
};

const requestRefresh = async () => {
    const response = await refreshClient.post('/auth/refresh');
    const data = unwrapApiResponse(response.data) as { accessToken?: string | null };
    if (!data?.accessToken) {
        throw new Error('Invalid refresh response');
    }
    return data.accessToken;
};

api.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        const payload = response.data as unknown;
        if (isApiResult(payload) && isErrorResponse(payload)) {
            throw new ApiError(payload.error);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
        const status = error.response?.status;
        const isAuthEndpoint = typeof originalRequest?.url === 'string' && originalRequest.url.includes('/auth/');

        if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token) => {
                            originalRequest.headers = originalRequest.headers ?? {};
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const accessToken = await requestRefresh();
                setStoredAccessToken(accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                const errorInstance = refreshError instanceof Error
                    ? refreshError
                    : new Error('Refresh token request failed');
                processQueue(errorInstance, null);
                clearStoredTokens();
                authFailureHandler?.();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
