import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Clock, AlertCircle, XCircle, FileText, Edit, User, Calendar, Truck, RotateCcw, Hash, Barcode } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import AppButton from '../components/AppButton';

const STATUS_CONFIG = {
    Paid:      { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle size={14}/> },
    Pending:   { color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: <Clock size={14}/> },
    Partial:   { color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: <FileText size={14}/> },
    Overdue:   { color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    icon: <AlertCircle size={14}/> },
    Cancelled: { color: 'text-slate-500',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   icon: <XCircle size={14}/> },
};

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        invoiceService.getById(id)
            .then(data => { setInvoice(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleStatusChange = async (status) => {
        try {
            await invoiceService.patchStatus(id, status);
            setInvoice(prev => ({ ...prev, paymentStatus: status }));
            showToast(`Statut mis à jour : ${status.toUpperCase()}`);
        } catch (err) {
            showToast('Update Failed : System Restriction');
        }
    };

    const handlePrint = () => { window.print(); };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest text-xs">Accessing Encrypted Transaction File...</div>;
    if (!invoice) return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest text-lg">⚠️ File Metadata Inaccessible</div>;

    const sc = STATUS_CONFIG[invoice.paymentStatus] || STATUS_CONFIG.Pending;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
            {/* Notifications */}
            {toast && (
                <div className="fixed top-8 right-8 z-[1000] px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest animate-slide-in">
                    {toast}
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
                <div className="space-y-1">
                    <Link to="/invoices" className="flex items-center gap-2 text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest hover:text-primary transition-all mb-4">
                        <ArrowLeft size={14}/> Secure Ledger
                    </Link>
                    <div className="flex items-center gap-4">
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                          {invoice.invoiceNumber || `TXN-${invoice.invoiceId}`}
                      </h1>
                      <div className={`px-4 py-1.5 rounded-xl text-[9px] uppercase font-black tracking-[0.2em] border shadow-sm ${sc.border} ${sc.bg} ${sc.color}`}>
                          {invoice.paymentStatus}
                      </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <AppButton variant="secondary" onClick={handlePrint} className="rounded-2xl">
                        <Printer size={18} className="mr-2"/> Dispatch Print
                    </AppButton>
                    <Link to={`/invoices/edit/${id}`}>
                      <AppButton className="rounded-2xl">
                          <Edit size={18} className="mr-2"/> Modify Record
                      </AppButton>
                    </Link>
                </div>
            </div>

            {/* Document Body */}
            <div id="invoice-print" className="bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border)] print:border-none print:shadow-none">
                {/* Branding Banner */}
                <div className="bg-slate-900 dark:bg-slate-800 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center transform rotate-3">
                                <FileText size={32} className="text-white"/>
                            </div>
                            <div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">Sales Receipt</h3>
                                <p className="text-primary font-black uppercase tracking-[0.3em] text-[9px] mt-1">DMS Enterprise Operations Hub</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Authenticated Stamp</div>
                            <div className="text-2xl font-black italic">{new Date(invoice.invoiceDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                </div>

                {/* Logistics Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-12 bg-[var(--bg-app)]/50 border-b border-[var(--border)]">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                            <User size={16}/> Billing Destination
                        </div>
                        <div className="space-y-3">
                            <div className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tight">{invoice.customer?.customerName || 'Standard Client'}</div>
                            <div className="space-y-2">
                                <div className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-3"><Barcode size={14} className="text-primary"/> Client-ID: {invoice.customerId}</div>
                                <div className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-3"><Truck size={14} className="text-primary"/> {invoice.customer?.address || 'Terminal A Distribution'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 md:text-right">
                        <div className="flex items-center md:justify-end gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                            <Hash size={16}/> Operational Flow
                        </div>
                        <div className="space-y-6">
                            <div className="inline-block p-4 bg-[var(--secondary)] rounded-2xl border border-[var(--border)] text-left min-w-[200px]">
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Responsible Rep</p>
                                <p className="text-lg font-black text-[var(--text-main)]">{invoice.salesman?.name || 'Central Office'}</p>
                            </div>
                            <div className="print:hidden">
                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 italic">Ledger Control</p>
                                <select value={invoice.paymentStatus} onChange={e => handleStatusChange(e.target.value)}
                                    className={`appearance-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm ${sc.border} ${sc.bg} ${sc.color} focus:outline-none cursor-pointer outline-none transition-all hover:scale-105`}>
                                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} className="bg-white dark:bg-slate-900">{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Manifest */}
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--secondary)]/50 border-b border-[var(--border)]">
                            <tr>
                                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Inventory Item</th>
                                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">Unit Valve</th>
                                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">Volume</th>
                                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-primary text-center">Empties Returned</th>
                                <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] text-right">Segment total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {invoice.invoiceItems?.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-[var(--secondary)]/20 transition-colors">
                                    <td className="p-10">
                                        <div className="font-black text-lg text-[var(--text-main)] uppercase tracking-tight italic">{item.product?.productName || 'Line Item'}</div>
                                        <div className="text-[10px] font-extrabold text-[var(--text-muted)] mt-1 uppercase tracking-widest whitespace-nowrap">SKU: {item.product?.barcode || 'INTERNAL'}</div>
                                    </td>
                                    <td className="p-10 text-center font-bold text-[var(--text-muted)]">Rs. {item.unitPrice.toLocaleString()}</td>
                                    <td className="p-10 text-center">
                                       <span className="text-2xl font-black text-[var(--text-main)]">{item.quantity}</span>
                                       <span className="text-[10px] font-black text-[var(--text-muted)] uppercase ml-1">PCS</span>
                                    </td>
                                    <td className="p-10 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl border border-primary/10 font-black text-xs shadow-sm">
                                            <RotateCcw size={14}/> {item.returnedQuantity || 0}
                                        </div>
                                    </td>
                                    <td className="p-10 text-right font-black text-2xl text-emerald-500 italic">Rs. {item.totalPrice.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="p-12 bg-[var(--bg-app)]/30 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-[var(--border)]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">Audit Observations</div>
                        <div className="p-8 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] shadow-inner min-h-[120px] text-sm font-bold text-[var(--text-muted)] italic leading-relaxed">
                            {invoice.notes || 'No exceptional variances recorded for this transaction. All logistics segments and empty bottle reconciliations have been audited at point of site exit.'}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[var(--text-muted)]">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Segmental Total</span>
                                <span className="font-black">Rs. {invoice.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-500">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Promotional Discount</span>
                                <span className="font-black">- Rs. {invoice.discount?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pt-8 border-t-2 border-slate-900 dark:border-white flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2">Net Distribution Yield</div>
                                <div className="text-5xl font-black text-[var(--text-main)] tracking-tighter italic">Rs. {invoice.netAmount?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Signature */}
                <div className="p-16 flex justify-end">
                    <div className="w-1/3 text-center space-y-4">
                        <div className="h-px bg-[var(--border)] w-full"></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Executive Clearance Stamp</div>
                        <div className="text-xs font-bold text-primary italic uppercase tracking-widest">{invoice.salesman?.name || 'ADMIN-HQ'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
