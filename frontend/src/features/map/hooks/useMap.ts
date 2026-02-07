import { useQuery } from '@tanstack/react-query';
import { getElderMap } from '@/features/map/api/mapApi';
import { getPatrolSnapshots } from '@/features/map/api/snapshotApi';

export const useElderMap = (elderId: number | undefined, enabled = true) => {
    return useQuery({
        queryKey: ['elder-map', elderId],
        queryFn: () => getElderMap(elderId as number),
        enabled: enabled && typeof elderId === 'number' && !Number.isNaN(elderId),
    });
};

export const usePatrolSnapshots = (patrolId: string | undefined, enabled = true) => {
    const trimmedPatrolId = patrolId?.trim() ?? '';

    return useQuery({
        queryKey: ['patrol-snapshots', trimmedPatrolId],
        queryFn: () => getPatrolSnapshots(trimmedPatrolId),
        enabled: enabled && trimmedPatrolId.length > 0,
    });
};
