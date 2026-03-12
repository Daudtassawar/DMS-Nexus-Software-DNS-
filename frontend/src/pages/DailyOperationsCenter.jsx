import { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCw, Activity, DollarSign, ListChecks, TrendingUp, Edit2, Trash2, X } from 'lucide-react';
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
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteActivity = async (id) => {
        if (!window.confirm('Delete this operational log?')) return;
        try { await dailyOperationsService.deleteActivity(id); fetchData(); } catch(e) { console.error(e); }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Delete this expense record?')) return;
        try { await dailyOperationsService.deleteExpense(id); fetchData(); } catch(e) { console.error(e); }
    };

    const submitEditActivity = async (e) => {
        e.preventDefault();
        try {
            await dailyOperationsService.updateActivity(editingActivity.activityId, editActivityForm);
            setEditingActivity(null);
            fetchData();
        } catch(err) { console.error(err); }
    };

    const submitEditExpense = async (e) => {
        e.preventDefault();
        try {
            await dailyOperationsService.updateExpense(editingExpense.expenseId, { 
                ...editExpenseForm, 
                amount: parseFloat(editExpenseForm.amount) 
            });
            setEditingExpense(null);
            fetchData();
        } catch(err) { console.error(err); }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-16 max-w-[1700px] mx-auto">
            {/* Header / Command Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">Operations Hub</h1>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
                   </div>
                   <p className="text-[var(--text-muted)] font-extrabold uppercase tracking-[0.2em] text-[11px] italic">Strategic node synchronization & financial reconciliation</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--bg-card)] px-6 py-3.5 rounded-2xl flex items-center gap-4 border border-[var(--border)] shadow-sm">
                        <Calendar size={18} className="text-primary"/>
                        <span className="font-black text-xs uppercase tracking-[0.15em] italic">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <AppButton 
                        variant="secondary"
                        onClick={fetchData} 
                        disabled={refreshing}
                        className="p-3.5 group"
                    >
                        <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}/>
                    </AppButton>
                </div>
            </div>

            {/* Liquidity Layer */}
            <CashSummaryCard data={cashSummary} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Entry Terminals */}
                <div className="xl:col-span-3 space-y-8">
                    <DailyActivityForm onActivityAdded={fetchData} />
                    <DailyExpenseForm onExpenseAdded={fetchData} />
                </div>

                {/* Analytical Engine */}
                <div className="xl:col-span-9 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        <div className="lg:col-span-3 h-full">
                            <SalesExpenseChart 
                                sales={cashSummary.totalSalesToday || 0} 
                                expenses={cashSummary.totalExpensesToday || 0} 
                            />
                        </div>
                        <div className="lg:col-span-2 h-full">
                            <DailyReportCard report={dailyReport} loading={loading} />
                        </div>
                    </div>

                    {/* Data Throughput Streams */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Operational Activities */}
                        <AppCard p0 className="overflow-hidden flex flex-col min-h-[450px] group">
                            <div className="p-6 border-b border-[var(--border)] bg-primary/5 flex justify-between items-center group-hover:bg-primary transition-colors duration-500">
                                <div className="flex items-center gap-3">
                                    <ListChecks size={20} className="text-primary group-hover:text-white transition-colors"/>
                                    <span className="font-black text-[11px] uppercase tracking-[0.3em] text-[var(--text-main)] group-hover:text-white transition-colors">Operational Pulse</span>
                                </div>
                                <AppBadge variant="primary" size="sm" dot className="group-hover:bg-white group-hover:text-primary border-none">Live</AppBadge>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                                {activities.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-50 italic">
                                        <Activity size={48} className="text-[var(--text-muted)] animate-pulse"/>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">No activities detected in current cycle</p>
                                    </div>
                                ) : activities.slice(0, 15).map((a, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-app)] border border-[var(--border)] rounded-[var(--radius-lg)] group/item hover:border-primary/50 transition-all interactive relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover/item:opacity-100 transition-opacity"></div>
                                        <div className="absolute top-2 right-2 flex gap-1 transition-opacity">
                                            <button onClick={() => {
                                                setEditingActivity(a);
                                                setEditActivityForm({ title: a.title, description: a.description });
                                            }} className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"><Edit2 size={12}/></button>
                                            <button onClick={() => handleDeleteActivity(a.activityId)} className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-colors"><Trash2 size={12}/></button>
                                        </div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="min-w-0 flex-1 pr-4">
                                                <h5 className="font-black text-[var(--text-main)] text-sm uppercase tracking-tight italic truncate">{a.title}</h5>
                                            </div>
                                            <span className="shrink-0 text-[9px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10 mt-1">
                                                {new Date(a.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed italic mt-1 truncate">{a.description}</p>
                                    </div>
                                ))}
                            </div>
                        </AppCard>

                        {/* Financial Expenses */}
                        <AppCard p0 className="overflow-hidden flex flex-col min-h-[450px] group">
                            <div className="p-6 border-b border-[var(--border)] bg-rose-500/5 flex justify-between items-center group-hover:bg-rose-500 transition-colors duration-500">
                                <div className="flex items-center gap-3">
                                    <DollarSign size={20} className="text-rose-500 group-hover:text-white transition-colors"/>
                                    <span className="font-black text-[11px] uppercase tracking-[0.3em] text-[var(--text-main)] group-hover:text-white transition-colors">Expense Pipeline</span>
                                </div>
                                <AppBadge variant="danger" size="sm" dot className="group-hover:bg-white group-hover:text-rose-600 border-none">Outflow</AppBadge>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                                {expenses.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-50 italic">
                                        <TrendingUp size={48} className="text-[var(--text-muted)] animate-pulse"/>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Minimal financial throughput detected</p>
                                    </div>
                                ) : expenses.slice(0, 15).map((e, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-app)] border border-[var(--border)] rounded-[var(--radius-lg)] flex items-center justify-between group/item hover:border-rose-500/50 transition-all interactive group">
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="shrink-0 w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center group-hover/item:rotate-12 transition-transform shadow-sm">
                                              <DollarSign size={24}/>
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h5 className="font-black text-[var(--text-main)] text-sm uppercase tracking-tight italic truncate">{e.expenseTitle}</h5>
                                                <AppBadge variant="secondary" size="sm" className="mt-1 shadow-sm leading-none">{e.category.toUpperCase()}</AppBadge>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4 shrink-0 overflow-hidden">
                                            <div className="min-w-0 text-right">
                                                <h4 className="font-black text-rose-600 text-xl italic leading-none whitespace-nowrap">-Rs. {e.amount.toLocaleString()}</h4>
                                                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase mt-1.5 tracking-widest italic opacity-60">
                                                    {new Date(e.expenseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 transition-opacity ml-2 shrink-0">
                                                <button onClick={() => {
                                                    setEditingExpense(e);
                                                    setEditExpenseForm({ title: e.expenseTitle, category: e.category, amount: e.amount, notes: e.notes || '' });
                                                }} className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-colors"><Edit2 size={12}/></button>
                                                <button onClick={() => handleDeleteExpense(e.expenseId)} className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-md transition-colors"><Trash2 size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AppCard>
                    </div>
                </div>
            </div>

            {/* Edit Modals */}
            {editingActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <form onSubmit={submitEditActivity} className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] max-w-md w-full mx-4 shadow-2xl relative">
                        <button type="button" onClick={() => setEditingActivity(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"><X size={20}/></button>
                        <h2 className="text-xl font-black text-primary uppercase italic mb-6">Modify Activity</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                                <input required value={editActivityForm.title} onChange={e => setEditActivityForm({...editActivityForm, title: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                                <textarea required value={editActivityForm.description} onChange={e => setEditActivityForm({...editActivityForm, description: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none" rows="3" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <AppButton type="button" variant="secondary" onClick={() => setEditingActivity(null)}>Cancel</AppButton>
                                <AppButton type="submit">Save Changes</AppButton>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {editingExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <form onSubmit={submitEditExpense} className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] max-w-md w-full mx-4 shadow-2xl relative">
                        <button type="button" onClick={() => setEditingExpense(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"><X size={20}/></button>
                        <h2 className="text-xl font-black text-rose-500 uppercase italic mb-6">Modify Expense</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
                                <input required value={editExpenseForm.title} onChange={e => setEditExpenseForm({...editExpenseForm, title: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                                    <select value={editExpenseForm.category} onChange={e => setEditExpenseForm({...editExpenseForm, category: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white uppercase text-xs font-bold">
                                        {['Fuel', 'Vehicle Maintenance', 'Office Expense', 'Salary', 'Miscellaneous'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                                    <input type="number" required value={editExpenseForm.amount} onChange={e => setEditExpenseForm({...editExpenseForm, amount: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Notes</label>
                                <textarea value={editExpenseForm.notes} onChange={e => setEditExpenseForm({...editExpenseForm, notes: e.target.value})} className="w-full mt-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none" rows="2" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <AppButton type="button" variant="secondary" onClick={() => setEditingExpense(null)}>Cancel</AppButton>
                                <AppButton type="submit" className="!bg-rose-600">Save Changes</AppButton>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
