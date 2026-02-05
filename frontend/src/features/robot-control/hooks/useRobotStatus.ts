import { useQuery } from '@tanstack/react-query';
import { robotApi } from '../api/robotApi';

export const useRobotStatus = (robotId?: number) => {
    return useQuery({
        queryKey: ['robot', 'status', robotId],
        queryFn: () => robotApi.getStatus(robotId as number),
        enabled: typeof robotId === 'number' && !Number.isNaN(robotId),
    });
};
