import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
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
            <section className="icloud-section">
                <div className="icloud-section-head">
                    <div>
                        <p className="eyebrow">ACCOUNT ADMINISTRATION</p>
                        <h1 className="icloud-title">Admin accounts</h1>
                        <p className="icloud-subtitle">Only administrator accounts can sign in. Existing staff records are preserved but disabled.</p>
                    </div>
                </div>
                <section className={`icloud-card collapsible-form-card${showForm ? ' is-expanded' : ''}`} id="add-account">
                    <div className="admin-card-heading collapsible-form-heading p-5 border-b border-icloud-border flex items-center justify-between">
                        <div>
                            <p className="text-[0.75rem] font-medium text-icloud-text-tertiary mb-1">New administrator</p>
                            <h2 className="text-lg font-bold text-icloud-text">Create admin account</h2>
                            <p className="text-[0.8rem] text-icloud-text-secondary">Email addresses may be shared. New accounts are administrator accounts.</p>
                        </div>
                        <button className="icloud-btn-secondary" type="button" aria-expanded={showForm} aria-controls="account-form" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : '+ Add admin'}</button>
                    </div>
                    <div className={`collapsible-form-content${showForm ? ' is-expanded' : ''}`} id="account-form" aria-hidden={!showForm} inert={!showForm}>
                        <div className="collapsible-form-inner p-5"><form className="account-form space-y-3" onSubmit={submit}>
                            <fieldset disabled={!showForm} className="border-0 bg-transparent p-0">
                                <div className="field flex flex-col gap-1.5">
                                    <label className="icloud-label">Display name</label>
                                    <input className="icloud-input" value={form.data.display_name} onChange={(event) => form.setData('display_name', event.target.value)} maxLength="120" required />
                                    {errors.display_name && <p className="text-[0.75rem] text-icloud-danger">{errors.display_name}</p>}
                                </div>
                                <div className="field flex flex-col gap-1.5">
                                    <label className="icloud-label">Email</label>
                                    <input type="email" className="icloud-input" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} maxLength="190" required />
                                    {errors.email && <p className="text-[0.75rem] text-icloud-danger">{errors.email}</p>}
                                </div>
                                <div className="field flex flex-col gap-1.5">
                                    <label className="icloud-label">Initial password</label>
                                    <input type="password" className="icloud-input" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} minLength="12" autoComplete="new-password" required />
                                    <p className="text-[0.7rem] text-icloud-text-tertiary">At least 12 characters.</p>
                                    {errors.password && <p className="text-[0.75rem] text-icloud-danger">{errors.password}</p>}
                                </div>
                                <div className="form-actions flex items-end gap-3 pt-3 border-t border-icloud-border/50">
                                    <button className="icloud-btn" type="submit" disabled={form.processing}>Create account</button>
                                    <button className="icloud-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </fieldset>
                        </form></div>
                    </div>
                </section>
                <section className="icloud-card mt-6 p-0 accounts-card directory-card">
                    <div className="admin-card-heading accounts-heading p-5 border-b border-icloud-border flex items-center justify-between">
                        <div>
                            <p className="text-[0.75rem] font-medium text-icloud-text-tertiary mb-1">Account directory</p>
                            <h2 className="text-lg font-bold text-icloud-text">Accounts</h2>
                            <p className="text-[0.8rem] text-icloud-text-secondary">Activate or deactivate administrator access. Legacy staff accounts remain disabled.</p>
                        </div>
                        <span className="text-[0.75rem] font-medium text-icloud-text-secondary">{users.length} accounts</span>
                    </div>
                    {users.length === 0 ? <div className="empty-state text-center py-10 p-5"><span className="text-3xl mb-2 block">♙</span><strong className="text-lg font-medium text-icloud-text block">No accounts found</strong></div> :
                        <div className="table-wrap overflow-x-auto p-5"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-icloud-border/50"><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Name</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Username</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Email</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Role</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Status</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Created</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Access</th></tr></thead><tbody>
                            {users.map((user) => <tr key={user.id} className="border-b border-icloud-border/50 hover:bg-icloud-bg transition-colors"><td className="py-3 text-[0.8rem] text-icloud-text"><strong>{user.display_name}</strong></td><td className="py-3 text-[0.8rem] text-icloud-text-secondary">{user.username || '—'}</td><td className="py-3 text-[0.8rem] text-icloud-text">{user.email}</td><td className="py-3"><span className="role-tag inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold border-blue-100 bg-blue-50 text-blue-700">{user.role === 'admin' ? 'Admin' : 'Staff (legacy)'}</span></td><td className="py-3"><span className={`state-tag inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold${Number(user.is_active) === 1 ? ' border-green-100 bg-green-50 text-green-700' : ' border-red-100 bg-red-50 text-red-700' }`}>{Number(user.is_active) === 1 ? 'Active' : 'Inactive'}</span></td><td className="py-3 text-[0.8rem] text-icloud-text-secondary">{new Date(user.created_at).toLocaleDateString()}</td><td className="py-3">{user.role === 'admin' ? <button type="button" className="icloud-btn-ghost px-3 py-1 rounded-lg text-[0.75rem] font-medium text-icloud-blue hover:bg-red-50" onClick={() => setStatus(user)}>{Number(user.is_active) === 1 ? 'Deactivate' : 'Activate'}</button> : <span className="state-tag is-inactive inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-red-100 bg-red-50 text-[0.7rem] font-semibold text-red-700">Disabled</span>}</td></tr>)}
                        </tbody></table></div>}
                </section>
            </section>
        </DashboardLayout>
    );
}
