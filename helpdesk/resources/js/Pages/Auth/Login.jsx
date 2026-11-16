import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { appUrl } from '../../url';

export default function Login() {
    const form = useForm({ login_action: 'admin_login', email: '', password: '' });
    const error = form.errors.login || form.errors.login_action;

    return (
        <>
            <Head title="Administrator sign in" />
            <main className="icloud-page min-h-screen flex items-center justify-center px-4">
                <div className="icloud-card icloud-login-card w-full max-w-md p-6">
                    <div className="icloud-login-brand flex items-center gap-3 mb-7">
                        <span className="icloud-brand-mark"><img src={appUrl('/public/assets/images/SP.ico')} alt="" /></span>
                        <span className="icloud-brand-copy"><strong>Jephthah's Workbench</strong><small>Administrator access</small></span>
                    </div>
                    <h1 className="text-[1.5rem] font-bold text-icloud-text mb-1">Sign in</h1>
                    <p className="text-[0.85rem] text-icloud-text-secondary mb-6">Use your administrator email and password.</p>
                    {error && <div className="icloud-card border-icloud-danger bg-red-50 p-3 mb-5 text-[0.8rem] text-icloud-danger rounded-xl" role="alert">{error}</div>}
                    <form className="login-form" onSubmit={(event) => { event.preventDefault(); form.post(appUrl('/admin/login')); }}>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label" htmlFor="email">Administrator email</label>
                            <div className="relative">
                                <svg viewBox="0 0 24 24" className="login-input-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icloud-text-tertiary" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 5.5L19.5 7" /></svg>
                                <input id="email" type="email" autoComplete="username" placeholder="Your administrator email" className="icloud-input w-full pl-9" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} required />
                            </div>
                            {form.errors.email && <p className="text-[0.75rem] text-icloud-danger">{form.errors.email}</p>}
                        </div>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label" htmlFor="password">Password</label>
                            <div className="relative">
                                <svg viewBox="0 0 24 24" className="login-input-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icloud-text-tertiary" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v2" /></svg>
                                <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="icloud-input w-full pl-9" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
                            </div>
                            {form.errors.password && <p className="text-[0.75rem] text-icloud-danger">{form.errors.password}</p>}
                        </div>
                        {form.errors.form && <p className="text-[0.75rem] text-icloud-danger">{form.errors.form}</p>}
                        <button className="icloud-btn w-full" type="submit" disabled={form.processing}>{form.processing ? 'Signing in…' : 'Sign in'}</button>
                    </form>
                    <footer className="mt-6 pt-4 border-t border-icloud-border flex justify-between text-[0.7rem] text-icloud-text-tertiary"><span>© {new Date().getFullYear()} Jephthah's Workbench</span><span>Administrator access only</span></footer>
                </div>
            </main>
        </>
    );
}
