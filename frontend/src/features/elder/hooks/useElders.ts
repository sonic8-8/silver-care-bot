import { useQuery } from '@tanstack/react-query';
import { getElders } from '../api/elderApi';

export const useElders = () => {
    return useQuery({
        queryKey: ['elders'],
        queryFn: getElders,
    });
};
