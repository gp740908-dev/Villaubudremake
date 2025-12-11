import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import '../admin.css';

const AdminLayout = () => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="admin-content">
                <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
