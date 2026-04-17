import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Clock, AlertCircle, XCircle, FileText, Edit, User, Calendar, Truck, RotateCcw, Hash, Barcode, Download } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import AppButton from '../components/AppButton';
import { generateProfessionalInvoicePDF } from '../utils/pdfGenerator';
import AppBadge from '../components/AppBadge';
import paymentService from '../services/paymentService';
import { formatCurrency } from '../utils/currencyUtils';
import systemSettingsService from '../services/systemSettingsService';

const STATUS_CONFIG = {
    Paid:      { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle size={14}/> },
    Unpaid:    { color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100',    icon: <Clock size={14}/> },
    Partial:   { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   icon: <FileText size={14}/> },
    Overdue:   { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100',     icon: <AlertCircle size={14}/> },
    Cancelled: { color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-100',   icon: <XCircle size={14}/> },
};

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [payments, setPayments] = useState([]);
    const [companySettings, setCompanySettings] = useState(null);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const data = await invoiceService.getById(id);
            setInvoice(data);
            const pyts = await paymentService.getByInvoiceId(id);
            setPayments(pyts);
            
            // Also fetch settings for professional header
            const settings = await systemSettingsService.getSettings();
            setCompanySettings(settings);

            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleStatusChange = async (status) => {
        try {
            await invoiceService.patchStatus(id, status);
            setInvoice(prev => ({ ...prev, paymentStatus: status }));
            showToast(`Status updated to ${status}`);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Update failed';
            showToast(msg);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || isNaN(paymentAmount)) {
            showToast('Please enter a valid amount');
            return;
        }
        try {
            await paymentService.create({
                invoiceId: parseInt(id),
                amountPaid: parseFloat(paymentAmount),
                paymentMethod: 'Cash',
                paymentDate: new Date().toISOString()
            });
            setPaymentAmount('');
            setShowPaymentModal(false);
            showToast('Payment recorded successfully');
            fetchInvoice(); // Refresh data
        } catch (err) {
            const msg = err.response?.data?.message || 'Payment recording failed';
            showToast(msg);
        }
    };

    const handlePrint = () => { window.print(); };

    const handleDownloadPDF = () => {
        if (invoice) {
            generateProfessionalInvoicePDF(invoice, companySettings);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold animate-pulse text-slate-500 uppercase tracking-widest text-sm">Loading Invoice...</div>;
    if (!invoice) return <div className="p-20 text-center font-bold text-rose-500 uppercase tracking-widest text-lg">Invoice Not Found</div>;

    const currentStatus = invoice.paymentStatus === 'Pending' ? 'Unpaid' : invoice.paymentStatus;
    const sc = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Unpaid;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 ">
            {/* Notifications */}
            {toast && (
                <div className="toast-notification bg-slate-900 border border-slate-700 shadow-md">
                    <CheckCircle size={18}/> {toast}
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
                <div>
                    <Link to="/invoices" className="flex items-center gap-2 text-[var(--text-muted)] font-bold uppercase text-[10px] tracking-wider hover:text-[var(--primary)] transition-all mb-3">
                        <ArrowLeft size={14}/> Back to Invoices
                    </Link>
                    <div className="flex items-center gap-4">
                      <h1 className="text-3xl font-bold text-[var(--text-main)]">
                          {invoice.invoiceNumber || `Invoice #${invoice.invoiceId}`}
                      </h1>
                      <AppBadge variant={sc.color.includes('emerald') ? 'success' : sc.color.includes('amber') ? 'warning' : sc.color.includes('slate') ? 'secondary' : 'danger'} dot uppercase>
                          {currentStatus}
                      </AppBadge>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AppButton variant="secondary" onClick={handleDownloadPDF} className="rounded-md border-slate-200">
                        <Download size={18} className="mr-2"/> Download PDF
                    </AppButton>
                    <AppButton variant="secondary" onClick={handlePrint} className="rounded-md border-slate-200">
                        <Printer size={18} className="mr-2"/> Print
                    </AppButton>
                    <Link to={`/invoices/edit/${id}`}>
                      <AppButton className="rounded-md">
                          <Edit size={18} className="mr-2"/> Edit
                      </AppButton>
                    </Link>
                </div>
            </div>

            {/* Document Body */}
            <div id="invoice-print" className="bg-[var(--bg-card)] rounded-lg shadow-sm overflow-hidden border border-[var(--border)] print:border-none print:shadow-none">
                {/* Header Banner */}
                <div className="p-8 border-b border-[var(--border)]">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-[var(--primary)] text-white rounded flex items-center justify-center font-bold text-2xl uppercase">
                                {companySettings?.companyName?.charAt(0) || 'D'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-main)]">{companySettings?.companyName || 'DMS Nexus'}</h3>
                                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{companySettings?.address || 'Distribution Management System'}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{companySettings?.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-[var(--text-main)] uppercase tracking-tight mb-4">INVOICE</h2>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</p>
                                <p className="text-sm font-bold text-[var(--text-main)]">{new Date(invoice.invoiceDate).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[var(--secondary)]">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">Customer Information</p>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-[var(--text-main)]">{invoice.customer?.customerName || 'Direct Sale'}</p>
                            <div className="space-y-1 text-sm text-[var(--text-muted)]">
                                <p className="flex items-center gap-2"><Barcode size={14}/> ID: {invoice.customerId}</p>
                                <p className="flex items-center gap-2"><Truck size={14}/> {invoice.customer?.address || 'Generic Address'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 md:text-right">
                        <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">Sales Information</p>
                        <div className="space-y-3">
                            <div className="inline-block text-left">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Sales Representative</p>
                                <p className="text-base font-bold text-[var(--text-main)]">{invoice.salesman?.name || 'Head Office'}</p>
                            </div>
                            <div className="print:hidden">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Update Status</p>
                                <select value={currentStatus} onChange={e => handleStatusChange(e.target.value)}
                                    className="appearance-none px-4 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-app)] text-[var(--text-main)] text-[10px] font-bold uppercase tracking-wider focus:ring-2 focus:ring-[var(--primary)] outline-none cursor-pointer">
                                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Product Description</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Unit Price</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Qty</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Returned</th>
                                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {invoice.invoiceItems?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-8 py-4">
                                        <p className="font-bold text-sm text-[var(--text-main)]">{item.product?.productName || 'Line Item'}</p>
                                    </td>
                                    <td className="px-8 py-4 text-center text-sm font-medium text-[var(--text-muted)]">{formatCurrency(item.unitPrice)}</td>
                                    <td className="px-8 py-4 text-center font-bold text-sm text-[var(--text-main)]">{item.quantity}</td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="text-xs font-semibold text-slate-500">{item.returnedQuantity || 0}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right font-bold text-sm text-[var(--text-main)]">{formatCurrency(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[var(--border)]">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Notes</p>
                        <div className="p-4 bg-[var(--secondary)] rounded border border-[var(--border)] text-sm text-[var(--text-muted)] min-h-[80px]">
                            {invoice.notes || 'No notes provided.'}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Subtotal</span>
                                <span className="font-bold">{formatCurrency(invoice.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-500">
                                <span className="font-semibold uppercase tracking-wider text-[10px]">Discount</span>
                                <span className="font-bold">- {formatCurrency(invoice.discount)}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--text-main)]">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mb-1">Total Payable</p>
                                    <p className="text-3xl font-bold text-[var(--text-main)]">{formatCurrency(invoice.netAmount)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Paid</p>
                                    <p className="text-lg font-bold text-emerald-600 tabular-nums">{formatCurrency(invoice.paidAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Due</p>
                                    <p className="text-lg font-bold text-red-600 tabular-nums">{formatCurrency(invoice.remainingAmount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Signature Area */}
                <div className="p-12 border-t border-[var(--border)] border-dashed">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 max-w-sm">
                            <h4 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">Payment History</h4>
                            {payments.length > 0 ? (
                                <div className="space-y-2">
                                    {payments.map(p => (
                                        <div key={p.paymentId} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0 italic">
                                            <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                                            <span className="font-bold">{formatCurrency(p.amountPaid)} ({p.paymentMethod})</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">No payments recorded yet.</p>
                            )}
                        </div>
                        <div className="w-64 text-center">
                            <div className="h-px bg-slate-300 w-full mb-2"></div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Container */}
            <div className="flex gap-4 print:hidden justify-center pt-4">
                 <AppButton onClick={() => setShowPaymentModal(true)} className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                     Record Payment
                 </AppButton>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Record Payment</h3>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Invoice {invoice.invoiceNumber}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={24}/>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount to Pay (Rs.)</label>
                                <input 
                                    type="number" 
                                    value={paymentAmount} 
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    placeholder={invoice.remainingAmount}
                                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg text-2xl font-bold text-slate-800 focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-slate-200"
                                />
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 flex gap-3 text-amber-700 border border-amber-100">
                                <AlertCircle size={20} className="shrink-0"/>
                                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                                    Recording a payment will reduce the customer's balance and update cash flow reports. Status must be updated manually.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-lg transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleRecordPayment} className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-200 transition-all">
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
