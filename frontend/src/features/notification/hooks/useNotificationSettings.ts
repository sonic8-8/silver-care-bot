import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMySettings, updateMySettings } from '@/features/notification/api/notificationApi';
import { notificationKeys } from '@/features/notification/queryKeys';
import type { UpdateMySettingsPayload } from '@/shared/types';

export const useNotificationSettings = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery({
        queryKey: notificationKeys.settings,
        queryFn: getMySettings,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateMySettingsPayload) => updateMySettings(payload),
        onSuccess: (nextSettings) => {
            queryClient.setQueryData(notificationKeys.settings, nextSettings);
        },
    });

    return {
        settingsQuery,
        updateSettings: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
};
