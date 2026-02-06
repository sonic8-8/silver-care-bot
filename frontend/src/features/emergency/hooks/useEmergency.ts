import { useMutation, useQuery } from '@tanstack/react-query';
import { getEmergency, resolveEmergency } from '../api/emergencyApi';
import type { ResolveEmergencyPayload } from '../api/emergencyApi';

export const useEmergency = (emergencyId?: number) => {
    const detailQuery = useQuery({
        queryKey: ['emergency', emergencyId],
        queryFn: () => getEmergency(emergencyId as number),
        enabled: typeof emergencyId === 'number',
    });

    const resolveMutation = useMutation({
        mutationFn: (payload: ResolveEmergencyPayload) => {
            if (typeof emergencyId !== 'number') {
                return Promise.reject(new Error('Emergency ID is required'));
            }
            return resolveEmergency(emergencyId, payload);
        },
    });

    return {
        detailQuery,
        resolveMutation,
    };
};
