import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CalendarCheck,
    Tag,
    FileText,
    BarChart3,
    Users,
    Settings,
    X,
    Quote,
    Image,
    HelpCircle,
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/villas', label: 'Villas Management', icon: Building2 },
    { path: '/admin/bookings', label: 'Bookings Management', icon: CalendarCheck },
    { path: '/admin/offers', label: 'Offers Management', icon: Tag },
    { path: '/admin/blog', label: 'Blog Posts', icon: FileText },
    { path: '/admin/testimonials', label: 'Testimonials', icon: Quote },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/users', label: 'Admin Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const location = useLocation();

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`admin-sidebar ${isOpen ? 'open' : ''}`}
            >
                {/* Logo */}
                <div className="admin-sidebar-logo flex items-center justify-between">
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <span className="text-white font-semibold text-xl">
                            Stay<span className="text-[#A1BC98]">in</span>UBUD
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 hover:bg-white/10 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 py-2">
                    <div className="text-xs uppercase tracking-wider text-white/50 font-medium">
                        Admin Panel
                    </div>
                </div>

                {/* Navigation */}
                <nav className="admin-sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <Link
                        to="/"
                        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
                    >
                        ← Back to Website
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
