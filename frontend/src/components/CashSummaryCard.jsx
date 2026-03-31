import { Wallet, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import AppCard from './AppCard';

export default function CashSummaryCard({ data, loading }) {
    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[var(--bg-card)] rounded-[var(--radius-lg)] animate-pulse border border-[var(--border)]"></div>)}
        </div>
    );

    const items = [
        { label: 'Today Revenue', value: data.totalSalesToday, icon: <TrendingUp size={18}/>, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/5', border: 'border-l-[var(--primary)]' },
        { label: 'Payments Received', value: data.totalPaymentsReceived, icon: <Landmark size={18}/>, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
        { label: 'Today Expenses', value: data.totalExpensesToday, icon: <TrendingDown size={18}/>, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-l-rose-500' },
        { label: 'Cash in Hand', value: data.cashInHand, icon: <Wallet size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-500' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <AppCard key={idx} className={`border-l-4 ${item.border}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-md ${item.bg} ${item.color}`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{item.label}</p>
                            <h4 className="text-xl font-bold text-[var(--text-main)] tabular-nums">
                                Rs. {(item.value || 0).toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </AppCard>
            ))}
        </div>
    );
}
