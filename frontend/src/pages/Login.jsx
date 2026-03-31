import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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
            setError(err.response?.data?.message || 'The username or password you entered is incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <div className="w-full max-w-[440px] animate-fade-in">
                <div className="bg-white p-8 md:p-12 rounded-lg border border-slate-200 shadow-xl flex flex-col items-center">
                    
                    {/* Brand Identity */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mx-auto mb-6">
                           <Shield size={32} className="text-white"/>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hamdaan <span className="text-blue-600">Traders</span></h1>
                        <p className="text-xs font-medium text-slate-500 mt-2 uppercase tracking-wider">Enterprise Distribution System</p>
                    </div>

                    {error && (
                        <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-md flex items-center gap-3 text-xs font-medium animate-shake">
                            <AlertCircle size={16} className="shrink-0"/> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Username</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <User size={18}/>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pl-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={18}/>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 font-medium text-sm placeholder:text-slate-400 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <AppButton
                            disabled={loading}
                            className="w-full py-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex justify-center group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                </div>
                            )}
                        </AppButton>
                        
                        <div className="pt-8 text-center border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 hover:underline font-bold transition-colors">
                                    Request Access
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
                
                {/* Footer Security Badge */}
                <div className="mt-8 flex items-center justify-center gap-4 opacity-50">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                       <CheckCircle2 size={12} className="text-emerald-600"/> Secure Data Link
                   </div>
                   <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                   <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">v4.2.0-STABLE</div>
                </div>
            </div>
        </div>
    );
}
