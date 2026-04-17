import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Banknote, 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ArrowRight,
  RefreshCcw,
  Plus,
  Minus
} from 'lucide-react';
import AppCard from './AppCard';
import AppButton from './AppButton';
import AppInput from './AppInput';
import AppBadge from './AppBadge';
import { formatCurrency, CURRENCY_SYMBOL } from '../utils/currencyUtils';

const PaymentAllocationModal = ({ customer, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [allocations, setAllocations] = useState({}); // { invoiceId: amount }
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchOutstandingInvoices();
  }, [customer.customerId]);

  const fetchOutstandingInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/Invoices/customer/${customer.customerId}/outstanding`);
      setInvoices(res.data || []);
      // Reset allocations
      setAllocations({});
    } catch (err) {
      setError('Failed to fetch outstanding invoices.');
    } finally {
      setLoading(false);
    }
  };

  const currentAllocatedTotal = Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const remainingInHand = (parseFloat(totalAmount) || 0) - currentAllocatedTotal;

  const handleAutoAllocate = () => {
    let remaining = parseFloat(totalAmount) || 0;
    const newAllocations = {};
    
    // FIFO Allocation
    for (const inv of invoices) {
      if (remaining <= 0) break;
      const amountToApply = Math.min(remaining, inv.remainingAmount);
      newAllocations[inv.invoiceId] = amountToApply.toFixed(2);
      remaining -= amountToApply;
    }
    
    setAllocations(newAllocations);
  };

  const handleManualChange = (invoiceId, value) => {
    setAllocations(prev => ({
      ...prev,
      [invoiceId]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (currentAllocatedTotal <= 0) {
      setError('Total allocated amount must be greater than zero.');
      return;
    }
    if (currentAllocatedTotal > (parseFloat(totalAmount) || 0)) {
        setError('Allocated amount cannot exceed the total payment received.');
        return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        customerId: customer.customerId,
        amount: parseFloat(totalAmount),
        paymentMethod,
        paymentDate: `${paymentDate}T${new Date().toISOString().split('T')[1]}`,
        manualAllocations: Object.entries(allocations)
          .filter(([_, amt]) => parseFloat(amt) > 0)
          .map(([id, amt]) => ({
            invoiceId: parseInt(id),
            amount: parseFloat(amt)
          }))
      };

      await axios.post('/api/v1/Payments/bulk', payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment.');
    } finally {
      setSaving(false);
    }
  };

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
      <AppCard className="w-full max-w-4xl border border-[var(--border)] shadow-2xl relative max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] bg-[var(--secondary)]/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl">
              <Banknote size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Bulk Payment Allocation</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold">
                Customer: <span className="text-blue-600">{customer.customerName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Payment Basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Amount Received</label>
              <AppInput 
                type="number" step="0.01" 
                prefix={CURRENCY_SYMBOL}
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="text-lg font-black"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Payment Method</label>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full h-11 bg-[var(--bg-app)] border border-[var(--border)] rounded-md px-4 text-sm font-bold uppercase focus:ring-2 focus:border-blue-600 transition-all text-[var(--text-main)]"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check / Pay Order</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Payment Date</label>
              <input 
                type="date" 
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full h-11 bg-[var(--bg-app)] border border-[var(--border)] rounded-md px-4 text-sm font-bold transition-all text-[var(--text-main)]" 
              />
            </div>
          </div>

          {/* Outstanding Summary */}
          <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <div className="flex items-center gap-6">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Outstanding</p>
                   <p className="text-xl font-black text-slate-900">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="w-px h-8 bg-blue-200/50"></div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Currently Allocated</p>
                   <p className={`text-xl font-black ${currentAllocatedTotal > (parseFloat(totalAmount)||0) ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(currentAllocatedTotal)}</p>
                </div>
            </div>
            
            <AppButton onClick={handleAutoAllocate} variant="secondary" className="rounded-lg h-10 border-blue-200 text-blue-700 bg-blue-50">
               <RefreshCcw size={14} className="mr-2"/> Auto-Distribute (FIFO)
            </AppButton>
          </div>

          {/* Allocation Table */}
          <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
                     <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Invoice #</th>
                     <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Net Amount</th>
                     <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Remaining</th>
                     <th className="px-6 py-3 text-[10px] font-bold text-blue-600 uppercase w-48 text-right">Apply Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] animate-pulse">Scanning records...</td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px]">No pending invoices found</td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.invoiceId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{inv.invoiceNumber}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(inv.netAmount)}</td>
                        <td className="px-6 py-4">
                           <AppBadge variant={inv.remainingAmount > 0 ? 'warning' : 'success'} size="xs" className="font-bold">
                              {formatCurrency(inv.remainingAmount)} DUE
                           </AppBadge>
                        </td>
                        <td className="px-6 py-4">
                           <AppInput 
                              type="number" step="0.01" 
                              value={allocations[inv.invoiceId] || ''}
                              onChange={e => handleManualChange(inv.invoiceId, e.target.value)}
                              placeholder="0.00"
                              className="text-right font-bold h-9"
                              prefix={CURRENCY_SYMBOL}
                           />
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-slate-50 flex justify-between items-center">
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining to Allocate</span>
             <span className={`text-sm font-black ${remainingInHand < 0 ? 'text-red-600' : remainingInHand > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                {remainingInHand < 0 ? 'Exceeded by ' : ''}{formatCurrency(Math.abs(remainingInHand))}
             </span>
          </div>
          <div className="flex gap-4">
            <AppButton variant="secondary" onClick={onClose} disabled={saving} className="rounded-lg px-8">Discard</AppButton>
            <AppButton 
                onClick={handleSubmit} 
                className="rounded-lg px-8 bg-blue-600"
                disabled={saving || loading || currentAllocatedTotal <= 0 || remainingInHand < 0}
            >
              {saving ? <RefreshCcw size={18} className="animate-spin mr-2"/> : <CheckCircle size={18} className="mr-2"/>}
              {saving ? 'Processing...' : 'Confirm Allocation'}
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
};

export default PaymentAllocationModal;
