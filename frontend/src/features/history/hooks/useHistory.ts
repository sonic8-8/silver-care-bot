import { useQuery } from '@tanstack/react-query';
import { getActivities, getWeeklyReport } from '../api/historyApi';

export const useActivities = (elderId: number | undefined, date: string, enabled = true) => {
    return useQuery({
        queryKey: ['history-activities', elderId, date],
        queryFn: () => getActivities(elderId as number, date),
        enabled: enabled && typeof elderId === 'number' && !Number.isNaN(elderId) && Boolean(date),
    });
};

export const useWeeklyReport = (elderId: number | undefined, weekStartDate: string, enabled = true) => {
    return useQuery({
        queryKey: ['history-weekly-report', elderId, weekStartDate],
        queryFn: () => getWeeklyReport(elderId as number, weekStartDate),
        enabled: enabled && typeof elderId === 'number' && !Number.isNaN(elderId) && Boolean(weekStartDate),
    });
};
