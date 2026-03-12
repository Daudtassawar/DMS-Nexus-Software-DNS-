import { useState, useEffect } from 'react';
import authService from '../services/authService';
import AppModal from './AppModal';
import AppTable from './AppTable';
import AppButton from './AppButton';
import { Shield, Clock, Hash, CheckCircle, XCircle } from 'lucide-react';

export default function UserActivityModal({ isOpen, onClose, username }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && username) {
            fetchActivity();
        }
    }, [isOpen, username]);

    const fetchActivity = async () => {
        setLoading(true); setError('');
        try {
            const data = await authService.getUserActivity(username);
            setLogs(data || []);
        } catch (err) {
            setError('Access Log synchronization failure.');
        } finally { setLoading(false); }
    };

    return (
        <AppModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Audit Log: ${username}`}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                {error && <div className="p-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{error}</div>}

                <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl mb-4">
                    <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20"><Shield size={20}/></div>
                    <div>
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Access Verification Stream</h4>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Historical connection records and authentication attempts.</p>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-app)]/50">
                    <AppTable 
                        headers={['Chronological Timestamp', 'Network ID (IP)', 'Status Protocol']}
                        data={logs}
                        loading={loading}
                        emptyMessage="No historical connection data detected for this identity."
                        renderRow={(log) => {
                            const success = log.status.includes('Success');
                            return (
                                <>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-black italic text-xs text-[var(--text-main)]">
                                            <Clock size={12} className="text-primary"/>
                                            {new Date(log.loginTime).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} className="text-[var(--text-muted)]"/>
                                            <code className="text-[10px] font-black text-[var(--text-muted)] bg-[var(--secondary)] px-2 py-1 rounded-md">{log.ipAddress || '0.0.0.0'}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {success ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 italic">
                                                <CheckCircle size={10}/> Authenticated
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/20 italic">
                                                <XCircle size={10}/> Rejected
                                            </span>
                                        )}
                                    </td>
                                </>
                            );
                        }}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <AppButton variant="secondary" onClick={onClose}>Close Archive</AppButton>
                </div>
            </div>
        </AppModal>
    );
}
