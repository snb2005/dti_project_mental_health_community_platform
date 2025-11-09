import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
    const { userData, backendUrl } = useContext(AppContent);
    const [isAdmin, setIsAdmin] = useState(null); // null = loading state

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
                    withCredentials: true
                });

                if (data.success && data.userData?.role === 'admin') {
                    setIsAdmin(true); // User is an admin
                } else {
                    setIsAdmin(false);
                    toast.error('Admin access required');
                }
            } catch (error) {
                setIsAdmin(false);
                toast.error('Authentication failed');
            }
        };

        verifyAdmin();
    }, [backendUrl]);

    // Show loading while verifying admin
    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Redirect if not an admin
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
