import { useState } from 'react';
import { DollarSign } from 'lucide-react';
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
            setError('Financial commitment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <AppCard title="Financial Outflow" subtitle="Register operational costs and expenses." className="border-l-4 border-l-rose-500 group">
                {error && <div className="p-3 mb-4 bg-rose-600 text-white text-[10px] rounded-xl font-black uppercase tracking-widest">{error}</div>}

                <div className="space-y-5">
                    <AppInput 
                        label="Expense Descriptor"
                        placeholder="e.g. Diesel Refill - Truck 04" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 font-sans">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic pl-1">Category Hub</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-sm font-semibold appearance-none cursor-pointer transition-all"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <AppInput 
                            label="Transaction Value"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5 font-sans">
                        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic pl-1">Accounting Notes</label>
                        <textarea 
                            placeholder="Additional context for auditor..." 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            rows="2"
                            className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-sm font-semibold resize-none transition-all shadow-inner"
                        ></textarea>
                    </div>

                    <AppButton 
                        disabled={loading}
                        className="w-full justify-center !bg-rose-600 hover:!bg-rose-700 py-3.5"
                    >
                        {loading ? 'COMMITTING...' : 'RECORD OUTFLOW'}
                    </AppButton>
                </div>
            </AppCard>
        </form>
    );
}
