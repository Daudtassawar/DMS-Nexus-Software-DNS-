import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import customerService from '../services/customerService';

export default function CustomerDetail({ customerId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payAmount, setPayAmount] = useState('');
    const [payNote, setPayNote] = useState('');
    const [paying, setPaying] = useState(false);
    const [activeTab, setActiveTab] = useState('invoices'); // invoices | payments

    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const C = {
        dialog: dark ? '#1e293b' : '#ffffff',
        section: dark ? '#0f172a' : '#f8fafc',
        border: dark ? '#334155' : '#e2e8f0',
        textH: dark ? '#e2e8f0' : '#1f2937',
        textS: dark ? '#94a3b8' : '#6b7280',
        textP: dark ? '#f1f5f9' : '#111827',
        rowHover: dark ? '#334155' : '#f9fafb',
    };

    useEffect(() => {
        document.documentElement.style.overflow = 'hidden';
        return () => { document.documentElement.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const d = await customerService.getHistory(customerId);
            setData(d);
        } catch { setData(null); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [customerId]);

    const handlePayment = async (e) => {
        e.preventDefault();
        const amt = parseFloat(payAmount);
        if (!amt || amt <= 0) return;
        setPaying(true);
        try {
            await customerService.recordPayment(customerId, amt, payNote);
            setPayAmount(''); setPayNote('');
            await fetchData();
        } catch { alert('Payment failed.'); } finally { setPaying(false); }
    };

    const modalRoot = document.getElementById('modal-root') || document.body;

    const Badge = ({ status }) => {
        const colors = {
            Paid:    { bg: '#dcfce7', color: '#166534' },
            Partial: { bg: '#fef3c7', color: '#92400e' },
            Pending: { bg: '#fee2e2', color: '#991b1b' },
        };
        const c = colors[status] || colors.Pending;
        return (
            <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700', background: c.bg, color: c.color }}>{status}</span>
        );
    };

    const Stat = ({ label, value, color }) => (
        <div style={{ background: C.section, border: `1px solid ${C.border}`, borderRadius: '0.5rem', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: color || C.textH }}>{value}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS, marginTop: '0.15rem' }}>{label}</div>
        </div>
    );

    return createPortal(
        <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '1rem' }}>
            <div onClick={(e) => e.stopPropagation()}
                style={{ background: C.dialog, borderRadius: '0.875rem', width: '100%', maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '1.1rem 1.4rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: C.dialog, zIndex: 2, borderRadius: '0.875rem 0.875rem 0 0' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: C.textH }}>
                            👤 {loading ? 'Loading...' : data?.customerName}
                        </h3>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: C.textS }}>Customer Detail & Transaction History</p>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: C.section, color: C.textS, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: '1.25rem 1.4rem', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: C.textS }}>⏳ Loading history...</div>
                    ) : !data ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>Failed to load customer data.</div>
                    ) : (
                        <>
                            {/* Info Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <Stat label="Total Invoiced" value={`Rs. ${(data.totalInvoiced || 0).toFixed(0)}`} color="#3b82f6" />
                                <Stat label="Total Paid" value={`Rs. ${(data.totalPaid || 0).toFixed(0)}`} color="#10b981" />
                                <Stat label="Outstanding" value={`Rs. ${(data.outstanding || 0).toFixed(0)}`} color={(data.outstanding || 0) > 0 ? '#ef4444' : '#10b981'} />
                                <Stat label="Credit Limit" value={`Rs. ${(data.creditLimit || 0).toFixed(0)}`} color="#8b5cf6" />
                            </div>

                            {/* Contact Block */}
                            <div style={{ background: C.section, border: `1px solid ${C.border}`, borderRadius: '0.6rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '0.5rem 1.5rem' }}>
                                {[['📞 Phone', data.phone], ['📍 Area', data.area || '—'], ['🏠 Address', data.address || '—']].map(([label, val]) => (
                                    <div key={label}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: C.textS }}>{label}</div>
                                        <div style={{ fontWeight: '600', color: C.textP, fontSize: '0.88rem' }}>{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Record Payment Form */}
                            <div style={{ background: C.section, border: `1px solid ${C.border}`, borderRadius: '0.6rem', padding: '1rem 1.2rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textS, marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>💵</span> Record Payment
                                </div>
                                <form onSubmit={handlePayment} style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ flex: '1', minWidth: '120px' }}>
                                        <label style={{ display: 'block', fontSize: '0.71rem', fontWeight: '700', color: C.textS, marginBottom: '0.25rem' }}>Amount (Rs.) *</label>
                                        <input required type="number" step="0.01" min="1" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                                            style={{ width: '100%', padding: '0.55rem 0.75rem', border: `1.5px solid ${C.border}`, borderRadius: '0.4rem', background: dark ? '#1e293b' : '#fff', color: C.textP, boxSizing: 'border-box' }}
                                            placeholder="0.00" />
                                    </div>
                                    <div style={{ flex: '2', minWidth: '180px' }}>
                                        <label style={{ display: 'block', fontSize: '0.71rem', fontWeight: '700', color: C.textS, marginBottom: '0.25rem' }}>Note</label>
                                        <input value={payNote} onChange={e => setPayNote(e.target.value)}
                                            style={{ width: '100%', padding: '0.55rem 0.75rem', border: `1.5px solid ${C.border}`, borderRadius: '0.4rem', background: dark ? '#1e293b' : '#fff', color: C.textP, boxSizing: 'border-box' }}
                                            placeholder="e.g. Cash payment" />
                                    </div>
                                    <button type="submit" disabled={paying} style={{ padding: '0.55rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.4rem', fontWeight: '800', cursor: paying ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                                        {paying ? '⏳...' : '✔ Record'}
                                    </button>
                                </form>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                                {[['invoices', '🧾 Invoices'], ['payments', '💳 Payments']].map(([id, label]) => (
                                    <button key={id} onClick={() => setActiveTab(id)} style={{
                                        padding: '0.45rem 1rem', borderRadius: '0.4rem', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                                        background: activeTab === id ? '#3b82f6' : C.section,
                                        color: activeTab === id ? 'white' : C.textS,
                                    }}>{label} ({id === 'invoices' ? (data.invoices?.length || 0) : data.invoices?.reduce((s, i) => s + (i.payments?.length || 0), 0) || 0})</button>
                                ))}
                            </div>

                            {/* Invoices Tab */}
                            {activeTab === 'invoices' && (
                                data.invoices?.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: C.textS }}>🧾 No invoices yet.</div>
                                ) : (
                                    <div style={{ borderRadius: '0.6rem', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: C.section }}>
                                                    {['Invoice #', 'Date', 'Total', 'Discount', 'Net', 'Status'].map(h => (
                                                        <th key={h} style={{ padding: '0.65rem 0.8rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.invoices?.map(inv => (
                                                    <tr key={inv.invoiceId} style={{ borderBottom: `1px solid ${C.border}` }}
                                                        onMouseOver={e => e.currentTarget.style.background = C.rowHover}
                                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: '700', color: '#3b82f6', fontSize: '0.88rem' }}>{inv.invoiceNumber}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', color: C.textS, fontSize: '0.85rem' }}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', color: C.textP, fontSize: '0.88rem' }}>Rs. {(inv.totalAmount || 0).toFixed(0)}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', color: '#f59e0b', fontSize: '0.88rem' }}>Rs. {(inv.discount || 0).toFixed(0)}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: '800', color: C.textP, fontSize: '0.88rem' }}>Rs. {(inv.netAmount || 0).toFixed(0)}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem' }}><Badge status={inv.paymentStatus} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}

                            {/* Payments Tab */}
                            {activeTab === 'payments' && (() => {
                                const allPayments = data.invoices?.flatMap(i =>
                                    (i.payments || []).map(p => ({ ...p, invoiceNumber: i.invoiceNumber }))
                                ).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
                                return allPayments?.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: C.textS }}>💳 No payments recorded yet.</div>
                                ) : (
                                    <div style={{ borderRadius: '0.6rem', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: C.section }}>
                                                    {['Invoice', 'Date', 'Amount', 'Note'].map(h => (
                                                        <th key={h} style={{ padding: '0.65rem 0.8rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.textS, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allPayments?.map((p, idx) => (
                                                    <tr key={idx} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: '700', color: '#3b82f6', fontSize: '0.85rem' }}>{p.invoiceNumber}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', color: C.textS, fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: '800', color: '#10b981', fontSize: '0.88rem' }}>Rs. {(p.amount || 0).toFixed(0)}</td>
                                                        <td style={{ padding: '0.65rem 0.8rem', color: C.textS, fontSize: '0.85rem' }}>{p.notes || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
}
