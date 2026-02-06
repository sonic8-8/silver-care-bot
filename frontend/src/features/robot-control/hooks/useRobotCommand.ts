import { useMutation, useQueryClient } from '@tanstack/react-query';
import { robotApi, type RobotCommandRequest } from '../api/robotApi';

export const useRobotCommand = (robotId?: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: RobotCommandRequest) => {
            if (typeof robotId !== 'number' || Number.isNaN(robotId)) {
                throw new Error('Robot ID is required');
            }
            return robotApi.sendCommand(robotId, request);
        },
        onSuccess: () => {
            if (typeof robotId === 'number' && !Number.isNaN(robotId)) {
                queryClient.invalidateQueries({ queryKey: ['robot', 'status', robotId] });
            }
        },
    });
};
