import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import FilePicker from '../../Components/FilePicker';
import { appUrl } from '../../url';

function ConnectionMonitor() {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const canvas = useRef(null);

    useEffect(() => {
        let active = true;
        const sample = async () => {
            try {
                const response = await fetch(appUrl('/admin/database/metrics'), { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Database metrics are unavailable.');
                if (active) {
                    setMetrics(data);
                    setError('');
                    setHistory((items) => [...items, { value: data.connected, time: Date.now() }].slice(-60));
                }
            } catch (reason) {
                if (active) setError(reason.message);
            }
        };
        sample();
        const timer = window.setInterval(sample, 5000);
        return () => { active = false; window.clearInterval(timer); };
    }, []);

    useEffect(() => {
        const element = canvas.current;
        if (!element) return undefined;
        const draw = () => {
            const bounds = element.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            element.width = Math.max(1, Math.floor(bounds.width * ratio));
            element.height = Math.max(1, Math.floor(bounds.height * ratio));
            const context = element.getContext('2d');
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            const max = Math.max(4, ...history.map((point) => point.value));
            const pad = 18;
            context.clearRect(0, 0, bounds.width, bounds.height);
            context.strokeStyle = '#e5e5ea';
            context.beginPath();
            context.moveTo(0, bounds.height - pad);
            context.lineTo(bounds.width, bounds.height - pad);
            context.stroke();
            if (history.length < 2) return;
            context.beginPath();
            history.forEach((point, index) => {
                const x = pad + (bounds.width - pad * 2) * index / (history.length - 1);
                const y = bounds.height - pad - (bounds.height - pad * 2) * point.value / max;
                if (index === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            });
            context.strokeStyle = '#0071e3';
            context.lineWidth = 2;
            context.stroke();
        };
        draw();
        const observer = new ResizeObserver(draw);
        observer.observe(element);
        return () => observer.disconnect();
    }, [history]);

    const statusClass = `database-live-status inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[0.75rem] font-medium${error ? ' border-rose-200 bg-rose-50 text-rose-700' : ' border-blue-200 bg-blue-50 text-blue-700'}`;

    return <section className="database-monitor icloud-card p-0" aria-label="Live database connection metrics">
        <div className="database-live-summary grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border-b border-black/[0.06]">
            <article className="database-info-card p-4 rounded-xl border border-black/[0.06] bg-white"><span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current connections</span><strong className="text-2xl font-extrabold text-[#1d1d1f] block">{metrics?.connected ?? '—'}</strong><small className="text-xs text-slate-500">Open client threads</small></article>
            <article className="database-info-card p-4 rounded-xl border border-black/[0.06] bg-white"><span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active threads</span><strong className="text-2xl font-extrabold text-[#1d1d1f] block">{metrics?.running ?? '—'}</strong><small className="text-xs text-slate-500">Threads processing work</small></article>
            <article className="database-info-card p-4 rounded-xl border border-black/[0.06] bg-white"><span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Peak connections</span><strong className="text-2xl font-extrabold text-[#1d1d1f] block">{metrics?.maxUsed ?? '—'}</strong><small className="text-xs text-slate-500">{metrics?.maxConnections ?? '—'} configured maximum</small></article>
        </div>
        <section className="admin-card database-chart-card p-6"><div className="admin-card-heading accounts-heading flex items-center justify-between mb-4"><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live server status</span><h2 className="text-lg font-bold text-[#1d1d1f] mt-0.5">Database connections</h2><p className="text-xs text-slate-500 mt-0.5">Connection counts sampled every five seconds.</p></div><span className={statusClass}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /><span>{error || (metrics ? 'Live' : 'Connecting…')}</span></span></div><div className="database-chart-wrap h-28 w-full"><canvas ref={canvas} aria-label="Live chart of MySQL client connections" className="w-full h-full" /></div><div className="database-chart-footer mt-4 flex justify-between text-xs text-slate-500 font-medium"><span>Recent samples</span><span>{metrics ? new Date(metrics.sampledAt).toLocaleTimeString() : 'Waiting for first sample'}</span></div></section>
    </section>;
}

function resultClass(table, matches) {
    if (table.status !== 'ready') return 'database-sync-result inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold border-amber-200 bg-amber-50 text-amber-700';
    if (matches) return 'database-sync-result inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold border-emerald-200 bg-emerald-50 text-emerald-700';
    return 'database-sync-result inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold border-blue-200 bg-blue-50 text-blue-700';
}

export default function Database({ driver = 'sqlite', databaseName, serverVersion, tables = [], connected = false, backupStatus = 'unavailable', backupChanges = 0, backupSkippedTables = [] }) {
    const form = useForm({ sql_file: null, confirm_replace: false });
    const cloneForm = useForm({ operation: 'backup', preview_token: '', confirm_clone: false });
    const { errors, flash } = usePage().props;
    const fileInput = useRef(null);
    const databaseType = driver === 'sqlite' ? 'SQLite' : 'MySQL';
    const [tableSearch, setTableSearch] = useState('');
    const [clonePreview, setClonePreview] = useState(null);
    const [clonePreviewError, setClonePreviewError] = useState('');
    const [clonePreviewing, setClonePreviewing] = useState(false);
    const filteredTables = useMemo(() => tables.filter((table) => table.name.toLowerCase().includes(tableSearch.trim().toLowerCase())), [tables, tableSearch]);
    const previewClone = async (operation) => {
        cloneForm.setData({ operation, preview_token: '', confirm_clone: false });
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            setClonePreviewError('The security token is missing. Refresh the page and try again.');
            return;
        }
        setClonePreviewing(true);
        setClonePreviewError('');
        setClonePreview(null);
        try {
            const response = await fetch(appUrl('/admin/database/backup/preview'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({ operation }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not preview the database backup or restore.');
            setClonePreview(data);
            cloneForm.setData({ operation, preview_token: data.token, confirm_clone: false });
        } catch (reason) {
            setClonePreviewError(reason.message || 'Could not preview the database backup or restore.');
        } finally {
            setClonePreviewing(false);
        }
    };
    const submitSync = (event) => {
        event.preventDefault();
        if (!clonePreview || !cloneForm.data.confirm_clone) return;
        cloneForm.post(appUrl('/admin/database/backup'), {
            onSuccess: () => setClonePreview(null),
        });
    };
    const syncableChanges = clonePreview?.tables?.some((table) => table.status !== 'ready') ? 0 : (clonePreview?.tables || []).reduce((total, table) => total + table.source_rows + table.target_rows, 0);
    const skippedTables = clonePreview?.tables?.filter((table) => table.status !== 'ready') || [];
    const submit = (event) => {
        event.preventDefault();
        if (!window.confirm('Import may drop and replace tables and data in the configured database. Continue?')) return;
        form.post(appUrl('/admin/database/import'));
    };

    const backupStateClass = `database-backup-state inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold${backupStatus === 'current' ? ' border-emerald-200 bg-emerald-50 text-emerald-700' : backupStatus === 'outdated' ? ' border-blue-200 bg-blue-50 text-blue-700' : backupStatus === 'needs_attention' ? ' border-amber-200 bg-amber-50 text-amber-700' : ' border-slate-200 bg-slate-50 text-slate-700'}`;
    const backupStateLabel = backupStatus === 'current' ? 'Backup current' : backupStatus === 'outdated' ? 'Backup outdated' : backupStatus === 'needs_attention' ? 'Schema needs attention' : 'Aiven unavailable';
    const connectionDotClass = `w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,199,89,0.4)]' : 'bg-rose-500'}`;

    return <DashboardLayout title="Local database" activePage="database">
        <section className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
                <div>
                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">System Administration</p>
                    <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">Local database</h1>
                    <p className="text-sm text-slate-500 mt-1">The application uses local SQLite as its primary database.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a className="icloud-btn-secondary" href="https://console.aiven.io/" target="_blank" rel="noopener noreferrer">Aiven Console <span className="ml-1" aria-hidden="true">→</span></a>
                    <a className="icloud-btn-secondary" href={appUrl('/admin/database')}>↻ Refresh</a>
                </div>
            </div>

            <section className="admin-card database-sync-card icloud-card p-0" aria-label="Aiven database backup and restore">
                <div className="admin-card-heading database-backup-heading p-6 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local primary · Aiven backup</span>
                        <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Backup and restore</h2>
                        <p className="text-sm text-slate-500 mt-1">Local SQLite is the live database. Back up copies local data to Aiven; restore replaces local data with the Aiven copy.</p>
                    </div>
                    <span className={backupStateClass}><span className="w-1.5 h-1.5 rounded-full bg-current" /><span>{backupStateLabel}</span></span>
                </div>
                <div className="database-backup-status-detail p-6 border-b border-black/[0.04] text-sm text-slate-600 bg-slate-50/50">
                    {backupStatus === 'outdated' ? <>
                        <strong className="block text-[#1d1d1f] font-bold">{backupChanges.toLocaleString()} {backupChanges === 1 ? 'row differs' : 'rows differ'} between Local SQLite and Aiven.</strong>
                        <span className="block mt-1">Local SQLite is the latest copy. Back up now to update Aiven.</span>
                    </> : backupStatus === 'current' ? <>
                        <strong className="block text-[#1d1d1f] font-bold">Aiven is synchronized with Local SQLite.</strong>
                        <span className="block mt-1">No rows differ between the two databases.</span>
                    </> : backupStatus === 'needs_attention' ? <>
                        <strong className="block text-[#1d1d1f] font-bold">The database needs attention.</strong>
                        <span className="block mt-1">{backupSkippedTables.length ? `Review these tables: ${backupSkippedTables.join(', ')}.` : 'The comparison exceeded its limit or found an incompatible table.'}</span>
                    </> : <>
                        <strong className="block text-[#1d1d1f] font-bold">Aiven is unavailable.</strong>
                        <span className="block mt-1">Could not compare Local SQLite with Aiven. Check the Aiven connection settings.</span>
                    </>}
                </div>
                {errors.clone && <div className="p-6 border-b border-black/[0.04]"><div className="p-4 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700 font-medium" role="alert">{errors.clone}</div></div>}
                {flash?.backupSnapshot && <p className="p-6 border-b border-black/[0.04] text-xs text-slate-600">A private pre-operation snapshot was created. <a href={appUrl(`/admin/database/backup-snapshots/${encodeURIComponent(flash.backupSnapshot)}`)} className="text-blue-600 font-semibold hover:underline">Download snapshot</a></p>}
                {clonePreviewError && <div className="p-6 border-b border-black/[0.04]"><div className="p-4 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700 font-medium" role="alert">{clonePreviewError}</div></div>}
                <div className="database-backup-actions p-6 border-b border-black/[0.04] flex flex-col sm:flex-row gap-3">
                    <button className="icloud-btn flex-1 shadow-md" type="button" disabled={clonePreviewing} onClick={() => previewClone('backup')}>{clonePreviewing && cloneForm.data.operation === 'backup' ? 'Comparing…' : 'Back up local to Aiven'}</button>
                    <button className="icloud-btn-secondary flex-1" type="button" disabled={clonePreviewing} onClick={() => previewClone('restore')}>{clonePreviewing && cloneForm.data.operation === 'restore' ? 'Comparing…' : 'Restore Aiven to local'}</button>
                </div>
                {clonePreview && <>
                    <p className="p-6 border-b border-black/[0.04] text-sm text-slate-600">Clone <strong className="text-[#1d1d1f] font-bold">{clonePreview.source === 'local' ? 'Local SQLite' : 'Aiven MySQL'}</strong> → <strong className="text-[#1d1d1f] font-bold">{clonePreview.target === 'local' ? 'Local SQLite' : 'Aiven MySQL'}</strong>. Destination table data will be replaced.</p>
                    <div className="table-wrap database-sync-table-wrap p-6"><table className="w-full text-left border-collapse text-sm database-sync-table"><thead><tr className="border-b border-black/[0.06]"><th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Table</th><th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source rows</th><th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination rows</th><th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Result</th></tr></thead><tbody className="divide-y divide-black/[0.04]">{clonePreview.tables.map((table) => {
                    const matches = table.status === 'ready' && table.new_rows + table.changed_rows + table.target_only_rows === 0;
                    const result = table.status !== 'ready'
                        ? table.status.replaceAll('_', ' ')
                        : matches
                            ? 'Matches'
                            : `${table.new_rows.toLocaleString()} added · ${table.changed_rows.toLocaleString()} changed · ${table.target_only_rows.toLocaleString()} removed`;
                    return <tr key={table.name} className="hover:bg-slate-50/80 transition-colors fade-in-up"><td className="py-3.5 text-xs font-bold text-[#1d1d1f]" data-label="Table">{table.name}</td><td className="py-3.5 text-xs text-slate-600" data-label="Source rows">{table.status === 'ready' ? table.source_rows.toLocaleString() : '—'}</td><td className="py-3.5 text-xs text-slate-600" data-label="Destination rows">{table.status === 'ready' ? table.target_rows.toLocaleString() : '—'}</td><td className="py-3.5" data-label="Result"><span className={resultClass(table, matches)}>{result}</span></td></tr>;
                })}</tbody></table></div>
                {skippedTables.length > 0 && <p className="p-6 border-b border-black/[0.04] text-xs text-rose-600 font-medium">Clone is blocked until every managed table has the same schema and transactional storage on Aiven. Check migrations and table engines, then preview again.</p>}
                {syncableChanges > 0 && skippedTables.length === 0 ? <form className="database-sync-confirm p-6 border-b border-black/[0.04] bg-slate-50/50" onSubmit={submitSync}>
                    <label className="flex items-start gap-3"><input type="checkbox" checked={cloneForm.data.confirm_clone} onChange={(event) => cloneForm.setData('confirm_clone', event.target.checked)} required className="mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /><span className="text-xs text-slate-600 leading-relaxed">I reviewed the preview. Replace all destination data in these tables with the source copy. A private snapshot of the destination will be created first.{cloneForm.data.operation === 'restore' ? ' The restore is blocked if it would remove or disable your current administrator account.' : ''}</span></label>
                    <button className="mt-4 icloud-btn w-full shadow-md" type="submit" disabled={cloneForm.processing || !cloneForm.data.confirm_clone}>{cloneForm.processing ? 'Cloning…' : cloneForm.data.operation === 'backup' ? 'Confirm backup to Aiven' : 'Confirm restore to local'}</button>
                </form> : skippedTables.length === 0 ? <p className="p-6 border-b border-black/[0.04] text-xs text-slate-500 font-medium">Both copies already match. No clone is needed.</p> : null}
            </>}
            </section>

            <section className="admin-card accounts-card database-tables-card icloud-card p-0">
                <div className="admin-card-heading accounts-heading p-6 border-b border-black/[0.06] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schema overview</span>
                        <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Tables</h2>
                        <p className="text-sm text-slate-500 mt-1">Browse and manage table data in the configured {databaseType} database.</p>
                    </div>
                    <span className="account-count text-xs font-bold text-slate-400 uppercase tracking-widest">{tables.length} tables</span>
                </div>
                {tables.length === 0 ? (
                    <div className="empty-state text-center py-16 p-6">
                        <span className="text-4xl mb-3 block">▤</span>
                        <strong className="text-lg font-medium text-[#1d1d1f] block">No tables found</strong>
                        <p className="mt-1 text-sm text-slate-500">The configured database has no visible tables.</p>
                    </div>
                ) : (
                    <>
                        <div className="database-table-search p-4 border-b border-black/[0.04] bg-slate-50/50 flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter tables</label>
                            <input id="database-table-search" type="search" className="icloud-input w-72 text-sm" value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search table names…" />
                        </div>
                        <div className="table-wrap overflow-x-auto p-6">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-black/[0.06]">
                                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Table</th>
                                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine</th>
                                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{driver === 'sqlite' ? 'Rows' : 'Estimated rows'}</th>
                                        {driver === 'mysql' && <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data + indexes</th>}
                                        <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.04]">
                                    {filteredTables.length === 0 ? (
                                        <tr>
                                            <td className="py-8 text-center text-slate-500 text-sm" colSpan={driver === 'sqlite' ? 4 : 5}>No tables match that search.</td>
                                        </tr>
                                    ) : (
                                        filteredTables.map((table) => (
                                            <tr key={table.name} className="hover:bg-slate-50/80 transition-colors fade-in-up">
                                                <td className="py-3.5 text-xs font-bold text-[#1d1d1f]">{table.name}</td>
                                                <td className="py-3.5 text-xs text-slate-600">{table.engine || '—'}</td>
                                                <td className="py-3.5 text-xs text-slate-600">{Number(table.rows_estimate || 0).toLocaleString()}</td>
                                                {driver === 'mysql' && <td className="py-3.5 text-xs text-slate-600">{ (Number(table.bytes || 0) / 1048576).toFixed(2) } MB</td>}
                                                <td className="py-3.5 text-right">
                                                    <Link className="icloud-btn-secondary h-8 px-4 text-xs font-semibold" href={`${appUrl('/admin/database/table')}?table=${encodeURIComponent(table.name)}`}>
                                                        Browse rows <span className="ml-1" aria-hidden="true">→</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            <section className="database-summary grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Database connection details">
                <article className="database-info-card p-5 rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Connection</span>
                    <strong className="text-lg font-bold text-[#1d1d1f] block flex items-center gap-2 mt-1">
                        <span className={connectionDotClass} />
                        <span>{connected ? 'Connected' : 'Unavailable'}</span>
                    </strong>
                    <small className="text-xs text-slate-500 mt-1 block">{connected ? `Using the configured ${databaseType} connection.` : `Check the configured ${databaseType} connection.`}</small>
                </article>
                <article className="database-info-card p-5 rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Database</span>
                    <strong className="text-lg font-bold text-[#1d1d1f] block mt-1 truncate">{databaseName}</strong>
                    <small className="text-xs text-slate-500 mt-1 block">{driver === 'sqlite' ? 'Local database file in this project' : 'MySQL schema used by the workbench'}</small>
                </article>
                <article className="database-info-card p-5 rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <span className="database-info-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{driver === 'sqlite' ? 'SQLite version' : 'Server version'}</span>
                    <strong className="text-lg font-bold text-[#1d1d1f] block mt-1">{serverVersion}</strong>
                    <small className="text-xs text-slate-500 mt-1 block">{driver === 'sqlite' ? 'Local database engine' : 'Configured MySQL server'}</small>
                </article>
            </section>

            {driver === 'mysql' && <ConnectionMonitor />}

            <section className="database-transfer-grid grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Database import and export">
                <article className="admin-card database-transfer-card icloud-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup</span>
                                <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Export database</h2>
                            </div>
                            <span className="text-2xl text-blue-600 font-light">↓</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">{driver === 'sqlite' ? 'Download a copy of the local SQLite database file, including its schema and all records.' : 'Download a Laravel-compatible MySQL SQL backup with table definitions and data, including Laravel migration history.'}</p>
                    </div>
                    <div>
                        <a className="icloud-btn database-download-button w-full shadow-md" href={appUrl('/admin/database/export')}>{driver === 'sqlite' ? 'Download SQLite backup' : 'Download SQL backup'}</a>
                        <p className="database-transfer-warning mt-3 text-xs text-slate-400 font-medium">The backup includes password hashes and other database contents. Keep the file private.</p>
                    </div>
                </article>

                {driver === 'sqlite' ? (
                    <article className="admin-card database-transfer-card icloud-card p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restore</span>
                                    <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Restore database</h2>
                                </div>
                                <span className="text-2xl text-blue-600 font-light">↑</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">To restore a SQLite backup, stop the application and replace <code className="text-blue-600 font-mono font-bold bg-blue-50 px-1 py-0.5 rounded">database/database.sqlite</code> with the backup file.</p>
                        </div>
                        <p className="database-transfer-warning text-xs text-slate-400 font-medium">Keep a separate backup before replacing the local database file.</p>
                    </article>
                ) : (
                    <article className="admin-card database-transfer-card icloud-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restore</span>
                                <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Restore database</h2>
                            </div>
                            <span className="text-2xl text-blue-600 font-light">↑</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Restore a .sql backup into the database configured for this Laravel application. Pending Laravel migrations run after the import.</p>
                        {errors.sql_file && <div className="mb-4"><div className="p-3 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700 font-medium" role="alert">{errors.sql_file}</div></div>}
                        {errors.confirm_replace && <div className="mb-4"><div className="p-3 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700 font-medium" role="alert">{errors.confirm_replace}</div></div>}
                        <form className="account-form database-import-form space-y-4" onSubmit={submit}>
                            <label className="id-picture-field flex flex-col gap-1.5" htmlFor="database-sql-file">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SQL file <span className="text-rose-500" aria-hidden="true">*</span></span>
                                <FilePicker id="database-sql-file" inputRef={fileInput} name="sql_file" accept=".sql,application/sql,text/plain" selectedFile={form.data.sql_file} emptyText="No SQL file selected" onChange={(event) => form.setData('sql_file', event.target.files[0] || null)} required />
                                <small className="text-xs text-slate-400">Choose a .sql dump. Maximum size: 25 MB.</small>
                            </label>
                            <label className="database-import-confirm flex items-start gap-3">
                                <input type="checkbox" checked={form.data.confirm_replace} onChange={(event) => form.setData('confirm_replace', event.target.checked)} required className="mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                <span className="text-xs text-slate-600 leading-relaxed">I understand matching tables and their data may be replaced in this Laravel database.</span>
                            </label>
                            <button className="icloud-btn w-full shadow-md" type="submit" disabled={form.processing}>{form.processing ? 'Restoring…' : 'Restore SQL backup'}</button>
                        </form>
                        <p className="database-transfer-warning mt-4 text-xs text-slate-400 font-medium">The restore uses this app’s configured database connection. Only table and data statements are accepted.</p>
                    </article>
                )}
            </section>
        </section>
    </DashboardLayout>;
}
