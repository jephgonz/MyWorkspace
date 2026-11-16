import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import BrowserNotifications from './BrowserNotifications';
import { appUrl } from '../url';

const adminLinks = [
    { key: 'overview', label: 'Overview', icon: 'overview', href: '/admin' },
    { key: 'accomplishments', label: 'Accomplishments', icon: 'accomplishments', href: '/admin/accomplishments' },
    { key: 'monthly-allocation', label: 'Monthly CSV', icon: 'monthly-allocation', href: '/admin/tools/monthly-allocation' },
    { key: 'id-generator', label: 'ID Generator', icon: 'id-generator', href: '/admin/tools/id-generator' },
    { key: 'settings', label: 'Settings', icon: 'settings', href: '/admin/users' },
];

const navigationIcons = {
    overview: <><rect x="3.75" y="3.75" width="6.5" height="6.5" rx="1.5" /><rect x="13.75" y="3.75" width="6.5" height="6.5" rx="1.5" /><rect x="3.75" y="13.75" width="6.5" height="6.5" rx="1.5" /><rect x="13.75" y="13.75" width="6.5" height="6.5" rx="1.5" /></>,
    accomplishments: <><path d="M8 5h11.5M8 12h11.5M8 19h11.5" /><path d="m3.5 5 1.25 1.25L7 4M3.5 12l1.25 1.25L7 11M3.5 19l1.25 1.25L7 18" /></>,
    settings: <><circle cx="12" cy="8" r="3.25" /><path d="M5.25 20c.55-3.1 3.2-5 6.75-5s6.2 1.9 6.75 5" /><path d="M19 4.5v4M17 6.5h4" /></>,
    'id-generator': <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="2" /><path d="M5.75 16c.4-1.6 1.5-2.5 3.25-2.5s2.85.9 3.25 2.5M14.5 9h3.25M14.5 13h3.25M14.5 16h2" /></>,
    'monthly-allocation': <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17M7.5 12.5h.01M12 12.5h.01M16.5 12.5h.01M7.5 16h.01M12 16h.01" /></>,
};

function NavigationIcon({ name }) {
    return (
        <svg className="icloud-sidebar-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {navigationIcons[name]}
        </svg>
    );
}

export default function DashboardLayout({ title, activePage, children }) {
    const { auth, errors, flash } = usePage().props;
    const user = auth?.user;
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigationRef = useRef(null);
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
    useEffect(() => {
        if (!window.matchMedia('(max-width: 760px)').matches) return;
        const navigation = navigationRef.current;
        const activeLink = navigation?.querySelector('.icloud-sidebar-item-active');
        if (!navigation || !activeLink) return;
        navigation.scrollLeft = activeLink.offsetLeft - (navigation.clientWidth - activeLink.offsetWidth) / 2;
    }, [activePage]);
    return (
        <div className="icloud-page relative">
            <Head title={title} />
            <aside className="icloud-sidebar" aria-label="Workbench navigation">
                <div className="icloud-sidebar-brand">
                    <span className="icloud-brand-mark"><img src={appUrl('/public/assets/images/SP.ico')} alt="" /></span>
                    <span className="icloud-brand-copy"><strong>Jephthah's Workbench</strong><small>Admin console</small></span>
                </div>
                <p className="icloud-sidebar-section-label">Workspace</p>
                <nav className="icloud-sidebar-nav" aria-label="Admin navigation" ref={navigationRef}>
                    {adminLinks.map((link) => (
                        <Link key={link.key} className={`icloud-sidebar-item${activePage === link.key ? ' icloud-sidebar-item-active' : ''}`} href={appUrl(link.href)} aria-current={activePage === link.key ? 'page' : undefined}>
                            <span className="icloud-sidebar-icon"><NavigationIcon name={link.icon} /></span>
                            <span className="icloud-sidebar-label">{link.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="icloud-sidebar-foot"><span className="online-dot" /><span><strong>Workspace online</strong><small>Administrator access</small></span></div>
            </aside>
            <header className="icloud-topbar">
                <div className="icloud-topbar-heading">
                    <span>ADMIN CONSOLE</span>
                    <strong>{title}</strong>
                </div>
                <div className="topbar-user flex items-center gap-3">
                    <BrowserNotifications userId={user?.id || 'admin'} />
                    <div className="topbar-profile flex items-center gap-2" ref={profileRef}>
                        <button className="profile-trigger icloud-btn-ghost flex items-center gap-2 px-2" type="button" aria-label={`Profile menu for ${user?.name || 'administrator'}`} aria-expanded={profileOpen} aria-controls="profile-menu" onClick={() => setProfileOpen((open) => !open)}>
                            <span className="user-badge inline-flex items-center justify-center w-6 h-6 rounded-full border border-icloud-border bg-icloud-surface text-[0.75rem] font-medium text-icloud-text">{ (user?.name || '?').slice(0, 1).toUpperCase() }</span>
                            <span className="profile-trigger-name hidden sm:inline text-[0.8rem] font-medium text-icloud-text">{user?.name}</span>
                            <span className={`profile-chevron${profileOpen ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
                        </button>
                        <section className={`profile-menu${profileOpen ? ' is-open' : ''}`} id="profile-menu" aria-hidden={!profileOpen} inert={!profileOpen}>
                            <div className="profile-menu-heading"><strong>Your profile</strong><small className="text-[0.75rem] text-icloud-text-tertiary">Administrator</small></div>
                            <form className="profile-form" onSubmit={saveProfile}>
                                <fieldset disabled={!profileOpen || profile.processing}>
                                    <div className="icloud-label">Display name</div>
                                    <input className="icloud-input w-full" value={profile.data.display_name} onChange={(event) => profile.setData('display_name', event.target.value)} maxLength="120" required />
                                    <div className="icloud-label mt-3">Email</div>
                                    <input type="email" className="icloud-input w-full" value={profile.data.email} onChange={(event) => profile.setData('email', event.target.value)} maxLength="190" required />
                                    <small className="mt-1 block text-[0.7rem] text-icloud-text-tertiary">Email addresses do not need to be unique.</small>
                                    {Object.entries(profile.errors).map(([field, message]) => <p key={field} className="mt-1 block text-[0.75rem] text-icloud-danger">{message}</p>)}
                                    <button className="mt-3 icloud-btn w-full" type="submit" disabled={profile.processing}>{profile.processing ? 'Saving…' : 'Save profile'}</button>
                                </fieldset>
                            </form>
                            <button className="profile-signout mt-4 block w-full text-left px-3 py-2 text-[0.8rem] text-icloud-danger hover:bg-red-50 rounded-xl transition-colors" type="button" onClick={() => router.post(appUrl('/logout'))}>Sign out</button>
                        </section>
                    </div>
                </div>
            </header>
            <div className="icloud-content">
                {flash?.success && <div className="dashboard-notice success" role="status">{flash.success}</div>}
                {flash?.error && <div className="dashboard-notice error" role="alert">{flash.error}</div>}
                {errors?.form && <div className="dashboard-notice error" role="alert">{errors.form}</div>}
                {children}
                <footer className="dashboard-footer icloud-section mt-6 pt-4 border-t border-icloud-border text-[0.7rem] text-icloud-text-tertiary">Jephthah's Workbench <span className="mx-1">·</span> Administration</footer>
            </div>
        </div>
    );
}
