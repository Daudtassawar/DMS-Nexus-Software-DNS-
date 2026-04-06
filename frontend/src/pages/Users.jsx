import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Settings, Edit, Key, Shield, UserX, UserCheck, Activity, UserPlus, Trash2, CheckCircle, AlertCircle, RefreshCcw, Mail, ShieldAlert, X, User as UserIcon, MoreVertical, Check, Ban, Eye } from 'lucide-react';
import UserModal from '../components/UserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import UserActivityModal from '../components/UserActivityModal';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';
import AppTable from '../components/AppTable';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ type: '', msg: '' });
    
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resettingUser, setResettingUser] = useState(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [activityUsername, setActivityUsername] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    const navigate = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser || currentUser?.user?.role !== 'Admin') { navigate('/'); return; }
            const data = await authService.getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch { setError('Failed to load user records.'); }
        finally { setLoading(false); }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 3500);
    };

    const handleDelete = async (username) => {
        if (!window.confirm(`Permanently remove user record for '${username}'?`)) return;
        setOpenDropdown(null);
        try {
            await authService.deleteUser(username);
            setUsers(prev => prev.filter(u => u.userName !== username));
            showToast('success', `User '${username}' has been removed.`);
        } catch { showToast('error', 'Failed to remove user record.'); }
    };

    const handleToggleStatus = async (user) => {
        setOpenDropdown(null);
        if (!window.confirm(`Modify account status for '${user.userName}'?`)) return;
        try {
            await authService.toggleUserStatus(user.userName);
            fetchUsers();
            showToast('success', `Account status updated.`);
        } catch { showToast('error', 'Status modification failed.'); }
    };

    const handleApprove = async (username) => {
        setOpenDropdown(null);
        try {
            await authService.approveUser(username);
            setUsers(prev => prev.map(u => u.userName === username ? { ...u, status: 'Approved' } : u));
            showToast('success', `Access granted for '${username}'.`);
        } catch { showToast('error', 'Approval process failed.'); }
    };

    const handleReject = async (username) => {
        setOpenDropdown(null);
        try {
            await authService.rejectUser(username);
            setUsers(prev => prev.map(u => u.userName === username ? { ...u, status: 'Rejected' } : u));
            showToast('success', `Access denied for '${username}'.`);
        } catch { showToast('error', 'Rejection process failed.'); }
    };

    const openEditModal = (user) => { setEditingUser(user); setIsUserModalOpen(true); setOpenDropdown(null); };
    const openResetModal = (username) => { setResettingUser(username); setIsResetModalOpen(true); setOpenDropdown(null); };
    const openActivityModal = (username) => { setActivityUsername(username); setIsActivityModalOpen(true); setOpenDropdown(null); };

    const activeCount = users.filter(u => u.status === 'Approved').length;
    const pendingCount = users.filter(u => u.status === 'Pending').length;

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto  pb-20">
            {toast.msg && (
                <div className={`toast-notification ${toast.type === 'success' ? 'success' : 'error'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{toast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="text-blue-600" size={24}/> User Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage system accounts, roles, and access permissions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-4 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                            <span className="text-sm font-bold text-emerald-600">{activeCount}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                            <span className="text-sm font-bold text-amber-600">{pendingCount}</span>
                        </div>
                    </div>
                    <AppButton onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="rounded-md">
                        <UserPlus size={18} className="mr-2"/> Add User
                    </AppButton>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3 text-sm font-semibold">
                    <AlertCircle size={18}/> {error}
                </div>
            )}

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                    <AppCard key={user.userName} p0 className={`relative group border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow-md ${!user.isActive && 'opacity-70'}`}>
                        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} title={user.isActive ? 'Active' : 'Disabled'}></div>
                        
                        <div className="p-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center border border-blue-100 font-bold text-lg">
                                    {user.fullName ? user.fullName[0].toUpperCase() : user.userName[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate" title={user.fullName}>{user.fullName || 'No Name'}</h3>
                                    <p className="text-xs font-bold text-blue-600 truncate">@{user.userName}</p>
                                </div>
                            </div>
                            
                            <div className="mt-5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
                                    <AppBadge variant={user.role === 'Admin' ? 'primary' : 'secondary'} size="xs" className="rounded font-bold px-2">
                                        {user.role}
                                    </AppBadge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                    <AppBadge variant={user.status === 'Approved' ? 'success' : user.status === 'Pending' ? 'warning' : 'danger'} size="xs" className="rounded font-bold px-2">
                                        {user.status || 'Unknown'}
                                    </AppBadge>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</span>
                                    <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-2">
                                        <Mail size={12} className="text-slate-400"/> {user.email || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                            <button onClick={() => openEditModal(user)} className="text-[10px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-2 py-1 rounded transition-colors uppercase tracking-wider">
                                <Edit size={12}/> Edit Profile
                            </button>
                            <div className="relative">
                                <button onClick={() => setOpenDropdown(openDropdown === user.userName ? null : user.userName)} 
                                        className="p-1.5 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                                    <MoreVertical size={16}/>
                                </button>
                                
                                {openDropdown === user.userName && (
                                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-white border border-slate-200 rounded-lg shadow-sm z-50 overflow-hidden py-1">
                                        <button onClick={() => openResetModal(user.userName)} className="w-full px-4 py-2 hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase flex items-center gap-3">
                                            <Key size={14} className="text-slate-400"/> Change Password
                                        </button>
                                        <button onClick={() => openActivityModal(user.userName)} className="w-full px-4 py-2 hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase flex items-center gap-3">
                                            <Eye size={14} className="text-slate-400"/> Audit Activity
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        {user.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleApprove(user.userName)} className="w-full px-4 py-2 hover:bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase flex items-center gap-3">
                                                    <CheckCircle size={14}/> Authorize Access
                                                </button>
                                                <button onClick={() => handleReject(user.userName)} className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 text-[10px] font-bold uppercase flex items-center gap-3">
                                                    <Ban size={14}/> Deny Request
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleToggleStatus(user)} className={`w-full px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase flex items-center gap-3 ${user.isActive ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {user.isActive ? <Ban size={14}/> : <Check size={14}/>}
                                            {user.isActive ? 'Disable Account' : 'Reactivate Account'}
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button onClick={() => handleDelete(user.userName)} className="w-full px-4 py-2 hover:bg-red-50 text-red-600 text-[10px] font-bold uppercase flex items-center gap-3">
                                            <Trash2 size={14}/> Delete Records
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AppCard>
                ))}
            </div>

            {/* Modals */}
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} user={editingUser} onSave={fetchUsers} />
            <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} username={resettingUser} onSave={(user) => showToast('success', `Password reset for ${user}.`)} />
            <UserActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} username={activityUsername} />
        </div>
    );
}
