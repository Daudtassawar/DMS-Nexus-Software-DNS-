import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, Lock, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
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
            setError(err.response?.data?.message || 'Authentication sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
            {/* Animated Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse transition-all duration-[5000ms]"></div>
            
            <div className="w-full max-w-[480px] p-4 relative z-10 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] flex flex-col items-center">
                    
                    {/* Brand Identity */}
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] mx-auto mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                           <Shield size={40} className="text-white"/>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">DMS <span className="text-primary not-italic">OS</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">Enterprise Distribution Intelligence</p>
                    </div>

                    {error && (
                        <div className="w-full mb-6 p-4 bg-rose-500 text-white rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-shake">
                            <AlertCircle size={18}/> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">System Handle</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                    <User size={18}/>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security Key</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                    <Lock size={18}/>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white font-bold text-sm placeholder:text-slate-600 transition-all focus:bg-white/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <AppButton
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] italic text-xs shadow-xl shadow-primary/20 flex justify-center group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Synchronizing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Initialize Core <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                </div>
                            )}
                        </AppButton>
                        
                        <div className="pt-8 text-center border-t border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                New Terminal Access?{' '}
                                <Link to="/register" className="text-primary hover:text-blue-400 transition-colors">
                                    Apply for Credentials
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
                
                {/* Footer Security Badge */}
                <div className="mt-8 flex items-center justify-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                   <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-[0.3em]">
                       <CheckCircle size={10}/> End-to-End Encrypted
                   </div>
                   <div className="w-1 h-1 bg-white rounded-full"></div>
                   <div className="text-[9px] font-black text-white uppercase tracking-[0.3em]">v4.2.0-Production</div>
                </div>
            </div>
        </div>
    );
}
