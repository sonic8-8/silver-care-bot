import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { setAuthFailureHandler } from '@/shared/api/axios';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
        },
    },
});

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    useEffect(() => {
        setAuthFailureHandler(() => {
            useAuthStore.getState().logout();
        });
        return () => setAuthFailureHandler(null);
    }, []);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
