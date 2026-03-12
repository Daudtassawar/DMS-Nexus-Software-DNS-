import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import distributorService from '../services/distributorService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Package, DollarSign, BarChart2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DistributorPerformanceModal({ isOpen, distributor, onClose }) {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !distributor?.distributorId) return;
        document.documentElement.style.overflow = 'hidden';
        setTab('overview');
        fetchData();
        return () => { document.documentElement.style.overflow = ''; };
    }, [isOpen, distributor]);

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const perf = await distributorService.getPerformance(distributor.distributorId);
            setData(perf);
        } catch {
            setError('Could not load analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const C = {
        bg: dark ? '#1e293b' : '#ffffff',
        bgDeep: dark ? '#0f172a' : '#f8fafc',
        border: dark ? '#334155' : '#e5e7eb',
        textH: dark ? '#f8fafc' : '#111827',
        textS: dark ? '#94a3b8' : '#6b7280',
        axis: dark ? '#475569' : '#9ca3af',
        tooltip: dark ? '#1e293b' : '#ffffff',
    };

    // Prepare chart data
    const productSales = (data?.productSalesBreakdown || []).map(p => ({
        name: p.productName?.length > 12 ? p.productName.slice(0, 12) + '…' : p.productName,
        Sales: Number(p.totalSales || 0),
        Units: Number(p.totalUnitsSold || 0),
    }));

    const monthlySales = (data?.monthlySalesTrend || []).map(m => ({
        name: `${MONTHS[(m.month || 1) - 1]} ${m.year || ''}`,
        Sales: Number(m.totalSales || 0),
    }));

    const inventoryData = (data?.inventoryBreakdown || []).map(p => ({
        name: p.productName?.length > 10 ? p.productName.slice(0, 10) + '…' : p.productName,
        value: Number(p.totalStock || 0),
    }));

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <TrendingUp size={13}/> },
        { id: 'sales', label: 'Sales by Product', icon: <BarChart2 size={13}/> },
        { id: 'trend', label: 'Monthly Trend', icon: <TrendingUp size={13}/> },
        { id: 'inventory', label: 'Inventory', icon: <Package size={13}/> },
    ];

    const customTooltipStyle = {
        background: C.tooltip, border: `1px solid ${C.border}`,
        borderRadius: '0.5rem', padding: '0.6rem 1rem',
        color: C.textH, fontSize: '0.8rem', fontWeight: '600',
    };

    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', padding: '1rem' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '1.1rem', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ─ Header ─ */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: C.textH, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            🏢 {distributor?.name} — Performance Analytics
                        </h2>
                        <div style={{ fontSize: '0.8rem', color: C.textS, marginTop: '0.2rem' }}>
                            📍 {distributor?.region || 'No region'} &nbsp;|&nbsp; 📞 {distributor?.contact || 'No contact'}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: C.bgDeep, border: `1px solid ${C.border}`, color: C.textS, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</button>
                </div>

                {/* ─ Tabs ─ */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1.5rem 0', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.5rem 1rem', borderRadius: '0.5rem 0.5rem 0 0',
                            border: `1px solid ${tab === t.id ? C.border : 'transparent'}`,
                            borderBottom: 'none',
                            background: tab === t.id ? C.bg : 'transparent',
                            color: tab === t.id ? '#10b981' : C.textS,
                            fontWeight: tab === t.id ? '700' : '500',
                            cursor: 'pointer', fontSize: '0.82rem',
                            position: 'relative', bottom: '-1px',
                        }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ─ Body ─ */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '280px', color: C.textS, fontSize: '0.9rem' }}>
                            ⏳ Loading analytics...
                        </div>
                    )}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{error}</div>
                    )}

                    {!loading && !error && data && (
                        <>
                            {/* ── OVERVIEW TAB ────────────────────────────── */}
                            {tab === 'overview' && (
                                <div>
                                    {/* KPI cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <StatCard icon={<DollarSign size={28} />} label="Lifetime Sales" value={`$${Number(data.totalSalesGenerated || 0).toLocaleString()}`} color="#10b981" bg={C.bgDeep} border={C.border} textS={C.textS} />
                                        <StatCard icon={<Package size={28} />} label="Current Stock Units" value={Number(data.currentInventoryStock || 0).toLocaleString()} color="#3b82f6" bg={C.bgDeep} border={C.border} textS={C.textS} />
                                        <StatCard icon={<BarChart2 size={28} />} label="Products In Catalog" value={(data.productSalesBreakdown || []).length} color="#8b5cf6" bg={C.bgDeep} border={C.border} textS={C.textS} />
                                        <StatCard icon={<TrendingUp size={28} />} label="Sales Months Tracked" value={(data.monthlySalesTrend || []).length} color="#f59e0b" bg={C.bgDeep} border={C.border} textS={C.textS} />
                                    </div>

                                    {/* Mini bar preview */}
                                    {productSales.length > 0 && (
                                        <div style={{ background: C.bgDeep, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${C.border}` }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textS, marginBottom: '0.75rem' }}>Top Selling Products</div>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <BarChart data={productSales.slice(0, 5)} barSize={24}>
                                                    <XAxis dataKey="name" tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                                                    <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                    {productSales.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: C.textS, background: C.bgDeep, borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
                                            No sales data yet. Link this distributor to products and create invoices to see analytics.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── PRODUCT SALES TAB ───────────────────────── */}
                            {tab === 'sales' && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: C.textS, marginBottom: '1rem' }}>Sales revenue and units per product from this distributed source.</div>
                                    {productSales.length === 0 ? (
                                        <Empty text="No product sales linked to this distributor." C={C} />
                                    ) : (
                                        <>
                                            <div style={{ background: C.bgDeep, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${C.border}`, marginBottom: '1rem' }}>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <BarChart data={productSales} barSize={28} barGap={8}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                                                        <XAxis dataKey="name" tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                        <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                                                        <Legend wrapperStyle={{ fontSize: '0.8rem', color: C.textS }} />
                                                        <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                                                        <Bar dataKey="Units" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Units Sold" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Table breakdown */}
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: C.bgDeep }}>
                                                        {['Product', 'Revenue', 'Units Sold'].map(h => (
                                                            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: C.textS, fontWeight: '700', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(data.productSalesBreakdown || []).map((p, i) => (
                                                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                            <td style={{ padding: '0.65rem 0.75rem', color: C.textH, fontWeight: '600' }}>{p.productName}</td>
                                                            <td style={{ padding: '0.65rem 0.75rem', color: '#10b981', fontWeight: '700' }}>${Number(p.totalSales || 0).toLocaleString()}</td>
                                                            <td style={{ padding: '0.65rem 0.75rem', color: '#3b82f6', fontWeight: '700' }}>{Number(p.totalUnitsSold || 0).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ── MONTHLY TREND TAB ───────────────────────── */}
                            {tab === 'trend' && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: C.textS, marginBottom: '1rem' }}>Monthly sales revenue trend from this distributor's products.</div>
                                    {monthlySales.length === 0 ? (
                                        <Empty text="No monthly sales data available yet." C={C} />
                                    ) : (
                                        <div style={{ background: C.bgDeep, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${C.border}` }}>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <LineChart data={monthlySales}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                                                    <XAxis dataKey="name" tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={customTooltipStyle} />
                                                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: C.textS }} />
                                                    <Line type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} name="Revenue ($)" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── INVENTORY TAB ───────────────────────────── */}
                            {tab === 'inventory' && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: C.textS, marginBottom: '1rem' }}>Current warehouse stock count per product from this distributor.</div>
                                    {inventoryData.length === 0 ? (
                                        <Empty text="No stock found for this distributor's products." C={C} />
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div style={{ background: C.bgDeep, borderRadius: '0.75rem', border: `1px solid ${C.border}`, padding: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS, marginBottom: '0.75rem' }}>Inventory Share</div>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <PieChart>
                                                        <Pie data={inventoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: C.axis }} fontSize={10}>
                                                            {inventoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                        </Pie>
                                                        <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v} units`, 'Stock']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div style={{ background: C.bgDeep, borderRadius: '0.75rem', border: `1px solid ${C.border}`, padding: '1rem', overflowY: 'auto', maxHeight: '280px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS, marginBottom: '0.75rem' }}>Stock per Product</div>
                                                {(data.inventoryBreakdown || []).map((p, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: `1px solid ${C.border}` }}>
                                                        <span style={{ fontSize: '0.85rem', color: C.textH, fontWeight: '600' }}>{p.productName}</span>
                                                        <span style={{ color: COLORS[i % COLORS.length], fontWeight: '800', fontSize: '0.9rem' }}>{Number(p.totalStock || 0).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ─ Footer ─ */}
                <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '0.6rem 1.75rem', background: 'transparent', border: `1px solid ${C.border}`, color: C.textH, borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
}

function StatCard({ icon, label, value, color, bg, border, textS }) {
    return (
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.07, color }}>{icon}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: textS, marginBottom: '0.35rem' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color, lineHeight: 1 }}>{value}</div>
        </div>
    );
}

function Empty({ text, C }) {
    return (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.textS, background: C.bgDeep, borderRadius: '0.75rem', border: `1px solid ${C.border}` }}>
            📊 {text}
        </div>
    );
}
