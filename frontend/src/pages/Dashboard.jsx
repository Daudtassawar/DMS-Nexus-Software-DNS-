import { useState, useEffect } from 'react';
import { 
    Package, FileText, Wallet2, 
    TrendingUp, Activity, Box, DollarSign,
    Zap, Database, RotateCcw, CheckCircle2, TrendingDown,
    LayoutGrid, History, BellRing
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

const MetricCard = ({ title, val, icon: Icon, trend, color = 'var(--primary)', highlight = false }) => (
  <AppCard className={`overflow-hidden relative group interactive border-t-4 transition-all duration-500 hover:shadow-2xl ${highlight ? 'bg-primary/5' : ''}`} style={{ borderTopColor: color }}>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter italic text-[var(--text-main)] tabular-nums">{val}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            <div className={`p-1 rounded-md ${trend > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'} flex items-center justify-center`}>
                {trend > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            </div>
            {Math.abs(trend)}% Velocity
          </div>
        )}
      </div>
      <div className="p-3.5 rounded-[1.25rem] shadow-sm group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={24}/>
      </div>
    </div>
    {/* Decorative element */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700" style={{ backgroundColor: color }}></div>
  </AppCard>
);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportService.getDashboard()
            .then(res => { setData(res); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const ChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl animate-fade-in">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">
                        {payload[0].payload.month || payload[0].payload.name}
                    </p>
                    <p className="text-lg font-black text-white italic">
                        Value: Rs. {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fade-in">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/10 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40 animate-pulse" size={24}/>
            </div>
            <div className="text-center">
                <p className="text-primary font-black uppercase tracking-[0.5em] text-xs animate-pulse italic">Synchronizing Operational Core</p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Connecting to Enterprise Data Nexus...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="max-w-xl mx-auto mt-24">
            <AppCard className="border-rose-500/50 bg-rose-500/5 text-center p-16 rounded-[3rem]">
                <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Database size={48}/>
                </div>
                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-widest italic">Signal Loss Detected</h2>
                <p className="text-[11px] font-bold text-[var(--text-muted)] mt-4 leading-relaxed uppercase tracking-wider">The connection to the central data nexus has been severed. Re-initialize the terminal link.</p>
                <AppButton className="mt-10 px-10 py-4 !rounded-2xl !bg-rose-600 uppercase tracking-[0.3em] text-[10px] font-black" onClick={() => window.location.reload()}>Re-Initialize Link</AppButton>
            </AppCard>
        </div>
    );

    const { totals, charts, activity } = data;

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Command Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Zap size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Live Telemetry Terminal</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)] flex items-center gap-4">
                        Operations <span className="text-primary not-italic">Omni</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                        <AppBadge variant="success" size="sm" dot className="px-4 py-1.5 border-none shadow-sm backdrop-blur-md">System Integrity: Optimal</AppBadge>
                        <AppBadge variant="secondary" size="sm" className="px-4 py-1.5 border-none shadow-sm backdrop-blur-md">Node ID: 8849-DX</AppBadge>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex items-center -space-x-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`w-12 h-12 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-app)] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] shadow-lg hover:z-20 hover:-translate-y-1 transition-all cursor-pointer`}>U{i}</div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-[var(--bg-card)] bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary/20 hover:z-20 hover:-translate-y-1 transition-all cursor-pointer">+14</div>
                  </div>
                  <AppButton variant="secondary" onClick={() => window.location.reload()} className="!rounded-[1.5rem] !px-8 !py-4 group">
                    <RotateCcw size={18} className="text-primary group-hover:rotate-180 transition-transform duration-700 mr-2"/> 
                    <span className="uppercase tracking-[0.2em] font-black text-[10px]">Sync Matrix</span>
                  </AppButton>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Strategic Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                <RequirePermission permission="Reports.View">
                    <MetricCard title="Operational Yield" val={`Rs.${totals.todaySales.toLocaleString()}`} icon={Wallet2} trend={12} color="var(--primary)" highlight />
                </RequirePermission>
                <RequirePermission permission="Invoices.View">
                    <MetricCard title="TXN Propagation" val={totals.todayInvoices} icon={FileText} color="#7c3aed" trend={3.8} />
                </RequirePermission>
                <RequirePermission permission="Stock.View">
                    <MetricCard title="Critical Depletion" val={totals.lowStock} icon={Box} color="#ea580c" trend={-2} />
                </RequirePermission>
                <RequirePermission permission="Customers.View">
                    <MetricCard title="Exposure Balance" val={`Rs.${totals.outstandingBalance.toLocaleString()}`} icon={DollarSign} color="#e11d48" />
                </RequirePermission>
                <RequirePermission permission="Products.View">
                    <MetricCard title="Inventory Depth" val={totals.totalProducts} icon={Package} color="#059669" />
                </RequirePermission>
            </div>

            {/* Tactical Intelligence Row */}
            <RequirePermission permission="Reports.View">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <AppCard title="Velocity Projection" subtitle="Real-time multi-threaded revenue stream analysis." className="xl:col-span-2 !p-0 overflow-hidden flex flex-col group">
                        <div className="p-10 flex-1">
                            <div className="h-[360px] w-full group-hover:scale-[1.01] transition-transform duration-700">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.monthlyTrend}>
                                        <defs>
                                            <linearGradient id="dashboardSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--border)" opacity={0.6} />
                                        <XAxis dataKey="month" hide />
                                        <YAxis hide />
                                        <RechartsTooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={6} fillOpacity={1} fill="url(#dashboardSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] bg-[var(--secondary)]/10 flex justify-between items-center px-10">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#2563eb]"></div>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Revenue Node</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Projection Alpha</span>
                                </div>
                            </div>
                            <AppBadge variant="info" size="sm" className="italic font-black border-none uppercase tracking-[0.2em] px-4 py-1">Mode: Algorithmic</AppBadge>
                        </div>
                    </AppCard>

                    <AppCard title="Sector Dominance" subtitle="High-velocity product categories via volume." className="!p-0 overflow-hidden flex flex-col group">
                        <div className="p-10 flex-1">
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.topProducts} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" hide />
                                        <RechartsTooltip content={<ChartTooltip/>} cursor={{ fill: 'rgba(37,99,235,0.03)' }} />
                                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={28}>
                                            {charts.topProducts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] bg-[var(--secondary)]/10 px-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic flex items-center gap-2">
                                    <History size={14}/> Recent Peak
                                </span>
                                <span className="text-sm font-black text-primary italic">SKU-774900</span>
                            </div>
                        </div>
                    </AppCard>
                </div>
            </RequirePermission>

            {/* Live Data Streams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <RequirePermission permission="Invoices.View">
                    <AppCard title="Latest Transmissions" subtitle="Real-time ledger entries from field operations." p0 className="border-l-8 border-l-primary group">
                        <div className="p-8 space-y-6">
                            {activity.recentInvoices.map((inv) => (
                                <div key={inv.invoiceId} className="flex justify-between items-center p-6 rounded-[2rem] bg-[var(--bg-app)]/50 border border-[var(--border)] group-hover:border-primary/20 transition-all interactive group/item relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover/item:opacity-30 transition-opacity"></div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center font-black text-[11px] text-[var(--text-muted)] group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm border border-[var(--border)] group-hover/item:scale-105 group-hover/item:rotate-6">
                                          ID{inv.invoiceId}
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-[var(--text-main)] uppercase tracking-tighter italic leading-none mb-1.5">{inv.customerName}</p>
                                            <div className="flex items-center gap-2">
                                              <AppBadge variant="secondary" size="sm" className="leading-none border-none py-1">SECURED BY: {inv.salesmanName || 'SYSTEM_CORE'}</AppBadge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-black text-xl italic text-[var(--text-main)] leading-none tabular-nums">Rs.{(inv.netAmount || 0).toLocaleString()}</h4>
                                        <div className="mt-2.5">
                                          <AppBadge variant={inv.paymentStatus === 'Paid' ? 'success' : 'warning'} size="sm" dot>
                                            {inv.paymentStatus.toUpperCase()}
                                          </AppBadge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-primary/5 text-center transition-colors hover:bg-primary/10 cursor-pointer border-t border-[var(--border)]">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Access Full Ledger</span>
                        </div>
                    </AppCard>
                </RequirePermission>

                <RequirePermission permission="Stock.View">
                    <AppCard title="Delta Detection" subtitle="Recent anomalies and high-volume movements." p0 className="border-l-8 border-l-rose-500 group">
                        <div className="p-8 space-y-6">
                            {activity.recentStock.slice(0, 5).map((stk) => (
                                <div key={stk.transactionId} className="flex justify-between items-center p-6 rounded-[2rem] bg-[var(--bg-app)]/50 border border-[var(--border)] group-hover:border-rose-500/20 transition-all interactive group/item relative overflow-hidden">
                                     <div className={`absolute top-0 left-0 w-2 h-full ${stk.transactionType.includes('In') ? 'bg-emerald-500' : 'bg-rose-500'} opacity-0 group-hover/item:opacity-30 transition-opacity`}></div>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl ${stk.transactionType.includes('In') ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'} flex items-center justify-center font-black transition-all shadow-sm border border-[var(--border)] group-hover/item:scale-105 group-hover/item:rotate-12`}>
                                          {stk.transactionType.includes('In') ? <TrendingUp size={28}/> : <TrendingDown size={28}/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-[var(--text-main)] uppercase tracking-tighter italic leading-none mb-1.5">{stk.productName}</p>
                                            <AppBadge variant={stk.transactionType.includes('In') ? 'success' : 'danger'} size="sm" className="leading-none border-none py-1">TYPE: {stk.transactionType.toUpperCase()}</AppBadge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h4 className={`text-3xl font-black italic tracking-tighter leading-none tabular-nums ${stk.transactionType.includes('In') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {stk.transactionType.includes('In') ? '+' : '-'}{stk.quantity}
                                        </h4>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2 italic">Delta Magnitude</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-rose-500/5 text-center transition-colors hover:bg-rose-500/10 cursor-pointer border-t border-[var(--border)]">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] italic">Analyze Delta Feed</span>
                        </div>
                    </AppCard>
                </RequirePermission>
            </div>
        </div>
    );
}
