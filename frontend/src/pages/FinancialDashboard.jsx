import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  Activity, ArrowUpRight, ArrowDownRight, Lightbulb, Landmark
} from 'lucide-react';
import AppCard from '../components/AppCard';
import AppBadge from '../components/AppBadge';
import { formatCurrency } from '../utils/currencyUtils';

const FinancialDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState([]);
    const [forecast, setForecast] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plRes, insightRes, forecastRes] = await Promise.all([
                    axios.get('/api/v1/Accounting/profit-loss'),
                    axios.get('/api/v1/Analytics/financial-insights'),
                    axios.get('/api/v1/Analytics/sales-forecast')
                ]);
                setStats(plRes.data);
                setInsights(insightRes.data);
                setForecast(forecastRes.data);
            } catch (err) {
                console.error("Error fetching financial data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );



    const kpiData = [
        { label: 'Revenue (Actual Sales)', value: stats?.revenue, icon: DollarSign, color: 'blue', borderColor: '#3b82f6', sub: 'Total invoiced amount' },
        { label: 'Gross Profit', value: stats?.grossProfit, icon: TrendingUp, color: 'emerald', borderColor: '#10b981', sub: 'Revenue - COGS' },
        { label: 'Operating Expenses', value: stats?.operatingExpenses, icon: TrendingDown, color: 'red', borderColor: '#ef4444', sub: 'Daily operations cost' },
        { label: 'Net Profit', value: stats?.netProfit, icon: Activity, color: 'indigo', borderColor: '#6366f1', sub: 'Final bottom line' },
    ];

    const navLinks = [
        { label: 'P&L Statement', sub: 'Detailed revenue & cost', path: '/finance/p-and-l', icon: PieChart },
        { label: 'Balance Sheet', sub: 'Assets & liabilities', path: '/finance/balance-sheet', icon: Landmark },
        { label: 'Cash Flow', sub: 'Collections vs payments', path: '/finance/cash-flow', icon: Activity },
        { label: 'Product Analytics', sub: 'Item-wise margins', path: '/finance/product-profit', icon: DollarSign },
        { label: 'Sales Forecast', sub: '7-day trend prediction', path: '/finance/forecast', icon: TrendingUp },
    ];

    return (
        <div className="space-y-6 pb-20 max-w-[1700px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg">
                            <PieChart size={20}/>
                        </div> 
                        Financial Control Center
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time business performance metrics and financial health monitoring.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-white shadow-sm rounded-md border border-slate-200">Last 30 Days</button>
                    <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700">Year to Date</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, idx) => (
                    <AppCard key={idx} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative group">
                        <div className={`absolute top-0 left-0 w-1 h-full bg-${kpi.color}-500`}></div>
                        <div className="flex justify-between items-start pt-2">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <h3 className={`text-2xl font-black tabular-nums transition-colors ${kpi.label === 'Net Profit' && (kpi.value < 0 ? 'text-red-600' : 'text-blue-600')}`}>
                                    {formatCurrency(kpi.value)}
                                </h3>
                                <p className="text-[9px] font-medium text-slate-400 mt-1 italic">{kpi.sub}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 border border-${kpi.color}-100 group-hover:scale-110 transition-transform`}>
                                <kpi.icon size={20}/>
                            </div>
                        </div>
                    </AppCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <AppCard className="xl:col-span-2 border border-slate-200 shadow-sm bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Revenue Momentum</h3>
                            <p className="text-xs text-slate-400 mt-1">30-day historical data vs AI-powered 7-day forecast</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Actual Revenue</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Predicted Trend</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...(forecast?.historical || []), ...(forecast?.forecast || [])]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => str ? new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}
                                    stroke="#cbd5e1" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} tickMargin={10}
                                />
                                <YAxis stroke="#cbd5e1" fontSize={10} fontWeight="600" axisLine={false} tickLine={false} tickFormatter={(v) => `₨ ${(v/1000).toFixed(0)}K`}/>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}
                                    formatter={(value) => [formatCurrency(value, false), '']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="predictedAmount" stroke="#10b981" strokeWidth={3} strokeDasharray="8 4" fillOpacity={1} fill="url(#colorPred)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Financial Insights */}
                <div className="space-y-6">
                    <AppCard className="border border-slate-200 shadow-sm flex flex-col bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"><Lightbulb size={20}/></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Business Insights</h3>
                        </div>
                        <div className="space-y-4 flex-1">
                            {(insights || []).length > 0 ? (insights || []).map((insight, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className={`p-2 rounded-lg shrink-0 h-fit ${(insight || '').includes('increased') ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-amber-100 text-amber-600 shadow-sm'}`}>
                                        {(insight || '').includes('increased') ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wide">{insight}</p>
                                </div>
                            )) : (
                                <div className="text-center py-12">
                                    <Activity className="mx-auto text-slate-200 mb-2" size={32}/>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Awaiting more data...</p>
                                </div>
                            )}
                        </div>
                    </AppCard>

                    <AppCard className="bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-xl text-white overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={120}/>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Consolidated Margin</p>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h4 className="text-4xl font-black tabular-nums tracking-tighter">{(stats?.marginPercent || 0).toFixed(1)}%</h4>
                                <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-widest">Net Profit Margin</p>
                            </div>
                            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                Health Score: {(stats?.marginPercent || 0) > 15 ? 'Excellent' : 'Stable'}
                            </div>
                        </div>
                    </AppCard>
                </div>

            </div>
            
            {/* Quick Actions / Reports Nav */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {navLinks.map((link, i) => (
                    <Link 
                        key={i} 
                        to={link.path}
                        className="bg-white border border-slate-200 p-5 rounded-xl hover:border-blue-500 hover:ring-4 hover:ring-blue-50 transition-all group shadow-sm flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all">
                            <link.icon size={22}/>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{link.label}</h4>
                        <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">{link.sub}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FinancialDashboard;
