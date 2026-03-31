import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, ArrowDownCircle, ArrowUpCircle, TrendingUp, FileText, Filter, Download } from 'lucide-react';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';

const ProfitLossReport = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setDateRange({ start, end });
        fetchData(start, end);
    }, []);

    const fetchData = async (s = dateRange.start, e = dateRange.end) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/Accounting/profit-loss?startDate=${s}&endDate=${e}`);
            setData(res.data);
        } catch (err) {
            console.error("Error fetching P&L:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    const fmt = (v) => (v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const isProfit = (data?.netProfit || 0) >= 0;

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Calculator className="text-blue-600" size={24}/> Profit &amp; Loss Report
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Income statement — revenue, costs, and net profit for the selected period.</p>
                </div>
                <button className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download size={16}/> Export PDF
                </button>
            </div>

            {/* Date Filter */}
            <AppCard className="border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Start Date</label>
                        <input 
                            type="date" value={dateRange.start} 
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">End Date</label>
                        <input 
                            type="date" value={dateRange.end} 
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <AppButton onClick={() => fetchData()} className="rounded-md">
                        <Filter size={16} className="mr-2"/> Apply Filter
                    </AppButton>
                </div>
            </AppCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* P&L Statement */}
                <div className="lg:col-span-2">
                    <AppCard className="border border-slate-200 shadow-sm" p0>
                        {/* Statement Header */}
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Income Statement</h3>
                            <FileText size={16} className="text-slate-400" />
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Revenue */}
                            <div>
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Revenue</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregated from invoices</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-md border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100"><ArrowUpCircle size={15}/></div>
                                        <span className="text-sm font-bold text-slate-900">Gross Sales Revenue</span>
                                    </div>
                                    <span className="font-bold text-blue-600 tabular-nums">Rs. {fmt(data?.revenue)}</span>
                                </div>
                            </div>

                            {/* COGS */}
                            <div>
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Cost of Sales</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock unit cost</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-md border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded border border-amber-100"><TrendingUp size={15}/></div>
                                        <span className="text-sm font-bold text-slate-900">Cost of Goods Sold (COGS)</span>
                                    </div>
                                    <span className="font-bold text-red-600 tabular-nums">-Rs. {fmt(data?.costOfGoodsSold)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 mt-2 bg-emerald-50 border border-emerald-200 rounded-md">
                                    <span className="text-sm font-bold text-slate-900">Gross Profit</span>
                                    <span className="text-base font-bold text-emerald-600 tabular-nums">Rs. {fmt(data?.grossProfit)}</span>
                                </div>
                            </div>

                            {/* Operating Expenses */}
                            <div>
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-600">Operating Expenses</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed &amp; variable costs</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-md border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 text-red-600 rounded border border-red-100"><ArrowDownCircle size={15}/></div>
                                        <span className="text-sm font-bold text-slate-900">General &amp; Admin Expenses</span>
                                    </div>
                                    <span className="font-bold text-red-600 tabular-nums">-Rs. {fmt(data?.operatingExpenses)}</span>
                                </div>
                            </div>

                            {/* Net Profit */}
                            <div className={`p-5 rounded-lg border-2 ${isProfit ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Profit</p>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">After Operating Expenses</h2>
                                    </div>
                                    <div className="text-right">
                                        <h2 className={`text-3xl font-bold tabular-nums ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                            Rs. {fmt(data?.netProfit)}
                                        </h2>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isProfit ? '✓ Surplus' : '⚠ Deficit'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AppCard>
                </div>

                {/* Margin Summary */}
                <AppCard className="border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center mb-6 shadow-inner">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 tabular-nums">{(data?.marginPercent || 0).toFixed(1)}%</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Margin</p>
                        </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Profit Margin Analysis</h4>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-[240px]">
                        You retain <span className="font-bold text-blue-600">{(data?.marginPercent || 0).toFixed(1)}%</span> of every rupee in revenue after all operating expenses are deducted.
                    </p>
                    <div className={`mt-6 w-full p-4 rounded-lg border ${isProfit ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isProfit ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isProfit ? '✓ Profitable Period' : '⚠ Loss Period'}
                        </p>
                    </div>
                </AppCard>
            </div>
        </div>
    );
};

export default ProfitLossReport;
