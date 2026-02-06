import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type {
    CreateMedicationPayload,
    MedicationItem,
    MedicationOverview,
    UpdateMedicationPayload,
} from '../types';

const ensureData = <T>(data: T | null, errorMessage: string): T => {
    if (data === null) {
        throw new Error(errorMessage);
    }
    return data;
};

export const getMedicationOverview = async (elderId: number) => {
    const response = await api.get<ApiResult<MedicationOverview>>(`/elders/${elderId}/medications`);
    return ensureData(unwrapApiResponse(response.data), 'Medication overview is empty');
};

export const createMedication = async (elderId: number, payload: CreateMedicationPayload) => {
    const response = await api.post<ApiResult<MedicationItem>>(`/elders/${elderId}/medications`, payload);
    return ensureData(unwrapApiResponse(response.data), 'Medication create response is empty');
};

export const updateMedication = async (
    elderId: number,
    medicationId: number,
    payload: UpdateMedicationPayload
) => {
    const response = await api.put<ApiResult<MedicationItem>>(
        `/elders/${elderId}/medications/${medicationId}`,
        payload
    );
    return ensureData(unwrapApiResponse(response.data), 'Medication update response is empty');
};

export const deleteMedication = async (elderId: number, medicationId: number) => {
    const response = await api.delete<ApiResult<null>>(`/elders/${elderId}/medications/${medicationId}`);
    return unwrapApiResponse(response.data);
};
