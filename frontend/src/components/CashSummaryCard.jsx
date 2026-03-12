import { Wallet, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import AppCard from './AppCard';

export default function CashSummaryCard({ data, loading }) {
    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[var(--bg-card)] rounded-[var(--radius-lg)] animate-pulse border border-[var(--border)]"></div>)}
        </div>
    );

    const items = [
        { label: 'Gross Revenue Today', value: data.totalSalesToday, icon: <TrendingUp size={20}/>, color: 'text-primary', bg: 'bg-primary/10', border: 'border-l-primary' },
        { label: 'Payments Collected', value: data.totalPaymentsReceived, icon: <Landmark size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-l-indigo-500' },
        { label: 'Operational Expenses', value: data.totalExpensesToday, icon: <TrendingDown size={20}/>, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-l-rose-500' },
        { label: 'Net Cash Position', value: data.cashInHand, icon: <Wallet size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <AppCard key={idx} className={`border-l-4 ${item.border} group`}>
                    <div className="flex items-center gap-5">
                        <div className={`p-3.5 ${item.bg} ${item.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">{item.label}</p>
                            <h4 className="text-2xl font-black text-[var(--text-main)] tracking-tighter tabular-nums italic">
                                Rs. {(item.value || 0).toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </AppCard>
            ))}
        </div>
    );
}
