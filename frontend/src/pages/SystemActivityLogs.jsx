import { useState, useEffect, useMemo } from 'react';
import auditLogService from '../services/auditLogService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { ShieldCheck, Search, Filter, RefreshCcw, User, Clock, Layers, FileText, AlertCircle } from 'lucide-react';

const MODULES = ['All', 'Auth', 'Products', 'Stock', 'Invoices', 'Distributors', 'Users', 'Operations', 'Finance', 'System'];

const MODULE_COLORS = {
    Auth: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    Products: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Stock: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Invoices: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Distributors: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    Users: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    Operations: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Finance: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    System: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const ACTION_ICON_COLOR = {
    Create: 'text-emerald-500',
    Edit: 'text-blue-500',
    Update: 'text-blue-500',
    Delete: 'text-rose-500',
    Login: 'text-violet-500',
    Add: 'text-emerald-500',
    Reduce: 'text-amber-500',
    Transfer: 'text-cyan-500',
    Adjust: 'text-orange-500',
    Bulk: 'text-indigo-500',
};

function moduleBadge(module) {
    const cls = MODULE_COLORS[module] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${cls}`}>
            <Layers size={10} />
            {module}
        </span>
    );
}

function actionColor(action) {
    const first = action?.split(' ')[0];
    return ACTION_ICON_COLOR[first] || 'text-[var(--text-muted)]';
}

export default function SystemActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [searchUser, setSearchUser] = useState('');
    const [selectedModule, setSelectedModule] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        setLoading(true); setError('');
        try {
            const data = await auditLogService.getLogs({
                userId: searchUser || undefined,
                module: selectedModule !== 'All' ? selectedModule : undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });
            setLogs(data || []);
        } catch {
            setError('Failed to load activity logs. You may not have permission to view this page.');
        } finally {
            setLoading(false);
        }
    };

    // Client-side search for instant filtering on top of server results
    const filtered = useMemo(() => {
        if (!searchUser) return logs;
        const q = searchUser.toLowerCase();
        return logs.filter(l =>
            l.userName?.toLowerCase().includes(q) ||
            l.userId?.toLowerCase().includes(q) ||
            l.action?.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q)
        );
    }, [logs, searchUser]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8 max-w-[1800px] mx-auto animate-fade-in pb-20">

            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-violet-500/10 text-violet-500 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                            <ShieldCheck size={22} />
                        </div>
                        <span className="text-[11px] font-black text-violet-500 uppercase tracking-[0.4em] italic">Security &amp; Compliance</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                        Activity <span className="text-violet-500 not-italic">Audit</span>
                    </h1>
                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-3 italic">
                        Track all system events · user actions · data changes across every module.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 relative z-10">
                    <AppButton variant="secondary" onClick={fetchLogs} className="!px-8 !py-3.5 !rounded-2xl group">
                        <RefreshCcw size={16} className="mr-2 group-hover:rotate-180 transition-transform duration-700 text-violet-500" />
                        <span className="uppercase tracking-[0.2em] font-black text-[10px]">Refresh</span>
                    </AppButton>
                </div>
                <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-violet-500/5 rounded-bl-[20rem] -mr-32 -mt-32 blur-[80px] pointer-events-none" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                    { label: 'Total Events', value: logs.length, color: 'violet' },
                    { label: 'Users Active', value: [...new Set(logs.map(l => l.userName))].filter(Boolean).length, color: 'blue' },
                    { label: 'Modules Covered', value: [...new Set(logs.map(l => l.module))].filter(Boolean).length, color: 'emerald' },
                    { label: 'Today', value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: 'amber' },
                ].map(s => (
                    <AppCard key={s.label} className={`border-t-4 border-t-${s.color}-500`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic mb-1">{s.label}</p>
                        <h4 className={`text-3xl font-black tabular-nums text-${s.color}-500`}>{s.value}</h4>
                    </AppCard>
                ))}
            </div>

            {/* Filters */}
            <AppCard className="overflow-hidden">
                <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4 p-4 items-end flex-wrap">
                    {/* Search user */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">Search User / Action</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                placeholder="Username or action..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] text-sm text-[var(--text-main)] focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Module filter */}
                    <div className="min-w-[160px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">Module</label>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <select
                                value={selectedModule}
                                onChange={e => setSelectedModule(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] text-sm text-[var(--text-main)] focus:outline-none focus:border-violet-500 appearance-none transition-colors"
                            >
                                {MODULES.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* From Date */}
                    <div className="min-w-[160px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] text-sm text-[var(--text-main)] focus:outline-none focus:border-violet-500 transition-colors"
                        />
                    </div>

                    {/* To Date */}
                    <div className="min-w-[160px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1.5 block">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] text-sm text-[var(--text-main)] focus:outline-none focus:border-violet-500 transition-colors"
                        />
                    </div>

                    <AppButton type="submit" className="!px-8 !py-2.5 !rounded-xl whitespace-nowrap">
                        <Search size={14} className="mr-2" />
                        <span className="uppercase tracking-widest font-black text-[10px]">Apply Filters</span>
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="secondary"
                        className="!px-6 !py-2.5 !rounded-xl whitespace-nowrap"
                        onClick={() => { setSearchUser(''); setSelectedModule('All'); setFromDate(''); setToDate(''); setTimeout(fetchLogs, 50); }}
                    >
                        <span className="uppercase tracking-widest font-black text-[10px]">Clear</span>
                    </AppButton>
                </form>
            </AppCard>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-sm font-semibold">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Logs Table */}
            <AppCard p0 className="overflow-hidden shadow-2xl border-t-4 border-t-violet-500">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--secondary)]/10 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                    </span>
                </div>
                <div className="p-4">
                    <AppTable
                        headers={['User', 'Action', 'Module', 'Description', 'IP Address', 'Timestamp']}
                        data={filtered}
                        loading={loading}
                        emptyMessage="No activity logs found. System events will appear here as users perform actions."
                        renderRow={(log) => (
                            <>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-500/20 border-2 border-white/20">
                                            {(log.userName || log.userId || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[var(--text-main)] leading-none">{log.userName || log.userId}</p>
                                            <p className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5 leading-none">{log.userId?.substring(0, 12)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`font-black text-sm italic tracking-tight ${actionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    {moduleBadge(log.module || 'System')}
                                </td>
                                <td className="px-6 py-5 max-w-xs">
                                    <div className="flex items-start gap-2">
                                        <FileText size={12} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed truncate">{log.description || '—'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-1 rounded-lg">
                                        {log.ipAddress || '—'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={11} className="text-violet-500 shrink-0" />
                                        <span className="text-xs text-[var(--text-muted)] font-semibold whitespace-nowrap">{formatDate(log.timestamp)}</span>
                                    </div>
                                </td>
                            </>
                        )}
                    />
                </div>
            </AppCard>
        </div>
    );
}
