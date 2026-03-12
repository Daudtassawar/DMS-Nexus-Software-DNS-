import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import salesmanService from '../services/salesmanService';
import { TrendingUp, Target, DollarSign, Award } from 'lucide-react';

export default function SalesmanPerformanceModal({ isOpen, onClose, salesmanId, titleName }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Default to current month/year
    const d = new Date();
    const [month, setMonth] = useState(d.getMonth() + 1);
    const [year, setYear] = useState(d.getFullYear());

    const dark = document.documentElement.getAttribute('data-theme') === 'dark';

    const C = {
        dialog:    dark ? '#1e293b' : '#ffffff',
        section:   dark ? '#0f172a' : '#f8fafc',
        border:    dark ? '#334155' : '#e2e8f0',
        textMain:  dark ? '#f1f5f9' : '#0f172a',
        textSub:   dark ? '#94a3b8' : '#64748b',
        textHead:  dark ? '#e2e8f0' : '#1e293b',
        headerBg:  dark ? '#1e293b' : '#ffffff',
    };

    const fetchPerformance = async () => {
        setLoading(true); setError('');
        try {
            const data = await salesmanService.getSalesmanPerformance(salesmanId, year, month);
            setStats(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load performance metrics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && salesmanId) {
            document.documentElement.style.overflow = 'hidden';
            fetchPerformance();
        }
        return () => { document.documentElement.style.overflow = ''; };
    }, [isOpen, salesmanId, month, year]);

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
        <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '1rem' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.dialog, borderRadius: '0.875rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: C.headerBg, zIndex: 2, borderRadius: '0.875rem 0.875rem 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{width: 40, height: 40, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: C.textHead }}>Target Dashboard</h3>
                            <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: C.textSub, fontWeight: 500 }}>Performance for <strong style={{color: C.textMain}}>{titleName}</strong></p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: C.section, color: C.textSub, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                           <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: C.textSub, marginBottom: '0.4rem', textTransform: 'uppercase'}}>Month</label>
                           <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, background: C.dialog, color: C.textMain}}>
                               {Array.from({length: 12}, (_, i) => (<option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>))}
                           </select>
                        </div>
                        <div style={{ flex: 1 }}>
                           <label style={{display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: C.textSub, marginBottom: '0.4rem', textTransform: 'uppercase'}}>Year</label>
                           <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: `1px solid ${C.border}`, background: C.dialog, color: C.textMain}}>
                               {[0,1,2].map(offset => {
                                   const y = d.getFullYear() - offset;
                                   return <option key={y} value={y}>{y}</option>
                               })}
                           </select>
                        </div>
                    </div>

                    {error ? (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>⚠️ {error}</div>
                    ) : loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: C.textSub }}>⏳ Calculating commissions...</div>
                    ) : stats ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: C.section, borderRadius: '0.75rem', border: `1px solid ${C.border}`, padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.textSub, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    <DollarSign size={16} /> Total Sales Completed
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: C.textMain }}>
                                    ${stats.totalSales.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: C.textSub, marginTop: '0.2rem' }}>
                                    Across {stats.invoicesCount} invoices
                                </div>
                            </div>
                            
                            <div style={{ background: C.section, borderRadius: '0.75rem', border: `1px solid ${C.border}`, padding: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.textSub, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    <Target size={16} /> Monthly Target
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: C.textMain }}>
                                    ${stats.monthlyTarget.toFixed(2)}
                                </div>
                                
                                <div style={{ marginTop: '0.75rem', background: '#e2e8f0', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${Math.min(stats.targetProgressPercentage, 100)}%`, 
                                        height: '100%', 
                                        background: stats.targetProgressPercentage >= 100 ? '#10b981' : '#3b82f6',
                                        transition: 'width 1s ease-out'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <span style={{ color: stats.targetProgressPercentage >= 100 ? '#10b981' : '#3b82f6' }}>{stats.targetProgressPercentage}%</span>
                                    <span style={{ color: C.textSub }}>Progress</span>
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', borderRadius: '0.75rem', border: '1px solid rgba(16,185,129,0.2)', padding: '1.25rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                            <Award size={18} /> Commission Earned
                                        </div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#065f46', lineHeight: 1 }}>
                                            ${stats.commissionEarned.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.5rem', fontWeight: 600 }}>
                                            Calculated at {stats.commissionRate}% base rate
                                        </div>
                                    </div>
                                    {stats.targetProgressPercentage >= 100 && (
                                        <div style={{ background: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            🎉 Target Exceeded!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        modalRoot
    );
}
