import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Edit, Trash2, X, Lock, CheckCircle2, ShieldAlert, Zap, Search, Info } from 'lucide-react';
import authService from '../services/authService';
import AppTable from '../components/AppTable';
import AppButton from '../components/AppButton';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import AppCard from '../components/AppCard';
import AppBadge from '../components/AppBadge';

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                axios.get('/api/v1/roles'),
                axios.get('/api/v1/roles/permissions')
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
            setError(null);
        } catch (err) {
            setError('System Access Protocol Failure: Unauthorized.');
        } finally { setLoading(false); }
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const handleOpenModal = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions || []
            });
        } else {
            setCurrentRole(null);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setCurrentRole(null); };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleModuleToggle = (moduleName, modulePerms) => {
        const allModulePermIds = modulePerms.map(p => p.id);
        const hasAll = allModulePermIds.every(id => formData.permissions.includes(id));
        setFormData(prev => {
            let newPerms = [...prev.permissions];
            if (hasAll) newPerms = newPerms.filter(id => !allModulePermIds.includes(id));
            else allModulePermIds.forEach(id => { if (!newPerms.includes(id)) newPerms.push(id) });
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) await axios.put(`/api/v1/roles/${currentRole.id}`, formData);
            else await axios.post('/api/v1/roles', formData);
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Role definition update failed.');
        }
    };

    const handleDelete = async (role) => {
        if (['Admin', 'Manager', 'Salesman'].includes(role.name)) {
            alert('Core protocols restricted: Cannot delete system roles.');
            return;
        }
        if (window.confirm(`Permanently expunge security role '${role.name}'?`)) {
            try {
                await axios.delete(`/api/v1/roles/${role.id}`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Purge failed.');
            }
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-16 max-w-[1700px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">Authority Hub</h1>
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 animate-pulse"><ShieldCheck size={28}/></div>
                   </div>
                   <p className="text-[var(--text-muted)] font-extrabold uppercase tracking-[0.25em] text-[11px] italic">RBAC configuration and security scope definitions.</p>
                </div>
                {authService.hasPermission("Users.Create") && (
                    <AppButton onClick={() => handleOpenModal()} className="px-8 py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <Plus size={20} className="mr-3"/> <span className="uppercase tracking-[0.1em] font-black">Define Authority</span>
                    </AppButton>
                )}
            </div>

            {error && <div className="p-6 bg-rose-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 shadow-xl shadow-rose-500/20 animate-slide-in"><ShieldAlert size={24}/> {error}</div>}

            <AppCard p0 className="overflow-hidden shadow-xl border-t-8 border-t-indigo-500 group">
                <AppTable 
                    headers={['Identity Segment', 'Strategic Definition', 'Capability Matrix', 'Actions']}
                    data={roles}
                    loading={loading}
                    renderRow={(role) => (
                        <>
                           <td className="px-8 py-7">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center font-black group-hover:rotate-12 transition-transform shadow-sm">
                                      <Lock size={24}/>
                                    </div>
                                    <div>
                                        <div className="font-black text-[var(--text-main)] uppercase tracking-tighter italic text-lg leading-none mb-1.5">
                                            {role.name}
                                        </div>
                                        {['Admin', 'Manager', 'Salesman'].includes(role.name) ? (
                                           <AppBadge variant="primary" size="sm" className="italic border-none px-3 leading-none !rounded-lg">SYSTEM CORE</AppBadge>
                                        ) : (
                                           <AppBadge variant="secondary" size="sm" className="italic border-none px-3 leading-none !rounded-lg uppercase">CUSTOM NODE</AppBadge>
                                        )}
                                    </div>
                                </div>
                           </td>
                           <td className="px-8 py-7">
                               <p className="text-sm font-black text-[var(--text-muted)] italic leading-relaxed max-w-sm lowercase first-letter:uppercase">{role.description || 'No system descriptor provided for this operational role.'}</p>
                           </td>
                           <td className="px-8 py-7">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-2.5 h-2.5 rounded-full ${role.name === 'Admin' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-indigo-400'}`}></div>
                                      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] italic">
                                          {role.name === 'Admin' ? 'ABSOLUTE AUTHORITY' : `${role.permissions?.length || 0} MODULAR PERMISSIONS`}
                                      </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1 opacity-50">
                                    {role.permissions?.slice(0, 3).map(p => (
                                      <span key={p} className="text-[8px] font-black uppercase tracking-tighter bg-[var(--bg-app)] px-2 py-0.5 rounded border border-[var(--border)]">NODE-{p}</span>
                                    ))}
                                    {role.permissions?.length > 3 && <span className="text-[8px] font-black uppercase tracking-tighter bg-[var(--bg-app)] px-2 py-0.5 rounded border border-[var(--border)]">+{role.permissions.length - 3} MORE</span>}
                                  </div>
                                </div>
                           </td>
                           <td className="px-8 py-7">
                                <div className="flex justify-end gap-3">
                                    {authService.hasPermission("Users.Edit") && role.name !== 'Admin' && (
                                        <button onClick={() => handleOpenModal(role)} className="p-3 bg-indigo-500/5 text-indigo-500 border border-indigo-500/10 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all interactive shadow-sm" title="Override Matrix">
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    {authService.hasPermission("Users.Delete") && !['Admin', 'Manager', 'Salesman'].includes(role.name) && (
                                        <button onClick={() => handleDelete(role)} className="p-3 bg-rose-500/5 text-rose-500 border border-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all interactive shadow-sm" title="Purge Protocol">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                           </td>
                        </>
                    )}
                />
            </AppCard>

            {/* Role Configuration Terminal */}
            <AppModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={currentRole ? `RECONFIGURING: ${currentRole.name}` : 'NEW AUTHORITY SPECIFICATION'}
                maxWidth="max-w-6xl"
            >
                <form id="roleForm" onSubmit={handleSubmit} className="space-y-10 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AppInput
                            label="Authority Identifier"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            disabled={currentRole && ['Admin', 'Manager', 'Salesman'].includes(currentRole.name)}
                            placeholder="e.g. SYSTEM_AUDITOR"
                            icon={ShieldCheck}
                        />
                        <AppInput
                            label="Operational Scope Description"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Primary focus and responsibility level..."
                            icon={Info}
                        />
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 bg-primary/5 p-4 py-3 rounded-2xl border border-primary/20">
                           <Zap size={18} className="text-primary animate-pulse"/>
                           <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Permission Matrix Integration</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-1">
                            {Object.entries(groupedPermissions).map(([module, perms]) => {
                                const allSelected = perms.every(p => formData.permissions.includes(p.id));
                                return (
                                    <div key={module} className="bg-[var(--bg-app)]/50 rounded-[2.5rem] border border-[var(--border)] space-y-4 group hover:border-primary/40 transition-all shadow-inner relative overflow-hidden">
                                        <div className="p-6 pb-2">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-black text-[var(--text-main)] italic text-sm uppercase tracking-[0.2em]">{module} CORE</h4>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleModuleToggle(module, perms)}
                                                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
                                                >
                                                    {allSelected ? 'NULLIFY' : 'AUTHORIZE'}
                                                </button>
                                            </div>
                                            <div className="space-y-4 pb-4">
                                                {perms.map(perm => (
                                                    <label key={perm.id} className="flex items-center justify-between group/item cursor-pointer p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-primary/30 transition-all shadow-sm">
                                                        <span className="text-[11px] font-black text-[var(--text-muted)] group-hover/item:text-primary transition-colors uppercase tracking-widest italic">
                                                            {perm.name.replace(`${module}.`, '')}
                                                        </span>
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={formData.permissions.includes(perm.id)}
                                                                onChange={() => handlePermissionToggle(perm.id)}
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-5 pt-10 border-t border-[var(--border)]">
                        <button type="button" onClick={handleCloseModal} className="px-8 py-4 rounded-[1.5rem] border-2 border-[var(--border)] text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] transition-all hover:bg-[var(--bg-app)] active:scale-95 italic">Abort Process</button>
                        <AppButton type="submit" className="px-10 py-4 !rounded-[1.5rem] !bg-primary text-white shadow-xl shadow-primary/20">
                            {currentRole ? 'COMMIT AUTHORITY UPDATES' : 'INTIALIZE AUTHORITY SCOPE'}
                        </AppButton>
                    </div>
                </form>
            </AppModal>
        </div>
    );
};

export default RolesManagement;
