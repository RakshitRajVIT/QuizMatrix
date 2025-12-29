// ProtectedRoute - Wrapper component for authenticated routes
// Redirects to login if user is not authenticated
// Can also check for admin-only access

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return <LoadingSpinner message="Checking authentication..." />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check admin access if required
    if (adminOnly && !isAdmin) {
        return <Navigate to="/join" replace />;
    }

    // User is authenticated (and admin if required) - show the content
    return children;
};

export default ProtectedRoute;
