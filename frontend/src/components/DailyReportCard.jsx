import { Hash, DollarSign, Package, ShoppingBag } from 'lucide-react';
import AppCard from './AppCard';
import AppBadge from './AppBadge';

export default function DailyReportCard({ report, loading }) {
    if (loading) return <AppCard className="h-64 animate-pulse border border-[var(--border)]"></AppCard>;

    const stats = [
        { label: 'Total Invoices', value: report.invoicesToday, icon: <Hash size={14}/>, color: 'text-[var(--primary)]' },
        { label: 'Gross Revenue', value: `Rs.${(report.salesToday || 0).toLocaleString()}`, icon: <DollarSign size={14}/>, color: 'text-indigo-600' },
        { label: 'Daily Net Profit', value: `Rs.${(report.netProfit || 0).toLocaleString()}`, icon: <DollarSign size={14}/>, highlight: true }
    ];

    const achievements = [
        { label: 'Top Product', value: report.topProduct || 'N/A', icon: <Package size={14}/> },
        { label: 'Top Customer', value: report.topCustomer || 'N/A', icon: <ShoppingBag size={14}/> }
    ];

    return (
        <AppCard title="Performance Data" subtitle="Core metrics for the current day." className="h-full flex flex-col">
            <div className="space-y-6 flex-1">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Financial Summary</p>
                    <div className="grid grid-cols-1 gap-2">
                        {stats.map((s, idx) => (
                            <div key={idx} className={`
                                p-4 rounded-md flex justify-between items-center border
                                ${s.highlight ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--secondary)] border-[var(--border)]'}
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded ${s.highlight ? 'bg-white/20' : 'bg-[var(--bg-card)] border border-[var(--border)]'} ${s.color || 'text-white'}`}>
                                      {s.icon}
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-tight ${s.highlight ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                                      {s.label}
                                    </span>
                                </div>
                                <span className={`font-bold text-base tabular-nums ${s.highlight ? 'text-white' : 'text-[var(--text-main)]'}`}>
                                  {s.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Operational Highs</p>
                    <div className="bg-[var(--secondary)] rounded-lg border border-[var(--border)] overflow-hidden">
                        {achievements.map((a, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border-b last:border-none border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                      {a.icon}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">{a.label}</p>
                                      <p className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-[160px] leading-none uppercase">{a.value}</p>
                                    </div>
                                </div>
                                <AppBadge variant="success" size="xs">Active</AppBadge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppCard>
    );
}
