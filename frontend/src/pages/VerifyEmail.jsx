import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import AppButton from '../components/AppButton';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link. Missing parameters.');
                return;
            }

            try {
                const response = await authService.verifyEmail(token, email);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be expired.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] font-sans p-6">
            <div className="w-full max-w-[440px]">
                <div className="bg-[var(--bg-card)] p-8 md:p-12 rounded-lg border border-[var(--border)] shadow-xl text-center">
                    
                    <div className="mb-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6 border border-[var(--primary)]/20 shadow-inner">
                            <ShieldCheck className="text-[var(--primary)]" size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-main)] uppercase tracking-tight">Identity Verification</h1>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2">DMS Secure Protocol</p>
                    </div>

                    <div className="space-y-8">
                        {status === 'loading' && (
                            <div className="py-8 flex flex-col items-center">
                                <Loader2 className="animate-spin text-[var(--primary)] mb-4" size={48} strokeWidth={1} />
                                <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Synchronizing Authentication...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="py-2 space-y-6">
                                <div className="flex flex-col items-center text-emerald-500">
                                    <CheckCircle2 size={64} strokeWidth={1.5} />
                                    <h2 className="text-lg font-bold uppercase tracking-wide mt-4">Verification Complete</h2>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                                    <p className="text-xs font-bold text-emerald-800 uppercase leading-relaxed">{message}</p>
                                </div>
                                <AppButton className="w-full justify-center py-4 rounded-md shadow-lg" as={Link} to="/login">
                                    Access Domain <ArrowRight className="ml-2" size={18} />
                                </AppButton>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="py-2 space-y-6">
                                <div className="flex flex-col items-center text-red-500">
                                    <XCircle size={64} strokeWidth={1.5} />
                                    <h2 className="text-lg font-bold uppercase tracking-wide mt-4">Authentication Denied</h2>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                                    <p className="text-xs font-bold text-red-800 uppercase leading-relaxed">{message}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <AppButton className="w-full justify-center py-4 rounded-md" as={Link} to="/login" variant="secondary">
                                        Return to Login
                                    </AppButton>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">Contact SysAdmin if internal error persists</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40">
                    <span className="flex items-center gap-2"><Mail size={12}/> Support</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></div>
                    <span>DMS Logistics v2.0</span>
                </div>
            </div>
        </div>
    );
}
