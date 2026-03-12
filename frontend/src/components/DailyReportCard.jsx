import { Trophy, Hash, DollarSign, Package, ShoppingBag } from 'lucide-react';
import AppCard from './AppCard';
import AppBadge from './AppBadge';

export default function DailyReportCard({ report, loading }) {
    if (loading) return <AppCard className="h-64 animate-pulse border border-[var(--border)]"></AppCard>;

    const stats = [
        { label: 'TXN THROUGHPUT', value: report.invoicesToday, icon: <Hash size={14}/>, color: 'text-primary' },
        { label: 'GROSS YIELD', value: `Rs.${(report.salesToday || 0).toLocaleString()}`, icon: <DollarSign size={14}/>, color: 'text-indigo-500' },
        { label: 'NET DAILY YIELD', value: `Rs.${(report.netProfit || 0).toLocaleString()}`, icon: <DollarSign size={14}/>, highlight: true }
    ];

    const achievements = [
        { label: 'PEAK SKU NODE', value: report.topProduct || 'ANALYZING...', icon: <Package size={14}/> },
        { label: 'ELITE ACCOUNT', value: report.topCustomer || 'ANALYZING...', icon: <ShoppingBag size={14}/> }
    ];

    return (
        <AppCard title="Operational Performance" subtitle="Critical metrics from the current business cycle." className="h-full flex flex-col group">
            <div className="space-y-8 flex-1">
                <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.2em] italic pl-1">Financial Momentum</p>
                    <div className="grid grid-cols-1 gap-3">
                        {stats.map((s, idx) => (
                            <div key={idx} className={`
                                p-5 rounded-[var(--radius-lg)] flex justify-between items-center transition-all duration-500
                                ${s.highlight ? 'bg-primary text-white shadow-xl shadow-primary/30 ring-4 ring-primary/10' : 'bg-[var(--secondary)]/40 border border-[var(--border)] group-hover:border-primary/20'}
                            `}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${s.highlight ? 'bg-white/20' : 'bg-[var(--bg-app)] shadow-inner'} ${s.color || 'text-white'}`}>
                                      {s.icon}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-tight italic ${s.highlight ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                                      {s.label}
                                    </span>
                                </div>
                                <span className={`font-black italic text-lg tracking-tighter ${s.highlight ? 'text-white' : 'text-[var(--text-main)]'}`}>
                                  {s.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.2em] italic pl-1">Operational Highs</p>
                    <div className="bg-[var(--bg-app)]/50 rounded-2xl border border-[var(--border)] p-2">
                        {achievements.map((a, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 last:border-none group/item">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/item:rotate-12 transition-transform">
                                      {a.icon}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">{a.label}</p>
                                      <p className="text-[11px] font-black text-[var(--text-main)] italic truncate max-w-[140px] leading-none uppercase">{a.value}</p>
                                    </div>
                                </div>
                                <AppBadge variant="success" size="sm">Active</AppBadge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppCard>
    );
}
