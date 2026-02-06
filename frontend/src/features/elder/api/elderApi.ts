import { api } from '@/shared/api/axios';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult, ElderDetail, ElderListPayload, EmergencyContact } from '@/shared/types';

export type CreateEmergencyContactPayload = {
    name: string;
    phone: string;
    relation?: string;
    priority?: number;
};

export type CreateElderPayload = {
    name: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    address?: string;
    emergencyContacts?: CreateEmergencyContactPayload[];
};

export type UpdateElderPayload = {
    name?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    address?: string;
};

export type UpdateEmergencyContactPayload = {
    name?: string;
    phone?: string;
    relation?: string;
    priority?: number;
};

export const getElders = async () => {
    const response = await api.get<ApiResult<ElderListPayload>>('/elders');
    return unwrapApiResponse(response.data);
};

export const getElderDetail = async (elderId: number) => {
    const response = await api.get<ApiResult<ElderDetail>>(`/elders/${elderId}`);
    return unwrapApiResponse(response.data);
};

export const createElder = async (payload: CreateElderPayload) => {
    const response = await api.post<ApiResult<ElderDetail>>('/elders', payload);
    return unwrapApiResponse(response.data);
};

export const updateElder = async (elderId: number, payload: UpdateElderPayload) => {
    const response = await api.put<ApiResult<ElderDetail>>(`/elders/${elderId}`, payload);
    return unwrapApiResponse(response.data);
};

export const deleteElder = async (elderId: number) => {
    const response = await api.delete<ApiResult<null>>(`/elders/${elderId}`);
    return unwrapApiResponse(response.data);
};

export const getContacts = async (elderId: number) => {
    const response = await api.get<ApiResult<EmergencyContact[]>>(`/elders/${elderId}/contacts`);
    return unwrapApiResponse(response.data) ?? [];
};

export const createContact = async (elderId: number, payload: CreateEmergencyContactPayload) => {
    const response = await api.post<ApiResult<EmergencyContact>>(`/elders/${elderId}/contacts`, payload);
    return unwrapApiResponse(response.data);
};

export const updateContact = async (
    elderId: number,
    contactId: number,
    payload: UpdateEmergencyContactPayload
) => {
    const response = await api.put<ApiResult<EmergencyContact>>(
        `/elders/${elderId}/contacts/${contactId}`,
        payload
    );
    return unwrapApiResponse(response.data);
};

export const deleteContact = async (elderId: number, contactId: number) => {
    const response = await api.delete<ApiResult<null>>(`/elders/${elderId}/contacts/${contactId}`);
    return unwrapApiResponse(response.data);
};
