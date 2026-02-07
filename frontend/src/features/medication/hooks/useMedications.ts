import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createMedication,
    deleteMedication,
    getMedicationOverview,
    updateMedication,
} from '../api/medicationApi';
import type { CreateMedicationPayload, UpdateMedicationPayload } from '../types';

const medicationQueryKey = (elderId?: number) => ['elder-medications', elderId] as const;

export const useMedications = (elderId?: number) => {
    return useQuery({
        queryKey: medicationQueryKey(elderId),
        queryFn: () => getMedicationOverview(elderId as number),
        enabled: typeof elderId === 'number' && !Number.isNaN(elderId),
    });
};

export const useCreateMedication = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateMedicationPayload) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }
            return createMedication(elderId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: medicationQueryKey(elderId) });
        },
    });
};

export const useUpdateMedication = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ medicationId, payload }: { medicationId: number; payload: UpdateMedicationPayload }) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }
            return updateMedication(elderId, medicationId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: medicationQueryKey(elderId) });
        },
    });
};

export const useDeleteMedication = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (medicationId: number) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }
            return deleteMedication(elderId, medicationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: medicationQueryKey(elderId) });
        },
    });
};
