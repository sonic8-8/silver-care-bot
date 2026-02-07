import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../api/dashboardApi';

export const useDashboard = (elderId?: number) => {
    return useQuery({
        queryKey: ['dashboard', elderId],
        queryFn: () => getDashboardData(elderId as number),
        enabled: typeof elderId === 'number' && !Number.isNaN(elderId),
    });
};
