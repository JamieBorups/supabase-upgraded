

import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext.tsx';
import { User, UserRole } from '../../types.ts';
import { generatePasswordHash } from '../../utils/crypto.ts';
import FormField from '../ui/FormField.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import ConfirmationModal from '../ui/ConfirmationModal.tsx';
import UserEditorModal from './UserEditorModal.tsx';
import * as api from '../../services/api.ts';

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const UsersSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const { users, members, currentUser } = state;

    const [newUser, setNewUser] = useState({ memberId: '', username: '', password: '', role: 'user' as UserRole });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const memberMap = useMemo(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);
    const linkedMemberIds = useMemo(() => new Set(users.map(u => u.memberId).filter(id => id !== null)), [users]);


    const availableMembers = useMemo(() =>
        members.filter(m => !linkedMemberIds.has(m.id)),
        [members, linkedMemberIds]
    );

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            notify('Username and password are required.', 'error');
            return;
        }
        if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            notify('Username already exists.', 'error');
            return;
        }

        try {
            const passwordHash = await generatePasswordHash(newUser.password);
            const userPayload: Omit<User, 'id'> = {
                username: newUser.username,
                passwordHash,
                role: newUser.role,
                memberId: newUser.memberId || null,
            };
            
            const createdUser = await api.addUser(userPayload as User);
            dispatch({ type: 'ADD_USER', payload: createdUser });
            notify(`User '${newUser.username}' created successfully.`, 'success');
            setNewUser({ memberId: '', username: '', password: '', role: 'user' });
        } catch (error: any) {
            notify(`Error creating user: ${error.message}`, 'error');
        }
    };
    
    const handleSaveUser = async (updatedUser: User, newPassword?: string) => {
        try {
            let payload: Partial<User> = { ...updatedUser };
            delete (payload as any).id;
            delete (payload as any).createdAt;

            if (newPassword) {
                payload.passwordHash = await generatePasswordHash(newPassword);
            }

            const returnedUser = await api.updateUser(updatedUser.id, payload);

            dispatch({ type: 'UPDATE_USER', payload: returnedUser });
            notify(`User '${returnedUser.username}' updated successfully.`, 'success');
            setUserToEdit(null);
        } catch (error: any) {
            notify(`Error updating user: ${error.message}`, 'error');
        }
    };

    const handleDeleteClick = (user: User) => {
        if (user.id === currentUser?.id) {
            notify("You cannot delete your own account.", 'warning');
            return;
        }
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.deleteUser(userToDelete.id);
            dispatch({ type: 'DELETE_USER', payload: userToDelete.id });
            notify(`User '${userToDelete.username}' deleted.`, 'success');
        } catch (error: any) {
             notify(`Error deleting user: ${error.message}`, 'error');
        }
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
                <p className="mt-1 text-sm text-slate-500">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div>
            {isDeleteModalOpen && userToDelete && (
                 <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={`Delete User: ${userToDelete.username}`}
                    message={<>Are you sure you want to delete this user? This action is irreversible.</>}
                    confirmButtonText="Delete User"
                />
            )}
             {userToEdit && (
                <UserEditorModal
                    user={userToEdit}
                    isOpen={!!userToEdit}
                    onClose={() => setUserToEdit(null)}
                    onSave={handleSaveUser}
                />
            )}
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
            <p className="mt-1 text-sm text-slate-500">Create and manage user accounts for your collective.</p>

            <div className="mt-8 space-y-8">
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New User</h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <FormField label="Link to Member" htmlFor="user_member"><Select id="user_member" value={newUser.memberId} onChange={e => setNewUser(p => ({...p, memberId: e.target.value || null}))} options={[{value:'', label: 'Unlinked (e.g. Admin)'}, ...availableMembers.map(m => ({value: m.id, label: `${m.firstName} ${m.lastName}`}))]} /></FormField>
                        <FormField label="Username" htmlFor="user_username"><Input required id="user_username" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} /></FormField>
                        <FormField label="Password" htmlFor="user_password"><Input required type="password" id="user_password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} /></FormField>
                        <FormField label="Role" htmlFor="user_role"><Select id="user_role" value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value as UserRole}))} options={[{value: 'user', label: 'User'}, {value: 'admin', label: 'Admin'}]} /></FormField>
                         <div className="lg:col-span-4">
                            <button type="submit" className="w-full md:w-auto px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Create User</button>
                        </div>
                    </form>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Existing Users</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                             <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Username</th>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Role</th>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Linked Member</th>
                                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3 font-medium text-slate-800">{user.username}</td>
                                        <td className="px-4 py-3 capitalize">{user.role}</td>
                                        <td className="px-4 py-3 text-slate-600">{user.memberId ? memberMap.get(user.memberId) || 'Member not found' : <span className="italic">None</span>}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button onClick={() => setUserToEdit(user)} className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-md">Edit</button>
                                            <button onClick={() => handleDeleteClick(user)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersSettings;
