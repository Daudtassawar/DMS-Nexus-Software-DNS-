import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, Filter, TrendingUp, Receipt, RefreshCcw, DollarSign, Activity, CreditCard, Layers, CheckCircle, Info, AlertCircle } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await invoiceService.getAll();
            setInvoices(data || []);
        } catch { showToast('error', 'Critical: Ledger Access Interrupted.'); }
        finally { setLoading(false); }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 3500);
    };

    const handleDelete = async (inv) => {
        if (!window.confirm(`Permanently expunge invoice ${inv.invoiceNumber}?\nThis action triggers stock reversal protocols.`)) return;
        setDeletingId(inv.invoiceId);
        try {
            await invoiceService.delete(inv.invoiceId);
            setInvoices(prev => prev.filter(i => i.invoiceId !== inv.invoiceId));
            showToast('success', 'Transaction successfully expunged.');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Purge protocol failed.');
        } finally { setDeletingId(null); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await invoiceService.patchStatus(id, status);
            setInvoices(prev => prev.map(i => i.invoiceId === id ? { ...i, paymentStatus: status } : i));
            showToast('success', `Status Overriden: ${status.toUpperCase()}.`);
        } catch (err) {
            showToast('error', 'Status modification failed.');
        }
    };

    const filtered = invoices.filter(inv => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (inv.invoiceNumber || '').toLowerCase().includes(q) ||
            (inv.customer?.customerName || '').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-10 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Notifications */}
            {toast.msg && (
                <div className={`fixed bottom-10 right-10 z-[1000] px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 animate-slide-in-right text-white italic border border-white/10 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header / Config Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Receipt size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Transactional Infrastructure</span>
                   </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Revenue <span className="text-primary not-italic">Ledger</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">Verified financial records, receivable tracking, and transactional compliance.</p>
                </div>
                
                <div className="flex flex-wrap gap-5 relative z-10">
                    <AppButton onClick={() => navigate('/invoices/create')} className="!px-10 !py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-3"/> <span className="uppercase tracking-[0.15em] font-black text-[10px]">Generate Invoice</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AppCard className="group relative overflow-hidden border-t-4 border-t-blue-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Total Txns</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] tabular-nums">{invoices.length}</h4>
                        </div>
                        <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Layers size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-emerald-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Net revenue</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-emerald-600 tabular-nums">Rs. {invoices.reduce((s, i) => s + (i.netAmount || 0), 0).toLocaleString()}</h4>
                        </div>
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-amber-500 transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Pending nodes</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-amber-500 tabular-nums">{invoices.filter(i => i.paymentStatus === 'Pending').length}</h4>
                        </div>
                        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Activity size={24}/>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="group relative overflow-hidden border-t-4 border-t-primary transition-all duration-500 hover:shadow-2xl">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-2 italic">Accounts settled</p>
                            <h4 className="text-3xl font-black italic tracking-tighter text-primary tabular-nums">{invoices.filter(i => i.paymentStatus === 'Paid').length}</h4>
                        </div>
                        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                            <CheckCircle size={24}/>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Central Terminal */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-primary group">
                <div className="flex flex-col xl:flex-row gap-8 items-center p-8 bg-[var(--secondary)]/10 border-b border-[var(--border)]">
                    <div className="flex-[2] w-full relative">
                        <AppInput 
                            placeholder="Interrogate ledger: Transaction ID or Client Entity..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            icon={Search}
                            className="!rounded-2xl"
                        />
                    </div>
                    <div className="flex flex-1 items-center gap-4 w-full">
                        <div className="relative flex-1 group/select">
                           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/60 group-hover/select:text-primary transition-colors">
                            <Filter size={16}/>
                           </div>
                           <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] italic focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                {['All', 'Pending', 'Paid', 'Partial', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s === 'All' ? 'STATUS: ALL NODES' : `STATUS: ${s.toUpperCase()}`}</option>)}
                            </select>
                        </div>
                        <AppButton variant="secondary" onClick={fetchInvoices} className="!px-8 !py-3.5 !rounded-2xl group">
                          <RefreshCcw size={18} className="mr-3 text-primary group-hover:rotate-180 transition-transform duration-700"/> 
                          <span className="uppercase tracking-[0.2em] font-black text-[10px]">Sync</span>
                        </AppButton>
                    </div>
                </div>

                <div className="p-4">
                  <AppTable 
                      headers={['Reference / Creation', 'Client Entity', 'Yield Analysis', 'Payment Protocol', 'Actions']}
                      data={filtered}
                      loading={loading}
                      renderRow={(inv) => {
                          const statusColors = {
                              Paid: 'success',
                              Pending: 'warning',
                              Partial: 'primary',
                              Overdue: 'danger',
                              Cancelled: 'secondary'
                          };
                          return (
                              <>
                                  <td className="px-8 py-7">
                                      <div className="flex items-center gap-5">
                                          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform border border-primary/20 shadow-sm">
                                            <Receipt size={24}/>
                                          </div>
                                          <div>
                                              <p className="font-black text-lg italic uppercase tracking-tighter text-primary mb-1 leading-none">
                                                {inv.invoiceNumber || `TXN-${inv.invoiceId.toString().padStart(4, '0')}`}
                                              </p>
                                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] italic leading-none">
                                                  {new Date(inv.invoiceDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                              </p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-7">
                                      <div className="space-y-1.5">
                                          <p className="font-black text-base italic uppercase tracking-tighter text-[var(--text-main)] leading-none">{inv.customer?.customerName || 'DIRECT_OUTLET'}</p>
                                          <AppBadge variant="secondary" size="sm" className="px-2 border-none shadow-sm leading-none italic font-black text-[9px] !rounded-md uppercase tracking-widest">AUTH: {inv.customerId || '---'}</AppBadge>
                                      </div>
                                  </td>
                                  <td className="px-8 py-7">
                                      <div className="space-y-1.5">
                                          <p className="text-2xl font-black text-emerald-600 italic leading-none tracking-tighter tabular-nums">Rs. {(inv.netAmount || 0).toLocaleString()}</p>
                                          {inv.discount > 0 && (
                                            <div className="flex items-center gap-1.5">
                                              <Zap size={10} className="text-rose-500 animate-pulse"/>
                                              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic leading-none">- Rs. {(inv.discount || 0).toLocaleString()} PROMO_DELTA</p>
                                            </div>
                                          )}
                                      </div>
                                  </td>
                                  <td className="px-8 py-7">
                                      <div className="space-y-3">
                                          <div className="relative group/select-inline">
                                            <select
                                                value={inv.paymentStatus}
                                                onChange={e => handleStatusChange(inv.invoiceId, e.target.value)}
                                                className={`
                                                  w-full px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-[var(--border)] 
                                                  bg-[var(--bg-app)] text-[var(--text-main)] outline-none cursor-pointer transition-all hover:border-primary appearance-none italic
                                                `}
                                            >
                                                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                            </select>
                                          </div>
                                          <AppBadge variant={statusColors[inv.paymentStatus] || 'secondary'} size="sm" dot className="px-4 py-1 border-none shadow-md italic font-black text-[9px] uppercase tracking-widest !rounded-lg block w-fit">
                                            {inv.paymentStatus} ACTIVATED
                                          </AppBadge>
                                      </div>
                                  </td>
                                  <td className="px-8 py-7 text-right">
                                      <div className="flex justify-end gap-3">
                                          <Link to={`/invoices/${inv.invoiceId}`} className="p-3.5 bg-blue-500/5 text-blue-500 border border-blue-500/10 rounded-2xl hover:bg-blue-600 hover:text-white transition-all interactive shadow-sm" title="Telemetry Feed">
                                              <Activity size={20}/>
                                          </Link>
                                          <Link to={`/invoices/edit/${inv.invoiceId}`} className="p-3.5 bg-indigo-500/5 text-indigo-500 border border-indigo-500/10 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all interactive shadow-sm" title="Override Protocol">
                                              <Settings size={20}/>
                                          </Link>
                                          <button onClick={() => handleDelete(inv)} disabled={deletingId === inv.invoiceId} className="p-3.5 bg-rose-500/5 text-rose-500 border border-rose-500/10 rounded-2xl hover:bg-rose-600 hover:text-white transition-all interactive shadow-sm" title="Purge Protocol">
                                              <Trash2 size={20}/>
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
