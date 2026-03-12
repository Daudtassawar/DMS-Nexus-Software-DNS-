import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import AppCard from './AppCard';

export default function SalesExpenseChart({ sales, expenses }) {
    const data = [
        { name: 'Total Revenue', value: sales, color: '#2563eb' },
        { name: 'Total Expense', value: expenses, color: '#f43f5e' }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl animate-fade-in">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{payload[0].name}</p>
                    <p className="text-lg font-black text-white italic">Rs. {payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppCard title="Capital Flow Matrix" subtitle="Volume analysis of revenue vs operational costs." className="h-full flex flex-col group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 items-center px-4">
                <div className="h-[280px] relative transition-transform duration-500 group-hover:scale-[1.02]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={75}
                                outerRadius={100}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Efficiency</span>
                        <span className="text-2xl font-black text-primary italic">
                            {sales > 0 ? Math.round(((sales - expenses) / sales) * 100) : 0}%
                        </span>
                    </div>
                </div>

                <div className="h-[280px] group-hover:px-2 transition-all duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.03)' }} />
                            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-[var(--text-muted)]">REVENUE ENGINE</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full shadow-sm italic ${sales > expenses ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                    STATE: {sales > expenses ? 'SURPLUS GROWTH' : 'LIQUIDITY CRITICAL'}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                    <span className="text-[var(--text-muted)]">COST OVERHEAD</span>
                </div>
            </div>
        </AppCard>
    );
}
