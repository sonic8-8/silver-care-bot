import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@/test/utils';
import { useNotificationSettings } from './useNotificationSettings';

describe('useNotificationSettings', () => {
    it('fetches and updates settings', async () => {
        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useNotificationSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.settingsQuery.isSuccess).toBe(true);
        });

        expect(result.current.settingsQuery.data?.theme).toBeDefined();

        await result.current.updateSettings({
            notificationSettings: {
                medicationEnabled: false,
            },
        });

        await waitFor(() => {
            expect(result.current.settingsQuery.data?.notificationSettings.medicationEnabled).toBe(false);
        });
    });
});
