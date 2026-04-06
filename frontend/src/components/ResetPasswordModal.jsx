import { useState, useEffect } from 'react';
import authService from '../services/authService';
import AppModal from './AppModal';
import AppButton from './AppButton';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordModal({ isOpen, onClose, username, onSave }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) { setPassword(''); setConfirm(''); setError(''); }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            await authService.resetPassword(username, password);
            onSave(username);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.Message || 'Failed to reset password. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Reset Password" maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md flex items-center gap-2">
                        <AlertCircle size={14}/> {error}
                    </div>
                )}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs font-semibold text-amber-800">
                        You are resetting the password for <strong>@{username}</strong>. Their current session will be invalidated.
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                    <div className="relative">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="password"
                            required
                            minLength="8"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            className="w-full pl-9 pr-4 py-2.5 border border-[var(--border)] rounded-md text-sm bg-[var(--bg-app)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                        <CheckCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full pl-9 pr-4 py-2.5 border border-[var(--border)] rounded-md text-sm bg-[var(--bg-app)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                    <AppButton type="button" variant="secondary" onClick={onClose}>Cancel</AppButton>
                    <AppButton type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </AppButton>
                </div>
            </form>
        </AppModal>
    );
}
