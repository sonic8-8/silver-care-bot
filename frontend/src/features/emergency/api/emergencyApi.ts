import { api } from '@/shared/api/axios';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult, EmergencyDetail, EmergencyListPayload, EmergencyResolution, EmergencyType } from '@/shared/types';

export type ReportEmergencyPayload = {
    type: EmergencyType;
    location?: string;
    detectedAt?: string;
    confidence?: number;
    sensorData?: Record<string, unknown>;
};

export type ResolveEmergencyPayload = {
    resolution: EmergencyResolution;
    note?: string;
};

export const reportEmergency = async (robotId: number, payload: ReportEmergencyPayload) => {
    const response = await api.post<ApiResult<EmergencyDetail>>(`/robots/${robotId}/emergency`, payload);
    return unwrapApiResponse(response.data);
};

export const getEmergencies = async () => {
    const response = await api.get<ApiResult<EmergencyListPayload>>('/emergencies');
    return unwrapApiResponse(response.data);
};

export const getEmergency = async (emergencyId: number) => {
    const response = await api.get<ApiResult<EmergencyDetail>>(`/emergencies/${emergencyId}`);
    return unwrapApiResponse(response.data);
};

export const resolveEmergency = async (emergencyId: number, payload: ResolveEmergencyPayload) => {
    const response = await api.patch<ApiResult<EmergencyDetail>>(`/emergencies/${emergencyId}/resolve`, payload);
    return unwrapApiResponse(response.data);
};
