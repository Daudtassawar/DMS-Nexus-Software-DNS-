import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { ShieldCheck, User, Lock, Mail, ChevronRight, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';
import AppButton from '../components/AppButton';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Salesman'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        if (formData.password !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...submitData } = formData;
            await authService.register(submitData);
            setStatus({ type: 'success', message: 'Account created successfully! Redirecting...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Registration failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:items-center md:justify-center bg-[var(--bg-app)] transition-colors duration-500 overflow-x-hidden py-12">
            {/* Background Decorative Accent */}
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-[var(--primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[var(--primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-2xl md:m-4 flex-1 md:flex-none flex flex-col justify-center">
                <div className="bg-[var(--bg-card)] md:shadow-lg md:border border-[var(--border)] rounded-2xl md:p-10 p-8 flex-1 md:flex-none">
                    
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-[var(--primary)] bg-opacity-10 rounded-2xl border border-[var(--primary)] border-opacity-20 mb-6 transition-all duration-500 hover:scale-110">
                           <ShieldCheck size={40} className="text-[var(--primary)]"/>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-1">
                            System <span className="text-[var(--primary)]">Access</span>
                        </h1>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                            Enterprise Terminal Registration
                        </p>
                    </div>

                    {status.message && (
                        <div className={`w-full mb-8 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border transition-all ${
                            status.type === 'success' 
                                ? 'bg-emerald-500 bg-opacity-10 border-emerald-500 border-opacity-20 text-emerald-500 animate-bounce' 
                                : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-20 text-red-500 animate-pulse'
                        }`}>
                            {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <UserCircle size={18}/>
                                    </div>
                                    <input
                                        type="text" name="fullName" required
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                        value={formData.fullName} onChange={handleChange} placeholder="First Last"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <User size={18}/>
                                    </div>
                                    <input
                                        type="text" name="username" required
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                        value={formData.username} onChange={handleChange} placeholder="jdoe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <Mail size={18}/>
                                </div>
                                <input
                                    type="email" name="email" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                    value={formData.email} onChange={handleChange} placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <Lock size={18}/>
                                    </div>
                                    <input
                                        type="password" name="password" required minLength="6"
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                        value={formData.password} onChange={handleChange} placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <ShieldCheck size={18}/>
                                    </div>
                                    <input
                                        type="password" name="confirmPassword" required minLength="6"
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-50 transition-all"
                                        value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <AppButton
                                disabled={loading}
                                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-[var(--ring)] flex justify-center group"
                            >
                                {loading ? 'Processing...' : (
                                    <div className="flex items-center gap-2">
                                        Create Account <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                    </div>
                                )}
                            </AppButton>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary)] font-black uppercase tracking-widest transition-colors">
                                    Already have an account? <span className="underline decoration-[var(--primary)] decoration-2 underline-offset-4 ml-1">Sign In</span>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
