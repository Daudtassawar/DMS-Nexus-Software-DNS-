import { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCw, Activity, DollarSign, ListChecks, TrendingUp, Edit2, Trash2, X, ClipboardList, CreditCard, LayoutDashboard, CheckCircle2, AlertCircle } from 'lucide-react';
import dailyOperationsService from '../services/dailyOperationsService';
import CashSummaryCard from '../components/CashSummaryCard';
import DailyActivityForm from '../components/DailyActivityForm';
import DailyExpenseForm from '../components/DailyExpenseForm';
import SalesExpenseChart from '../components/SalesExpenseChart';
import DailyReportCard from '../components/DailyReportCard';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';

export default function DailyOperationsCenter() {
    const [cashSummary, setCashSummary] = useState({});
    const [dailyReport, setDailyReport] = useState({});
    const [activities, setActivities] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [editingActivity, setEditingActivity] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);

    const [editActivityForm, setEditActivityForm] = useState({ title: '', description: '' });
    const [editExpenseForm, setEditExpenseForm] = useState({ title: '', category: '', amount: '', notes: '' });

    const fetchData = useCallback(async () => {
        setRefreshing(true);
        try {
            const [cash, report, act, exp] = await Promise.all([
                dailyOperationsService.getCashSummary(),
                dailyOperationsService.getDailyReport(),
                dailyOperationsService.getActivities(),
                dailyOperationsService.getExpenses()
            ]);
            setCashSummary(cash);
            setDailyReport(report);
            setActivities(act);
            setExpenses(exp);
        } catch (err) {
            console.error('Operational Sync Failure', err);
            showStatus('error', 'Failed to synchronize operational data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus({ type: '', message: '' }), 3500);
    };

    const handleDeleteActivity = async (id) => {
        if (!window.confirm('Are you sure you want to delete this activity log?')) return;
        try { 
            await dailyOperationsService.deleteActivity(id); 
            showStatus('success', 'Activity log removed.');
            fetchData(); 
        } catch(e) { 
            showStatus('error', 'Failed to delete activity.');
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense record?')) return;
        try { 
            await dailyOperationsService.deleteExpense(id); 
            showStatus('success', 'Expense record removed.');
            fetchData(); 
        } catch(e) { 
            showStatus('error', 'Failed to delete expense.');
        }
    };

    const submitEditActivity = async (e) => {
        e.preventDefault();
        try {
            await dailyOperationsService.updateActivity(editingActivity.activityId, editActivityForm);
            setEditingActivity(null);
            showStatus('success', 'Activity updated successfully.');
            fetchData();
        } catch(err) { 
            showStatus('error', 'Failed to update activity.');
        }
    };

    const submitEditExpense = async (e) => {
        e.preventDefault();
        try {
            await dailyOperationsService.updateExpense(editingExpense.expenseId, { 
                ...editExpenseForm, 
                amount: parseFloat(editExpenseForm.amount) 
            });
            setEditingExpense(null);
            showStatus('success', 'Expense updated successfully.');
            fetchData();
        } catch(err) { 
            showStatus('error', 'Failed to update expense.');
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-[1700px] mx-auto">
            {status.message && (
                <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-4 rounded-md shadow-lg font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-white border border-white/20 ${status.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}{status.message}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <LayoutDashboard className="text-[var(--primary)]" size={24}/> Daily Operations Manager
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Monitor daily business activities, track expenses, and reconcile cash flow summary.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--secondary)] px-4 py-2 rounded-md flex items-center gap-3 border border-[var(--border)]">
                        <Calendar size={16} className="text-[var(--text-muted)]"/>
                        <span className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <AppButton 
                        variant="secondary"
                        onClick={fetchData} 
                        disabled={refreshing}
                        className="rounded-md"
                    >
                        <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''} mr-2`}/> Synchronize
                    </AppButton>
                </div>
            </div>

            {/* Cash Summary Card */}
            <CashSummaryCard data={cashSummary} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Entry Forms */}
                <div className="xl:col-span-3 space-y-6">
                    <DailyActivityForm onActivityAdded={fetchData} />
                    <DailyExpenseForm onExpenseAdded={fetchData} />
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3">
                            <SalesExpenseChart 
                                sales={cashSummary.totalSalesToday || 0} 
                                expenses={cashSummary.totalExpensesToday || 0} 
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <DailyReportCard report={dailyReport} loading={loading} />
                        </div>
                    </div>

                    {/* Lists Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Operational Activities */}
                        <AppCard p0 className="overflow-hidden flex flex-col min-h-[450px] border border-[var(--border)] shadow-sm">
                            <div className="p-4 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={18} className="text-[var(--primary)]"/>
                                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">Operational Activities</span>
                                </div>
                                <AppBadge variant="primary" size="sm" className="rounded px-2 text-[10px]">Active Session</AppBadge>
                            </div>
                            <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                                {activities.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <Activity size={40} className="text-slate-300 mb-3"/>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No activities recorded today</p>
                                    </div>
                                ) : activities.slice(0, 15).map((a, idx) => (
                                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0 pr-12">
                                                <h5 className="font-bold text-[var(--text-main)] text-sm">{a.title}</h5>
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--secondary)] px-2 py-0.5 rounded border border-[var(--border)] uppercase">
                                                {new Date(a.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">{a.description}</p>
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => {
                                                setEditingActivity(a);
                                                setEditActivityForm({ title: a.title, description: a.description });
                                            }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={14}/></button>
                                            <button onClick={() => handleDeleteActivity(a.activityId)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AppCard>

                        {/* Recent Expenses */}
                        <AppCard p0 className="overflow-hidden flex flex-col min-h-[450px] border border-[var(--border)] shadow-sm">
                            <div className="p-4 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={18} className="text-red-500"/>
                                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">Recent Expenses</span>
                                </div>
                                <AppBadge variant="danger" size="sm" className="rounded px-2 text-[10px]">Cash Outflow</AppBadge>
                            </div>
                            <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                                {expenses.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <TrendingUp size={40} className="text-slate-300 mb-3"/>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No expenses recorded today</p>
                                    </div>
                                ) : expenses.slice(0, 15).map((e, idx) => (
                                    <div key={idx} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between hover:border-red-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 text-red-500 rounded flex items-center justify-center shrink-0">
                                              <DollarSign size={20}/>
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h5 className="font-bold text-[var(--text-main)] text-sm truncate">{e.expenseTitle}</h5>
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{e.category}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-red-600 text-base tabular-nums">-Rs.{e.amount.toLocaleString()}</h4>
                                                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">
                                                    {new Date(e.expenseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-slate-100">
                                                <button onClick={() => {
                                                    setEditingExpense(e);
                                                    setEditExpenseForm({ title: e.expenseTitle, category: e.category, amount: e.amount, notes: e.notes || '' });
                                                }} className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"><Edit2 size={14}/></button>
                                                <button onClick={() => handleDeleteExpense(e.expenseId)} className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AppCard>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {editingActivity && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
                    <form onSubmit={submitEditActivity} className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] max-w-md w-full mx-4 shadow-2xl relative">
                        <button type="button" onClick={() => setEditingActivity(null)} className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20}/></button>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                            <ClipboardList className="text-[var(--primary)]" size={20}/> Modify Activity Entry
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Entry Subject</label>
                                <input required value={editActivityForm.title} onChange={e => setEditActivityForm({...editActivityForm, title: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-sm font-bold placeholder:font-medium text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all" placeholder="Enter activity title" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Summary Description</label>
                                <textarea required value={editActivityForm.description} onChange={e => setEditActivityForm({...editActivityForm, description: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-sm font-bold placeholder:font-medium text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all resize-none" rows="3" placeholder="Provide detailed summary" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <AppButton type="button" variant="secondary" onClick={() => setEditingActivity(null)} className="rounded-md">Discard</AppButton>
                                <AppButton type="submit" className="rounded-md px-6">Save Activity</AppButton>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {editingExpense && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
                    <form onSubmit={submitEditExpense} className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] max-w-md w-full mx-4 shadow-2xl relative">
                        <button type="button" onClick={() => setEditingExpense(null)} className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20}/></button>
                        <h2 className="text-lg font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                            <CreditCard className="text-red-500" size={20}/> Modify Expense Entry
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Expense Title</label>
                                <input required value={editExpenseForm.title} onChange={e => setEditExpenseForm({...editExpenseForm, title: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-sm font-bold text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Category</label>
                                    <select value={editExpenseForm.category} onChange={e => setEditExpenseForm({...editExpenseForm, category: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-[10px] font-bold uppercase text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all">
                                        {['Fuel', 'Vehicle Maintenance', 'Office Expense', 'Salary', 'Miscellaneous'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount (Rs.)</label>
                                    <input type="number" required value={editExpenseForm.amount} onChange={e => setEditExpenseForm({...editExpenseForm, amount: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-sm font-bold text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Audit Notes</label>
                                <textarea value={editExpenseForm.notes} onChange={e => setEditExpenseForm({...editExpenseForm, notes: e.target.value})} className="w-full mt-1.5 p-3 bg-[var(--secondary)] border border-[var(--border)] rounded-md text-sm font-bold placeholder:font-medium text-[var(--text-main)] focus:ring-2 focus:border-[var(--primary)] transition-all resize-none" rows="2" placeholder="Additional details..." />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <AppButton type="button" variant="secondary" onClick={() => setEditingExpense(null)} className="rounded-md">Discard</AppButton>
                                <AppButton type="submit" className="rounded-md px-6">Update Record</AppButton>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
