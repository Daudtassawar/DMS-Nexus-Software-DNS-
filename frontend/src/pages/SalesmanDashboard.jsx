import React, { useState, useEffect } from 'react';
import { 
    MapPin, Users, FileText, DollarSign, 
    Zap, Activity, Clock, RefreshCw, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';
import { formatCurrency } from '../utils/currencyUtils';

const MetricCard = ({ title, val, icon: Icon, color = 'var(--primary)' }) => (
  <AppCard className="border-t-4 shadow-sm group" style={{ borderTopColor: color }}>
    <div className="flex justify-between items-start">
      <div>
         <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">{title}</p>
         <h3 className="text-2xl font-bold text-[var(--text-main)] tabular-nums">{val}</h3>
      </div>
      <div className="p-3 rounded-md bg-[var(--secondary)] text-[var(--text-muted)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-200">
        <Icon size={20}/>
      </div>
    </div>
  </AppCard>
);

export default function SalesmanDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/v1/salesman/dashboard')
            .then(res => { setData(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
    );

    if (!data) return (
        <div className="text-center mt-20">
            <p className="text-red-500 font-bold">Failed to load dashboard data.</p>
            <AppButton onClick={() => window.location.reload()} className="mt-4">Retry</AppButton>
        </div>
    );

    const percentageVisited = data.totalCustomers > 0 ? (data.visitedCustomers / data.totalCustomers) * 100 : 0;

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto  pb-20">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded">On Shift</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(data.date).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Salesman Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" />
                        <span className="font-bold">{data.routeName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold">{data.employeeId}</span>
                    </p>
                </div>
                
                <div className="flex w-full md:w-auto gap-3">
                    <Link to="/invoices/create" className="flex-1 md:flex-none">
                        <AppButton className="w-full rounded-md">
                            <FileText size={18} className="mr-2" /> New Order
                        </AppButton>
                    </Link>
                    <Link to="/customers" className="flex-1 md:flex-none">
                        <AppButton variant="secondary" className="w-full hidden sm:flex rounded-md">
                            <Users size={18} className="mr-2" /> Customers
                        </AppButton>
                    </Link>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Customers Visited" val={`${data?.visitedCustomers || 0} / ${data?.totalCustomers || 0}`} icon={CheckCircle} color="#10b981" />
                <MetricCard title="Pending Visits" val={data?.pendingCustomers || 0} icon={Clock} color="#f97316" />
                <MetricCard title="Today's Orders" val={data?.todayOrders || 0} icon={FileText} color="#3b82f6" />
                <MetricCard title="Cash Collected" val={formatCurrency(data?.todayCashCollected, false)} icon={DollarSign} color="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Section */}
                <AppCard title="Route Progress" className="lg:col-span-1">
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Completion Rate</p>
                                <h4 className="text-2xl font-bold text-[var(--text-main)]">{Math.round(percentageVisited)}%</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Sales Total</p>
                                <h4 className="text-xl font-bold text-[var(--primary)]">{formatCurrency(data?.todaySales, false)}</h4>
                            </div>
                        </div>

                        <div className="w-full bg-[var(--bg-app)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                            <div 
                                className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${Math.max(percentageVisited, 2)}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight mb-1">Visited</p>
                                <p className="font-bold text-emerald-700">{data?.visitedCustomers || 0}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-md border border-orange-100">
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tight mb-1">Remaining</p>
                                <p className="font-bold text-orange-700">{data?.pendingCustomers || 0}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>

                {/* Customers to Visit Today */}
                <AppCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col border border-slate-200 shadow-sm">
                    <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-sm">
                            <Users size={16} className="text-blue-600" /> Today's Schedule
                        </h3>
                        <AppButton variant="secondary" size="sm" onClick={() => window.location.reload()} className="h-8 rounded-md">
                            <RefreshCw size={14} className="mr-2"/> Refresh
                        </AppButton>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        {data?.pendingCustomersList && data.pendingCustomersList.length > 0 ? (
                            <div className="divide-y divide-[var(--border)]">
                                {data.pendingCustomersList.map((customer) => (
                                    <div key={customer.customerId} className="p-4 px-6 flex items-center justify-between hover:bg-[var(--secondary)]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-[var(--bg-app)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--primary)] text-sm">
                                                {(customer?.customerName?.[0] || '?').toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--text-main)]">{customer.customerName}</h4>
                                             <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                                                    <MapPin size={10} /> {customer.area || 'Area N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-0.5">Balance</p>
                                                <p className={`font-bold text-sm tabular-nums ${(customer.balance || 0) > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {formatCurrency(customer.balance, false)}
                                                </p>
                                            </div>
                                            <Link to={`/invoices/create?customerId=${customer.customerId}`}>
                                                <AppButton variant="secondary" size="sm">
                                                    Order
                                                </AppButton>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        ) : (
                            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <CheckCircle size={40} className="text-[var(--text-muted)]"/>
                                <p className="text-sm font-medium text-[var(--text-muted)]">No pending visits for today.</p>
                            </div>
                        )}
                    </div>
                </AppCard>
            </div>
        </div>
    );
}
