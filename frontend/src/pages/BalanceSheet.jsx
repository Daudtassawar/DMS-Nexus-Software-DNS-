import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, Wallet, Briefcase, Calculator, PieChart, ShieldCheck, Activity } from 'lucide-react';
import AppCard from '../components/AppCard';
import AppBadge from '../components/AppBadge';

const BalanceSheet = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchBalanceSheet = async () => {
            try {
                const res = await axios.get('/api/v1/Accounting/balance-sheet');
                setData(res.data);
            } catch (err) {
                console.error("Error fetching balance sheet:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBalanceSheet();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    const fmt = (v) => (v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Landmark className="text-blue-600" size={24}/> Balance Sheet
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Statement of financial position — assets, liabilities and equity.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center min-w-[180px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner's Equity</p>
                    <h2 className="text-2xl font-bold text-slate-900 tabular-nums">Rs. {fmt(data?.equity)}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded border border-emerald-100"><Wallet size={16}/></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Assets</h3>
                    </div>

                    <AppCard className="border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {/* Cash */}
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Wallet size={18}/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Cash &amp; Equivalents</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Liquid capital</p>
                                </div>
                            </div>
                            <span className="text-base font-bold text-emerald-600 tabular-nums">Rs. {fmt(data?.assets?.cash)}</span>
                        </div>
                        {/* Inventory */}
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 border border-blue-100">
                                    <Briefcase size={18}/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Inventory Value</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Stock at purchase cost</p>
                                </div>
                            </div>
                            <span className="text-base font-bold text-blue-600 tabular-nums">Rs. {fmt(data?.assets?.inventory)}</span>
                        </div>
                        {/* Total Assets */}
                        <div className="flex justify-between items-center pt-4">
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Total Assets</p>
                            <h2 className="text-xl font-bold text-emerald-600 tabular-nums">Rs. {fmt(data?.assets?.total)}</h2>
                        </div>
                    </AppCard>
                </div>

                {/* Liabilities Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded border border-red-100"><PieChart size={16}/></div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Liabilities</h3>
                    </div>

                    <AppCard className="border border-slate-200 shadow-sm divide-y divide-slate-100">
                        {/* Accounts Payable */}
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center text-red-600 border border-red-100">
                                    <Activity size={18}/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Accounts Payable</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pending supplier dues</p>
                                </div>
                            </div>
                            <span className="text-base font-bold text-red-600 tabular-nums">Rs. {fmt(data?.liabilities?.accountsPayable)}</span>
                        </div>
                        {/* Accrued Taxes */}
                        <div className="flex justify-between items-center py-4 opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center text-slate-500 border border-slate-200">
                                    <ShieldCheck size={18}/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Accrued Taxes</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reserved for settlement</p>
                                </div>
                            </div>
                            <span className="text-base font-bold text-slate-500 tabular-nums">Rs. 0.00</span>
                        </div>
                        {/* Total Liabilities */}
                        <div className="flex justify-between items-center pt-4">
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Total Liabilities</p>
                            <h2 className="text-xl font-bold text-red-600 tabular-nums">Rs. {fmt(data?.liabilities?.total)}</h2>
                        </div>
                    </AppCard>

                    {/* Accounting Equation */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                <Calculator size={18}/>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Accounting Equation</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assets = Liabilities + Equity</p>
                            </div>
                        </div>
                        <AppBadge variant="success" size="sm" className="rounded font-bold px-3">Reconciled</AppBadge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;
