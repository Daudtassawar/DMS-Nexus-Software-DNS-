import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, Filter, TrendingUp, Receipt, RefreshCw, DollarSign, Activity, CreditCard, Layers, CheckCircle, Info, AlertCircle, Zap, Truck, Printer, Download, FileText } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import { ExportService } from '../utils/ExportService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { formatCurrency } from '../utils/currencyUtils';

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const d = await invoiceService.getAll({ 
                page, 
                pageSize: 20, 
                search: debouncedSearch,
                status: statusFilter === 'All' ? null : statusFilter
            });
            setInvoices(d.items || []);
            setTotalPages(d.totalPages || 1);
            setTotalCount(d.totalCount || 0);
        } catch { showToast('error', 'Failed to load invoices.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchInvoices(); }, [page, debouncedSearch, statusFilter]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 3500);
    };

    const handleDelete = async (inv) => {
        if (!window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}? This action will reverse stock changes.`)) return;
        setDeletingId(inv.invoiceId);
        try {
            await invoiceService.delete(inv.invoiceId);
            fetchInvoices();
            showToast('success', 'Invoice deleted successfully.');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to delete invoice.');
        } finally { setDeletingId(null); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await invoiceService.patchStatus(id, status);
            setInvoices(prev => prev.map(i => i.invoiceId === id ? { ...i, paymentStatus: status } : i));
            showToast('success', `Status updated to ${status}.`);
        } catch (err) {
            showToast('error', 'Failed to update status.');
        }
    };

    const filtered = invoices; // Server-side filtering

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {/* Notifications */}
            {toast.msg && (
                <div className={`toast-notification ${toast.type === 'success' ? 'success' : 'error'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Receipt className="text-blue-600" size={24}/> Invoice Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Track all invoices, receivables, and payment statuses.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <AppButton variant="secondary" onClick={() => navigate('/invoices/loading-summary')} className="rounded-md">
                        <Truck size={18} className="mr-2"/> Loading Summary
                    </AppButton>
                    <AppButton variant="secondary" onClick={() => navigate('/invoices/bulk-print')} className="rounded-md">
                        <Printer size={18} className="mr-2"/> Bulk Print
                    </AppButton>
                    <AppButton onClick={() => navigate('/invoices/create')} className="rounded-md">
                        <Plus size={18} className="mr-2"/> New Invoice
                    </AppButton>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AppCard className="border-t-4 border-t-blue-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Invoices</p>
                            <h4 className="text-2xl font-bold text-slate-900 tabular-nums">{totalCount}</h4>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <Layers size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-emerald-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoices in Page</p>
                            <h4 className="text-2xl font-bold text-emerald-600 tabular-nums">{invoices.length}</h4>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                            <TrendingUp size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-amber-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pages</p>
                            <h4 className="text-2xl font-bold text-amber-600 tabular-nums">{totalPages}</h4>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded">
                            <Activity size={18}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-t-4 border-t-blue-600 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Page</p>
                            <h4 className="text-2xl font-bold text-blue-600 tabular-nums">{page}</h4>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <CheckCircle size={18}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Filter Section */}
            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-4 items-center p-4 bg-slate-50/50 border-b border-slate-200">
                    <div className="flex-[2] w-full relative">
                        <AppInput 
                            placeholder="Search by invoice # or customer name..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="flex flex-1 items-center gap-3 w-full">
                        <div className="relative flex-1">
                           <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Filter size={14} className="text-slate-400"/>
                           </div>
                           <select 
                                value={statusFilter} 
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                            >
                                {['All', 'Unpaid', 'Partial', 'Paid', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s === 'All' ? 'ALL STATUS' : s.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <AppButton variant="secondary" onClick={() => {
                                const exportData = filtered.map(inv => ({
                                    'Invoice#': inv.invoiceNumber || `INV-${inv.invoiceId}`,
                                    'Date': new Date(inv.invoiceDate).toLocaleDateString(),
                                    'Customer': inv.customerName,
                                    'Net Amount': inv.netAmount,
                                    'Status': inv.paymentStatus
                                }));
                                ExportService.exportToExcel(exportData, 'Invoices_Export');
                            }} className="rounded-md" title="Export to Excel">
                                <Download size={16} className="text-emerald-600"/>
                            </AppButton>
                            <AppButton variant="secondary" onClick={() => {
                                const columns = [
                                    { header: 'Inv#', key: 'invoiceNumber' },
                                    { header: 'Date', key: 'invoiceDate' },
                                    { header: 'Customer', key: 'customerName' },
                                    { header: 'Net Amount', key: 'netAmount', isCurrency: true },
                                    { header: 'Status', key: 'paymentStatus' }
                                ];
                                const exportData = filtered.map(inv => ({
                                    ...inv,
                                    invoiceNumber: inv.invoiceNumber || `INV-${inv.invoiceId}`,
                                    invoiceDate: new Date(inv.invoiceDate).toLocaleDateString()
                                }));
                                ExportService.exportToPDF(exportData, columns, 'Invoices_Report', 'Invoice Summary Report');
                            }} className="rounded-md" title="Export to PDF">
                                <FileText size={16} className="text-rose-600"/>
                            </AppButton>
                            <AppButton variant="secondary" onClick={fetchInvoices} className="rounded-md">
                                <RefreshCw size={16} className="mr-2"/>
                                <span className="text-xs font-bold uppercase">Sync</span>
                            </AppButton>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                  <AppTable 
                      headers={['Invoice', 'Customer', 'Amount', 'Payment Status', 'Actions']}
                      data={filtered}
                      loading={loading}
                      pagination={true}
                      currentPage={page}
                      totalPages={totalPages}
                      totalCount={totalCount}
                      onPageChange={(p) => setPage(p)}
                      renderRow={(inv) => {
                          const statusColors = {
                              Paid: 'success',
                              Partial: 'warning',
                              Unpaid: 'danger',
                              Overdue: 'danger',
                              Cancelled: 'secondary'
                          };
                          return (
                              <>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 text-blue-600 flex items-center justify-center shadow-sm">
                                            <Receipt size={20}/>
                                          </div>
                                          <div>
                                              <p className="font-bold text-sm text-blue-600 leading-tight">
                                                {inv.invoiceNumber || `INV-${inv.invoiceId.toString().padStart(4, '0')}`}
                                              </p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <AppBadge variant={inv.invoiceType === 'Spot' ? 'danger' : 'info'} size="xs" className="rounded px-1.5 font-bold">
                                                    {inv.invoiceType || 'SPOT'}
                                                </AppBadge>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {new Date(inv.invoiceDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                              </div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <p className="font-bold text-sm text-slate-900 leading-tight">{inv.customerName || 'Direct Sale'}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {inv.customerId || '---'}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                      <h4 className="text-base font-bold text-emerald-600 tabular-nums">{formatCurrency(inv.netAmount)}</h4>
                                      <div className="flex flex-col text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                        <span>Paid: {formatCurrency(inv.paidAmount)}</span>
                                        {inv.remainingAmount > 0 && (
                                          <span className="text-red-500">Due: {formatCurrency(inv.remainingAmount)}</span>
                                        )}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="space-y-2">
                                          <select
                                              value={inv.paymentStatus}
                                              onChange={e => handleStatusChange(inv.invoiceId, e.target.value)}
                                              className="w-full px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer hover:border-blue-500 transition-colors appearance-none"
                                          >
                                              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                          </select>
                                          <AppBadge 
                                            variant={statusColors[inv.paymentStatus] || 'secondary'} 
                                            size="xs"
                                            className="rounded px-2 font-bold"
                                          >
                                            {inv.paymentStatus?.toUpperCase()}
                                          </AppBadge>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex justify-end gap-2">
                                           <Link to={`/invoices/${inv.invoiceId}`} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm" title="View Invoice">
                                               <Eye size={16}/>
                                           </Link>
                                           <Link to={`/invoices/edit/${inv.invoiceId}`} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm" title="Edit Invoice">
                                               <Edit size={16}/>
                                           </Link>
                                          <button onClick={() => handleDelete(inv)} disabled={deletingId === inv.invoiceId} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Delete Invoice">
                                              {deletingId === inv.invoiceId ? <RefreshCw className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                                          </button>
                                      </div>
                                  </td>
                              </>
                          );
                      }}
                  />
                </div>
            </AppCard>
        </div>
    );
}
