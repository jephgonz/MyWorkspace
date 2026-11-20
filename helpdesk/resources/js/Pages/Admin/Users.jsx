import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import Collapse from '../../Components/Collapse.jsx';
import { appUrl } from '../../url';

export default function Users({ users = [] }) {
    const [showForm, setShowForm] = useState(false);
    const form = useForm({ display_name: '', email: '', password: '' });
    const { errors } = usePage().props;
    const submit = (event) => {
        event.preventDefault();
        form.post(appUrl('/admin/users'), { onSuccess: () => { form.reset(); setShowForm(false); } });
    };
    const setStatus = (user) => {
        const activate = Number(user.is_active) !== 1;
        if (user.role === 'admin' && !activate && !window.confirm('Deactivate this administrator account?')) return;
        router.post(appUrl('/admin/users/status'), { user_id: user.id, is_active: activate ? 1 : 0 });
    };

    return (
        <DashboardLayout title="Admin accounts" activePage="users">
            <section className="space-y-6">
                <div>
                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Account Administration</p>
                    <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">Admin accounts</h1>
                    <p className="text-sm text-slate-500 mt-1">Only administrator accounts can sign in. Existing staff records are preserved but disabled.</p>
                </div>

                <section className="icloud-card overflow-hidden">
                    <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New administrator</p>
                            <h2 className="text-xl font-bold text-[#1d1d1f] mt-1">Create admin account</h2>
                        </div>
                        <button className="icloud-btn-secondary" type="button" onClick={() => setShowForm((current) => !current)}>
                            {showForm ? 'Close form' : '+ Add admin'}
                        </button>
                    </div>
                    <Collapse open={showForm}>
                        <div className="p-6 bg-slate-50/50">
                            <form className="space-y-4 max-w-2xl" onSubmit={submit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Display name</label>
                                        <input className="icloud-input" value={form.data.display_name} onChange={(event) => form.setData('display_name', event.target.value)} maxLength="120" required placeholder="Full Name" />
                                        {errors.display_name && <p className="text-xs text-red-500">{errors.display_name}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                                        <input type="email" className="icloud-input" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} maxLength="190" required placeholder="email@example.com" />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Initial password</label>
                                    <input type="password" className="icloud-input" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} minLength="12" autoComplete="new-password" required placeholder="••••••••••••" />
                                    <p className="text-[10px] text-slate-400 ml-1">At least 12 characters.</p>
                                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                </div>
                                <div className="pt-4 border-t border-black/[0.06] flex items-center gap-3">
                                    <button className="icloud-btn h-9 px-6 shadow-md" type="submit" disabled={form.processing}>Create account</button>
                                    <button className="icloud-btn-secondary h-9 px-6" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </Collapse>
                </section>

                <section className="icloud-card overflow-hidden">
                    <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account directory</p>
                            <h2 className="text-xl font-bold text-[#1d1d1f] mt-1">Active Users</h2>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{users.length} accounts</span>
                    </div>

                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-3xl mb-2 block">👤</span>
                            <strong className="text-lg font-medium text-[#1d1d1f]">No accounts found</strong>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.04]">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#1d1d1f]">{user.display_name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{user.username || 'NO USERNAME'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${user.role === 'admin' ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                                    {user.role === 'admin' ? 'Admin' : 'Staff'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${Number(user.is_active) === 1 ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
                                                    {Number(user.is_active) === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.role === 'admin' ? (
                                                    <button
                                                        type="button"
                                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                                                        onClick={() => setStatus(user)}
                                                    >
                                                        {Number(user.is_active) === 1 ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">System Lock</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>
        </DashboardLayout>
    );
}
