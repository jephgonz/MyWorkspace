import React from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import { appUrl } from '../../url';

const tools = [
    {
        key: 'accomplishments',
        label: 'Accomplishments',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        color: '#10b981',
        gradFrom: 'from-emerald-500/20',
        borderColor: 'group-hover:border-emerald-500/40',
        shadowColor: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
        href: '/admin/accomplishments',
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
        color: '#06b6d4',
        gradFrom: 'from-cyan-500/20',
        borderColor: 'group-hover:border-cyan-500/40',
        shadowColor: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
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
        color: '#a855f7',
        gradFrom: 'from-purple-500/20',
        borderColor: 'group-hover:border-purple-500/40',
        shadowColor: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
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
        color: '#f59e0b',
        gradFrom: 'from-amber-500/20',
        borderColor: 'group-hover:border-amber-500/40',
        shadowColor: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
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
        color: '#f43f5e',
        gradFrom: 'from-rose-500/20',
        borderColor: 'group-hover:border-rose-500/40',
        shadowColor: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
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
            <div className="space-y-6 max-w-6xl mx-auto pb-10">
                {/* Dashboard Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                            <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase font-mono">Jephthah's Workbench</span>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Real-time summary of tasks, completions, administrator accounts, and application tools.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={appUrl('/admin/accomplishments')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>View Task Board</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics: Real System Data in Glass Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Pending Tasks */}
                    <Link
                        href={appUrl('/admin/accomplishments')}
                        className="rounded-2xl bg-[#141933]/70 hover:bg-[#161c3b]/90 border border-white/[0.08] hover:border-cyan-500/40 p-5 transition-all duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_35px_rgba(6,182,212,0.15)] backdrop-blur-xl group block"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors">
                                Pending Tasks
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 2" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between">
                            <div>
                                <span className="text-3xl font-extrabold text-white tracking-tight">{openTaskCount}</span>
                                <p className="text-[11px] text-slate-400 mt-1">Open items awaiting completion</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                {openTaskCount > 0 ? 'Active' : 'Caught up'}
                            </span>
                        </div>
                    </Link>

                    {/* Card 2: Completed this Quarter */}
                    <div className="rounded-2xl bg-[#141933]/70 border border-white/[0.08] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300">
                                Completed This Quarter
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between">
                            <div>
                                <span className="text-3xl font-extrabold text-white tracking-tight">{completedThisQuarterCount}</span>
                                <p className="text-[11px] text-slate-400 mt-1">Accomplishments logged</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Quarter Goal
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Administrator Accounts */}
                    <Link
                        href={appUrl('/admin/users')}
                        className="rounded-2xl bg-[#141933]/70 hover:bg-[#161c3b]/90 border border-white/[0.08] hover:border-purple-500/40 p-5 transition-all duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_35px_rgba(168,85,247,0.15)] backdrop-blur-xl group block"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-purple-300 transition-colors">
                                Administrator Accounts
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between">
                            <div>
                                <span className="text-3xl font-extrabold text-white tracking-tight">{accountCounts.administrators}</span>
                                <p className="text-[11px] text-slate-400 mt-1">Active console administrators</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                {accountCounts.active} Active
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Section: Pending Tasks Preview (if any) */}
                {pendingTasks && pendingTasks.length > 0 && (
                    <div className="rounded-2xl bg-[#141933]/70 border border-white/[0.08] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <span className="text-cyan-400">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="9 11 12 14 22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                    </svg>
                                </span>
                                <h2 className="text-sm font-bold text-white">Upcoming Tasks</h2>
                            </div>
                            <Link href={appUrl('/admin/accomplishments')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                View all →
                            </Link>
                        </div>

                        <div className="mt-3 divide-y divide-white/[0.04]">
                            {pendingTasks.map((task) => (
                                <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 truncate">{task.title}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Due: {formatDueDate(task.due_date)}</p>
                                    </div>
                                    <Link
                                        href={appUrl('/admin/accomplishments')}
                                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-medium text-slate-300 border border-white/[0.08] transition-colors"
                                    >
                                        Open
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Application Tools */}
                <div className="rounded-2xl bg-[#141933]/70 border border-white/[0.08] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    <div className="pb-4 border-b border-white/[0.06]">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Application Tools</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Quick access to all workbench modules and administrative utilities.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                        {tools.map((app) => (
                            <Link
                                key={app.key}
                                href={appUrl(app.href)}
                                className={`group p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] ${app.borderColor} ${app.shadowColor} transition-all duration-200 flex flex-col justify-between`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                                        style={{
                                            backgroundColor: `${app.color}15`,
                                            borderColor: `${app.color}35`,
                                            color: app.color,
                                            borderWidth: 1,
                                            boxShadow: `0 0 15px ${app.color}20`,
                                        }}
                                    >
                                        {app.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                                            {app.label}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            {app.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-end text-[11px] font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                                    <span>Launch</span>
                                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
