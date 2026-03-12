import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Search, ArrowLeft, CheckCircle, User, ShoppingCart, Calculator, Hash, RotateCcw, Info, Package, DollarSign, Target, Zap, Activity, ShieldAlert, Layers, UserCircle } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import salesmanService from '../services/salesmanService';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppBadge from '../components/AppBadge';

export default function CreateInvoice() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesmen, setSalesmen] = useState([]);

    const [customerId, setCustomerId] = useState('');
    const [salesmanId, setSalesmanId] = useState('');
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [c, p, s] = await Promise.all([
                    customerService.getAll(),
                    productService.getAll(),
                    salesmanService.getSalesmen()
                ]);
                setCustomers(c || []);
                setProducts(p || []);
                setSalesmen(s || []);

                if (isEdit) {
                    const inv = await invoiceService.getById(id);
                    setCustomerId(inv.customerId.toString());
                    setSalesmanId(inv.salesmanId?.toString() || '');
                    setDiscount(inv.discount);
                    setNotes(inv.notes || '');
                    setItems(inv.invoiceItems?.map(item => ({
                        productId: item.productId,
                        productName: item.product?.productName || `Product #${item.productId}`,
                        salePrice: item.unitPrice,
                        quantity: item.quantity,
                        returnedQuantity: item.returnedQuantity || 0,
                        unitPrice: item.unitPrice,
                        lineTotal: item.totalPrice,
                    })) || []);
                }
            } catch (err) {
                setError('Registry Access Failure.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEdit]);

    useEffect(() => {
        if (!productSearch.trim()) { setFilteredProducts([]); setShowDropdown(false); return; }
        const q = productSearch.toLowerCase();
        const results = products.filter(p =>
            p.productName?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q)
        ).slice(0, 8);
        setFilteredProducts(results);
        setShowDropdown(results.length > 0);
    }, [productSearch, products]);

    const addProduct = (product) => {
        setProductSearch('');
        setShowDropdown(false);
        const existing = items.findIndex(i => i.productId === product.productId);
        if (existing >= 0) {
            changeQty(existing, items[existing].quantity + 1);
        } else {
            setItems(prev => [...prev, {
                productId: product.productId,
                productName: product.productName,
                salePrice: product.salePrice,
                quantity: 1,
                returnedQuantity: 0,
                unitPrice: product.salePrice,
                lineTotal: product.salePrice,
            }]);
        }
    };

    const changeQty = (i, qty) => {
        const q = Math.max(1, parseInt(qty) || 1);
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: q, lineTotal: item.unitPrice * q } : item));
    };

    const changeReturn = (i, qty) => {
        const q = Math.max(0, parseInt(qty) || 0);
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, returnedQuantity: q } : item));
    };

    const changePrice = (i, price) => {
        const p = Math.max(0, parseFloat(price) || 0);
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, unitPrice: p, lineTotal: p * item.quantity } : item));
    };

    const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const discountAmt = Math.min(parseFloat(discount) || 0, subtotal);
    const netTotal = Math.max(0, subtotal - discountAmt);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!customerId) { setError('Assign target customer for this protocol.'); return; }
        if (items.length === 0) { setError('Minimum one asset required for ledger commitment.'); return; }

        setSubmitting(true);
        try {
            const payload = {
                customerId: parseInt(customerId),
                salesmanId: salesmanId ? parseInt(salesmanId) : null,
                discount: discountAmt,
                totalAmount: subtotal,
                netAmount: netTotal,
                notes: notes,
                invoiceItems: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    returnedQuantity: i.returnedQuantity,
                    unitPrice: i.unitPrice,
                    totalPrice: i.lineTotal,
                })),
            };
            
            let res;
            if (isEdit) res = await invoiceService.update(id, payload);
            else res = await invoiceService.create(payload);
            
            setSuccess(true);
            setTimeout(() => navigate(`/invoices/${isEdit ? id : res.invoiceId}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || `Registry Write Failure. Check inventory availability.`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
        <Activity size={48} className="text-primary animate-spin-slow"/>
        <p className="font-black text-[11px] uppercase tracking-[0.5em] text-[var(--text-muted)] italic">Initializing Transaction Terminal...</p>
      </div>
    );

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in text-center">
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce border-8 border-white/20">
                    <CheckCircle size={64} />
                </div>
                <div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Ledger Committed</h2>
                    <p className="text-emerald-500 mt-4 font-black uppercase tracking-[0.3em] text-[11px] italic">Navigating to Receipt Terminal...</p>
                </div>
            </div>
        );
    }

    const selectedCustomer = customers.find(c => c.customerId === parseInt(customerId));

    return (
        <div className="max-w-[1700px] mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header / Command Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-[var(--bg-card)] p-10 rounded-[3.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                   <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-[var(--text-muted)] font-black uppercase text-[10px] tracking-[0.4em] hover:text-primary transition-all mb-6 group/back italic">
                        <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform"/> ABORT PROTOCOL
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:rotate-12 transition-transform duration-500"><Calculator size={22}/></div>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Requisition Channel</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
                       Transaction <span className="text-primary not-italic">{isEdit ? 'Override' : 'Entry'}</span>
                    </h1>
                </div>
                
                <div className="bg-slate-900 dark:bg-primary/10 px-10 py-6 rounded-[2.5rem] border border-white/5 flex items-center gap-8 shadow-2xl relative z-10">
                    <div>
                        <div className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-1 italic">Net Valuation</div>
                        <div className="text-4xl font-black text-white italic tracking-tighter tabular-nums leading-none">Rs.{netTotal.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20 shrink-0"><DollarSign size={28}/></div>
                </div>
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-bl-[20rem] -mr-40 -mt-40 blur-[100px] pointer-events-none"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {error && <div className="p-6 bg-rose-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-rose-500/20 animate-shake italic"> <ShieldAlert size={24}/> {error}</div>}

                {/* Tactical Parameters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <AppCard p0 className="overflow-hidden border-t-8 border-t-blue-500 group transition-all duration-500 hover:shadow-2xl">
                        <div className="p-8 bg-blue-500/5 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><UserCircle size={18}/></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 italic">Billing Terminal</h3>
                          </div>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Assign target entity</label>
                                <select required value={customerId} onChange={e => setCustomerId(e.target.value)}
                                    className="w-full px-6 py-5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-black text-xl italic outline-none cursor-pointer appearance-none shadow-inner">
                                    <option value="">-- [SELECT CLIENT NODE] --</option>
                                    {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.customerName.toUpperCase()}</option>)}
                                </select>
                            </div>
                            {selectedCustomer && (
                                <div className="grid grid-cols-2 gap-6 animate-slide-up">
                                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl group/stat transition-all hover:bg-rose-500/10">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 italic">Debt Exposure</p>
                                        <h4 className="text-2xl font-black italic text-rose-600 tabular-nums">Rs.{selectedCustomer.balance?.toLocaleString()}</h4>
                                    </div>
                                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl group/stat transition-all hover:bg-blue-500/10">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">Crate Registry</p>
                                        <h4 className="text-2xl font-black italic text-blue-600 tabular-nums">{selectedCustomer.emptyCratesBalance || 0} PCS</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AppCard>

                    <AppCard p0 className="overflow-hidden border-t-8 border-t-primary group transition-all duration-500 hover:shadow-2xl">
                        <div className="p-8 bg-primary/5 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg"><Target size={18}/></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Fulfillment Strategy</h3>
                          </div>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic">Designate field representative</label>
                                <select value={salesmanId} onChange={e => setSalesmanId(e.target.value)}
                                    className="w-full px-6 py-5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-black text-xl italic outline-none cursor-pointer appearance-none shadow-inner">
                                    <option value="">-- [SELECT FIELD REP] --</option>
                                    {salesmen.map(s => <option key={s.salesmanId} value={s.salesmanId}>{s.name.toUpperCase()} [{s.area.toUpperCase()}]</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                              <Info size={20} className="text-primary"/>
                              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-relaxed">Ensure rep availability for the assigned territory node before commitment.</p>
                            </div>
                        </div>
                    </AppCard>
                </div>

                {/* Inventory Matrix */}
                <AppCard p0 className="overflow-hidden shadow-2xl border-t-8 border-t-emerald-500 group transition-all duration-500">
                    <div className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-emerald-600 font-black text-[12px] uppercase tracking-[0.5em] italic">
                               <Package size={20} className="group-hover:rotate-12 transition-transform"/> Inventory Interface
                          </div>
                          <AppBadge variant="info" size="md" className="px-5 py-2 border-none shadow-lg shadow-blue-500/10 italic font-black text-[10px] uppercase tracking-widest !rounded-xl">ACTIVE_NODES: {items.length}</AppBadge>
                        </div>
                        <div className="relative">
                            <AppInput 
                                placeholder="Scan Barcode or Interrogate Asset Hierarchy..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                onFocus={() => filteredProducts.length > 0 && setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                icon={Search}
                                className="!py-6 bg-[var(--bg-app)] !rounded-[2.5rem] !text-2xl shadow-inner border-[var(--border)] italic font-black placeholder:italic"
                            />
                            {showDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-6 bg-[var(--bg-card)] rounded-[3rem] z-[100] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.3)] border border-[var(--border)] divide-y divide-[var(--border)] animate-slide-up">
                                    {filteredProducts.map(p => (
                                        <div key={p.productId} onMouseDown={() => addProduct(p)} className="p-8 flex justify-between items-center hover:bg-primary/5 cursor-pointer transition-all group/item">
                                            <div className="flex items-center gap-6">
                                               <div className="p-4 bg-primary/5 text-primary rounded-2xl group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-white transition-all"><ShoppingCart size={24}/></div>
                                               <div>
                                                  <h5 className="font-black text-xl uppercase tracking-tighter italic text-[var(--text-main)] leading-none">{p.productName}</h5>
                                                  <div className="flex items-center gap-2 mt-2">
                                                    <AppBadge variant="secondary" size="sm" className="px-3 border-none shadow-sm italic font-black text-[9px] uppercase tracking-widest">{p.brand || 'GENERAL'}</AppBadge>
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] opacity-40">|</span>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{p.category}</p>
                                                  </div>
                                               </div>
                                            </div>
                                            <div className="text-right">
                                                <h4 className="text-emerald-500 font-black text-3xl italic tracking-tighter tabular-nums leading-none">Rs.{p.salePrice}</h4>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 italic">Unit yield</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="overflow-x-auto border-t-4 border-[var(--bg-app)]">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--secondary)]/10">
                                    <tr>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] italic">Asset Descriptor</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] text-center w-52 italic">Valuation Matrix</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] text-center w-40 italic">Density</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-primary text-center w-40 italic">Returns</th>
                                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] text-right italic">Yield Delta</th>
                                        <th className="px-10 py-8 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-8 divide-[var(--bg-app)]">
                                    {items.map((item, i) => (
                                        <tr key={i} className="group hover:bg-primary/5 transition-all">
                                            <td className="px-10 py-8">
                                                <h5 className="font-black text-lg uppercase tracking-tighter italic text-[var(--text-main)] leading-none">{item.productName}</h5>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2 italic">MANIFEST: #{item.productId}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="relative group/input">
                                                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xs">Rs.</span>
                                                  <input type="number" step="0.01" value={item.unitPrice} onChange={e => changePrice(i, e.target.value)}
                                                      className="w-full pl-14 pr-6 py-5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl text-center font-black text-xl italic outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <input type="number" min="1" value={item.quantity} onChange={e => changeQty(i, e.target.value)}
                                                    className="w-full px-6 py-5 bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl text-center font-black text-xl italic outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="relative group/input">
                                                    <input type="number" min="0" value={item.returnedQuantity} onChange={e => changeReturn(i, e.target.value)}
                                                        className="w-full px-6 py-5 bg-primary/5 border border-primary/20 rounded-2xl text-center font-black text-xl italic text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                                                    <RotateCcw size={18} className="absolute -top-1 -right-1 text-primary animate-spin-slow opacity-20"/>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <h4 className="text-2xl font-black text-[var(--text-main)] italic tracking-tighter tabular-nums leading-none">Rs.{item.lineTotal.toLocaleString()}</h4>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button type="button" onClick={() => removeItem(i)} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all interactive shadow-sm">
                                                    <Trash2 size={24}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AppCard>

                {/* Economic Reconciliation */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    <AppCard p0 className="lg:col-span-3 min-h-[350px] overflow-hidden group border-t-8 border-t-amber-500 transition-all duration-500 hover:shadow-2xl">
                        <div className="p-8 bg-amber-500/5 border-b border-[var(--border)] flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Layers size={18}/></div>
                          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600 italic">Audit Log & Observations</h3>
                        </div>
                        <div className="p-8">
                          <textarea rows={8} value={notes} onChange={e => setNotes(e.target.value)} placeholder="ENTER MISSION CRITICAL OBSERVATIONS, LOGISTICS BOTTLENECKS, OR DELIVERY SPECIFICATIONS..."
                              className="w-full px-8 py-6 bg-[var(--bg-app)] border border-[var(--border)] rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 outline-none font-black text-sm uppercase tracking-widest resize-none shadow-inner italic placeholder:opacity-30" />
                        </div>
                    </AppCard>
                    
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden text-white group">
                           {/* Dynamic Decorative Elements */}
                           <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
                           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full"></div>
                           
                           <div className="space-y-10 relative z-10">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center opacity-40">
                                        <span className="text-[11px] font-black uppercase tracking-[0.6em] italic">Gross Manifest</span>
                                        <span className="font-black text-xl italic tabular-nums leading-none">Rs.{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.6em] text-primary italic">Promotional Delta</span>
                                        <div className="relative w-44 group/discount">
                                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500 group-hover/discount:text-primary transition-colors">-</span>
                                          <input type="number" step="0.01" placeholder="0.00" value={discount} onChange={e => setDiscount(e.target.value)}
                                            className="w-full pl-10 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-right font-black text-lg italic outline-none focus:ring-4 focus:ring-primary/20 transition-all text-primary shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-12 border-t border-white/5 flex flex-col gap-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#2563EB]"></div>
                                          <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.8em] italic leading-none">Final Economic Reconciliation</h5>
                                        </div>
                                        <h2 className="text-6xl font-black italic tracking-tighter leading-none tabular-nums group-hover:scale-105 transition-transform origin-left duration-500">Rs.{netTotal.toLocaleString()}</h2>
                                    </div>
                                    <button 
                                      type="submit" 
                                      disabled={submitting || items.length === 0} 
                                      className="w-full py-8 rounded-[2.5rem] bg-primary text-white text-[12px] uppercase tracking-[0.5em] font-black shadow-[0_25px_60px_-15px_rgba(37,99,235,0.6)] active:scale-95 transition-all hover:brightness-110 hover:shadow-[0_30px_70px_-10px_rgba(37,99,235,0.7)] disabled:grayscale disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-4 group/btn"
                                    >
                                        {submitting ? (
                                          <>
                                            <Activity size={20} className="animate-spin"/>
                                            <span>COMMITTING PROTOCOL...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Zap size={20} className="group-hover/btn:scale-125 transition-transform"/>
                                            <span>{isEdit ? 'OVERRIDE REQUISITION' : 'COMMIT TRANSACTION'}</span>
                                          </>
                                        )}
                                    </button>
                                </div>
                           </div>
                        </div>

                        <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center gap-5 italic text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                          <ShieldAlert size={28} className="text-primary shrink-0"/>
                          <p>Committing this ledger will trigger immediate stock adjustments and credit exposure updates across the network.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
