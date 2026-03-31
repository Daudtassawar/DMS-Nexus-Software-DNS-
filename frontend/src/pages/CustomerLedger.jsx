import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, FileText, ArrowDownRight, ArrowUpRight, Edit2, Trash2, Download, Calendar, Undo, User, RefreshCcw, Banknote, Calculator, History, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';
import AppInput from '../components/AppInput';

const CustomerLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState([]);
  const [filteredLedger, setFilteredLedger] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Transaction Modal State
  const [showModal, setShowModal] = useState(false);
  const [transaction, setTransaction] = useState({ id: null, transactionType: 'Debit', amount: '', description: '', reference: '', date: '' });

  // Undo Delete Queue Mechanics
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const deleteTimers = useRef({});

  useEffect(() => {
    fetchData();
    return () => {
      Object.values(deleteTimers.current).forEach(clearTimeout);
    };
  }, [id]);

  useEffect(() => {
    let filtered = ledger;
    if (startDate) {
      filtered = filtered.filter(l => new Date(l.date) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(l => new Date(l.date) <= end);
    }
    filtered = filtered.filter(l => !pendingDeletes.includes(l.id));
    setFilteredLedger(filtered);
  }, [ledger, startDate, endDate, pendingDeletes]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const custRes = await axios.get(`/api/v1/Customers/${id}`);
      setCustomer(custRes.data);
      const ledRes = await axios.get(`/api/v1/CustomerLedger/${id}`);
      setLedger(ledRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3500);
  };

  const isDebit = (type) => String(type) === 'Debit' || type === 2 || String(type) === '2';
  const isCredit = (type) => String(type) === 'Credit' || type === 1 || String(type) === '1';

  const handleTransaction = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        customerId: Number(id),
        transactionType: transaction.transactionType,
        amount: Number(transaction.amount),
        description: transaction.description,
        reference: transaction.reference || null,
        date: transaction.date || undefined
      };

      if (transaction.id) {
        await axios.put(`/api/v1/CustomerLedger/${transaction.id}`, payload);
        showStatus('success', 'Account entry updated.');
      } else {
        await axios.post('/api/v1/CustomerLedger', payload);
        showStatus('success', 'New transaction recorded.');
      }
      
      setShowModal(false);
      resetTransactionForm();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || err.message;
      showStatus('error', `Submission failed: ${msg}`);
    }
  };

  const resetTransactionForm = () => {
    setTransaction({ id: null, transactionType: 'Debit', amount: '', description: '', reference: '', date: '' });
  };

  const openEdit = (l) => {
    const dateFormatted = new Date(l.date).toISOString().slice(0, 16);
    setTransaction({
      id: l.id,
      transactionType: l.transactionType,
      amount: l.amount,
      description: l.description,
      reference: l.reference || '',
      date: dateFormatted
    });
    setShowModal(true);
  };

  const handleDeleteRequest = (tId) => {
    setPendingDeletes(prev => [...prev, tId]);

    const timer = setTimeout(async () => {
      try {
        await axios.delete(`/api/v1/CustomerLedger/${tId}`);
        fetchData();
      } catch (err) {
        showStatus('error', 'Critical: Failed to remove entry.');
      } finally {
        setPendingDeletes(prev => prev.filter(pId => pId !== tId));
        delete deleteTimers.current[tId];
      }
    }, 7000); 

    deleteTimers.current[tId] = timer;
  };

  const handleUndoDelete = (tId) => {
    if (deleteTimers.current[tId]) {
      clearTimeout(deleteTimers.current[tId]);
      delete deleteTimers.current[tId];
    }
    setPendingDeletes(prev => prev.filter(pId => pId !== tId));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${customer?.customerName} - Account Statement`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 30);
    
    if (startDate || endDate) {
      doc.text(`Statement Period: ${startDate || 'All Time'} to ${endDate || 'Now'}`, 14, 36);
    }
    
    const tableColumn = ["Date", "Description", "Ref", "Debit (Inv)", "Credit (Paid)", "Balance"];
    const tableRows = [];

    const chronologicalLedger = [...filteredLedger].reverse();

    chronologicalLedger.forEach(l => {
      tableRows.push([
        new Date(l.date).toLocaleDateString(),
        l.description,
        l.reference || '-',
        isDebit(l.transactionType) ? `Rs. ${l.amount.toLocaleString()}` : '-',
        isCredit(l.transactionType) ? `Rs. ${l.amount.toLocaleString()}` : '-',
        `Rs. ${l.runningBalance.toLocaleString()}`
      ]);
    });

    tableRows.push(['', '', 'TOTALS:', `Rs. ${totalDebit.toLocaleString()}`, `Rs. ${totalCredit.toLocaleString()}`, `Rs. ${(totalDebit - totalCredit).toLocaleString()}`]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: startDate || endDate ? 42 : 36,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    
    doc.save(`${customer?.customerName.replace(/ /g, '_')}_Account.pdf`);
  };

  const totalDebit = filteredLedger.filter(l => isDebit(l.transactionType)).reduce((sum, l) => sum + l.amount, 0);
  const totalCredit = filteredLedger.filter(l => isCredit(l.transactionType)).reduce((sum, l) => sum + l.amount, 0);

  if (loading && !customer) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reconciling Ledger entries...</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
      {status.message && (
          <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-4 rounded-xl shadow-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-white border border-white/10 animate-slide-up ${status.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              {status.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{status.message}
          </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/customers')} className="mt-1 p-2 border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <User className="text-blue-500" size={24}/> {customer?.customerName} <span className="text-slate-400 font-medium">Customer Statement</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Audit customer billing records, track payments, and reconcile outstanding dues.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <AppButton variant="secondary" onClick={exportPDF} className="rounded-md">
            <Download size={18} className="mr-2"/> Export Statement
          </AppButton>
          <AppButton onClick={() => { resetTransactionForm(); setShowModal(true); }} className="rounded-md">
            <Plus size={18} className="mr-2"/> Record Payment
          </AppButton>
        </div>
      </div>

      {/* Account Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AppCard className="border border-slate-200">
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statement Scope</span>
                <Calendar size={14} className="text-slate-300"/>
              </div>
              <div className="grid grid-cols-1 gap-2">
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-[10px] font-bold uppercase focus:outline-none focus:border-blue-500 transition-colors" />
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-[10px] font-bold uppercase focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
           </div>
        </AppCard>

        <AppCard className="border-t-4 border-t-blue-500 border-x-slate-200 border-b-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowUpRight size={12} className="text-blue-500"/> Total Billings</p>
          <h4 className="text-2xl font-bold text-slate-900 tabular-nums">Rs. {totalDebit.toLocaleString()}</h4>
          <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">Invoice Total (+)</p>
        </AppCard>

        <AppCard className="border-t-4 border-t-emerald-500 border-x-slate-200 border-b-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowDownRight size={12} className="text-emerald-500"/> Total Payments</p>
          <h4 className="text-2xl font-bold text-slate-900 tabular-nums">Rs. {totalCredit.toLocaleString()}</h4>
          <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Payment Total (-)</p>
        </AppCard>

        <AppCard className={`border-t-4 border-x-slate-200 border-b-slate-200 ${(totalDebit - totalCredit) > 0 ? 'border-t-red-500' : 'border-t-emerald-500'}`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receivable Balance</p>
          <h4 className={`text-2xl font-bold tabular-nums ${(totalDebit - totalCredit) > 0 ? 'text-red-600' : 'text-emerald-500'}`}>Rs. {(totalDebit - totalCredit).toLocaleString()}</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">{(totalDebit - totalCredit) > 0 ? 'Outstanding Dues' : 'Account Balanced'}</p>
        </AppCard>
      </div>

      {/* Undo Queue Alerts */}
      <div className="fixed bottom-10 right-10 z-[1000] flex flex-col gap-3">
        {pendingDeletes.map(pdId => (
          <div key={pdId} className="bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-5 animate-slide-up border border-white/5">
            <div className="p-2 bg-red-500/20 text-red-400 rounded"><Trash2 size={20}/></div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-tight">Entry flagged for removal</p>
              <p className="text-[9px] text-slate-400 uppercase font-medium mt-0.5">Purging record in 7 seconds...</p>
            </div>
            <button onClick={() => handleUndoDelete(pdId)} className="bg-white text-slate-900 px-4 py-1.5 rounded font-bold text-[10px] uppercase hover:bg-slate-100 transition-colors flex items-center gap-2">
              <Undo size={14}/> Recover
            </button>
          </div>
        ))}
      </div>

      {/* Ledger Registry Table */}
      <AppCard p0 className="overflow-hidden shadow-sm border border-[var(--border)]">
        <div className="flex items-center justify-between p-4 bg-[var(--secondary)] border-b border-[var(--border)]">
           <div className="flex items-center gap-2 text-slate-600">
              <History size={16}/>
              <span className="text-xs font-bold uppercase tracking-wider">Account History</span>
           </div>
           <AppButton variant="secondary" size="sm" onClick={fetchData} className="rounded-md">
              <RefreshCcw size={14} className="mr-2"/> Refresh Entries
           </AppButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Entry Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Transaction Specification</th>
                <th className="px-6 py-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest text-right">Debit (+)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-right">Credit (-)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-main)] uppercase tracking-widest text-right">Running Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No ledger entries identified</td>
                </tr>
              ) : (
                filteredLedger.map(l => (
                  <tr key={l.id} className="hover:bg-[var(--secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--text-main)]">{new Date(l.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">{new Date(l.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{l.description}</p>
                      {l.reference && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">REF: {l.reference}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isDebit(l.transactionType) ? (
                        <span className="text-sm font-bold text-blue-600 tabular-nums">+ {l.amount.toLocaleString()}</span>
                      ) : <span className="text-slate-200">--</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCredit(l.transactionType) ? (
                        <span className="text-sm font-bold text-emerald-600 tabular-nums">- {l.amount.toLocaleString()}</span>
                      ) : <span className="text-slate-200">--</span>}
                    </td>
                    <td className="px-6 py-4 text-right bg-[var(--secondary)]">
                       <span className="text-sm font-bold text-[var(--text-main)] tabular-nums">Rs. {l.runningBalance.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(l)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteRequest(l.id)} className="p-2 rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AppCard>

      {/* Account Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-6 animate-fade-in">
          <AppCard className="w-full max-w-xl border border-[var(--border)] shadow-md relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg"><Calculator size={24}/></div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-main)]">{transaction.id ? 'Modify Account Entry' : 'New Account Entry'}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">Direct manual modification of customer account balance.</p>
              </div>
            </div>

            <form onSubmit={handleTransaction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Adjustment Type</label>
                  <select 
                    value={transaction.transactionType} 
                    onChange={e => setTransaction({...transaction, transactionType: e.target.value})} 
                    className="w-full h-11 bg-[var(--bg-app)] border border-[var(--border)] rounded-md px-4 text-sm font-bold uppercase focus:ring-2 focus:border-[var(--primary)] transition-all cursor-pointer text-[var(--text-main)]"
                  >
                    <option value="Debit">DEBIT (Increase Dues)</option>
                    <option value="Credit">CREDIT (Record Payment)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Entry Amount (Rs.)</label>
                  <div className="relative">
                    <input 
                      type="number" step="0.01" required min="0.01" 
                      value={transaction.amount} 
                      onChange={e => setTransaction({...transaction, amount: e.target.value})} 
                      className="w-full h-11 bg-[var(--bg-app)] border border-[var(--border)] rounded-md px-4 text-sm font-bold focus:ring-2 focus:border-[var(--primary)] transition-all text-[var(--text-main)]" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Memo</label>
                <AppInput 
                  placeholder="Reason for adjustment / payment detail..." 
                  value={transaction.description}
                  onChange={e => setTransaction({...transaction, description: e.target.value})}
                  required
                  className="rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Verification Ref.</label>
                  <AppInput 
                    placeholder="Check #, Slip #, INV #" 
                    value={transaction.reference}
                    onChange={e => setTransaction({...transaction, reference: e.target.value})}
                    className="rounded-md"
                  />
                </div>
                {transaction.id && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Entry Timestamp</label>
                    <input 
                      type="datetime-local" 
                      value={transaction.date || ''} 
                      onChange={e => setTransaction({...transaction, date: e.target.value})} 
                      className="w-full h-11 bg-[var(--bg-app)] border border-[var(--border)] rounded-md px-4 text-xs font-bold uppercase transition-all" 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <AppButton variant="secondary" type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-md">Discard</AppButton>
                <AppButton type="submit" className="flex-1 rounded-md">Save Account Entry</AppButton>
              </div>
            </form>
          </AppCard>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
