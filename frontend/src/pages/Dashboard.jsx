import { useState, useEffect } from 'react';
import { 
    Package, FileText, Wallet2, 
    TrendingUp, Activity, Box, DollarSign,
    RefreshCcw, TrendingDown,
    Database, CheckCircle, History, BarChart3, Users
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import reportService from '../services/reportService';
import RequirePermission from '../components/RequirePermission';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';
import { formatCurrency } from '../utils/currencyUtils';

const MetricCard = ({ title, val, icon: Icon, trend, color = 'var(--primary)' }) => (
  <AppCard className="border-l-4 shadow-sm group" style={{ borderLeftColor: color }}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[var(--text-main)] tabular-nums">{val}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
      <div className="p-3 rounded-lg bg-[var(--secondary)] text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors duration-200">
        <Icon size={20}/>
      </div>
    </div>
  </AppCard>
);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salesmanData, setSalesmanData] = useState([]);
    const [salesmanRange, setSalesmanRange] = useState('daily');
    const [salesmanLoading, setSalesmanLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        reportService.getDashboard()
            .then(res => { setData(res); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    useEffect(() => {
        setSalesmanLoading(true);
        reportService.getSalesmanAnalysis(salesmanRange)
            .then(res => { setSalesmanData(res); setSalesmanLoading(false); })
            .catch(err => { console.error(err); setSalesmanLoading(false); });
    }, [salesmanRange]);

    const ChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded-md shadow-sm">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                        {payload[0].payload.month || payload[0].payload.name}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">
                        {formatCurrency(payload[0].value, false)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Loading business analytics...</p>
        </div>
    );

    if (!data) return (
        <div className="max-w-xl mx-auto mt-20">
            <AppCard className="text-center p-12 border-red-200 bg-red-50 text-red-900 shadow-sm">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-md flex items-center justify-center mx-auto mb-6">
                    <Database size={32}/>
                </div>
                <h2 className="text-xl font-bold">Connection Failed</h2>
                <p className="text-sm mt-2 opacity-80">Unable to retrieve real-time data from the server. Please check your network.</p>
                <AppButton className="mt-8 rounded-md" onClick={() => window.location.reload()}>Retry Connection</AppButton>
            </AppCard>
        </div>
    );

    // Provide default objects to prevent destructuring of null/undefined
    const { totals = {}, charts = {}, activity = {} } = data || {};

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Operational Dashboard</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Real-time performance metrics and business activity overview.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <AppButton variant="secondary" onClick={() => window.location.reload()} className="rounded-md">
                    <RefreshCcw size={16} className="mr-2"/> Refresh
                  </AppButton>
                  <AppButton className="rounded-md">
                    <BarChart3 size={16} className="mr-2"/> Analytics
                  </AppButton>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <RequirePermission permission="Reports.View">
                    <MetricCard title="Today's Sales" val={formatCurrency(totals?.todaySales, false)} icon={TrendingUp} color="#3b82f6" trend={0} />
                </RequirePermission>
                <RequirePermission permission="Reports.View">
                    <MetricCard title="Today's Collection" val={formatCurrency(totals?.todayPaid, false)} icon={Wallet2} color="#10b981" />
                </RequirePermission>
                <RequirePermission permission="Reports.View">
                    <MetricCard title="Pending Amount" val={formatCurrency(totals?.todayPending, false)} icon={Activity} color="#f59e0b" />
                </RequirePermission>
                <RequirePermission permission="Invoices.View">
                    <MetricCard title="Daily Invoices" val={totals?.todayInvoices || 0} icon={FileText} color="#8b5cf6" />
                </RequirePermission>
                <RequirePermission permission="Stock.View">
                    <MetricCard title="Stock Alerts" val={(totals?.lowStockCount || 0) + (totals?.outOfStockCount || 0)} icon={Box} color="#ef4444" />
                </RequirePermission>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Salesman Performance Section */}
                <AppCard p0 className="shadow-sm border border-[var(--border)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-main)]">Salesman Performance</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Ranking by net revenue contribution.</p>
                        </div>
                        <div className="flex bg-[var(--secondary)] p-1 rounded-lg border border-[var(--border)]">
                            {['daily', 'weekly', 'monthly'].map((r) => (
                                <button 
                                    key={r}
                                    onClick={() => setSalesmanRange(r)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${salesmanRange === r ? 'bg-white text-[var(--primary)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[400px]">
                        {salesmanLoading ? (
                            <div className="p-12 text-center space-y-3">
                                <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin mx-auto"></div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Updating data...</p>
                            </div>
                        ) : salesmanData.length > 0 ? (
                            <div className="p-6 space-y-6">
                                {salesmanData.map((s, idx) => {
                                    const maxSales = Math.max(...salesmanData.map(x => x.totalSales), 1);
                                    const percentage = (s.totalSales / maxSales) * 100;
                                    return (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-main)]">{s.salesmanName}</p>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{s.orderCount} Orders completed</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-[var(--text-main)] tabular-nums">{formatCurrency(s.totalSales, false)}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Post-Discount</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-[var(--secondary)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
                                                <div 
                                                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Users className="mx-auto text-[var(--border)] mb-4" size={40}/>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No transaction data recorded for this period</p>
                            </div>
                        )}
                    </div>
                </AppCard>

                <AppCard p0 className="xl:col-span-2 shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-main)]">Revenue Momentum</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Historical analysis of net sales volume.</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts?.monthlyTrend || []}>
                                    <defs>
                                        <linearGradient id="dashboardSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `Rs.${val/1000}k`} />
                                    <RechartsTooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#dashboardSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </AppCard>
            </div>


            {/* Activities Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RequirePermission permission="Invoices.View">
                    <AppCard p0 className="shadow-sm border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-main)]">Recent Business Flow</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">Latest field transactions and order status.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                            {(activity?.recentInvoices || []).map((inv) => (
                                <div key={inv.invoiceId} className="flex justify-between items-center p-4 hover:bg-[var(--secondary)] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-[var(--secondary)] flex items-center justify-center font-bold text-xs text-[var(--text-main)] border border-[var(--border)]">
                                          #{(inv.invoiceId || 0).toString().padStart(4, '0')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text-main)] mb-0.5">{inv.customerName}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">By {inv.salesmanName || 'System'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-[var(--text-main)] tabular-nums">{formatCurrency(inv.netAmount, false)}</p>
                                        <div className="mt-1">
                                          <AppBadge variant={inv.paymentStatus === 'Paid' ? 'success' : 'warning'} size="sm" className="rounded px-2">
                                            {inv.paymentStatus}
                                          </AppBadge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-[var(--secondary)] text-center hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors cursor-pointer border-t border-[var(--border)]">
                            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">View All Invoices</span>
                        </div>
                    </AppCard>
                </RequirePermission>

                <RequirePermission permission="Stock.View">
                    <AppCard p0 className="shadow-sm border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-main)]">Inventory Alerts</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">Recent stock movements and depletion warnings.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                            {(activity?.recentStock || []).slice(0, 7).map((stk) => (
                                <div key={stk.transactionId} className="flex justify-between items-center p-4 hover:bg-[var(--secondary)] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-md ${(stk.transactionType || '').includes('In') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                          {(stk.transactionType || '').includes('In') ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[var(--text-main)] mb-0.5">{stk.productName}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{stk.transactionType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-base tabular-nums ${(stk.transactionType || '').includes('In') ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {(stk.transactionType || '').includes('In') ? '+' : '-'}{stk.quantity}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-0.5">Stock Change</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-[var(--secondary)] text-center hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors cursor-pointer border-t border-[var(--border)]">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Inventory Management</span>
                        </div>
                    </AppCard>
                </RequirePermission>
            </div>
        </div>
    );
}
