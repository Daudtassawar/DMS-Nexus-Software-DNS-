import { useState, useEffect } from 'react';
import authService from '../services/authService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';

export default function ResetPasswordModal({ isOpen, onClose, username, onSave }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await authService.resetPassword(username, password);
            onSave(username);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Protocol override failure.');
        } finally { setLoading(false); }
    };

    return (
        <AppModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Credential Override Protocol"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{error}</div>}

                <div className="space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl">
                        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-tight">
                            You are initiating a <span className="text-rose-500 font-black italic">Force Reset</span> for identity <strong className="underline decoration-2 underline-offset-4">{username}</strong>. 
                        </p>
                    </div>

                    <AppInput
                        label="Override Access Key"
                        type="password"
                        required
                        minLength="6"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Define new security key..."
                    />
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1 italic">Entropy requirement: Minimum 6 characters.</p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
                    <AppButton variant="secondary" onClick={onClose}>Abort</AppButton>
                    <AppButton disabled={loading} className="!bg-rose-600 hover:!bg-rose-700">
                        {loading ? 'Committing...' : 'Commit Override'}
                    </AppButton>
                </div>
            </form>
        </AppModal>
    );
}
