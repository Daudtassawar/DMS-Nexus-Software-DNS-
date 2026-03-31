import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Search, ArrowLeft, CheckCircle, User, ShoppingCart, Calculator, Hash, RotateCcw, Info, Package, DollarSign, Target, Zap, Activity, ShieldAlert, Layers, UserCircle } from 'lucide-react';
import invoiceService from '../services/invoiceService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import salesmanService from '../services/salesmanService';
import routeService from '../services/routeService';
import vehicleService from '../services/vehicleService';
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
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [customerId, setCustomerId] = useState('');
    const [salesmanId, setSalesmanId] = useState('');
    const [routeId, setRouteId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [invoiceType, setInvoiceType] = useState('Spot');
    
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);


    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [c, p, s, r, v] = await Promise.all([
                    customerService.getAll(),
                    productService.getAll(),
                    salesmanService.getSalesmen(),
                    routeService.getAll(),
                    vehicleService.getAll()
                ]);
                setCustomers(c || []);
                setProducts(p || []);
                setSalesmen(s || []);
                setRoutes(r || []);
                setVehicles(v || []);

                if (isEdit) {
                    const inv = await invoiceService.getById(id);
                    setCustomerId(inv.customerId.toString());
                    setSalesmanId(inv.salesmanId?.toString() || '');
                    setRouteId(inv.routeId?.toString() || '');
                    setVehicleId(inv.vehicleId?.toString() || '');
                    setDiscount(inv.discount);
                    setPaidAmount(inv.paidAmount || 0);
                    setNotes(inv.notes || '');
                    setDeliveryDate(inv.deliveryDate ? inv.deliveryDate.split('T')[0] : '');
                    setInvoiceType(inv.invoiceType || 'Spot');
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
            (p.productName?.toLowerCase() || '').includes(q) ||
            (p.barcode?.toLowerCase() || '').includes(q)
        ).slice(0, 8);
        setFilteredProducts(results);
        setShowDropdown(results.length > 0);
    }, [productSearch, products]);

    const getDropdownStyle = () => {
        if (!searchRef.current) return { display: 'none' };
        const rect = searchRef.current.getBoundingClientRect();
        // If the rect is zero-sized, hide the dropdown
        if (rect.width === 0 || rect.height === 0) return { display: 'none' };
        
        const style = {
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 99999,
            pointerEvents: 'auto'
        };
        console.log('Dropdown Style:', style);
        return style;
    };

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
    const remainingTotal = Math.max(0, netTotal - (parseFloat(paidAmount) || 0));

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
                paidAmount: parseFloat(paidAmount) || 0,
                notes: notes,
                deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,
                routeId: routeId ? parseInt(routeId) : null,
                vehicleId: vehicleId ? parseInt(vehicleId) : null,
                invoiceType: invoiceType,
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
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-md flex items-center justify-center shadow-md border-4 border-emerald-200">
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
        <div className="max-w-[1700px] mx-auto space-y-6 animate-fade-in pb-20">
            {/* Header / Command Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                   <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-[var(--text-muted)] font-medium text-sm hover:text-[var(--primary)] transition-all mb-4 group/back">
                        <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform"/> Back to Invoices
                    </button>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">
                       {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage transaction details and inventory allocation.</p>
                </div>
                
                <div className="bg-[var(--primary)] px-6 py-4 rounded-lg flex items-center gap-6 shadow-sm border border-[var(--primary-hover)]">
                    <div>
                        <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Net Total</div>
                        <div className="text-2xl font-bold text-white tabular-nums">Rs.{netTotal.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-md text-white"><DollarSign size={20}/></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-3 shadow-sm"> <ShieldAlert size={20}/> {error}</div>}

                {/* Parameters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AppCard p0 title="Customer Information" className="border-t-4 border-t-blue-500">
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--text-main)]">Select Customer</label>
                                <select required value={customerId} onChange={e => setCustomerId(e.target.value)}
                                    className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none cursor-pointer">
                                    <option value="">-- Select Client --</option>
                                    {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.customerName}</option>)}
                                </select>
                            </div>
                            {selectedCustomer && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Current Balance</p>
                                        <h4 className="text-lg font-bold text-red-700 tabular-nums">Rs.{selectedCustomer.balance?.toLocaleString()}</h4>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Empty Crates</p>
                                        <h4 className="text-lg font-bold text-blue-700 tabular-nums">{selectedCustomer.emptyCratesBalance || 0} PCS</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AppCard>

                    <AppCard p0 title="Order Details" className="border-t-4 border-t-[var(--primary)]">
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[var(--text-main)]">Assign Salesman</label>
                                <select value={salesmanId} onChange={e => setSalesmanId(e.target.value)}
                                    className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none cursor-pointer">
                                    <option value="">-- Select Salesman --</option>
                                    {salesmen.map(s => <option key={s.salesmanId} value={s.salesmanId}>{s.name} [{s.area}]</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-main)]">Invoice Type</label>
                                    <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)}
                                        className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none cursor-pointer">
                                        <option value="Spot">Spot (Instant)</option>
                                        <option value="Delivery">Delivery (Scheduled)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-main)]">Delivery Date</label>
                                    <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-main)]">Route</label>
                                    <select value={routeId} onChange={e => setRouteId(e.target.value)}
                                        className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none cursor-pointer">
                                        <option value="">-- Select Route --</option>
                                        {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.routeName}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-[var(--text-main)]">Vehicle</label>
                                    <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
                                        className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all text-sm outline-none cursor-pointer">
                                        <option value="">-- Select Vehicle --</option>
                                        {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleNumber}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </AppCard>
                </div>

                {/* Inventory Matrix */}
                <AppCard p0 title="Inventory Items" className="relative z-50 border-t-4 border-t-emerald-500">
                    <div className="p-6 space-y-4">
                        <div className="relative" ref={searchRef}>
                            <AppInput 
                                placeholder="Search products by name or barcode..."
                                value={productSearch}
                                onChange={e => {
                                    setProductSearch(e.target.value);
                                    if (e.target.value.trim().length > 0) setShowDropdown(true);
                                }}
                                onFocus={() => { if (productSearch.trim().length > 0) setShowDropdown(true); }}
                                icon={Search}
                                className="!bg-[var(--bg-app)]"
                            />
                            {showDropdown && filteredProducts.length > 0 && createPortal(
                                <div className="fixed inset-0 z-[99998]" onClick={() => setShowDropdown(false)}>
                                  <div style={{...getDropdownStyle(), border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)'}} onClick={e => e.stopPropagation()} className="shadow-xl divide-y divide-[var(--border)] animate-fade-in max-h-[400px] overflow-y-auto">
                                      {filteredProducts.map(p => (
                                          <div key={p.productId} onClick={() => addProduct(p)} className="p-4 flex justify-between items-center hover:bg-[var(--secondary)] cursor-pointer transition-all">
                                              <div className="flex items-center gap-4">
                                                <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md"><ShoppingCart size={18}/></div>
                                                <div>
                                                    <h5 className="font-semibold text-sm text-[var(--text-main)]">{p.productName}</h5>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{p.brand || 'General'}</span>
                                                      <span className="text-[10px] text-[var(--text-muted)]">•</span>
                                                      <span className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">{p.category}</span>
                                                    </div>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                  <h4 className="text-[var(--primary)] font-bold text-base tabular-nums">Rs.{p.salePrice.toLocaleString()}</h4>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                </div>,
                                document.body
                            )}
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="overflow-x-auto border-t border-[var(--border)]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--secondary)]/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-[var(--text-muted)] text-center w-48 uppercase tracking-wider">Unit Price</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-[var(--text-muted)] text-center w-32 uppercase tracking-wider">Qty</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-[var(--primary)] text-center w-32 uppercase tracking-wider">Returns</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-[var(--text-muted)] text-right uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {items.map((item, i) => (
                                        <tr key={i} className="hover:bg-[var(--secondary)]/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <h5 className="font-semibold text-sm text-[var(--text-main)]">{item.productName}</h5>
                                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-tight">ID: #{item.productId}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">Rs.</span>
                                                  <input type="number" step="0.01" value={item.unitPrice} onChange={e => changePrice(i, e.target.value)}
                                                      className="w-full pl-10 pr-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-right font-medium text-sm tabular-nums" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="number" min="1" value={item.quantity} onChange={e => changeQty(i, e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-center font-medium text-sm tabular-nums" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input type="number" min="0" value={item.returnedQuantity} onChange={e => changeReturn(i, e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded focus:ring-2 focus:ring-red-200 outline-none text-center font-medium text-sm tabular-nums" />
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-sm tabular-nums text-[var(--text-main)]">
                                                Rs.{item.lineTotal.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" onClick={() => removeItem(i)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                                    <Trash2 size={18}/>
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
                {/* Economic Reconciliation */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    <AppCard p0 title="Order Notes" className="lg:col-span-3 border-t-4 border-t-orange-500">
                        <div className="p-6">
                          <textarea rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any special instructions or observations..."
                              className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] outline-none text-sm resize-none" />
                        </div>
                    </AppCard>
                    
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-md p-8 shadow-sm">
                           <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center opacity-70">
                                        <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                                        <span className="font-bold text-lg tabular-nums">Rs.{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Discount</span>
                                        <div className="relative w-32">
                                          <input type="number" step="0.01" placeholder="0.00" value={discount} onChange={e => setDiscount(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border)] rounded focus:ring-2 focus:ring-[var(--primary)] outline-none text-right font-bold text-sm text-[var(--primary)]" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Paid Amount</span>
                                        <div className="relative w-32">
                                          <input type="number" step="0.01" placeholder="0.00" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border)] rounded focus:ring-2 focus:ring-emerald-500 outline-none text-right font-bold text-sm text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-[var(--border)] space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h5 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] mb-1">Net Payable</h5>
                                            <h2 className="text-4xl font-bold tabular-nums">Rs.{netTotal.toLocaleString()}</h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Balance</p>
                                            <p className="text-xl font-bold tabular-nums text-[var(--text-muted)]">Rs.{remainingTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                      type="submit" 
                                      disabled={submitting || items.length === 0} 
                                      className="w-full py-4 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                          <>
                                            <Activity size={18} className="animate-spin"/>
                                            <span>Processing...</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle size={18}/>
                                            <span>{isEdit ? 'Update Invoice' : 'Create Invoice'}</span>
                                          </>
                                        )}
                                    </button>
                                </div>
                           </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                          <Info size={20} className="text-blue-500 shrink-0 mt-0.5"/>
                          <p className="text-xs text-blue-700 leading-relaxed font-medium">Finalizing this invoice will update stock levels and customer credit limits immediately.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
