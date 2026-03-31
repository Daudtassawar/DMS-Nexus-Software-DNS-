import { useState } from 'react';
import dailyOperationsService from '../services/dailyOperationsService';
import AppButton from './AppButton';
import AppInput from './AppInput';
import AppCard from './AppCard';

const CATEGORIES = ['Fuel', 'Vehicle Maintenance', 'Office Expense', 'Salary', 'Miscellaneous'];

export default function DailyExpenseForm({ onExpenseAdded }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Miscellaneous');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!title.trim() || isNaN(amt) || amt <= 0) return;

        setLoading(true);
        setError('');
        try {
            await dailyOperationsService.recordExpense({ 
                title, 
                category, 
                amount: amt, 
                notes 
            });
            setTitle('');
            setAmount('');
            setNotes('');
            if (onExpenseAdded) onExpenseAdded();
        } catch (err) {
            setError('Record failed to save.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <AppCard title="Expense Entry" subtitle="Record daily operational costs." className="border-l-4 border-l-rose-500">
                {error && <div className="p-3 mb-4 bg-red-600 text-white text-xs rounded-md font-bold uppercase tracking-wider">{error}</div>}

                <div className="space-y-4">
                    <AppInput 
                        label="Expense Title"
                        placeholder="e.g. Fuel - Vehicle 04" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 font-sans">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Category</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:border-rose-500 outline-none text-sm font-semibold appearance-none cursor-pointer transition-all"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <AppInput 
                            label="Amount (Rs.)"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5 font-sans">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Additional Notes</label>
                        <textarea 
                            placeholder="Optional details..." 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            rows="2"
                            className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:border-rose-500 outline-none text-sm font-semibold resize-none transition-all shadow-inner"
                        ></textarea>
                    </div>

                    <AppButton 
                        disabled={loading}
                        className="w-full justify-center !bg-rose-600 hover:!bg-rose-700 py-3 rounded-md"
                    >
                        {loading ? 'Saving...' : 'Record Expense'}
                    </AppButton>
                </div>
            </AppCard>
        </form>
    );
}
