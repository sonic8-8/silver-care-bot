import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryClientWrapper } from '@/test/utils';
import { useMedications } from './useMedications';
import { getMedicationOverview } from '../api/medicationApi';

vi.mock('../api/medicationApi', () => ({
    getMedicationOverview: vi.fn(),
    createMedication: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
}));

const mockedGetMedicationOverview = vi.mocked(getMedicationOverview);

describe('useMedications', () => {
    beforeEach(() => {
        mockedGetMedicationOverview.mockReset();
    });

    it('fetches medication overview successfully', async () => {
        mockedGetMedicationOverview.mockResolvedValue({
            weeklyStatus: {
                taken: 5,
                missed: 1,
                total: 6,
                rate: 83.3,
            },
            dailyStatus: [
                {
                    day: 'MON',
                    morning: 'TAKEN',
                    evening: 'MISSED',
                },
            ],
            medications: [
                {
                    id: 1,
                    name: '고혈압약',
                    dosage: '1정',
                    frequency: 'MORNING',
                    timing: '식후 30분',
                },
            ],
            dispenser: {
                remaining: 3,
                capacity: 7,
                needsRefill: true,
                daysUntilEmpty: 2,
            },
        });

        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useMedications(1), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedGetMedicationOverview).toHaveBeenCalledWith(1);
        expect(result.current.data?.medications[0]?.name).toBe('고혈압약');
    });

    it('does not run query without elder id', () => {
        const wrapper = createQueryClientWrapper();
        renderHook(() => useMedications(undefined), { wrapper });

        expect(mockedGetMedicationOverview).not.toHaveBeenCalled();
    });
});
