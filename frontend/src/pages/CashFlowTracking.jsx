import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
    ArrowDownLeft, ArrowUpRight, DollarSign, Wallet, 
    ArrowRightCircle, Filter, TrendingUp, TrendingDown
} from 'lucide-react';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import { formatCurrency, CURRENCY_SYMBOL } from '../utils/currencyUtils';

const CashFlowTracking = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({ 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/Accounting/cash-flow?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setData(res.data);
        } catch (err) {
            console.error("Error fetching cash flow:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    const chartData = [
        { name: 'Cash Inflow', amount: data?.cashInflow || 0, color: '#10b981' },
        { name: 'Cash Outflow', amount: data?.cashOutflow || 0, color: '#ef4444' }
    ];

    const isPositive = (data?.netCashFlow || 0) >= 0;

    return (
        <div className="space-y-6  pb-20 max-w-[1700px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Wallet className="text-blue-600" size={24}/> Cash Flow Tracking
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor cash inflows, outflows, and net position for the selected period.</p>
                </div>
            </div>

            {/* Date Range */}
            <AppCard className="border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">From Date</label>
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">To Date</label>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <AppButton onClick={fetchData} className="rounded-md">
                        <Filter size={16} className="mr-2"/> Apply Filter
                    </AppButton>
                </div>
            </AppCard>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cash Inflow</p>
                            <h4 className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(data?.cashInflow || 0, false)}</h4>
                            <p className="text-xs text-slate-500 mt-1">Collections received</p>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded"><ArrowDownLeft size={20}/></div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-red-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cash Outflow</p>
                            <h4 className="text-2xl font-bold text-red-600 tabular-nums">{formatCurrency(data?.cashOutflow || 0, false)}</h4>
                            <p className="text-xs text-slate-500 mt-1">Operating &amp; vendor costs</p>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded"><ArrowUpRight size={20}/></div>
                    </div>
                </AppCard>
                <AppCard className={`border-t-4 shadow-sm ${isPositive ? 'border-t-blue-500' : 'border-t-amber-500'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Cash Flow</p>
                            <h4 className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-blue-600' : 'text-amber-600'}`}>
                                {formatCurrency(data?.netCashFlow || 0, false)}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">{isPositive ? 'Positive cash position' : 'Negative cash position'}</p>
                        </div>
                        <div className={`p-2 rounded ${isPositive ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {isPositive ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                        </div>
                    </div>
                </AppCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <AppCard className="lg:col-span-2 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cash Flow Comparison</h3>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-400"><DollarSign size={16}/></div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}/>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value) => [formatCurrency(value), '']}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={80}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Insight */}
                <AppCard className="border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded"><ArrowRightCircle size={18}/></div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Insight</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {isPositive
                                ? "Cash position is positive. Consider reinvesting surplus into fast-moving inventory or settling pending liabilities to optimize credit terms."
                                : "Outflows exceed collections. Review operating expenses and accelerate customer payment cycles to preserve working capital."}
                        </p>
                    </div>
                    <div className={`mt-6 p-4 rounded-lg border ${isPositive ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isPositive ? '✓ Positive Cash Flow' : '⚠ Negative Cash Flow'}
                        </p>
                    </div>
                </AppCard>
            </div>
        </div>
    );
};

export default CashFlowTracking;
