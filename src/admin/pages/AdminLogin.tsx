import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import '../admin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!email.trim() || !password.trim()) {
            return;
        }

        const success = await login(email, password);

        if (success) {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#2d3a29]">
                        Stay<span className="text-[#778873]">in</span>UBUD
                    </h1>
                    <p className="text-sm text-[#6b7c67] mt-1">Admin Panel</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#2d3a29] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="admin-input"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-[#2d3a29] mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="admin-input pr-10"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7c67] hover:text-[#2d3a29]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#d4dbc8] text-[#778873] focus:ring-[#A1BC98]"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-[#6b7c67]">
                            Remember me
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full admin-btn admin-btn-primary py-3 text-base"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 size={18} className="animate-spin" />
                                Logging in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-[#F1F3E0] rounded-lg">
                    <p className="text-xs text-[#6b7c67] text-center">
                        <strong>Demo Credentials:</strong><br />
                        Email: <code className="bg-white px-1 rounded">admin@stayinubud.com</code><br />
                        Password: <code className="bg-white px-1 rounded">admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
