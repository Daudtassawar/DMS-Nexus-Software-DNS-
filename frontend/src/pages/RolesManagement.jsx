import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Edit, Trash2, X, Lock, CheckCircle, ShieldAlert, Zap, Search, Info, Shield, Key } from 'lucide-react';
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
            setError('Failed to load access control data.');
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
            setError(err.response?.data?.message || 'Failed to save role configuration.');
        }
    };

    const handleDelete = async (role) => {
        if (['Admin', 'Manager', 'Salesman'].includes(role.name)) {
            alert('Core system roles cannot be deleted.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete role '${role.name}'?`)) {
            try {
                await axios.delete(`/api/v1/roles/${role.id}`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete role.');
            }
        }
    };

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="text-blue-600" size={24}/> Roles &amp; Permissions
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Configure user roles and access control policies.</p>
                </div>
                {authService.hasPermission("Users.Create") && (
                    <AppButton onClick={() => handleOpenModal()} className="rounded-md">
                        <Plus size={18} className="mr-2"/> Add Role
                    </AppButton>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm font-semibold">
                    <ShieldAlert size={20}/> {error}
                </div>
            )}

            <AppCard p0 className="overflow-hidden shadow-sm border border-slate-200">
                <AppTable 
                    headers={['Role Name', 'Description', 'Capabilities', 'Actions']}
                    data={roles}
                    loading={loading}
                    renderRow={(role) => (
                        <>
                           <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
                                      <Lock size={18}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-[var(--text-main)] leading-none">{role.name}</p>
                                        <div className="mt-1.5">
                                            {['Admin', 'Manager', 'Salesman'].includes(role.name) ? (
                                               <AppBadge variant="primary" size="sm" className="rounded-md px-2">SYSTEM ROLE</AppBadge>
                                            ) : (
                                               <AppBadge variant="secondary" size="sm" className="rounded-md px-2">CUSTOM ROLE</AppBadge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                           </td>
                           <td className="px-6 py-4">
                               <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm">{role.description || 'No description provided.'}</p>
                           </td>
                           <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Key size={12} className="text-blue-500"/>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)]">
                                            {role.name === 'Admin' ? 'Full System Access' : `${role.permissions?.length || 0} Permissions`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {role.permissions?.slice(0, 3).map(p => (
                                        <span key={p} className="text-[8px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">{p}</span>
                                      ))}
                                      {role.permissions?.length > 3 && <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">+{role.permissions.length - 3} More</span>}
                                    </div>
                                </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {authService.hasPermission("Users.Edit") && role.name !== 'Admin' && (
                                        <button onClick={() => handleOpenModal(role)} className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm" title="Edit Role">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {authService.hasPermission("Users.Delete") && !['Admin', 'Manager', 'Salesman'].includes(role.name) && (
                                        <button onClick={() => handleDelete(role)} className="p-2 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Delete Role">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                           </td>
                        </>
                    )}
                />
            </AppCard>

            {/* Role Modal */}
            <AppModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={currentRole ? `Edit Role: ${currentRole.name}` : 'Create New Role'}
                size="xl"
            >
                <div className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AppInput
                            label="Role Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            disabled={currentRole && ['Admin', 'Manager', 'Salesman'].includes(currentRole.name)}
                            placeholder="e.g. Inventory Manager"
                        />
                        <AppInput
                            label="Description"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Brief purpose of this role..."
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                           <Key size={18} className="text-blue-500"/>
                           <h3 className="text-sm font-bold text-slate-800">Permissions Matrix</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(groupedPermissions).map(([module, perms]) => {
                                const allSelected = perms.every(p => formData.permissions.includes(p.id));
                                return (
                                    <div key={module} className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                                        <div className="p-4 bg-slate-100/50 border-b border-slate-200 flex justify-between items-center">
                                            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">{module}</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => handleModuleToggle(module, perms)}
                                                className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700 active:scale-95 transition-all"
                                            >
                                                {allSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {perms.map(perm => (
                                                <label key={perm.id} className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        {perm.name.replace(`${module}.`, '')}
                                                    </span>
                                                    <div className="relative inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={formData.permissions.includes(perm.id)}
                                                            onChange={() => handlePermissionToggle(perm.id)}
                                                        />
                                                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <AppButton variant="secondary" onClick={handleCloseModal} className="px-6 rounded-md">Cancel</AppButton>
                        <AppButton onClick={handleSubmit} className="px-8 rounded-md">
                            {currentRole ? 'Save Changes' : 'Create Role'}
                        </AppButton>
                    </div>
                </div>
            </AppModal>
        </div>
    );
};

export default RolesManagement;
