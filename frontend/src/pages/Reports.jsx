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
    <AppCard className="relative overflow-hidden border-l-4 shadow-sm" style={{ borderColor: color }}>
        <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-md" style={{ backgroundColor: `${color}10`, color }}>
                <Icon size={20}/>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-[var(--text-main)] tabular-nums">{value}</h4>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{label}</p>
            </div>
        </div>
        {trend && (
            <div className="absolute top-4 right-4">
                <AppBadge variant="success" size="xs" dot>+{trend}%</AppBadge>
            </div>
        )}
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
            console.error('Data Loading Error', err);
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
                xlsx.writeFile(wb, `Sales_Report_${d}.xlsx`);
            }
        }
    };

    const ChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {payload[0].payload.date || payload[0].payload.month || payload[0].payload.productName}
                    </p>
                    <p className="text-sm font-bold text-white">
                        Value: Rs. {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!dashboard) return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Loading Analytics...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 max-w-[1700px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-main)]">Business Intelligence</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Detailed performance analysis and operational reporting.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-[var(--secondary)] p-2 px-4 rounded-md border border-[var(--border)]">
                        <Calendar size={18} className="text-[var(--text-muted)]" />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--text-main)]">
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="bg-transparent border-none outline-none cursor-pointer" />
                            <span className="text-[var(--text-muted)]">to</span>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="bg-transparent border-none outline-none cursor-pointer" />
                        </div>
                    </div>
                    <AppButton variant="secondary" onClick={() => loadData()} className="!p-2.5 rounded-md">
                        <RefreshCcw size={18} className="text-[var(--primary)]"/>
                    </AppButton>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={DollarSign} label="Total Sales" value={`Rs.${(dashboard.totals?.todaySales || 0).toLocaleString()}`} color="var(--primary)" trend="12.5" />
                <MetricCard icon={FileText} label="Invoice Volume" value={dashboard.totals?.todayInvoices || 0} color="#10b981" trend="4.2" />
                <MetricCard icon={Package} label="Core Products" value={dashboard.totals?.totalProducts || 0} color="#8b5cf6" />
                <MetricCard icon={AlertTriangle} label="Low Stock Items" value={dashboard.totals?.lowStock || 0} color="#ef4444" />
            </div>

            {/* Main Section */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Navigation Sidebar */}
                <div className="xl:w-72 space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-2">Report Modules</p>
                    {['sales', 'products', 'finance', 'inventory'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-md font-bold text-xs uppercase tracking-wider transition-all border
                                ${activeTab === tab 
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md' 
                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-transparent hover:border-[var(--border)] hover:bg-[var(--secondary)]'
                                }
                            `}>
                            {tab} Report
                            {activeTab === tab ? <CheckCircle2 size={16}/> : <ChevronRight size={16} className="opacity-30"/>}
                        </button>
                    ))}
                    
                    <div className="pt-6 space-y-3">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2 mb-2">Export Data</p>
                        <div className="grid grid-cols-1 gap-2">
                            <AppButton variant="secondary" onClick={() => handleExport('excel')} className="!justify-start !py-3 rounded-md border-emerald-100 hover:bg-emerald-50 text-emerald-700">
                                <FileSpreadsheet size={16} className="mr-2"/>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Excel Spreadsheet</span>
                            </AppButton>
                            <AppButton variant="secondary" onClick={() => handleExport('pdf')} className="!justify-start !py-3 rounded-md border-rose-100 hover:bg-rose-50 text-rose-700">
                                <FileText size={16} className="mr-2"/>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Audit PDF Report</span>
                            </AppButton>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 min-w-0">
                    <AppCard p0 className="min-h-[600px] shadow-sm overflow-hidden relative border border-[var(--border)]">
                        {loading && (
                            <div className="absolute inset-0 bg-[var(--bg-card)] z-50 flex flex-col items-center justify-center gap-4">
                                <RefreshCcw size={32} className="text-[var(--primary)] animate-spin"/>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Updating Report Data...</p>
                            </div>
                        )}
                        
                        <div className="p-8">
                            {activeTab === 'sales' && salesData && (
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-5 bg-[var(--primary)] rounded-full"></div>
                                            <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Revenue Over Time</h3>
                                        </div>
                                        <div className="h-96 w-full bg-[var(--secondary)] rounded-xl p-6 border border-[var(--border)]">
                                            <ResponsiveContainer>
                                                <AreaChart data={salesData.dailySales}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis hide />
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                                    <RechartsTooltip content={<ChartTooltip />} />
                                                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                                <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Performance</h3>
                                            </div>
                                            <div className="h-64 px-4 bg-[var(--secondary)] border border-[var(--border)] rounded-xl flex items-center">
                                                <ResponsiveContainer>
                                                    <BarChart data={salesData.monthlySales}>
                                                        <XAxis dataKey="month" hide/>
                                                        <YAxis hide/>
                                                        <RechartsTooltip content={<ChartTooltip/>}/>
                                                        <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} barSize={32}/>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                                                <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Sales Representative Yield</h3>
                                            </div>
                                            <div className="h-64 px-4 bg-[var(--secondary)] border border-[var(--border)] rounded-xl flex items-center">
                                                <ResponsiveContainer>
                                                    <BarChart data={salesData.salesBySalesman} layout="vertical">
                                                        <XAxis type="number" hide/>
                                                        <YAxis dataKey="salesmanName" type="category" hide/>
                                                        <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="totalSales" fill="#8b5cf6" radius={[0,4,4,0]} barSize={24}/>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && productData && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                            <h3 className="text-base font-bold text-[var(--text-main)] uppercase tracking-wide">Top Selling Products</h3>
                                        </div>
                                        <div className="h-80 px-6 bg-[var(--secondary)] border border-[var(--border)] rounded-xl pt-6">
                                            <ResponsiveContainer>
                                                <BarChart data={productData.topSellingProducts} layout="vertical">
                                                    <XAxis type="number" hide/>
                                                    <YAxis dataKey="productName" type="category" hide/>
                                                    <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="quantitySold" fill="#10b981" radius={[0,4,4,0]} barSize={16}/>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-base font-bold text-[var(--text-main)] uppercase tracking-wide">Slow Moving Items</h3>
                                        </div>
                                        <div className="h-80 px-6 bg-[var(--secondary)] border border-[var(--border)] rounded-xl pt-6">
                                            <ResponsiveContainer>
                                                <BarChart data={productData.slowMovingProducts} layout="vertical">
                                                    <XAxis type="number" hide/>
                                                    <YAxis dataKey="productName" type="category" hide/>
                                                    <RechartsTooltip content={<ChartTooltip/>}/><Bar dataKey="quantitySold" fill="#f59e0b" radius={[0,4,4,0]} barSize={16}/>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && financeData && (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                       <div className="space-y-6">
                                           <div className="flex items-center gap-3">
                                               <div className="w-1 h-6 bg-[var(--primary)] rounded-full"></div>
                                               <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Gross Profit Margin</h3>
                                           </div>
                                           <div className="h-80 flex items-center justify-center relative">
                                               <ResponsiveContainer>
                                                   <PieChart>
                                                       <Pie data={[{n:'Profit',v:financeData.grossProfit},{n:'Cost',v:financeData.totalCost}]} cx="50%" cy="50%" innerRadius={80} outerRadius={110} dataKey="v" paddingAngle={8} stroke="none">
                                                           <Cell fill="#10b981"/><Cell fill="#ef4444" fillOpacity={0.8}/>
                                                       </Pie>
                                                       <RechartsTooltip content={<ChartTooltip/>} />
                                                   </PieChart>
                                               </ResponsiveContainer>
                                               <div className="absolute flex flex-col items-center pointer-events-none">
                                                   <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Margin</span>
                                                   <span className="text-3xl font-bold text-emerald-600 tabular-nums">
                                                     {Math.round((financeData.grossProfit / (financeData.grossProfit + financeData.totalCost)) * 100)}%
                                                   </span>
                                               </div>
                                           </div>
                                       </div>
                                       <div className="space-y-6">
                                           <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                                                 <h3 className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Outstanding Invoices</h3>
                                             </div>
                                             <AppBadge variant="danger" size="xs">High Priority</AppBadge>
                                           </div>
                                           <div className="bg-[var(--secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                                               <AppTable 
                                                   headers={['Customer', 'Outstanding Balance']}
                                                   data={financeData.outstandingInvoices.slice(0, 6)}
                                                   renderRow={(i) => (
                                                       <>
                                                           <td className="px-6 py-4">
                                                               <p className="text-sm font-bold text-[var(--text-main)]">{i.customerName}</p>
                                                               <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mt-1">Invoice: {i.invoiceNumber}</p>
                                                           </td>
                                                           <td className="px-6 py-4 text-right">
                                                               <div className="text-base font-bold text-red-600 tabular-nums">Rs.{i.balance.toLocaleString()}</div>
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
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-red-600 uppercase tracking-tight">Low Stock Inventory Audit</h3>
                                        </div>
                                        <AppBadge variant="danger" size="md">Action Required</AppBadge>
                                    </div>
                                    <div className="bg-[var(--secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
                                        <AppTable 
                                            headers={['Product', 'Category', 'Stock Level', 'Status']}
                                            data={inventoryData.lowStockReport}
                                            renderRow={(i) => (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center"><Package size={18}/></div>
                                                            <div>
                                                              <span className="font-bold text-[var(--text-main)] text-sm block">{i.productName}</span>
                                                              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block">ID: {i.productId}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                      <AppBadge variant="secondary" size="xs" uppercase>{i.category || 'General'}</AppBadge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                          <span className="text-lg font-bold text-red-600 tabular-nums leading-none">{i.totalQuantity}</span>
                                                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-1">Units Left</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <AppBadge variant="danger" size="sm" uppercase>{i.status}</AppBadge>
                                                    </td>
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </AppCard>
                </div>
            </div>
        </div>
    );
}
