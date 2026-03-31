import { useState, useEffect, useMemo } from 'react';
import auditLogService from '../services/auditLogService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';
import { ShieldCheck, Search, Filter, RefreshCcw, User, Clock, Layers, FileText, AlertCircle, Printer, Download, FileSpreadsheet, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MODULES = ['All', 'Auth', 'Products', 'Stock', 'Invoices', 'Distributors', 'Users', 'Operations', 'Finance', 'System'];

const MODULE_STYLES = {
    Auth: { color: 'violet', icon: Shield },
    Products: { color: 'blue', icon: Layers },
    Stock: { color: 'amber', icon: Layers },
    Invoices: { color: 'emerald', icon: FileText },
    Distributors: { color: 'cyan', icon: User },
    Users: { color: 'rose', icon: User },
    Operations: { color: 'orange', icon: Activity },
    Finance: { color: 'teal', icon: Wallet2 },
    System: { color: 'slate', icon: Settings },
};

const ACTION_COLORS = {
    Create: 'text-emerald-600',
    Edit: 'text-blue-600',
    Update: 'text-blue-600',
    Delete: 'text-red-600',
    Login: 'text-violet-600',
    Add: 'text-emerald-600',
    Reduce: 'text-amber-600',
    Transfer: 'text-cyan-600',
    Adjust: 'text-orange-600',
    Bulk: 'text-indigo-600',
};

function ModuleBadge({ module }) {
    return (
        <AppBadge variant="secondary" size="sm" className="rounded-md font-bold px-2">
            {module}
        </AppBadge>
    );
}

function getActionColor(action) {
    const first = action?.split(' ')[0];
    return ACTION_COLORS[first] || 'text-slate-600';
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
            setError('Failed to load activity logs.');
        } finally {
            setLoading(false);
        }
    };

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
        if (e) e.preventDefault();
        fetchLogs();
    };

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => window.print();

    const handleExportPDF = () => {
        if (!filtered.length) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text('System Activity Audit Log', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        const tableData = filtered.map(log => [
            log.userName || log.userId || '—',
            log.action || '—',
            log.module || 'System',
            log.description || '—',
            log.ipAddress || '—',
            formatDate(log.timestamp)
        ]);

        autoTable(doc, {
            head: [['User', 'Action', 'Module', 'Description', 'IP Address', 'Timestamp']],
            body: tableData,
            startY: 35,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        });

        doc.save(`activity_log_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        if (!filtered.length) return;
        const worksheet = XLSX.utils.json_to_sheet(filtered.map(log => ({
            'User': log.userName || log.userId || '—',
            'Action': log.action || '—',
            'Module': log.module || 'System',
            'Description': log.description || '—',
            'IP Address': log.ipAddress || '—',
            'Timestamp': formatDate(log.timestamp)
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
        XLSX.writeFile(workbook, `activity_log_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 max-w-[1800px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="text-blue-600" size={24}/> System Activity Logs
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Comprehensive audit trail of all system actions and modifications.</p>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                    <AppButton variant="secondary" onClick={handleExportExcel} disabled={!filtered.length} className="rounded-md px-4">
                        <FileSpreadsheet size={16} className="mr-2 text-emerald-600" /> Excel
                    </AppButton>
                    <AppButton variant="secondary" onClick={handleExportPDF} disabled={!filtered.length} className="rounded-md px-4">
                        <Download size={16} className="mr-2 text-rose-600" /> PDF
                    </AppButton>
                    <AppButton variant="secondary" onClick={handlePrint} className="rounded-md px-4">
                        <Printer size={16} className="mr-2" /> Print
                    </AppButton>
                    <AppButton onClick={fetchLogs} className="rounded-md px-4 ml-2">
                        <RefreshCcw size={16} className="mr-2" /> Refresh
                    </AppButton>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
                {[
                    { label: 'Total Logs', value: logs.length, color: 'blue' },
                    { label: 'Unique Users', value: [...new Set(logs.map(l => l.userName))].filter(Boolean).length, color: 'indigo' },
                    { label: "Today's Actions", value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: 'emerald' },
                    { label: 'Delete / Fail Events', value: logs.filter(l => l.action?.toLowerCase().includes('delete') || l.action?.toLowerCase().includes('fail')).length, color: 'rose' },
                ].map(s => (
                    <AppCard key={s.label} className="border-t-4 border-t-blue-500 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                        <h4 className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</h4>
                    </AppCard>
                ))}
            </div>

            {/* Filter Controls */}
            <AppCard className="print:hidden border border-slate-200 shadow-sm">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Search Action/User</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Type to search..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">System Module</label>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm appearance-none focus:outline-none focus:border-blue-500">
                                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Start Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">End Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm" />
                    </div>
                    <div className="flex items-end gap-2">
                        <AppButton type="submit" className="flex-1 rounded-md py-2">Apply</AppButton>
                        <AppButton type="button" variant="secondary" onClick={() => { setSearchUser(''); setSelectedModule('All'); setFromDate(''); setToDate(''); setTimeout(fetchLogs, 50); }}
                                   className="rounded-md py-2">Clear</AppButton>
                    </div>
                </form>
            </AppCard>

            {/* Error Notification */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm font-semibold">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Data Table */}
            <AppCard p0 className="overflow-hidden shadow-sm border border-[var(--border)]">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Found {filtered.length} matching events
                    </span>
                </div>
                <AppTable
                    headers={['User', 'Action', 'Module', 'Description', 'Origin', 'Timestamp']}
                    data={filtered}
                    loading={loading}
                    emptyMessage="No activity logs found for the selected criteria."
                    renderRow={(log) => (
                        <>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-200">
                                        {(log.userName || log.userId || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 leading-none">{log.userName || log.userId}</p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1">ID: {log.userId?.substring(0, 8)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`font-bold text-sm ${getActionColor(log.action)}`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <ModuleBadge module={log.module || 'System'} />
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                                <div className="flex items-start gap-2">
                                    <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-slate-500 leading-relaxed truncate" title={log.description}>{log.description || '—'}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    {log.ipAddress || 'Internal'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={11} className="text-blue-500 shrink-0" />
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{formatDate(log.timestamp)}</span>
                                </div>
                            </td>
                        </>
                    )}
                />
            </AppCard>
        </div>
    );
}
