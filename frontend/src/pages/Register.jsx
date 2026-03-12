import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, User, Lock, Mail, ChevronRight, UserCircle, CheckCircle } from 'lucide-react';
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
            setStatus({ type: 'error', message: 'Credential mismatch identified.' });
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...submitData } = formData;
            await authService.register(submitData);
            setStatus({ type: 'success', message: 'Identity established. Initializing redirect...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Identity registration failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans py-12">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            
            <div className="w-full max-w-[560px] p-4 relative z-10 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                    
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mx-auto mb-6 transform -rotate-12">
                           <Shield size={40} className="text-white"/>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Identity <span className="text-primary not-italic">Genesis</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">Apply for enterprise terminal access</p>
                    </div>

                    {status.message && (
                        <div className={`w-full mb-8 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl ${
                            status.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                        }`}>
                            {status.type === 'success' ? <CheckCircle size={18}/> : <Shield size={18}/>}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Legal Identity</label>
                                <div className="relative group">
                                    <input
                                        type="text" name="fullName" required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                        value={formData.fullName} onChange={handleChange} placeholder="Full Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Handle</label>
                                <div className="relative group">
                                    <input
                                        type="text" name="username" required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                        value={formData.username} onChange={handleChange} placeholder="Username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Communication Channel</label>
                            <div className="relative group">
                                <input
                                    type="email" name="email" required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                    value={formData.email} onChange={handleChange} placeholder="Email Address"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security Role Authorization</label>
                            <select
                                name="role"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-black text-sm appearance-none cursor-pointer focus:bg-white/10"
                                value={formData.role} onChange={handleChange}
                            >
                                <option value="Salesman">Salesman Protocol (Default)</option>
                                <option value="Manager">Field Manager Access</option>
                                <option value="Admin">Administrator Override</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Access Key</label>
                                <input
                                    type="password" name="password" required minLength="6"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                    value={formData.password} onChange={handleChange} placeholder="Define Password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Verify Access Key</label>
                                <input
                                    type="password" name="confirmPassword" required minLength="6"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                    value={formData.confirmPassword} onChange={handleChange} placeholder="Verify Password"
                                />
                            </div>
                        </div>

                        <AppButton
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] italic text-xs shadow-xl shadow-primary/20 flex justify-center group"
                        >
                            {loading ? 'Transmitting Data...' : (
                                <div className="flex items-center gap-2">
                                    Establish Identity <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                </div>
                            )}
                        </AppButton>
                        
                        <div className="pt-8 text-center border-t border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Already possess credentials?{' '}
                                <Link to="/login" className="text-primary hover:text-blue-400 transition-colors">
                                    Secure Sign-In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
