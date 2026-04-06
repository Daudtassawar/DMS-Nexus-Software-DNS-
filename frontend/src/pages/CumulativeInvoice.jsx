import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Truck, Printer, Search, Calendar, Users2, Package, Layers, BarChart3, RefreshCcw, Download, FileText } from 'lucide-react';
import { ExportService } from '../utils/ExportService';

const CumulativeInvoice = () => {
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
  const [data, setData] = useState(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    axios.get('/api/v1/Salesmen').then(res => setSalesmen(res.data || [])).catch(() => {});
    axios.get('/api/v1/Routes').then(res => setRoutes(res.data || [])).catch(() => {});
    axios.get('/api/v1/Vehicles').then(res => setVehicles(res.data || [])).catch(() => {});
    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (salesmanId) params.append('salesmanId', salesmanId);
      if (routeId) params.append('routeId', routeId);
      if (vehicleId) params.append('vehicleId', vehicleId);
      
      const res = await axios.get(`/api/v1/Invoices/cumulative?${params.toString()}`);
      setData(res.data);
      setGenerated(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items by brand for display
  const groupedItems = data?.items?.reduce((groups, item) => {
    const brand = item.brand || 'General';
    if (!groups[brand]) groups[brand] = [];
    groups[brand].push(item);
    return groups;
  }, {}) || {};

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto  pb-20">
      
      {/* Header — hidden on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 border border-[var(--border)] rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Back to Invoices">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Truck size={20}/></div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] italic">Loading Operations</span>
            </div>
            <h1 className="text-3xl font-bold uppercase italic tracking-tighter text-white">
              Loading <span className="text-primary not-italic">Summary</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Filters Panel — hidden on print */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 print:hidden">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 italic flex items-center gap-2"><Calendar size={12}/> Configuration Panel</p>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#020617] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#020617] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Salesman</label>
            <select value={salesmanId} onChange={e => setSalesmanId(e.target.value)} className="w-full bg-[#020617] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white font-bold appearance-none">
              <option value="">All Salesmen</option>
              {salesmen.map(s => <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Route</label>
            <select value={routeId} onChange={e => setRouteId(e.target.value)} className="w-full bg-[#020617] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white font-bold appearance-none">
              <option value="">All Routes</option>
              {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.routeName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Vehicle</label>
            <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full bg-[#020617] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white font-bold appearance-none">
              <option value="">All Vehicles</option>
              {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleNumber}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generateSummary} disabled={loading} className="w-full bg-primary text-slate-900 px-6 py-3 font-bold uppercase text-xs rounded-xl shadow hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? <RefreshCcw size={16} className="animate-spin"/> : <Search size={16}/>}
              {loading ? 'Calculating...' : 'Generate Summary'}
            </button>
          </div>
        </div>
      </div>

      {generated && data && (
        <>
          {/* Print Header — visible ONLY on print */}
          <div className="hidden print:block mb-6">
            <h1 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px'}}>LOADING SUMMARY</h1>
            <p style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>
              Period: {startDate || 'All'} to {endDate || 'All'} | Generated: {new Date().toLocaleString()}
            </p>
            <hr style={{margin: '12px 0'}}/>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
            <div className="bg-[var(--bg-card)] border border-blue-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Layers size={22}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoices Processed</p>
                <h3 className="text-2xl font-bold text-white">{data.invoiceCount}</h3>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Package size={22}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unique Products</p>
                <h3 className="text-2xl font-bold text-white">{data.totalProducts}</h3>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] border border-amber-500/20 rounded-xl p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><BarChart3 size={22}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Units to Load</p>
                <h3 className="text-2xl font-bold text-white">{data.totalItems}</h3>
              </div>
            </div>
          </div>

          {/* Print & Export Buttons */}
          <div className="flex justify-end gap-3 print:hidden">
            <button onClick={() => {
                const exportData = [];
                Object.entries(groupedItems).forEach(([brand, items]) => {
                    items.forEach(item => {
                        exportData.push({
                            'Brand': brand,
                            'Product Name': item.productName,
                            'Category': item.category,
                            'Quantity': item.totalQuantity,
                            'Returned': item.totalReturned,
                            'Net Amount': item.totalQuantity - item.totalReturned
                        });
                    });
                });
                ExportService.exportToExcel(exportData, 'Cumulative_Loading_Summary');
            }} className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 px-6 py-3 font-bold uppercase text-xs rounded-xl shadow hover:bg-emerald-800/40 flex items-center gap-2 transition-transform hover:scale-105">
              <Download size={16}/> Excel
            </button>
            <button onClick={() => {
                const columns = [
                    { header: 'Brand', key: 'brand' },
                    { header: 'Product', key: 'productName' },
                    { header: 'Category', key: 'category' },
                    { header: 'Total Qty', key: 'qty' },
                    { header: 'Returned', key: 'returned' },
                    { header: 'Net Load', key: 'net' }
                ];
                const exportData = [];
                Object.entries(groupedItems).forEach(([brand, items]) => {
                    items.forEach(item => {
                        exportData.push({
                            brand: brand,
                            productName: item.productName,
                            category: item.category,
                            qty: item.totalQuantity,
                            returned: item.totalReturned,
                            net: item.totalQuantity - item.totalReturned
                        });
                    });
                });
                ExportService.exportToPDF(exportData, columns, 'Cumulative_Loading_Summary', 'Cumulative Delivery Sheet');
            }} className="bg-rose-900/30 border border-rose-500/50 text-rose-400 px-6 py-3 font-bold uppercase text-xs rounded-xl shadow hover:bg-rose-800/40 flex items-center gap-2 transition-transform hover:scale-105">
              <FileText size={16}/> PDF
            </button>
            <button onClick={handlePrint} className="bg-slate-800 border border-[var(--border)] text-white px-6 py-3 font-bold uppercase text-xs rounded-xl shadow hover:bg-slate-700 flex items-center gap-2 transition-transform hover:scale-105">
              <Printer size={16}/> Print Loading Sheet
            </button>
          </div>

          {/* Loading Summary Table — Grouped by Brand */}
          {Object.keys(groupedItems).length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
              <Package size={48} className="mx-auto text-slate-600 mb-4"/>
              <p className="text-slate-500 font-bold uppercase text-sm tracking-widest">No invoice items found for this period</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([brand, items]) => (
              <div key={brand} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm print:shadow-none print:border print:border-gray-300 print:rounded-none print:mb-4">
                <div className="bg-slate-900/50 px-6 py-3 border-b border-[var(--border)] print:bg-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary italic print:text-black">{brand}</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-widest text-slate-400 print:text-black print:text-xs">
                      <th className="p-4 font-bold">Product</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Size / Unit</th>
                      <th className="p-4 font-bold text-right">Quantity</th>
                      <th className="p-4 font-bold text-right">Returned</th>
                      <th className="p-4 font-bold text-right">Net to Load</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)] hover:bg-white/5 transition-colors print:hover:bg-transparent">
                        <td className="p-4 text-white font-bold text-base print:text-black print:text-sm">{item.productName}</td>
                        <td className="p-4 text-slate-400 text-sm print:text-gray-600">{item.category}</td>
                        <td className="p-4">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold uppercase print:bg-transparent print:text-black print:px-0">{item.unit}</span>
                        </td>
                        <td className="p-4 text-right text-white font-bold text-lg tabular-nums print:text-black">{item.totalQuantity}</td>
                        <td className="p-4 text-right text-slate-400 font-bold tabular-nums print:text-gray-500">{item.totalReturned}</td>
                        <td className="p-4 text-right">
                          <span className={`font-bold text-xl tabular-nums ${item.netQuantity >= 50 ? 'text-amber-400 print:text-black print:font-extrabold' : 'text-emerald-400 print:text-black'}`}>
                            {item.netQuantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          {/* Grand Total Footer */}
          {data.items?.length > 0 && (
            <div className="bg-[var(--bg-card)] border-2 border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:border print:border-black print:rounded-none">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:text-black">Grand Total — All Products</p>
                <p className="text-xs text-slate-400 print:text-gray-600">Across {data.invoiceCount} invoices, {data.totalProducts} unique products</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary tabular-nums print:text-black">{data.totalItems}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:text-black">Total Units</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Print-specific styles are now handled globally in index.css */}
    </div>
  );
};

export default CumulativeInvoice;
