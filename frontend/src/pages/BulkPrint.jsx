import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Search, Calendar, RefreshCcw, FileText, User, Hash, Barcode, Truck, RotateCcw } from 'lucide-react';

const BulkPrint = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesmanId, setSalesmanId] = useState('');
    const [routeId, setRouteId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [salesmen, setSalesmen] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [customerGroups, setCustomerGroups] = useState([]);
    const [generated, setGenerated] = useState(false);

    useEffect(() => {
        axios.get('/api/v1/Salesmen').then(res => setSalesmen(res.data || [])).catch(() => {});
        axios.get('/api/v1/Routes').then(res => setRoutes(res.data || [])).catch(() => {});
        axios.get('/api/v1/Vehicles').then(res => setVehicles(res.data || [])).catch(() => {});
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
    }, []);

    const fetchBulkData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (salesmanId) params.append('salesmanId', salesmanId);
            if (routeId) params.append('routeId', routeId);
            if (vehicleId) params.append('vehicleId', vehicleId);
            
            const res = await axios.get(`/api/v1/Invoices/bulk-print?${params.toString()}`);
            setCustomerGroups(res.data);
            setGenerated(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to fetch bulk print data.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto  pb-20">
            {/* Header & Controls — Hidden on Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="p-2 border border-[var(--border)] rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Back to Invoices">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl"><Printer size={20}/></div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] italic">Batch Generation</span>
                        </div>
                        <h1 className="text-3xl font-bold uppercase italic tracking-tighter text-[var(--text-main)]">
                            Bulk Delivery <span className="text-primary not-italic">Print</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Filters Panel — Hidden on Print */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 print:hidden">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 italic flex items-center gap-2"><Calendar size={12}/> Configuration Panel</p>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Salesman</label>
                        <select value={salesmanId} onChange={e => setSalesmanId(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] font-bold appearance-none">
                            <option value="">All Salesmen</option>
                            {salesmen.map(s => <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Route</label>
                        <select value={routeId} onChange={e => setRouteId(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] font-bold appearance-none">
                            <option value="">All Routes</option>
                            {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.routeName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Vehicle</label>
                        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] font-bold appearance-none">
                            <option value="">All Vehicles</option>
                            {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleNumber}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchBulkData} disabled={loading} className="w-full bg-primary text-slate-900 px-6 py-3 font-bold uppercase text-xs rounded-xl shadow hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            {loading ? <RefreshCcw size={16} className="animate-spin"/> : <Search size={16}/>}
                            {loading ? 'Fetching...' : 'Generate Documents'}
                        </button>
                    </div>
                </div>
            </div>

            {generated && (
                <div className="print:hidden flex justify-between items-center bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)]">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] italic">Ready for Print</h3>
                        <p className="text-sm font-bold text-[var(--text-muted)] mt-1">{customerGroups.reduce((acc, g) => acc + g.invoices.length, 0)} total invoices generated.</p>
                    </div>
                    <button onClick={handlePrint} className="bg-slate-800 border border-[var(--border)] text-white px-8 py-4 font-bold uppercase text-sm rounded-xl shadow-sm hover:bg-slate-700 flex items-center gap-2 transition-transform hover:scale-105">
                        <Printer size={18}/> Print All Documents
                    </button>
                </div>
            )}

            {/* Printable Area - Renders each INVOICE as a separate page */}
            <div className="hidden print:block printable-area bg-white text-black">
                {customerGroups.length === 0 && generated ? (
                    <div className="text-center p-10 font-bold text-black">No delivery invoices found for the selected criteria.</div>
                ) : (
                    <>
                        {/* Page 1: Cumulative Loading Summary */}
                        {(() => {
                            const aggregatedItems = {};
                            customerGroups.forEach(group => {
                                group.invoices.forEach(inv => {
                                    inv.items.forEach(item => {
                                        if (!aggregatedItems[item.productId]) {
                                            aggregatedItems[item.productId] = {
                                                productName: item.productName || 'Unknown Product',
                                                quantity: 0
                                            };
                                        }
                                        aggregatedItems[item.productId].quantity += item.quantity;
                                    });
                                });
                            });
                            const summaryItems = Object.values(aggregatedItems).sort((a,b) => a.productName.localeCompare(b.productName));

                            return (
                                <div className="invoice-page outline-none bg-white p-8 max-w-[210mm] w-full mx-auto border border-gray-200 print:border-none print:p-0 print:shadow-none" style={{ pageBreakAfter: 'always' }}>
                                    <div className="flex justify-between border-b-2 border-black pb-6 mb-8 mt-4">
                                        <div className="flex flex-col justify-end">
                                            <h2 className="text-4xl font-extrabold tracking-widest uppercase m-0 text-black">LOADING SUMMARY</h2>
                                            <p className="text-sm font-bold mt-2 text-black m-0 tracking-wide uppercase">CUMULATIVE DELIVERY SHEET</p>
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-3xl font-bold uppercase text-black m-0 tracking-tight">Hamdaan Traders</h1>
                                            <div className="mt-3">
                                                <p className="text-sm text-black m-0"><span className="font-bold">Date Range:</span> {startDate ? new Date(startDate).toLocaleDateString() : 'All'} to {endDate ? new Date(endDate).toLocaleDateString() : 'All'}</p>
                                                <p className="text-sm text-black m-0"><span className="font-bold">Total Invoices:</span> {customerGroups.reduce((acc, g) => acc + g.invoices.length, 0)}</p>
                                                <p className="text-sm text-black m-0"><span className="font-bold">Total Unique Products:</span> {summaryItems.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold uppercase text-black mb-4 border-b border-black pb-2">Consolidated Product Quantities</h3>
                                    
                                    <table className="w-full text-left mb-8 border-collapse border-2 border-black" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr className="border-b-2 border-black bg-gray-100" style={{ backgroundColor: '#f3f4f6', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs">S.No</th>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs w-2/3">Product Description</th>
                                                <th className="p-3 font-bold text-black uppercase text-xs text-center">Total Quantity Required</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryItems.length > 0 ? summaryItems.map((item, idx) => (
                                                <tr key={idx} className="border-b border-black">
                                                    <td className="p-3 border-r-2 border-black text-sm font-bold text-center w-16">{idx + 1}</td>
                                                    <td className="p-3 border-r-2 border-black text-sm font-bold uppercase">{item.productName}</td>
                                                    <td className="p-3 text-lg font-bold text-black text-center bg-gray-50" style={{ backgroundColor: '#f9fafb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} >{item.quantity} PCS</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="p-6 text-center text-black font-bold">No products found.</td></tr>
                                            )}
                                        </tbody>
                                        {summaryItems.length > 0 && (
                                            <tfoot>
                                                <tr className="border-t-4 border-double border-black bg-gray-200" style={{ backgroundColor: '#e5e7eb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                    <td colSpan="2" className="p-3 border-r-2 border-black text-sm font-bold text-right uppercase text-black">Grand Total Quantity:</td>
                                                    <td className="p-3 text-xl font-bold text-black text-center">{summaryItems.reduce((acc, item) => acc + item.quantity, 0)} PCS</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>

                                    <div className="mt-16 pt-8 border-t-2 border-black border-dashed flex justify-between items-end px-10">
                                        <div className="text-center">
                                            <p className="text-xs font-bold uppercase text-black tracking-widest border-t border-black pt-2 w-48">Prepared By (Warehouse)</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold uppercase text-black tracking-widest border-t border-black pt-2 w-48">Verified By (Loader)</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Subsequent Pages: Actual Invoices */}
                        {customerGroups.flatMap((group) =>
                        group.invoices.map((inv) => {
                            const isDelivery = !!inv.deliveryDate;
                            const invoiceType = isDelivery ? "Delivery" : "Spot";
                            const subtotal = inv.items.reduce((sum, item) => sum + item.totalPrice, 0);
                            
                            return (
                                <div key={`${group.customer.customerId}-${inv.invoiceId}`} className="invoice-page outline-none bg-white p-8 max-w-[210mm] w-full mx-auto border border-gray-200 print:border-none print:p-0 print:shadow-none" style={{ pageBreakAfter: 'always' }}>
                                    {/* Professional Header */}
                                    <div className="flex justify-between border-b-2 border-black pb-6 mb-6">
                                        <div className="flex flex-col justify-between">
                                            <h2 className="text-4xl font-extrabold tracking-widest uppercase m-0 text-black">INVOICE</h2>
                                            <div className="mt-4">
                                                <p className="text-sm font-bold mt-1 text-black m-0 mb-1">Invoice #: {inv.invoiceNumber || `INV-${inv.invoiceId}`}</p>
                                                <p className="text-sm text-black m-0 mb-1"><span className="font-bold">Date:</span> {new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                                {isDelivery && <p className="text-sm text-black m-0"><span className="font-bold">Delivery Date:</span> {new Date(inv.deliveryDate).toLocaleDateString()}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-3xl font-bold uppercase text-black m-0 tracking-tight">Hamdaan Traders</h1>
                                            <p className="text-sm text-gray-800 font-bold m-0 mt-1 uppercase tracking-wide">Distributors & General Order Suppliers</p>
                                            <div className="mt-3">
                                                <p className="text-sm text-gray-800 m-0">123 Logistics Way, Suite A</p>
                                                <p className="text-sm text-gray-800 m-0">contact@hamdaantraders.com</p>
                                                <p className="text-sm text-gray-800 m-0 font-medium">+1 (555) 123-4567</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Customer Details */}
                                    <div className="flex justify-between mb-8 bg-gray-50 p-4 border border-black" style={{ backgroundColor: '#f9fafb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                        <div>
                                            <h3 className="font-bold text-black text-xs uppercase mb-2 tracking-wider">Billed To:</h3>
                                            <p className="font-bold text-black text-xl uppercase leading-tight m-0 mb-1">{group.customer.customerName}</p>
                                            <p className="text-sm text-black m-0 mb-1">📍 {group.customer.address || 'No address provided'}</p>
                                            <p className="text-sm text-black m-0">📞 {group.customer.phone}</p>
                                        </div>
                                        <div className="text-right flex flex-col justify-end">
                                            <div className="mb-2">
                                                <p className="text-sm text-black m-0"><span className="font-bold uppercase text-xs mr-2">Type:</span> <span className="font-medium bg-black text-white px-2 py-0.5 rounded text-xs">{invoiceType}</span></p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-black m-0"><span className="font-bold uppercase text-xs mr-2">Sales Rep:</span> <span className="font-medium">{inv.salesmanName || 'N/A'}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Table */}
                                    <table className="w-full text-left mb-8 border-collapse border-2 border-black" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr className="border-b-2 border-black bg-gray-100" style={{ backgroundColor: '#f3f4f6', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs">Item Description</th>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-24">Variant</th>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-20">Size</th>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-16">Qty</th>
                                                <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-right w-28">Rate</th>
                                                <th className="p-3 font-bold text-black uppercase text-xs text-right w-32">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inv.items.map((item, itemIdx) => (
                                                <tr key={itemIdx} className="border-b border-black">
                                                    <td className="p-3 border-r-2 border-black text-sm font-medium">{item.productName || 'Unknown Product'}</td>
                                                    <td className="p-3 border-r-2 border-black text-sm text-center text-gray-700">-</td>
                                                    <td className="p-3 border-r-2 border-black text-sm text-center text-gray-700">-</td>
                                                    <td className="p-3 border-r-2 border-black text-sm text-center font-bold">{item.quantity}</td>
                                                    <td className="p-3 border-r-2 border-black text-sm text-right">Rs. {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-sm text-right font-bold w-32">Rs. {Number(item.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                            {/* Empty rows to fill space if few items */}
                                            {(!inv.items || inv.items.length < 3) && (
                                                Array.from({ length: 3 - (inv.items?.length || 0) }).map((_, i) => (
                                                    <tr key={`empty-${i}`} className="border-b border-gray-300">
                                                        <td className="p-6 border-r-2 border-black"></td>
                                                        <td className="p-6 border-r-2 border-black"></td>
                                                        <td className="p-6 border-r-2 border-black"></td>
                                                        <td className="p-6 border-r-2 border-black"></td>
                                                        <td className="p-6 border-r-2 border-black"></td>
                                                        <td className="p-6"></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                    
                                    {/* Totals Section */}
                                    <div className="flex justify-end mb-16">
                                        <div className="w-80">
                                            <div className="flex justify-between py-2 border-b border-black">
                                                <span className="text-sm font-bold text-black uppercase">Subtotal:</span>
                                                <span className="text-sm font-bold text-black">Rs. {Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-black">
                                                <span className="text-sm font-bold text-black uppercase">Discount:</span>
                                                <span className="text-sm font-bold text-black">Rs. {Number(inv.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between py-3 border-b-4 border-black border-double mt-1 bg-gray-50 px-2" style={{ backgroundColor: '#f9fafb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                <span className="text-xl font-bold uppercase text-black">Net Total:</span>
                                                <span className="text-xl font-bold text-black">Rs. {Number(inv.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 flex justify-between items-end border-t-2 border-black pt-8">
                                        <div className="w-1/2">
                                            <p className="text-xs text-black font-bold uppercase mb-2 tracking-wider">Notes / Terms & Conditions:</p>
                                            <ol className="text-xs text-gray-800 m-0 pl-4 list-decimal space-y-1 font-medium">
                                                <li>Goods once sold will not be taken back.</li>
                                                <li>All claims must be made within 3 days of delivery.</li>
                                                <li>Make all checks payable to Hamdaan Traders.</li>
                                            </ol>
                                            <p className="text-sm text-black font-bold italic mt-4">Thank you for your business!</p>
                                        </div>
                                        <div className="w-64 text-center">
                                            <div className="border-t-2 border-black mb-2 border-dashed"></div>
                                            <p className="text-xs font-bold uppercase text-black m-0 tracking-wider">Authorized Signature & Stamp</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    </>
                )}
            </div>
            
            {/* Visual Preview Mode - for screen only */}
            {generated && customerGroups.length > 0 && (
                <div className="print:hidden space-y-8">
                    <p className="text-center text-[var(--text-muted)] font-bold uppercase text-sm tracking-widest italic animate-pulse">Preview Mode - Use 'Print' to generate full documents</p>
                    
                    {/* Render first invoice as preview */}
                    {(() => {
                        const firstGroup = customerGroups[0];
                        if(!firstGroup.invoices || firstGroup.invoices.length === 0) return null;
                        const firstInv = firstGroup.invoices[0];
                        const isDelivery = !!firstInv.deliveryDate;
                        const invoiceType = isDelivery ? "Delivery" : "Spot";
                        
                        return (
                            <div className="bg-white text-black p-8 mx-auto border border-gray-200 shadow-sm rounded-sm pointer-events-none transform scale-90 sm:scale-100 origin-top overflow-hidden" style={{ maxWidth: '210mm' }}>
                                {/* Shared Preview Template */}
                                <div className="flex justify-between border-b-2 border-black pb-6 mb-6">
                                    <div className="flex flex-col justify-between">
                                        <h2 className="text-4xl font-extrabold tracking-widest uppercase m-0 text-black">INVOICE</h2>
                                        <div className="mt-4">
                                            <p className="text-sm font-bold mt-1 text-black m-0 mb-1">Invoice #: {firstInv.invoiceNumber || `INV-${firstInv.invoiceId}`}</p>
                                            <p className="text-sm text-black m-0 mb-1"><span className="font-bold">Date:</span> {new Date(firstInv.invoiceDate).toLocaleDateString()}</p>
                                            {isDelivery && <p className="text-sm text-black m-0"><span className="font-bold">Delivery Date:</span> {new Date(firstInv.deliveryDate).toLocaleDateString()}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-3xl font-bold uppercase text-black m-0 tracking-tight">Hamdaan Traders</h1>
                                        <p className="text-sm text-gray-800 font-bold m-0 mt-1 uppercase tracking-wide">Distributors & General Order Suppliers</p>
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-800 m-0">123 Logistics Way, Suite A</p>
                                            <p className="text-sm text-gray-800 m-0">contact@hamdaantraders.com</p>
                                            <p className="text-sm text-gray-800 m-0 font-medium">+1 (555) 123-4567</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center text-gray-400 font-bold italic py-20 border-2 border-dashed border-gray-200 mt-10">
                                    <p className="text-xl">(Document Layout Rendering Template)</p>
                                    <p className="text-sm mt-2">{customerGroups.reduce((acc, g) => acc + g.invoices.length, 0)} Total Invoices Ready to Print</p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default BulkPrint;
