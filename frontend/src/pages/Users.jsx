import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Settings, Edit, Key, Shield, UserX, UserCheck, Activity, UserPlus, Trash2, CheckCircle, AlertCircle, RefreshCcw, Mail, ShieldAlert, X } from 'lucide-react';
import UserModal from '../components/UserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import UserActivityModal from '../components/UserActivityModal';
import AppCard from '../components/AppCard';
import AppButton from '../components/AppButton';
import AppBadge from '../components/AppBadge';

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
        } catch { setError('Identity registry access failure.'); }
        finally { setLoading(false); }
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 3500);
    };

    const handleDelete = async (username) => {
        if (!window.confirm(`Permanently expunge user '${username}' from central registry?`)) return;
        setOpenDropdown(null);
        try {
            await authService.deleteUser(username);
            setUsers(prev => prev.filter(u => u.userName !== username));
            showToast('success', `Identity '${username}' purged.`);
        } catch { showToast('error', 'Purge sequence failed.'); }
    };

    const handleToggleStatus = async (user) => {
        setOpenDropdown(null);
        if (!window.confirm(`Modify access availability for '${user.userName}'?`)) return;
        try {
            await authService.toggleUserStatus(user.userName);
            fetchUsers();
            showToast('success', `Access status modified.`);
        } catch { showToast('error', 'State transition failed.'); }
    };

    const handleApprove = async (username) => {
        setOpenDropdown(null);
        try {
            await authService.approveUser(username);
            setUsers(prev => prev.map(u => u.userName === username ? { ...u, status: 'Approved' } : u));
            showToast('success', `User '${username}' approved.`);
        } catch { showToast('error', 'Approval failed.'); }
    };

    const handleReject = async (username) => {
        setOpenDropdown(null);
        try {
            await authService.rejectUser(username);
            setUsers(prev => prev.map(u => u.userName === username ? { ...u, status: 'Rejected' } : u));
            showToast('success', `User '${username}' rejected.`);
        } catch { showToast('error', 'Rejection failed.'); }
    };

    const openEditModal = (user) => { setEditingUser(user); setIsUserModalOpen(true); setOpenDropdown(null); };
    const openResetModal = (username) => { setResettingUser(username); setIsResetModalOpen(true); setOpenDropdown(null); };
    const openActivityModal = (username) => { setActivityUsername(username); setIsActivityModalOpen(true); setOpenDropdown(null); };

    const activeCount = users.filter(u => u.status === 'Approved').length;
    const pendingCount = users.filter(u => u.status === 'Pending').length;

    return (
        <div className="space-y-10 animate-fade-in pb-16 max-w-[1700px] mx-auto">
            {/* Header / Admin Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic">Access Control</h1>
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary animate-pulse"><Shield size={28}/></div>
                   </div>
                   <p className="text-[var(--text-muted)] font-extrabold uppercase tracking-[0.25em] text-[11px] italic">System authorization, identity management, and credential auditing.</p>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex gap-3">
                        <AppBadge variant="success" size="md" dot className="px-5 py-2 border-none shadow-sm">Approved: {activeCount}</AppBadge>
                        <AppBadge variant="warning" size="md" className="px-5 py-2 border-none shadow-sm">Pending: {pendingCount}</AppBadge>
                    </div>
                    <AppButton onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="px-8 py-4 !rounded-2xl shadow-lg shadow-primary/20">
                        <UserPlus size={20} className="mr-3"/> <span className="uppercase tracking-[0.1em] font-black">Onboard User</span>
                    </AppButton>
                </div>
            </div>

            {/* Notification Bar */}
            {toast.msg && (
                <div className={`fixed top-12 right-12 z-[1000] px-8 py-5 rounded-[2rem] shadow-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 animate-slide-in text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={22}/> : <AlertCircle size={22}/>}
                    {toast.msg}
                </div>
            )}

            {/* Main User Registry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {users.map((user) => (
                    <AppCard key={user.userName} className={`relative group transition-all duration-500 border-l-8 ${user.isActive ? 'border-primary' : 'border-slate-400 grayscale opacity-70'} !p-0 overflow-hidden shadow-lg hover:shadow-2xl`}>
                        {/* User Header */}
                        <div className="p-8 border-b border-[var(--border)] bg-[var(--secondary)]/10 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-[var(--bg-app)] border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500 relative z-10">
                                    {user.role === 'Admin' ? '👑' : user.role === 'Manager' ? '👔' : '🧑‍💼'}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 z-20 flex items-center justify-center transition-all ${user.isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-slate-500'}`}>
                                   {user.isActive ? <CheckCircle size={14} className="text-white"/> : <X size={14} className="text-white"/>}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight italic leading-tight">{user.fullName || 'Anonymous User'}</h3>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">@{user.userName}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Metadata */}
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic flex items-center gap-2">
                                   <Mail size={12} className="text-primary"/> Encrypted Comms
                                </label>
                                <p className="text-xs font-black text-[var(--text-main)] truncate italic bg-[var(--bg-app)] p-2 rounded-lg border border-[var(--border)] shadow-inner">{user.email || 'NO_EMAIL_SECURED'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic flex items-center gap-2">
                                   <ShieldAlert size={12} className="text-primary"/> Authorization Scope
                                </label>
                                <div className="w-full flex gap-2">
                                  <AppBadge variant={user.role === 'Admin' ? 'primary' : 'secondary'} size="md" className="flex-1 justify-center !rounded-xl py-2 border-none italic font-black text-[10px]">
                                      {user.role.toUpperCase()}
                                  </AppBadge>
                                  <AppBadge variant={user.status === 'Approved' ? 'success' : user.status === 'Pending' ? 'warning' : 'danger'} size="md" className="flex-1 justify-center !rounded-xl py-2 border-none italic font-black text-[10px]">
                                      {user.status ? user.status.toUpperCase() : 'UNKNOWN'}
                                  </AppBadge>
                                </div>
                            </div>
                        </div>

                        {/* Action Interface */}
                        <div className="px-6 py-5 bg-[var(--bg-app)]/50 border-t border-[var(--border)] flex gap-3">
                            <AppButton variant="secondary" onClick={() => openEditModal(user)} className="flex-1 text-[10px] font-black uppercase tracking-widest py-3">
                                <Edit size={16} className="mr-2"/> Modify
                            </AppButton>
                            <div className="relative">
                                <AppButton variant="secondary" onClick={() => setOpenDropdown(openDropdown === user.userName ? null : user.userName)} className="aspect-square p-3 !rounded-xl transition-all hover:bg-primary hover:text-white">
                                    <Settings size={18}/>
                                </AppButton>
                                
                                {openDropdown === user.userName && (
                                    <div className="absolute bottom-full right-0 mb-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 min-w-[240px] overflow-hidden animate-slide-in">
                                        <button onClick={() => openResetModal(user.userName)} className="w-full p-5 flex items-center gap-4 hover:bg-primary/5 text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest transition-colors border-b border-[var(--border)] group">
                                            <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><Key size={16}/></div> 
                                            Rotate Keys
                                        </button>
                                        <button onClick={() => openActivityModal(user.userName)} className="w-full p-5 flex items-center gap-4 hover:bg-primary/5 text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest transition-colors border-b border-[var(--border)] group">
                                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all"><Activity size={16}/></div>
                                            Audit Logs
                                        </button>
                                        {user.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleApprove(user.userName)} className="w-full p-5 flex items-center gap-4 hover:bg-emerald-500/5 text-emerald-500 text-[11px] font-black uppercase tracking-widest transition-colors border-b border-[var(--border)] group">
                                                    <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><CheckCircle size={16}/></div>
                                                    Approve Access
                                                </button>
                                                <button onClick={() => handleReject(user.userName)} className="w-full p-5 flex items-center gap-4 hover:bg-rose-500/5 text-rose-500 text-[11px] font-black uppercase tracking-widest transition-colors border-b border-[var(--border)] group">
                                                    <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all"><UserX size={16}/></div>
                                                    Reject Access
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleToggleStatus(user)} className={`w-full p-5 flex items-center gap-4 hover:bg-primary/5 text-[11px] font-black uppercase tracking-widest transition-colors border-b border-[var(--border)] group ${user.isActive ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            <div className={`p-2 rounded-xl transition-all ${user.isActive ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500' : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500'} group-hover:text-white`}>
                                              {user.isActive ? <UserX size={16}/> : <UserCheck size={16}/>}
                                            </div>
                                            {user.isActive ? 'Suspend Access' : 'Restore Access'}
                                        </button>
                                        <button onClick={() => handleDelete(user.userName)} className="w-full p-5 flex items-center gap-4 hover:bg-rose-500 text-rose-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors group">
                                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl group-hover:bg-white group-hover:text-rose-500 transition-all"><Trash2 size={16}/></div>
                                            Purge Identity
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
            <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} username={resettingUser} onSave={(user) => showToast('success', `Keys rotated for ${user}.`)} />
            <UserActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} username={activityUsername} />
        </div>
    );
}
