import { useState, useEffect } from 'react';
import authService from '../services/authService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { CheckCircle, Copy, Link } from 'lucide-react';

export default function UserModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        role: 'Salesman'
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inviteResult, setInviteResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                try {
                    const fetchedRoles = await authService.getRoles();
                    setRoles(fetchedRoles);
                } catch (err) {
                    // If roles endpoint fails, use default roles
                    setRoles([{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Salesman' }]);
                }
            };
            fetchRoles();

            if (user) {
                setFormData({
                    username: user.userName,
                    fullName: user.fullName || '',
                    email: user.email || '',
                    role: user.role || 'Salesman'
                });
            } else {
                setFormData({ username: '', fullName: '', email: '', role: 'Salesman' });
            }
            setError('');
            setInviteResult(null);
        }
    }, [user, isOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setError('');
        try {
            if (user) {
                // Edit existing user
                await authService.updateUser(user.userName, { fullName: formData.fullName, email: formData.email });
                if (user.role !== formData.role) await authService.assignRole(user.userName, formData.role);
                onSave(); 
                onClose();
            } else {
                // Create new user directly
                await authService.createUser({ 
                    username: formData.username, 
                    email: formData.email, 
                    fullName: formData.fullName, 
                    password: formData.password,
                    role: formData.role 
                });
                
                onSave(); // Refresh the user list
                onClose();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.Message || err.response?.data?.title || err.message || 'Action failed. Please try again.';
            setError(msg);
        } finally { 
            setLoading(false); 
        }
    };

    const isEdit = !!user;

    return (
        <AppModal 
            isOpen={isOpen} 
            onClose={() => { setInviteResult(null); onClose(); }} 
            title={isEdit ? 'Edit User' : 'Add New User'}
        >
            {/* 📋 Form State */}
            <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Profile Information */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">👤 Profile Information</p>
                        {!isEdit && (
                            <>
                                <AppInput 
                                    label="Username (Must be unique) *"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g. john.admin"
                                />
                                <AppInput 
                                    label="Password *"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    placeholder="Enter secure password"
                                />
                            </>
                        )}
                        <AppInput 
                            label="Full Name *"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                        />
                        <AppInput 
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@company.com"
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">🔐 Authentication & Access</p>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Role *</label>
                            <select 
                                name="role" 
                                required 
                                value={formData.role} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold text-sm cursor-pointer"
                            >
                                {roles.length === 0 
                                    ? <>
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Salesman">Salesman</option>
                                      </>
                                    : roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)
                                }
                            </select>
                        </div>
                        {!isEdit && (
                            <p className="text-[11px] text-[var(--text-muted)] bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                💡 The user will receive a link to set their own password. They will be automatically approved and can log in immediately after setting their password.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <AppButton variant="secondary" type="button" onClick={onClose}>Cancel</AppButton>
                        <AppButton type="submit" disabled={loading}>
                            {loading ? 'Processing...' : (isEdit ? 'Save Changes' : 'Add User')}
                        </AppButton>
                    </div>
                </form>
        </AppModal>
    );
}
