import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthRole } from '@/features/auth/types';

interface ProtectedRouteProps {
    children: ReactNode;
    allowRoles?: AuthRole[];
    redirectTo?: string;
}

const hasAccess = (role: AuthRole | null | undefined, allowRoles?: AuthRole[]) => {
    if (!allowRoles || allowRoles.length === 0) return true;
    if (!role) return false;
    return allowRoles.includes(role);
};

function ProtectedRoute({ children, allowRoles, redirectTo = '/login' }: ProtectedRouteProps) {
    const { tokens, user } = useAuthStore();

    if (!tokens?.accessToken) {
        return <Navigate to={redirectTo} replace />;
    }

    if (!hasAccess(user?.role, allowRoles)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
