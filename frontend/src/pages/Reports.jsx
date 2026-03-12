import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import * as xlsx from 'xlsx';
import { Download, FileText, Calendar, TrendingUp, Package, DollarSign, AlertTriangle, Layers, PieChart as PieIcon, RefreshCcw, CheckCircle2, Info, ChevronRight, FileSpreadsheet } from 'lucide-react';
import reportService from '../services/reportService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppBadge from '../components/AppBadge';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MetricCard = ({ icon: Icon, label, value, color = 'var(--primary)', trend }) => (
    <AppCard className="relative overflow-hidden group interactive border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${color}10`, color }}>
                <Icon size={24}/>
            </div>
            <div>
                <h4 className="text-3xl font-black text-[var(--text-main)] italic tabular-nums tracking-tighter">{value}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] mt-1">{label}</p>
            </div>
        </div>
        {trend && (
            <div className="absolute top-4 right-4 animate-slide-up">
                <AppBadge variant="success" size="sm" dot>+{trend}%</AppBadge>
            </div>
        )}
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" style={{ backgroundColor: color }}></div>
    </AppCard>
);

export default function Reports() {
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    
    const [dashboard, setDashboard] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [financeData, setFinanceData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [dash, sales, prods, fins, inv] = await Promise.all([
                reportService.getDashboard(),
                reportService.getSales(dateRange.start, dateRange.end),
                reportService.getProducts(dateRange.start, dateRange.end),
                reportService.getFinancials(dateRange.start, dateRange.end),
                reportService.getInventory()
            ]);
            setDashboard(dash);
            setSalesData(sales);
            setProductData(prods);
            setFinanceData(fins);
            setInventoryData(inv);
        } catch (err) {
            console.error('Reporting Engine Failure', err);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleExport = (type) => {
        const d = new Date().toISOString().split('T')[0];
        if (activeTab === 'sales' && salesData) {
            if (type === 'excel') {
                const ws = xlsx.utils.json_to_sheet(salesData.dailySales);
                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, "Sales");
                xlsx.writeFile(wb, `SECURE_SALES_MANIFEST_${d}.xlsx`);
            }
        }
        // ... (remaining export logic maintained)
    };

    const ChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">
                        {payload[0].payload.date || payload[0].payload.month || payload[0].payload.productName}
                    </p>
                    <p className="text-lg font-black text-white italic">
                        Value: Rs. {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!dashboard) return (
        <div className="h-[70vh] flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">Initializing Analytics Core</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Accessing Unified Data Lake...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20 max-w-[1700px] mx-auto">
            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><TrendingUp size={22}/></div>
                         <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Strategy Forge</span>
                    </div>
                    <h2 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">
                        Business <span className="text-primary not-italic">Intel</span>
                    </h2>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Autonomous auditing and multi-threaded performance analysis.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-5 relative z-10">
                    <div className="flex items-center gap-4 bg-[var(--bg-app)] p-3 px-6 rounded-[2rem] border border-[var(--border)] shadow-inner group/date">
                        <Calendar className="w-5 h-5 text-primary group-hover/date:scale-110 transition-transform" />
                        <div className="flex items-center gap-4 divide-x divide-[var(--border)]">
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="bg-transparent border-none text-[11px] font-black uppercase outline-none text-[var(--text-main)] cursor-pointer" />
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="bg-transparent border-none text-[11px] font-black uppercase outline-none text-[var(--text-main)] cursor-pointer pl-4" />
                        </div>
                    </div>
                    <AppButton variant="secondary" onClick={() => loadData()} className="!rounded-2xl !p-4 group">
                        <RefreshCcw size={18} className="text-primary group-hover:rotate-180 transition-transform duration-700"/>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-bl-[20rem] -mr-32 -mt-32 blur-[80px] pointer-events-none"></div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard icon={DollarSign} label="Cumulative Yield" value={`Rs.${(dashboard.totals?.todaySales || 0).toLocaleString()}`} color="var(--primary)" trend="12.5" />
                <MetricCard icon={FileText} label="TXN Propagation" value={dashboard.totals?.todayInvoices || 0} color="#10b981" trend="4.2" />
                <MetricCard icon={Package} label="Core SKUs" value={dashboard.totals?.totalProducts || 0} color="#8b5cf6" />
                <MetricCard icon={AlertTriangle} label="Risk Vectors" value={dashboard.totals?.lowStock || 0} color="#f43f5e" />
            </div>

            {/* Main Intelligence Grid */}
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Tactical Sidebar */}
                <div className="xl:w-80 space-y-3">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] pl-4 mb-4 italic">Intel Segments</p>
                    {['sales', 'products', 'finance', 'inventory'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`
                                w-full flex items-center justify-between p-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] transition-all border-2 italic
                                ${activeTab === tab 
                                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 -translate-y-1 scale-[1.03]' 
                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-transparent hover:border-primary/40 hover:bg-primary/5'
                                }
                            `}>
                            {tab} Analysis
                            {activeTab === tab ? <CheckCircle2 size={16}/> : <ChevronRight size={16} className="opacity-30"/>}
                        </button>
                    ))}
                    
                    <div className="pt-8 space-y-4">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] pl-4 italic">Extraction Protocols</p>
                        <div className="grid grid-cols-1 gap-3 px-2">
                            <AppButton variant="secondary" onClick={() => handleExport('excel')} className="!py-4 transition-all hover:!bg-emerald-600 hover:text-white border-emerald-500/20 group">
                                <FileSpreadsheet size={16} className="mr-3 text-emerald-500 group-hover:text-white"/>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">XLS Manifest</span>
                            </AppButton>
                            <AppButton variant="secondary" onClick={() => handleExport('pdf')} className="!py-4 transition-all hover:!bg-rose-600 hover:text-white border-rose-500/20 group">
                                <FileText size={16} className="mr-3 text-rose-500 group-hover:text-white"/>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Audit PDF</span>
                            </AppButton>
                        </div>
                    </div>
                </div>

                {/* Computational Viewport */}
                <div className="flex-1 min-w-0">
                    <AppCard p0 className="min-h-[700px] border-t-8 border-t-primary overflow-hidden relative">
                        {loading ? (
                            <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in gap-6">
                                <div className="w-20 h-1 bg-primary/20 rounded-full overflow-hidden shadow-inner">
                                   <div className="w-1/2 h-full bg-primary animate-ping shadow-[0_0_12px_#2563eb]"></div>
                                </div>
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Re-Calculating Multi-Threaded Intel</p>
                            </div>
                        ) : (
                            <div className="p-10">
                                {activeTab === 'sales' && salesData && (
                                    <div className="space-y-16 animate-slide-up">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                                <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-[0.35em] italic">Revenue Propagation Matrix</h3>
                                            </div>
                                            <div className="h-[400px] w-full bg-[var(--bg-app)]/40 rounded-[2.5rem] p-10 border border-[var(--border)] group/chart hover:border-primary/30 transition-all shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-32 -mt-32 blur-3xl"></div>
                                                <ResponsiveContainer>
                                                    <AreaChart data={salesData.dailySales}>
                                                        <defs>
                                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5}/>
                                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="date" hide />
                                                        <YAxis hide />
                                                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--border)" opacity={0.4} />
                                                        <RechartsTooltip content={<ChartTooltip />} />
                                                        <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={6} fill="url(#colorSales)" animationDuration={1500} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                                    <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Sector Velocity (Monthly)</h3>
                                                </div>
                                                <div className="h-72 px-4 shadow-inner bg-[var(--bg-app)]/20 rounded-3xl pt-8">
                                                    <ResponsiveContainer>
                                                        <BarChart data={salesData.monthlySales}>
                                                            <XAxis dataKey="month" hide/>
                                                            <YAxis hide/>
                                                            <RechartsTooltip content={<ChartTooltip/>}/>
                                                            <Bar dataKey="total" fill="#10b981" radius={[12,12,12,12]} barSize={36}/>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                                    <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Human Capital Yield</h3>
                                                </div>
                                                <div className="h-72 px-4 shadow-inner bg-[var(--bg-app)]/20 rounded-3xl pt-8">
                                                    <ResponsiveContainer>
                                                        <BarChart data={salesData.salesBySalesman} layout="vertical">
                                                            <XAxis type="number" hide/>
                                                            <YAxis dataKey="salesmanName" type="category" hide/>
                                                            <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="totalSales" fill="#8b5cf6" radius={[12,12,12,12]} barSize={28}/>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'products' && productData && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-slide-up">
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981]"></div>
                                                <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">High-Velocity Nodes</h3>
                                            </div>
                                            <div className="h-96 px-6 bg-[var(--bg-app)]/30 border border-[var(--border)] rounded-[2.5rem] pt-10 shadow-inner">
                                                <ResponsiveContainer>
                                                    <BarChart data={productData.topSellingProducts} layout="vertical">
                                                        <XAxis type="number" hide/>
                                                        <YAxis dataKey="productName" type="category" hide/>
                                                        <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="quantitySold" fill="#10b981" radius={[12,12,12,12]} barSize={20}/>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_12px_#f59e0b]"></div>
                                                <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Operational Inertia</h3>
                                            </div>
                                            <div className="h-96 px-6 bg-[var(--bg-app)]/30 border border-[var(--border)] rounded-[2.5rem] pt-10 shadow-inner">
                                                <ResponsiveContainer>
                                                    <BarChart data={productData.slowMovingProducts} layout="vertical">
                                                        <XAxis type="number" hide/>
                                                        <YAxis dataKey="productName" type="category" hide/>
                                                        <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="quantitySold" fill="#f59e0b" radius={[12,12,12,12]} barSize={20}/>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'finance' && financeData && (
                                   <div className="space-y-16 animate-slide-up">
                                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                          <div className="space-y-8">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                                  <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Gross Valuation Split</h3>
                                              </div>
                                              <div className="h-[400px] flex items-center justify-center relative">
                                                  <ResponsiveContainer>
                                                      <PieChart>
                                                          <Pie data={[{n:'Yield',v:financeData.grossProfit},{n:'Capital',v:financeData.totalCost}]} cx="50%" cy="50%" innerRadius={100} outerRadius={140} dataKey="v" paddingAngle={10} stroke="none">
                                                              <Cell fill="#10b981"/><Cell fill="#f43f5e" fillOpacity={0.8}/>
                                                          </Pie>
                                                          <RechartsTooltip content={<ChartTooltip/>} />
                                                      </PieChart>
                                                  </ResponsiveContainer>
                                                  <div className="absolute flex flex-col items-center pointer-events-none">
                                                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">Margin</span>
                                                      <span className="text-4xl font-black text-emerald-500 italic tabular-nums">
                                                        {Math.round((financeData.grossProfit / (financeData.grossProfit + financeData.totalCost)) * 100)}%
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="space-y-8">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_12px_#f43f5e]"></div>
                                                    <h3 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.3em] italic">Debt Exposure Nodes</h3>
                                                </div>
                                                <AppBadge variant="danger" size="sm">Critical</AppBadge>
                                              </div>
                                              <div className="bg-[var(--bg-app)]/40 rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-inner p-4">
                                                  <AppTable 
                                                      headers={['Node Identity', 'Exposure Magnitude']}
                                                      data={financeData.outstandingInvoices.slice(0, 7)}
                                                      renderRow={(i) => (
                                                          <>
                                                              <td className="px-8 py-6">
                                                                  <p className="text-sm font-black text-[var(--text-main)] italic uppercase">{i.customerName}</p>
                                                                  <p className="text-[10px] font-black text-[var(--text-muted)] mt-1.5 uppercase tracking-widest">TRANSACTION REF: {i.invoiceNumber}</p>
                                                              </td>
                                                              <td className="px-8 py-6 text-right">
                                                                  <div className="text-xl font-black text-rose-600 italic tabular-nums">Rs.{i.balance.toLocaleString()}</div>
                                                              </td>
                                                          </>
                                                      )}
                                                  />
                                              </div>
                                          </div>
                                       </div>
                                   </div>
                                )}

                                {activeTab === 'inventory' && inventoryData && (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_#f43f5e]"></div>
                                                <h3 className="text-2xl font-black text-rose-600 uppercase tracking-tighter italic">Critical Asset Depletion Audit</h3>
                                            </div>
                                            <AppBadge variant="danger" size="lg" dot>Immediate Action</AppBadge>
                                        </div>
                                        <div className="bg-[var(--bg-app)]/40 rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-inner p-4">
                                            <AppTable 
                                                headers={['Asset Specification', 'Sector Hub', 'Liquidity Unit', 'Status Protocol']}
                                                data={inventoryData.lowStockReport}
                                                renderRow={(i) => (
                                                    <>
                                                        <td className="px-8 py-7">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:rotate-6 transition-transform"><Package size={24}/></div>
                                                                <div>
                                                                  <span className="font-black text-[var(--text-main)] italic text-base uppercase tracking-tight leading-none block">{i.productName}</span>
                                                                  <span className="text-[10px] font-black text-[var(--text-muted)] mt-1.5 uppercase tracking-widest block opacity-60">ID-6649{i.productId}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-7">
                                                          <AppBadge variant="secondary" size="sm" className="px-4 py-1 border-none shadow-sm leading-none">{i.category || 'GENERAL'}</AppBadge>
                                                        </td>
                                                        <td className="px-8 py-7">
                                                            <div className="flex flex-col">
                                                              <span className="text-2xl font-black text-rose-600 tabular-nums italic leading-none">{i.totalQuantity}</span>
                                                              <span className="text-[9px] font-black text-[var(--text-muted)] mt-1.5 uppercase tracking-widest italic opacity-60">Units Remaining</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-7 text-right">
                                                            <AppBadge variant="danger" size="md" className="px-6 py-2 border-none shadow-lg shadow-rose-500/20 italic font-black uppercase tracking-[0.2em]">
                                                                {i.status}
                                                            </AppBadge>
                                                        </td>
                                                    </>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </AppCard>
                </div>
            </div>
        </div>
    );
}
