import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

function RootRedirect() {
    const { tokens, user } = useAuthStore();

    if (!tokens?.accessToken || !user?.role) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'ROBOT') {
        return <Navigate to={`/robots/${user.id}/lcd`} replace />;
    }

    if (user.role === 'FAMILY' && typeof user.elderId === 'number') {
        return <Navigate to={`/elders/${user.elderId}`} replace />;
    }

    return <Navigate to="/elders" replace />;
}

export default RootRedirect;
