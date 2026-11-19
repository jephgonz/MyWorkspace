import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import BrowserNotifications from './BrowserNotifications';
import { appUrl } from '../url';

const navGroups = [
    {
        key: 'general',
        title: 'GENERAL',
        links: [
            { key: 'overview', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
            { key: 'accomplishments', label: 'Accomplishments', icon: 'accomplishments', href: '/admin/accomplishments' },
        ],
    },
    {
        key: 'database',
        title: 'DATABASE',
        links: [
            { key: 'database', label: 'Database', icon: 'database', href: '/admin/database' },
        ],
    },
    {
        key: 'tools',
        title: 'TOOLS',
        links: [
            { key: 'id-generator', label: 'ID Generator', icon: 'id-generator', href: '/admin/tools/id-generator' },
            { key: 'monthly-allocation', label: 'Monthly CSV', icon: 'monthly-allocation', href: '/admin/tools/monthly-allocation' },
        ],
    },
    {
        key: 'administration',
        title: 'ADMINISTRATION',
        links: [
            { key: 'users', label: 'Admin Accounts', icon: 'users', href: '/admin/users' },
        ],
    },
];

function NavIcon({ name, active }) {
    switch (name) {
        case 'dashboard':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
            );
        case 'accomplishments':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
            );
        case 'database':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            );
        case 'id-generator':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M15 8h2M15 12h2M7 16h10" />
                </svg>
            );
        case 'monthly-allocation':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            );
        case 'users':
        case 'settings':
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
            );
        default:
            return (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
    }
}

export default function DashboardLayout({ title, activePage = 'overview', children }) {
    const { auth, errors, flash } = usePage().props;
    const user = auth?.user;
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const profileRef = useRef(null);

    const profile = useForm({
        display_name: user?.name || '',
        email: user?.email || '',
    });

    const saveProfile = (event) => {
        event.preventDefault();
        profile.post(appUrl('/profile'), { onSuccess: () => setProfileOpen(false) });
    };

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false);
            }
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    const displayName = user?.name || 'Alex Chen';
    const roleTitle = 'Administrator';

    const isLinkActive = (link) => {
        if (activePage === link.key) return true;
        if (activePage === 'settings' && link.key === 'users') return true;
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (link.href !== '/admin' && currentPath.includes(link.href)) return true;
            if (link.href === '/admin' && (currentPath.endsWith('/admin') || currentPath.endsWith('/admin/'))) return true;
        }
        return false;
    };

    return (
        <div className="workbench-layout min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
            <Head title={title ? `${title} · Jephthah's Workbench` : "Jephthah's Workbench"} />

            <div className="workbench-ambient fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-72 left-1/2 h-[34rem] w-[48rem] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[120px]" />
            </div>

            <header className="workbench-topbar sticky top-0 z-40 w-full h-16 border-b border-white/[0.07] bg-[#09090b]/75 backdrop-blur-2xl flex items-center justify-between px-4 lg:px-6 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen((v) => !v)}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="lg:hidden mr-2">
                        <span className="font-bold text-xs tracking-tight text-white truncate max-w-[140px]">Jephthah's Workbench</span>
                    </div>

                    {/* Page Context & Title */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Admin Console</span>
                        <h2 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                            {title || 'Dashboard'}
                        </h2>
                    </div>
                </div>

                {/* Right Topbar Elements */}
                <div className="flex items-center gap-3">
                    {/* Notification Center */}
                    <div className="relative">
                        <BrowserNotifications userId={user?.id || 'admin'} />
                    </div>

                    {/* User profile capsule */}
                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            onClick={() => setProfileOpen((o) => !o)}
                            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-sm group"
                            aria-expanded={profileOpen}
                            aria-label="User Profile Menu"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-zinc-100">{displayName.slice(0, 1).toUpperCase()}</span>
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-slate-100 leading-tight group-hover:text-cyan-300 transition-colors">
                                    {displayName}
                                </span>
                                <span className="text-[10px] text-slate-400 leading-tight">
                                    {roleTitle}
                                </span>
                            </div>
                            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-cyan-400' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {/* Profile Dropdown Menu */}
                        {profileOpen && (
                            <div className="notification-menu is-open profile-settings-menu">
                                <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[1.5px]">
                                        <div className="w-full h-full rounded-full bg-[#0b0e1b] flex items-center justify-center font-bold text-cyan-300">
                                            {displayName.slice(0, 1).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">{displayName}</h4>
                                        <p className="text-[11px] text-slate-400">{user?.email || 'admin@workbench.local'}</p>
                                    </div>
                                </div>

                                <form className="mt-3 space-y-2.5" onSubmit={saveProfile}>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={profile.data.display_name}
                                            onChange={(e) => profile.setData('display_name', e.target.value)}
                                            className="w-full h-8 px-2.5 text-xs text-slate-200 bg-[#0b0e1b]/80 border border-white/[0.1] rounded-lg focus:border-cyan-400 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={profile.data.email}
                                            onChange={(e) => profile.setData('email', e.target.value)}
                                            className="w-full h-8 px-2.5 text-xs text-slate-200 bg-[#0b0e1b]/80 border border-white/[0.1] rounded-lg focus:border-cyan-400 outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profile.processing}
                                        className="w-full mt-2 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                                    >
                                        {profile.processing ? 'Saving…' : 'Save Profile'}
                                    </button>
                                </form>

                                <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                                    <Link href={appUrl('/admin/users')} className="text-xs text-slate-400 hover:text-cyan-300 transition-colors">
                                        Admin accounts
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post(appUrl('/logout'))}
                                        className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Application Container */}
            <div className="flex flex-1 relative z-10 min-w-0">
                {/* Left Sidebar */}
                <aside className={`
                    fixed lg:static top-16 bottom-0 left-0 z-30
                    w-64 bg-[#111113]/90 lg:bg-[#111113]/75 backdrop-blur-2xl
                    border-r border-white/[0.07] flex flex-col justify-between
                    transition-transform duration-300 ease-in-out
                    ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="p-5 pb-3">
                        <Link href={appUrl('/admin')} className="group block min-w-0">
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate">
                                        Jephthah's Workbench
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase block -mt-0.5">Admin console</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links by Category */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                        {navGroups.map((group) => (
                            <div key={group.key} className="space-y-1">
                                <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {group.title}
                                </div>
                                {group.links.map((link) => {
                                    const active = isLinkActive(link);
                                    return (
                                        <Link
                                            key={link.key}
                                            href={appUrl(link.href)}
                                            className={`
                                                group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150
                                                ${active
                                                    ? 'bg-white/[0.1] text-white border border-white/[0.12]'
                                                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                                                    <NavIcon name={link.icon} active={active} />
                                                </span>
                                                <span>{link.label}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom Status Footer */}
                    <div className="p-3.5 border-t border-white/[0.07] bg-white/[0.01]">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <span className="relative flex h-2 w-2 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-slate-200 leading-tight">Workspace Online</span>
                                <span className="text-[10px] text-slate-400 leading-tight">Administrator Access</span>
                            </div>
                        </div>
                        <div className="mt-2.5 text-center text-[10px] text-slate-400">
                            © {new Date().getFullYear()} Jephthah's Workbench
                        </div>
                    </div>
                </aside>

                {/* Mobile backdrop */}
                {mobileNavOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
                        onClick={() => setMobileNavOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 lg:p-6 lg:pl-7 relative">
                    {/* Flash messages / notifications */}
                    {flash?.success && (
                        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                {flash.success}
                            </span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                {flash.error}
                            </span>
                        </div>
                    )}
                    {errors?.form && (
                        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs shadow-lg">
                            {errors.form}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
