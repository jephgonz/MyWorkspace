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
            context.strokeStyle = '#e9edf3';
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

    const statusClass = `database-live-status inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[0.75rem] font-medium${error ? ' border-red-100 bg-red-50 text-red-700' : ' border-blue-100 bg-blue-50 text-blue-700'}`;

    return <section className="database-monitor icloud-card p-0" aria-label="Live database connection metrics">
        <div className="database-live-summary grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border-b border-icloud-border/50">
            <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">Current connections</span><strong className="text-xl font-bold text-icloud-text block">{metrics?.connected ?? '—'}</strong><small className="text-[0.7rem] text-icloud-text-secondary">Open client threads</small></article>
            <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">Active threads</span><strong className="text-xl font-bold text-icloud-text block">{metrics?.running ?? '—'}</strong><small className="text-[0.7rem] text-icloud-text-secondary">Threads processing work</small></article>
            <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">Peak connections</span><strong className="text-xl font-bold text-icloud-text block">{metrics?.maxUsed ?? '—'}</strong><small className="text-[0.7rem] text-icloud-text-secondary">{metrics?.maxConnections ?? '—'} configured maximum</small></article>
        </div>
        <section className="admin-card database-chart-card p-5 border-t border-icloud-border/50"><div className="admin-card-heading accounts-heading flex items-center justify-between mb-3"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Live server status</span><h2 className="text-lg font-bold text-icloud-text">Database connections</h2><p className="text-[0.8rem] text-icloud-text-secondary">Connection counts sampled every five seconds.</p></div><span className={statusClass}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /><span>{error || (metrics ? 'Live' : 'Connecting…')}</span></span></div><div className="database-chart-wrap h-24 w-full"><canvas ref={canvas} aria-label="Live chart of MySQL client connections" className="w-full h-full" /></div><div className="database-chart-footer mt-3 flex justify-between text-[0.7rem] text-icloud-text-secondary"><span>Recent samples</span><span>{metrics ? new Date(metrics.sampledAt).toLocaleTimeString() : 'Waiting for first sample'}</span></div></section>
    </section>;
}

function resultClass(table, matches) {
    if (table.status !== 'ready') return 'database-sync-result inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold border-amber-100 bg-amber-50 text-amber-700';
    if (matches) return 'database-sync-result inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold border-green-100 bg-green-50 text-green-700';
    return 'database-sync-result inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.7rem] font-semibold border-blue-100 bg-blue-50 text-blue-700';
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

    const backupStateClass = `database-backup-state inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[0.75rem] font-medium${backupStatus === 'current' ? ' border-green-100 bg-green-50 text-green-700' : backupStatus === 'outdated' ? ' border-blue-100 bg-blue-50 text-blue-700' : backupStatus === 'needs_attention' ? ' border-amber-100 bg-amber-50 text-amber-700' : ' border-gray-100 bg-gray-50 text-gray-700'}`;
    const backupStateLabel = backupStatus === 'current' ? 'Backup current' : backupStatus === 'outdated' ? 'Backup outdated' : backupStatus === 'needs_attention' ? 'Schema needs attention' : 'Aiven unavailable';
    const connectionDotClass = `w-2 h-2 rounded-full${connected ? ' bg-green-500' : ' bg-red-500'}`;

    return <DashboardLayout title="Local database" activePage="database">
        <section className="icloud-section">
            <div className="icloud-section-head flex flex-col lg:flex-row lg:items-center gap-4">
                <div>
                    <p className="eyebrow">SYSTEM</p>
                    <h1 className="icloud-title">Local database</h1>
                    <p className="icloud-subtitle">The application uses local SQLite as its primary database.</p>
                </div>
                <div className="title-actions flex items-center gap-2"><a className="icloud-btn-secondary" href="https://console.aiven.io/" target="_blank" rel="noopener noreferrer">Aiven Console <span aria-hidden="true">→</span></a><a className="icloud-btn-secondary" href={appUrl('/admin/database')}>↻ Refresh</a></div>
            </div>
            <section className="admin-card database-sync-card icloud-card p-0 mt-6" aria-label="Aiven database backup and restore">
                <div className="admin-card-heading database-backup-heading p-5 border-b border-icloud-border flex items-center justify-between"><div className="database-backup-heading-copy"><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Local primary · Aiven backup</span><h2 className="text-lg font-bold text-icloud-text">Backup and restore</h2><p className="text-[0.8rem] text-icloud-text-secondary">Local SQLite is the live database. Back up copies local data to Aiven; restore replaces local data with the Aiven copy. Both operations preview all managed tables and require confirmation.</p></div><span className={backupStateClass}><span className="w-1.5 h-1.5 rounded-full bg-current" /><span>{backupStateLabel}</span></span></div>
                <div className="database-backup-status-detail p-5 border-b border-icloud-border/50 text-[0.8rem] text-icloud-text-secondary">
                    {backupStatus === 'outdated' ? <>
                        <strong className="block text-icloud-text">{backupChanges.toLocaleString()} {backupChanges === 1 ? 'row differs' : 'rows differ'} between Local SQLite and Aiven.</strong>
                        <span className="block mt-1">Local SQLite is the latest copy. Back up now to update Aiven.</span>
                    </> : backupStatus === 'current' ? <>
                        <strong className="block text-icloud-text">Aiven is synchronized with Local SQLite.</strong>
                        <span className="block mt-1">No rows differ between the two databases.</span>
                    </> : backupStatus === 'needs_attention' ? <>
                        <strong className="block text-icloud-text">The database needs attention.</strong>
                        <span className="block mt-1">{backupSkippedTables.length ? `Review these tables: ${backupSkippedTables.join(', ')}.` : 'The comparison exceeded its limit or found an incompatible table.'}</span>
                    </> : <>
                        <strong className="block text-icloud-text">Aiven is unavailable.</strong>
                        <span className="block mt-1">Could not compare Local SQLite with Aiven. Check the Aiven connection settings.</span>
                    </>}
                </div>
                {errors.clone && <div className="p-5 border-b border-icloud-border/50"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">{errors.clone}</div></div>}
                {flash?.backupSnapshot && <p className="p-5 border-b border-icloud-border/50 text-[0.8rem] text-icloud-text-secondary">A private pre-operation snapshot was created. <a href={appUrl(`/admin/database/backup-snapshots/${encodeURIComponent(flash.backupSnapshot)}`)} className="text-icloud-blue hover:underline">Download snapshot</a></p>}
                {clonePreviewError && <div className="p-5 border-b border-icloud-border/50"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">{clonePreviewError}</div></div>}
                <div className="database-backup-actions p-5 border-b border-icloud-border/50 flex gap-3">
                    <button className="icloud-btn flex-1" type="button" disabled={clonePreviewing} onClick={() => previewClone('backup')}>{clonePreviewing && cloneForm.data.operation === 'backup' ? 'Comparing…' : 'Back up local to Aiven'}</button>
                    <button className="icloud-btn-secondary flex-1" type="button" disabled={clonePreviewing} onClick={() => previewClone('restore')}>{clonePreviewing && cloneForm.data.operation === 'restore' ? 'Comparing…' : 'Restore Aiven to local'}</button>
                </div>
                {clonePreview && <>
                    <p className="p-5 border-b border-icloud-border/50 text-[0.8rem] text-icloud-text-secondary">Clone <strong className="text-icloud-text">{clonePreview.source === 'local' ? 'Local SQLite' : 'Aiven MySQL'}</strong> → <strong className="text-icloud-text">{clonePreview.target === 'local' ? 'Local SQLite' : 'Aiven MySQL'}</strong>. Destination table data will be replaced.</p>
                    <div className="table-wrap database-sync-table-wrap p-5"><table className="w-full text-left border-collapse text-sm database-sync-table"><thead><tr className="border-b border-icloud-border/50"><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Table</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Source rows</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Destination rows</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Result</th></tr></thead><tbody>{clonePreview.tables.map((table) => {
                    const matches = table.status === 'ready' && table.new_rows + table.changed_rows + table.target_only_rows === 0;
                    const result = table.status !== 'ready'
                        ? table.status.replaceAll('_', ' ')
                        : matches
                            ? 'Matches'
                            : `${table.new_rows.toLocaleString()} added · ${table.changed_rows.toLocaleString()} changed · ${table.target_only_rows.toLocaleString()} removed`;
                    return <tr key={table.name} className="border-b border-icloud-border/50"><td className="py-2 text-[0.8rem] text-icloud-text" data-label="Table"><strong>{table.name}</strong></td><td className="py-2 text-[0.8rem] text-icloud-text-secondary" data-label="Source rows">{table.status === 'ready' ? table.source_rows.toLocaleString() : '—'}</td><td className="py-2 text-[0.8rem] text-icloud-text-secondary" data-label="Destination rows">{table.status === 'ready' ? table.target_rows.toLocaleString() : '—'}</td><td className="py-2" data-label="Result"><span className={resultClass(table, matches)}>{result}</span></td></tr>;
                })}</tbody></table></div>
                {skippedTables.length > 0 && <p className="p-5 border-b border-icloud-border/50 text-[0.8rem] text-red-700">Clone is blocked until every managed table has the same schema and transactional storage on Aiven. Check migrations and table engines, then preview again.</p>}
                {syncableChanges > 0 && skippedTables.length === 0 ? <form className="database-sync-confirm p-5 border-b border-icloud-border/50" onSubmit={submitSync}>
                    <label className="flex items-start gap-2"><input type="checkbox" checked={cloneForm.data.confirm_clone} onChange={(event) => cloneForm.setData('confirm_clone', event.target.checked)} required className="mt-0.5 text-icloud-blue" /><span className="text-[0.8rem] text-icloud-text-secondary leading-relaxed">I reviewed the preview. Replace all destination data in these tables with the source copy. A private snapshot of the destination will be created first.{cloneForm.data.operation === 'restore' ? ' The restore is blocked if it would remove or disable your current administrator account.' : ''}</span></label>
                    <button className="mt-3 icloud-btn w-full" type="submit" disabled={cloneForm.processing || !cloneForm.data.confirm_clone}>{cloneForm.processing ? 'Cloning…' : cloneForm.data.operation === 'backup' ? 'Confirm backup to Aiven' : 'Confirm restore to local'}</button>
                </form> : skippedTables.length === 0 ? <p className="p-5 border-b border-icloud-border/50 text-[0.8rem] text-icloud-text-secondary">Both copies already match. No clone is needed.</p> : null}
            </>}
            </section>
            <section className="admin-card accounts-card database-tables-card icloud-card p-0 mt-6"><div className="admin-card-heading accounts-heading p-5 border-b border-icloud-border flex items-center justify-between"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Schema overview</span><h2 className="text-lg font-bold text-icloud-text">Tables</h2><p className="text-[0.8rem] text-icloud-text-secondary">Browse and manage table data in the configured {databaseType} database.</p></div><span className="account-count text-[0.75rem] font-medium text-icloud-text-secondary">{tables.length} tables</span></div>
                {tables.length === 0 ? <div className="empty-state text-center py-10 p-5"><span className="text-3xl mb-2 block">▤</span><strong className="text-lg font-medium text-icloud-text block">No tables found</strong><p className="mt-1 text-[0.8rem] text-icloud-text-secondary">The configured database has no visible tables.</p></div> : <>
                    <div className="database-table-search p-4 border-b border-icloud-border/50 flex items-center gap-2"><label className="text-[0.7rem] font-semibold text-icloud-text-tertiary">Filter tables</label><input id="database-table-search" type="search" className="icloud-input w-64" value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search table names…" /></div>
                    <div className="table-wrap overflow-x-auto p-5"><table className="w-full text-left border-collapse text-sm"><thead><tr className="border-b border-icloud-border/50"><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Table</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Engine</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">{driver === 'sqlite' ? 'Rows' : 'Estimated rows'}</th>{driver === 'mysql' && <th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Data + indexes</th>}<th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary"></th></tr></thead><tbody>{filteredTables.length === 0 ? <tr><td className="py-4 text-center text-icloud-text-secondary" colSpan={driver === 'sqlite' ? 4 : 5}>No tables match that search.</td></tr> : filteredTables.map((table) => <tr key={table.name} className="border-b border-icloud-border/50 hover:bg-icloud-bg transition-colors"><td className="py-3 text-[0.8rem] text-icloud-text"><strong>{table.name}</strong></td><td className="py-3 text-[0.8rem] text-icloud-text-secondary">{table.engine || '—'}</td><td className="py-3 text-[0.8rem] text-icloud-text-secondary">{Number(table.rows_estimate || 0).toLocaleString()}</td>{driver === 'mysql' && <td className="py-3 text-[0.8rem] text-icloud-text-secondary">{ (Number(table.bytes || 0) / 1048576).toFixed(2) } MB</td>}<td className="py-3"><Link className="icloud-btn-secondary database-browse-button" href={`${appUrl('/admin/database/table')}?table=${encodeURIComponent(table.name)}`}>Browse rows <span aria-hidden="true">→</span></Link></td></tr>)}</tbody></table></div>
                </>}
            </section>
            <section className="database-summary grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 p-0" aria-label="Database connection details">
                <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">Connection</span><strong className="text-xl font-bold text-icloud-text block flex items-center gap-1.5"><span className={connectionDotClass} /><span>{connected ? 'Connected' : 'Unavailable'}</span></strong><small className="text-[0.7rem] text-icloud-text-secondary">{connected ? `Using the configured ${databaseType} connection.` : `Check the configured ${databaseType} connection.`}</small></article>
                <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">Database</span><strong className="text-xl font-bold text-icloud-text block">{databaseName}</strong><small className="text-[0.7rem] text-icloud-text-secondary">{driver === 'sqlite' ? 'Local database file in this project' : 'MySQL schema used by the workbench'}</small></article>
                <article className="database-info-card p-3 rounded-xl border border-icloud-border bg-white"><span className="database-info-label text-[0.7rem] font-semibold text-icloud-text-tertiary block mb-1">{driver === 'sqlite' ? 'SQLite version' : 'Server version'}</span><strong className="text-xl font-bold text-icloud-text block">{serverVersion}</strong><small className="text-[0.7rem] text-icloud-text-secondary">{driver === 'sqlite' ? 'Local database engine' : 'Configured MySQL server'}</small></article>
            </section>
            {driver === 'mysql' && <ConnectionMonitor />}
            <section className="database-transfer-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-0" aria-label="Database import and export">
                <article className="admin-card database-transfer-card icloud-card p-5"><div className="admin-card-heading flex items-center justify-between mb-3"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Backup</span><h2 className="text-lg font-bold text-icloud-text">Export database</h2><p className="text-[0.8rem] text-icloud-text-secondary">{driver === 'sqlite' ? 'Download a copy of the local SQLite database file, including its schema and all records.' : 'Download a Laravel-compatible MySQL SQL backup with table definitions and data, including Laravel migration history. It can also be opened in phpMyAdmin or MySQL Workbench.'}</p></div><span className="section-mark text-2xl text-icloud-blue">↓</span></div><a className="icloud-btn database-download-button w-full" href={appUrl('/admin/database/export')}>{driver === 'sqlite' ? 'Download SQLite backup' : 'Download SQL backup'}</a><p className="database-transfer-warning mt-3 text-[0.7rem] text-icloud-text-secondary">The backup includes password hashes and other database contents. Keep the file private.</p></article>
                {driver === 'sqlite' ? <article className="admin-card database-transfer-card icloud-card p-5"><div className="admin-card-heading flex items-center justify-between mb-3"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Restore</span><h2 className="text-lg font-bold text-icloud-text">Restore database</h2><p className="text-[0.8rem] text-icloud-text-secondary">To restore a SQLite backup, stop the application and replace <code className="text-icloud-blue">database/database.sqlite</code> with the backup file.</p></div><span className="section-mark text-2xl text-icloud-blue">↑</span></div><p className="database-transfer-warning text-[0.7rem] text-icloud-text-secondary">Keep a separate backup before replacing the local database file.</p></article> : <article className="admin-card database-transfer-card icloud-card p-5"><div className="admin-card-heading flex items-center justify-between mb-3"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Restore</span><h2 className="text-lg font-bold text-icloud-text">Restore database</h2><p className="text-[0.8rem] text-icloud-text-secondary">Restore a .sql backup into the database configured for this Laravel application. Pending Laravel migrations run after the import.</p></div><span className="section-mark text-2xl text-icloud-blue">↑</span></div>
                {errors.sql_file && <div className="mb-3"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">{errors.sql_file}</div></div>}
                {errors.confirm_replace && <div className="mb-3"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">{errors.confirm_replace}</div></div>}
                <form className="account-form database-import-form space-y-3" onSubmit={submit}>
                    <label className="id-picture-field flex flex-col gap-1.5" htmlFor="database-sql-file"><span className="icloud-label">SQL file <span className="text-icloud-danger" aria-hidden="true">*</span></span><FilePicker id="database-sql-file" inputRef={fileInput} name="sql_file" accept=".sql,application/sql,text/plain" selectedFile={form.data.sql_file} emptyText="No SQL file selected" onChange={(event) => form.setData('sql_file', event.target.files[0] || null)} required /><small className="text-[0.7rem] text-icloud-text-tertiary">Choose a .sql dump. Maximum size: 25 MB.</small></label>
                    <label className="database-import-confirm flex items-start gap-2"><input type="checkbox" checked={form.data.confirm_replace} onChange={(event) => form.setData('confirm_replace', event.target.checked)} required className="mt-0.5 text-icloud-blue" /><span className="text-[0.8rem] text-icloud-text-secondary leading-relaxed">I understand matching tables and their data may be replaced in this Laravel database.</span></label>
                    <button className="icloud-btn w-full" type="submit" disabled={form.processing}>{form.processing ? 'Restoring…' : 'Restore SQL backup'}</button>
                </form><p className="database-transfer-warning mt-3 text-[0.7rem] text-icloud-text-secondary">The restore uses this app’s configured database connection. Only table and data statements are accepted; database-level commands, routines, and triggers are not imported.</p>
            </article>}
            </section>
        </section>
    </DashboardLayout>;
}
