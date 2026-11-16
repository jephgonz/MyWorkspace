import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import { appUrl } from '../../url';

const apps = [
    { key: 'accomplishments', label: 'Accomplishments', icon: '✓', color: '#34c759', href: '/admin/accomplishments', desc: 'Track your tasks and completions.' },
    { key: 'settings', label: 'Admin accounts', icon: '♙', color: '#0071e3', href: '/admin/users', desc: 'Manage administrator accounts.' },
    { key: 'database', label: 'Database', icon: '▤', color: '#5ac8fa', href: '/admin/database', desc: 'Tables, backups, and SQL workbench.' },
    { key: 'id-generator', label: 'ID Generator', icon: '▧', color: '#ff9f0a', href: '/admin/tools/id-generator', desc: 'Create employee ID cards.' },
    { key: 'monthly-allocation', label: 'Monthly CSV', icon: '📊', color: '#bf5af2', href: '/admin/tools/monthly-allocation', desc: 'Download weekday allocation CSV.' },
];

export default function Dashboard({ accountCounts = { total: 0, active: 0, administrators: 0 }, openTaskCount = 0, pendingTaskCount = 0, completedThisQuarterCount = 0 }) {
    return (
        <DashboardLayout title="Overview" activePage="overview">
            <section className="icloud-section">
                <div className="icloud-section-head">
                    <div>
                        <p className="eyebrow">JEPHTHAH'S WORKBENCH</p>
                        <h1 className="icloud-title">Overview</h1>
                        <p className="icloud-subtitle">Manage your work, administrator accounts, and application tools.</p>
                    </div>
                    <Link className="icloud-btn-secondary" href={appUrl('/admin/accomplishments')}>View task board <span aria-hidden="true">→</span></Link>
                </div>
                <div className="grid gap-4 mb-6 md:grid-cols-3">
                    <article className="icloud-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Your pending tasks</p>
                                <p className="text-2xl font-bold text-icloud-text">{openTaskCount}</p>
                            </div>
                            <span className="w-10 h-10 rounded-xl bg-icloud-blue-bg flex items-center justify-center text-icloud-blue text-xl">✓</span>
                        </div>
                        <p className="mt-2 text-[0.75rem] text-icloud-text-secondary">Tasks still open across your board.</p>
                    </article>
                    <article className="icloud-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Completed this quarter</p>
                                <p className="text-2xl font-bold text-icloud-text">{completedThisQuarterCount}</p>
                            </div>
                            <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl">♙</span>
                        </div>
                        <p className="mt-2 text-[0.75rem] text-icloud-text-secondary">Accomplishments this quarter.</p>
                    </article>
                    <article className="icloud-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Administrator accounts</p>
                                <p className="text-2xl font-bold text-icloud-text">{accountCounts.administrators}</p>
                            </div>
                            <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">♜</span>
                        </div>
                        <p className="mt-2 text-[0.75rem] text-icloud-text-secondary">Active administrator accounts.</p>
                    </article>
                </div>
                <div className="icloud-card p-6">
                    <p className="text-[0.8rem] font-semibold text-icloud-text mb-3">Tools</p>
                    <div className="icloud-app-grid">
                        {apps.map((app) => (
                            <Link key={app.key} className="icloud-app-tile" href={appUrl(app.href)}>
                                <div className="icloud-app-icon" style={{ background: `linear-gradient(135deg, ${app.color}1a, ${app.color}0d)` }}><span aria-hidden="true" style={{ color: app.color }}>{app.icon}</span></div>
                                <span className="text-[0.8rem] font-medium text-icloud-text text-center leading-snug">{app.label}</span>
                                <span className="text-[0.7rem] text-icloud-text-tertiary text-center">{app.desc}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}
