
import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { User, UserRole, Member } from '../../types.ts';
import { useAppContext } from '../../context/AppContext.tsx';
import FormField from '../ui/FormField.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';

interface UserEditorModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User, newPassword?: string) => void;
}

const UserEditorModal: React.FC<UserEditorModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const { state } = useAppContext();
    const { members, users } = state;
    const [formData, setFormData] = useState<User>(user);
    const [newPassword, setNewPassword] = useState('');

    const linkedMemberIds = useMemo(() => {
        const ids = new Set(users.map(u => u.memberId).filter(id => id !== null));
        // Allow the current user's member to be selected again
        if (user.memberId) {
            ids.delete(user.memberId);
        }
        return ids;
    }, [users, user.memberId]);
    
    const availableMembers = useMemo(() => 
        members.filter(m => !linkedMemberIds.has(m.id)),
        [members, linkedMemberIds]
    );

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, newPassword.trim() || undefined);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSave}>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Edit User: {user.username}</h3>
                    <div className="space-y-4">
                        <FormField label="Username" htmlFor="edit_username">
                            <Input
                                id="edit_username"
                                value={formData.username}
                                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                                required
                            />
                        </FormField>
                        <FormField label="New Password" htmlFor="edit_password" instructions="Leave blank to keep the current password.">
                            <Input
                                id="edit_password"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Role" htmlFor="edit_role">
                             <Select id="edit_role" value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value as UserRole}))} options={[{value: 'user', label: 'User'}, {value: 'admin', label: 'Admin'}]} />
                        </FormField>
                        <FormField label="Link to Member" htmlFor="edit_member">
                            <Select 
                                id="edit_member" 
                                value={formData.memberId || ''} 
                                onChange={e => setFormData(p => ({...p, memberId: e.target.value || null}))} 
                                options={[{value:'', label: 'Unlinked'}, ...availableMembers.map(m => ({value: m.id, label: `${m.firstName} ${m.lastName}`}))]} 
                            />
                        </FormField>
                    </div>
                     <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditorModal;
