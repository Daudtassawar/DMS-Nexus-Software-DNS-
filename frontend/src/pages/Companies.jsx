import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Edit2, ArrowRight, Phone, MapPin, User, Info, CheckCircle, AlertCircle, Plus, Briefcase, Globe, Mail, ShieldCheck, CreditCard } from 'lucide-react';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppModal from '../components/AppModal';

const Companies = () => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', contactPerson: '', phone: '', address: '' });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchCompany(); }, []);

    const fetchCompany = async () => {
        try {
            const { data } = await axios.get('/api/v1/Company');
            if (data && data.length > 0) {
                setCompany(data[0]);
            }
        } catch (error) {
            console.error('Failed to retrieve corporate profile', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            if (formData.id) {
                await axios.put(`/api/v1/Company/${formData.id}`, formData);
            } else {
                await axios.post('/api/v1/Company', formData);
            }
            setShowModal(false);
            fetchCompany();
        } catch (error) {
            alert(error.response?.data?.Message || 'System encountered an error during profile persistence.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
             <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing Corporate Data...</p>
             </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border)] shadow-sm">
                <div>
                   <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <Building2 className="text-blue-500" size={24}/> Principal Entity Profile
                   </h1>
                   <p className="text-sm text-[var(--text-muted)] mt-1">Configure primary organizational identity and geographic operational headquarters.</p>
                </div>
            </div>

            {company ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <AppCard className="border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-1 px-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Identity Record</span>
                                <AppBadge variant="success" size="xs" className="rounded font-bold" dot>Active Entity</AppBadge>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shadow-inner">
                                        <Building2 size={48} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900 leading-tight">{company.name}</h2>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-500"/> Verified Corporate Subdomain
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6 border-t border-slate-100">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <User size={12}/> Authorized Liaison
                                                </span>
                                                <p className="text-sm font-bold text-slate-700">{company.contactPerson || 'Unspecified Executive'}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Phone size={12}/> Primary Contact Line
                                                </span>
                                                <p className="text-sm font-bold text-slate-700">{company.phone || 'No active connection'}</p>
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5 pt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <MapPin size={12}/> Registered Address
                                                </span>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{company.address || 'Geographic location not established'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                                <AppButton variant="secondary" onClick={() => { setFormData(company); setShowModal(true); }} className="rounded-md">
                                    <Edit2 size={16} className="mr-2" /> Modify Profile
                                </AppButton>
                                <AppButton onClick={() => navigate(`/company-ledger/${company.id}`)} className="rounded-md">
                                    <CreditCard size={16} className="mr-2" /> Corporate Ledger
                                </AppButton>
                            </div>
                        </AppCard>
                    </div>

                    <div className="space-y-6">
                        <AppCard className="border border-slate-200 bg-blue-600 text-white">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Info size={20}/> Operational Metadata
                                </h3>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                    This profile represents the root entity of the system. All transactions, invoices, and reports are globally associated with these credentials.
                                </p>
                                <div className="pt-4 space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider border-b border-blue-500 pb-2">
                                        <span>System Version</span>
                                        <span>v4.2.0-STABLE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider border-b border-blue-500 pb-2">
                                        <span>Last Audit</span>
                                        <span>Active Session</span>
                                    </div>
                                </div>
                            </div>
                        </AppCard>
                    </div>
                </div>
            ) : (
                <AppCard className="p-16 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl animate-fade-in">
                    <div className="max-w-sm mx-auto space-y-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-200">
                            <Building2 size={32} className="text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Entity Initialization Required</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">The system has not identified a primary corporate profile. Please establish your organizational identity to enable core modules.</p>
                        </div>
                        <AppButton onClick={() => { setFormData({ id: null, name: 'Corporate Headquarters', contactPerson: '', phone: '', address: '' }); setShowModal(true); }} 
                                  className="rounded-md w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20">
                            <Plus size={20} className="mr-2"/> Initialize Profile
                        </AppButton>
                    </div>
                </AppCard>
            )}

            {showModal && (
                <AppModal isOpen={true} onClose={() => setShowModal(false)} title={formData.id ? 'Modify Entity Profile' : 'Principal Entity Initialization'} size="md"
                    footer={<><AppButton variant="secondary" onClick={() => setShowModal(false)} disabled={saving} className="rounded-md">Cancel</AppButton><AppButton onClick={handleSubmit} loading={saving} className="rounded-md">Commit Changes</AppButton></>}>
                    <div className="space-y-4 pt-2">
                        <AppInput label="Legal Organization Name" placeholder="e.g. Nexus Distribution Hub" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
                        <AppInput label="Authorized Contact Liaison" placeholder="e.g. John Doe" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})}/>
                        <AppInput label="Primary Communication Port" placeholder="e.g. +92 300 1234567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                        
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Logistics Hub</label>
                           <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                                     placeholder="Enter complete geographic address for correspondence..."
                                     className="w-full bg-white border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"></textarea>
                        </div>
                    </div>
                </AppModal>
            )}
        </div>
    );
};

export default Companies;
