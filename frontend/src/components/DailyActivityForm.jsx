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
            setError('Operation failed to save.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <AppCard title="Activity Log" subtitle="Record daily field observations." className="border-l-4 border-l-[var(--primary)]">
                {error && <div className="p-3 mb-4 bg-red-600 text-white text-xs rounded-md font-bold uppercase tracking-wider">{error}</div>}

                <div className="space-y-4">
                    <AppInput 
                        label="Log Title"
                        placeholder="e.g. Route A Clearance" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <div className="space-y-1.5 font-sans">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</label>
                        <textarea 
                            required
                            placeholder="Details of the activity..." 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:border-[var(--primary)] outline-none text-sm font-semibold resize-none transition-all shadow-inner"
                        ></textarea>
                    </div>

                    <AppButton 
                        disabled={loading}
                        className="w-full justify-center py-3 rounded-md"
                    >
                        {loading ? 'Saving...' : 'Save Activity'}
                    </AppButton>
                </div>
            </AppCard>
        </form>
    );
}
