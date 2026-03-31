import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import AppCard from './AppCard';

export default function SalesExpenseChart({ sales, expenses }) {
    const data = [
        { name: 'Revenue', value: sales, color: '#2563eb' },
        { name: 'Expense', value: expenses, color: '#f43f5e' }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded shadow-lg">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{payload[0].name}</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">Rs. {payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppCard title="Revenue vs Expenses" subtitle="Operational cost analysis." className="h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-center px-4">
                <div className="h-[260px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={4}
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
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Surplus</span>
                        <span className="text-xl font-bold text-[var(--primary)] tabular-nums">
                            {sales > 0 ? Math.round(((sales - expenses) / sales) * 100) : 0}%
                        </span>
                    </div>
                </div>

                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                    <span className="text-[var(--text-muted)]">Revenue</span>
                </div>
                <div className={`px-4 py-1.5 rounded border ${sales > expenses ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    Status: {sales > expenses ? 'Profit' : 'Deficit'}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[var(--text-muted)]">Expenses</span>
                </div>
            </div>
        </AppCard>
    );
}
