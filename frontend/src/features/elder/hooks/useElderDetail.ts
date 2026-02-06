import { useQuery } from '@tanstack/react-query';
import { getElderDetail } from '../api/elderApi';

export const useElderDetail = (elderId?: number) => {
    return useQuery({
        queryKey: ['elder', elderId],
        queryFn: () => getElderDetail(elderId as number),
        enabled: typeof elderId === 'number',
    });
};
