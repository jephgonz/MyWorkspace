import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import { appUrl } from '../../url';

const tools = [
    {
        key: 'task-tracker',
        label: 'Task Tracker',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        color: '#0071e3', // Apple Blue
        gradFrom: 'from-blue-500/10',
        borderColor: 'group-hover:border-blue-500/30',
        shadowColor: 'group-hover:shadow-[0_8px_30px_rgba(0,113,227,0.12)]',
        href: '/admin/task-tracker',
        desc: 'Track tasks, milestones, and quarterly completion reports.',
    },
    {
        key: 'database',
        label: 'Database',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
        ),
        color: '#86868b', // Apple Grey
        gradFrom: 'from-slate-500/10',
        borderColor: 'group-hover:border-slate-500/30',
        shadowColor: 'group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        href: '/admin/database',
        desc: 'View tables, schema, backups, and SQL query workbench.',
    },
    {
        key: 'users',
        label: 'Admin Accounts',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
        ),
        color: '#5e5e5e',
        gradFrom: 'from-zinc-500/10',
        borderColor: 'group-hover:border-zinc-500/30',
        shadowColor: 'group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        href: '/admin/users',
        desc: 'Manage administrator accounts and system access privileges.',
    },
    {
        key: 'id-generator',
        label: 'ID Generator',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2M15 12h2M7 16h10" />
            </svg>
        ),
        color: '#bf40bf', // Apple Purple
        gradFrom: 'from-purple-500/10',
        borderColor: 'group-hover:border-purple-500/30',
        shadowColor: 'group-hover:shadow-[0_8px_30px_rgba(191,64,191,0.12)]',
        href: '/admin/tools/id-generator',
        desc: 'Design, generate, and export official employee ID cards.',
    },
    {
        key: 'monthly-allocation',
        label: 'Monthly CSV',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        color: '#ff3b30', // Apple Red
        gradFrom: 'from-rose-500/10',
        borderColor: 'group-hover:border-rose-500/30',
        shadowColor: 'group-hover:shadow-[0_8px_30px_rgba(255,59,48,0.12)]',
        href: '/admin/tools/monthly-allocation',
        desc: 'Download automated weekday allocation schedules as CSV.',
    },
];

function formatDueDate(value) {
    if (!value) return 'No due date';
    const datePart = String(value).slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Dashboard({
    accountCounts = { total: 0, active: 0, administrators: 0 },
    openTaskCount = 0,
    pendingTaskCount = 0,
    completedThisQuarterCount = 0,
    pendingTasks = [],
}) {
    return (
        <DashboardLayout title="Dashboard" activePage="overview">
            <div className="space-y-6">
                {/* Dashboard Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(0,113,227,0.3)]" />
                            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">MyWorkspace</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Real-time summary of tasks, completions, administrator accounts, and application tools.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={appUrl('/admin/task-tracker')}
                            className="icloud-btn shadow-lg"
                        >
                            <span>View Task Board</span>
                            <span className="ml-1.5" aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics: Apple Light Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Pending Tasks */}
                    <Link
                        href={appUrl('/admin/task-tracker')}
                        className="icloud-card p-6 group block"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                                Pending Tasks
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 2" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-5 flex items-baseline justify-between">
                            <div>
                                <span className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight">{openTaskCount}</span>
                                <p className="text-xs text-slate-500 mt-1 font-medium text-pretty">Open items awaiting completion</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${openTaskCount > 0 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                {openTaskCount > 0 ? 'Active' : 'Caught up'}
                            </span>
                        </div>
                    </Link>

                    {/* Card 2: Completed this Quarter */}
                    <div className="icloud-card p-6 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Completed This Quarter
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-5 flex items-baseline justify-between">
                            <div>
                                <span className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight">{completedThisQuarterCount}</span>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Tasks completed</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                Q4 Goal
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Administrator Accounts */}
                    <Link
                        href={appUrl('/admin/users')}
                        className="icloud-card p-6 group block"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#1d1d1f] transition-colors">
                                Admin Accounts
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-5 flex items-baseline justify-between">
                            <div>
                                <span className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight">{accountCounts.administrators}</span>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Console administrators</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {accountCounts.active} Active
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Section: Pending Tasks Preview */}
                {pendingTasks && pendingTasks.length > 0 && (
                    <div className="icloud-card p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                            <div className="flex items-center gap-3">
                                <span className="text-blue-600">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 11 12 14 22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                    </svg>
                                </span>
                                <h2 className="text-base font-bold text-[#1d1d1f]">Upcoming Tasks</h2>
                            </div>
                            <Link href={appUrl('/admin/task-tracker')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                View all items →
                            </Link>
                        </div>

                        <div className="mt-2 divide-y divide-slate-200/40">
                            {pendingTasks.map((task) => (
                                <div key={task.id} className="py-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#1d1d1f] truncate">{task.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Due: {formatDueDate(task.due_date)}</p>
                                    </div>
                                    <Link
                                        href={appUrl('/admin/task-tracker')}
                                        className="icloud-btn-secondary h-8 px-4 text-xs"
                                    >
                                        Open
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Application Tools */}
                <div className="icloud-card p-8">
                    <div className="pb-6 border-b border-slate-200/60">
                        <h2 className="text-base font-bold text-[#1d1d1f] uppercase tracking-wider">Application Tools</h2>
                        <p className="text-sm text-slate-500 mt-1">Quick access to all workbench modules and administrative utilities.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {tools.map((app) => (
                            <Link
                                key={app.key}
                                href={appUrl(app.href)}
                                className={`group p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/60 ${app.borderColor} ${app.shadowColor} transition-all duration-300 flex flex-col justify-between shadow-sm`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 duration-300 shadow-sm"
                                        style={{
                                            backgroundColor: `${app.color}10`,
                                            borderColor: `${app.color}25`,
                                            color: app.color,
                                            borderWidth: 1.5,
                                        }}
                                    >
                                        {app.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-[#1d1d1f] group-hover:text-blue-600 transition-colors">
                                            {app.label}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                                            {app.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-200/40 flex items-center justify-end text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                                    <span>Launch</span>
                                    <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
