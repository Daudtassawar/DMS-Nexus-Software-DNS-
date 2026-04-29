import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, User, Lock, Mail, ChevronRight, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
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
            setStatus({ type: 'success', message: 'Account created successfully. Redirecting to login...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 py-12">
            <div className="w-full max-w-[540px] ">
                <div className="bg-white p-8 md:p-12 rounded-lg border border-slate-200 shadow-sm">
                    
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 mx-auto mb-6">
                           <Shield size={32} className="text-white"/>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access <span className="text-blue-600">Request</span></h1>
                        <p className="text-xs font-medium text-slate-500 mt-2 uppercase tracking-wider">Enterprise Terminal Registration</p>
                    </div>

                    {status.message && (
                        <div className={`w-full mb-8 p-4 rounded-md flex items-center gap-3 text-xs font-medium border shadow-sm ${
                            status.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-red-50 border-red-100 text-red-700'
                        }`}>
                            {status.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Full Name</label>
                                <input
                                    type="text" name="fullName" required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={formData.fullName} onChange={handleChange} placeholder="First Last"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Username</label>
                                <input
                                    type="text" name="username" required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={formData.username} onChange={handleChange} placeholder="jdoe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Email Address</label>
                            <input
                                type="email" name="email" required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                value={formData.email} onChange={handleChange} placeholder="name@company.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Password</label>
                                <input
                                    type="password" name="password" required minLength="6"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={formData.password} onChange={handleChange} placeholder="Min 6 characters"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Confirm Password</label>
                                <input
                                    type="password" name="confirmPassword" required minLength="6"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        <AppButton
                            disabled={loading}
                            className="w-full py-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex justify-center group"
                        >
                            {loading ? 'Creating Account...' : (
                                <div className="flex items-center gap-2">
                                    Register Account <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                </div>
                            )}
                        </AppButton>
                        
                        <div className="pt-8 text-center border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                                Already have credentials?{' '}
                                <Link to="/login" className="text-blue-600 hover:underline font-bold transition-colors">
                                    Sign In here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
