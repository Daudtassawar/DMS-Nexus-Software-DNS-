import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import dailyOperationsService from '../services/dailyOperationsService';
import AppButton from './AppButton';
import AppInput from './AppInput';
import AppCard from './AppCard';

export default function DailyActivityForm({ onActivityAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setLoading(true);
        setError('');
        try {
            await dailyOperationsService.logActivity({ title, description });
            setTitle('');
            setDescription('');
            if (onActivityAdded) onActivityAdded();
        } catch (err) {
            setError('Operational log failed to commit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <AppCard title="Operational Log" subtitle="Record daily field observations and events." className="border-l-4 border-l-primary group">
                {error && <div className="p-3 mb-4 bg-rose-500 text-white text-[10px] rounded-xl font-black uppercase tracking-widest">{error}</div>}

                <div className="space-y-5">
                    <AppInput 
                        label="Activity Reference"
                        placeholder="e.g. Route A Clearance" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <div className="space-y-1.5 font-sans">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic pl-1">Detailed Intelligence</label>
                        <textarea 
                            required
                            placeholder="Describe the operational state..." 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-semibold resize-none transition-all shadow-inner"
                        ></textarea>
                    </div>

                    <AppButton 
                        disabled={loading}
                        className="w-full justify-center py-3.5"
                    >
                        {loading ? 'Committing...' : 'Record Node Activity'}
                    </AppButton>
                </div>
            </AppCard>
        </form>
    );
}
