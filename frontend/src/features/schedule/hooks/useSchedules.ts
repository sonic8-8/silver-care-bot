import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createSchedule,
    deleteSchedule,
    getSchedules,
    updateSchedule,
} from '../api/scheduleApi';
import type { CreateSchedulePayload, ScheduleType, UpdateSchedulePayload } from '../types';

export type ScheduleQueryFilters = {
    startDate?: string;
    endDate?: string;
    type?: ScheduleType;
};

const scheduleQueryKey = (elderId?: number, filters?: ScheduleQueryFilters) => {
    return [
        'elder-schedules',
        elderId,
        filters?.startDate ?? null,
        filters?.endDate ?? null,
        filters?.type ?? null,
    ] as const;
};

export const useSchedules = (elderId?: number, filters?: ScheduleQueryFilters) => {
    return useQuery({
        queryKey: scheduleQueryKey(elderId, filters),
        queryFn: () => getSchedules(elderId as number, filters),
        enabled: typeof elderId === 'number' && !Number.isNaN(elderId),
    });
};

export const useCreateSchedule = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSchedulePayload) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }

            return createSchedule(elderId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elder-schedules', elderId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', elderId] });
        },
    });
};

export const useUpdateSchedule = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ scheduleId, payload }: { scheduleId: number; payload: UpdateSchedulePayload }) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }

            return updateSchedule(elderId, scheduleId, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elder-schedules', elderId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', elderId] });
        },
    });
};

export const useDeleteSchedule = (elderId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (scheduleId: number) => {
            if (typeof elderId !== 'number' || Number.isNaN(elderId)) {
                throw new Error('Elder ID is required');
            }

            return deleteSchedule(elderId, scheduleId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elder-schedules', elderId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', elderId] });
        },
    });
};
