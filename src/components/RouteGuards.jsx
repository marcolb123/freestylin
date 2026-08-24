import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth-context';

// Both guards wait for `loading` before deciding. Without that they would
// bounce a signed-in dancer to /login on every refresh, since the user is
// rehydrated from localStorage after the first render.

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
}

export function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user?.isAdmin ? children : <Navigate to="/login" />;
}
