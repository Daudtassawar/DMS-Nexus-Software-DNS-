import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function SetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invitation token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        try {
            await authService.setPassword(token, password, confirmPassword);
            setSuccess('Password established successfully. Please wait for an administrator to approve your account before logging in.');
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to establish identity keys.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-app)] relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[var(--bg-card)] rounded-[2rem] p-10 border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group hover:scale-105 transition-all">
                        <KeyRound size={40} className="text-primary group-hover:animate-spin-slow" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">Secure Init</h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] mt-3 tracking-[0.3em] uppercase">Establish User Access Keys</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-fade-in shadow-inner">
                        <div className="min-w-[20px] pt-0.5"><ShieldCheck size={18} className="text-rose-500"/></div>
                        <p className="text-rose-500 text-xs font-black uppercase tracking-widest leading-relaxed">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-fade-in shadow-inner">
                        <div className="min-w-[20px] pt-0.5"><ShieldCheck size={18} className="text-emerald-500"/></div>
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest leading-relaxed">{success}</p>
                    </div>
                )}

                {!token ? null : success ? null : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AppInput
                            type="password"
                            label="New Cryptographic Key"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter robust password"
                        />

                        <AppInput
                            type="password"
                            label="Verify Cryptographic Key"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                        />

                        <AppButton type="submit" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] !rounded-2xl shadow-xl shadow-primary/25 mt-2 transition-all hover:scale-[1.02]" disabled={loading}>
                            {loading ? 'Committing...' : 'Establish Keys'}
                        </AppButton>
                    </form>
                )}
            </div>
            <div className="fixed bottom-8 text-center w-full z-0 text-[10px] uppercase tracking-[0.5em] font-black text-[var(--text-muted)] opacity-50 select-none">
                DMS Enterprise // Secured Authentication
            </div>
        </div>
    );
}
