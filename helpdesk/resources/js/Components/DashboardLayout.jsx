import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import BrowserNotifications from './BrowserNotifications';
import Collapse from './Collapse';
import { appUrl } from '../url';

const navGroups = [
    {
        key: 'general',
        title: 'GENERAL',
        links: [
            { key: 'overview', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
            { key: 'task-tracker', label: 'Task Tracker', icon: 'task-tracker', href: '/admin/task-tracker' },
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
        case 'task-tracker':
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
        <div className="workbench-layout min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col font-sans selection:bg-black/10 selection:text-black relative overflow-x-hidden">
            <Head title={title ? `${title} · MyWorkspace` : "MyWorkspace"} />

            <header className="workbench-topbar sticky top-0 z-40 w-full h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl flex items-center justify-between px-4 lg:px-6 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen((v) => !v)}
                        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-black hover:bg-slate-100/50 transition-colors cursor-pointer"
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="lg:hidden mr-2">
                        <span className="font-bold text-xs tracking-tight text-black truncate max-w-[140px]">MyWorkspace</span>
                    </div>

                    {/* Page Context & Title - MyWorkspace branding */}
                    <div className="flex flex-col min-w-0 hidden lg:block">
                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Admin console</span>
                        <h2 className="text-sm font-bold text-black tracking-tight leading-tight truncate">
                            MyWorkspace
                        </h2>
                    </div>

                    {/* Page Title Only */}
                    <div className="flex flex-col min-w-0 lg:hidden">
                        <h2 className="text-sm font-bold text-black tracking-tight leading-tight truncate">
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
                            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100/60 hover:bg-slate-100 border border-slate-200/60 hover:border-slate-300/60 transition-all cursor-pointer shadow-sm group"
                            aria-expanded={profileOpen}
                            aria-label="User Profile Menu"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/60 bg-slate-100/60 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-zinc-700">{displayName.slice(0, 1).toUpperCase()}</span>
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                    {displayName}
                                </span>
                                <span className="text-[10px] text-slate-500 leading-tight">
                                    {roleTitle}
                                </span>
                            </div>
                            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-blue-500' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {/* Profile Dropdown Menu */}
                        <Collapse open={profileOpen}>
                            <div className="notification-menu is-open profile-settings-menu bg-white border border-slate-200/80 shadow-xl rounded-2xl p-4 absolute right-0 mt-2 w-64 z-50">
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 p-[1.5px]">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-blue-600">
                                            {displayName.slice(0, 1).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-black">{displayName}</h4>
                                        <p className="text-[11px] text-slate-500">{user?.email || 'admin@workbench.local'}</p>
                                    </div>
                                </div>

                                <form className="mt-3 space-y-2.5" onSubmit={saveProfile}>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={profile.data.display_name}
                                            onChange={(e) => profile.setData('display_name', e.target.value)}
                                            className="w-full h-8 px-2.5 text-xs text-slate-900 bg-white border border-slate-200/80 rounded-lg focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={profile.data.email}
                                            onChange={(e) => profile.setData('email', e.target.value)}
                                            className="w-full h-8 px-2.5 text-xs text-slate-900 bg-white border border-slate-200/80 rounded-lg focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profile.processing}
                                        className="w-full mt-2 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md cursor-pointer"
                                    >
                                        {profile.processing ? 'Saving…' : 'Save Profile'}
                                    </button>
                                </form>

                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                    <Link href={appUrl('/admin/users')} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                                        Admin accounts
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post(appUrl('/logout'))}
                                        className="text-xs font-medium text-rose-600 hover:text-rose-500 transition-colors cursor-pointer"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </Collapse>
                    </div>
                </div>
            </header>

            {/* Main Application Container */}
            <div className="flex flex-1 relative z-10 min-w-0">
                {/* Left Sidebar */}
                <aside className={`
                    fixed lg:static top-16 bottom-0 left-0 z-30
                    w-64 bg-[#f5f5f7]/95 lg:bg-[#f5f5f7]/90 backdrop-blur-2xl
                    border-r border-slate-200/60 flex flex-col justify-between
                    transition-transform duration-350 cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease
                    ${mobileNavOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'}
                `}>
                    <div className="p-5 pb-3 border-b border-slate-200/60" />

                    {/* Navigation Links by Category */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-black/5">
                        {navGroups.map((group) => (
                            <div key={group.key} className="space-y-1">
                                <div className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
                                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                                                    : 'text-slate-600 hover:text-black hover:bg-slate-100/60'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
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
                    <div className="p-3.5 border-t border-slate-200/60 bg-slate-50/50">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm">
                            <span className="relative flex h-2 w-2 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-slate-900 leading-tight">Workspace Online</span>
                                <span className="text-[10px] text-slate-500 leading-tight">Administrator Access</span>
                            </div>
                        </div>
                        <div className="mt-2.5 text-center text-[10px] text-slate-500">
                            © {new Date().getFullYear()} MyWorkspace
                        </div>
                    </div>
                </aside>

                {/* Mobile backdrop */}
                {mobileNavOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ease-out animate-fade-in"
                        onClick={() => setMobileNavOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 lg:p-6 lg:pl-7 relative">
                    {/* Flash messages / notifications */}
                    {flash?.success && (
                        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between shadow-sm animate-fade-in">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                {flash.success}
                            </span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between shadow-sm animate-fade-in">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                {flash.error}
                            </span>
                        </div>
                    )}
                    {errors?.form && (
                        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs shadow-sm animate-fade-in">
                            {errors.form}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
