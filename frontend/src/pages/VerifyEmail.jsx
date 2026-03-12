import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import AppButton from '../components/AppButton';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Initializing identity validation sequence...');
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setStatus('error');
            setMessage('Validation credentials missing or corrupted.');
            return;
        }

        authService.verifyEmail(token, email)
            .then(() => {
                setStatus('success');
                setMessage('Identity verified. Access tokens synchronized.');
            })
            .catch(err => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification link expired or invalid.');
            });
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>

            <div className="w-full max-w-[480px] p-4 relative z-10 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] text-center">
                    
                    <div className="mb-10">
                        <div className="w-20 h-20 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                           <Shield size={40}/>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Integrity <span className="text-primary not-italic">Scan</span></h1>
                    </div>

                    <div className="space-y-8">
                        {status === 'verifying' && (
                            <div className="flex flex-col items-center gap-6">
                                <Loader2 size={48} className="text-primary animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic animate-pulse">{message}</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center gap-6 animate-slide-in">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/30">
                                    <CheckCircle size={32}/>
                                </div>
                                <div>
                                    <p className="text-emerald-400 font-black uppercase tracking-widest text-xs italic">{message}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Redirecting to terminal access...</p>
                                </div>
                                <AppButton onClick={() => navigate('/login')} className="w-full py-4 !bg-emerald-600 uppercase tracking-widest flex justify-center group">
                                    Initialize Login <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16}/>
                                </AppButton>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-6 animate-slide-in">
                                <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/30">
                                    <XCircle size={32}/>
                                </div>
                                <p className="text-rose-400 font-black uppercase tracking-widest text-xs italic">{message}</p>
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    <AppButton onClick={() => navigate('/login')} className="w-full py-4 uppercase tracking-widest flex justify-center bg-white/5 hover:bg-white/10 text-white">
                                        Return to Base
                                    </AppButton>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">If issues persist, contact system admin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
