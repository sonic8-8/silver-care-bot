import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@/test/utils';
import { useRobotStatus } from './useRobotStatus';

describe('useRobotStatus', () => {
    it('returns robot status data', async () => {
        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useRobotStatus(1), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.serialNumber).toBe('ROBOT-2026-X82');
        expect(result.current.data?.networkStatus).toBe('CONNECTED');
    });
});
