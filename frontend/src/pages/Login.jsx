import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, User, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import AppButton from '../components/AppButton';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.login(username, password);
            window.location.href = '/'; 
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:items-center md:justify-center bg-[var(--bg-app)] transition-colors duration-500 overflow-x-hidden">
            {/* Background Decorative Accent */}
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-[var(--primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[var(--primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md md:m-4 flex-1 md:flex-none flex flex-col justify-center">
                <div className="bg-[var(--bg-card)] md:shadow-lg md:border border-[var(--border)] rounded-2xl md:p-10 p-8 flex-1 md:flex-none flex flex-col items-center">
                    
                    {/* Brand Identity */}
                    <div className="mb-10 text-center w-full">
                        <div className="inline-flex items-center justify-center p-4 bg-[var(--primary)] bg-opacity-10 rounded-2xl border border-[var(--primary)] border-opacity-20 mb-6 group transition-all duration-500 hover:rotate-6">
                           <ShieldCheck size={40} className="text-[var(--primary)]"/>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-1">
                            DMS <span className="text-[var(--primary)]">Nexus</span>
                        </h1>
                        <div className="flex justify-center">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] typing-text max-w-fit mx-auto h-4">
                                Optimizing Resources, Maximizing Efficiency
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold animate-pulse">
                            <AlertCircle size={16} className="shrink-0"/> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Account Username</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <User size={18}/>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. admin_user"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Access Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <Lock size={18}/>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <AppButton
                                disabled={loading}
                                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-[var(--ring)] flex justify-center group"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Login to System <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                )}
                            </AppButton>

                            <Link to="/register" className="w-full">
                               <button type="button" className="w-full py-3.5 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest transition-all interactive">
                                 Register Account
                               </button>
                            </Link>
                        </div>
                        
                        <div className="pt-8 text-center">
                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] opacity-40">
                                DMS NEXUS v4.2.0 • Enterprise Edition
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
