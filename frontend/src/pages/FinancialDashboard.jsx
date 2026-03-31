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
        { label: 'Revenue', value: stats?.revenue, icon: DollarSign, color: 'blue', borderColor: '#3b82f6' },
        { label: 'Gross Profit', value: stats?.grossProfit, icon: TrendingUp, color: 'emerald', borderColor: '#10b981' },
        { label: 'Operating Expenses', value: stats?.operatingExpenses, icon: TrendingDown, color: 'red', borderColor: '#ef4444' },
        { label: 'Net Profit', value: stats?.netProfit, icon: Activity, color: 'blue', borderColor: '#2563eb' },
    ];

    const navLinks = [
        { label: 'P&L Statement', sub: 'Revenue and cost breakdown', path: '/finance/p-and-l', icon: PieChart },
        { label: 'Balance Sheet', sub: 'Assets and liabilities', path: '/finance/balance-sheet', icon: Landmark },
        { label: 'Cash Flow', sub: 'Payments and expenses', path: '/finance/cash-flow', icon: Activity },
        { label: 'Product Profit', sub: 'Unit margin analysis', path: '/finance/product-profit', icon: DollarSign },
        { label: 'Sales Forecast', sub: 'Revenue predictions', path: '/finance/forecast', icon: TrendingUp },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-[1700px] mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <PieChart className="text-blue-600" size={24}/> Financial Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">Profit & loss overview, revenue trends, and financial insights.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, idx) => (
                    <AppCard key={idx} className={`border-t-4 shadow-sm`} style={{ borderTopColor: kpi.borderColor }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
                                    Rs. {(kpi.value || 0).toLocaleString()}
                                </h3>
                            </div>
                            <div className={`p-2 rounded bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                <kpi.icon size={18}/>
                            </div>
                        </div>
                    </AppCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <AppCard className="xl:col-span-2 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Revenue Trend</h3>
                            <p className="text-xs text-slate-400 mt-1">Historical sales with forecast projection</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Historical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Forecast</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...(forecast?.historical || []), ...(forecast?.forecast || [])]}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}/>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" />
                                <Area type="monotone" dataKey="predictedAmount" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" fillOpacity={1} fill="url(#colorPred)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AppCard>

                {/* Financial Insights */}
                <AppCard className="border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded"><Lightbulb size={18}/></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Insights</h3>
                    </div>
                    <div className="space-y-3 flex-1">
                        {insights.length > 0 ? insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                                <div className={`p-1.5 rounded shrink-0 ${insight.includes('increased') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {insight.includes('increased') ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{insight}</p>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No insights available</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Profit Margin</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-slate-900 tabular-nums">{stats?.marginPercent?.toFixed(1)}%</h4>
                            <AppBadge variant="success" size="xs" className="rounded font-bold px-2">Stable</AppBadge>
                        </div>
                    </div>
                </AppCard>
            </div>
            
            {/* Navigation Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {navLinks.map((link, i) => (
                    <Link 
                        key={i} 
                        to={link.path}
                        className="bg-white border border-slate-200 p-5 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group shadow-sm"
                    >
                        <div className="w-9 h-9 rounded-md mb-3 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
                            <link.icon size={18}/>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{link.label}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{link.sub}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FinancialDashboard;
