import axios from 'axios';
import { ApiError, isApiResult, isErrorResponse } from './response';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
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
    (error) => {
        if (error.response?.status === 401) {
            // TODO: refresh token flow or redirect to login
        }
        return Promise.reject(error);
    }
);
