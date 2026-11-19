import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import ActionIcon from '../../Components/ActionIcon';
import { appUrl } from '../../url';

function DeleteRow({ table, keyToken }) {
    const form = useForm({ table, key: keyToken });
    return (
        <form onSubmit={(event) => {
            event.preventDefault();
            if (window.confirm('Delete this row?')) form.post(appUrl('/admin/database/record/delete'));
        }}>
            <button className="icloud-btn-ghost database-row-action is-delete" type="submit" aria-label="Delete row" title="Delete row" disabled={form.processing}>
                <ActionIcon type="remove" />
            </button>
        </form>
    );
}

export default function DatabaseTable({ table, columns = [], rows = [], keys = [], editable, canCreate }) {
    return (
        <DashboardLayout title={`Table: ${table}`} activePage="database">
            <section className="icloud-section">
                <div className="icloud-section-head">
                    <div>
                        <p className="eyebrow">DATABASE TABLE</p>
                        <h1 className="icloud-title">{table}</h1>
                        <p className="icloud-subtitle">Showing the first {rows.length} rows.</p>
                    </div>
                    <div className="table-page-actions">
                        <Link className="icloud-btn-secondary database-page-button" href={appUrl('/admin/database')}>← Tables</Link>
                        {canCreate && <Link className="icloud-btn database-page-button" href={`${appUrl('/admin/database/record/create')}?table=${encodeURIComponent(table)}`}>+ Add row</Link>}
                    </div>
                </div>
                <section className="icloud-card database-tables-card p-0">
                    {rows.length === 0 ? (
                        <div className="empty-state p-8 text-center">
                            <strong className="text-lg font-medium text-icloud-text block">No rows found</strong>
                        </div>
                    ) : (
                        <div className="table-wrap overflow-x-auto">
                            <table className="w-full min-w-max border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-icloud-border">
                                        {columns.map((column) => <th className="p-3 text-[0.7rem] font-semibold text-icloud-text-tertiary" key={column.name}>{column.name}</th>)}
                                        {editable && <th className="p-3 text-[0.7rem] font-semibold text-icloud-text-tertiary">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr className="border-b border-icloud-border/50 hover:bg-icloud-bg" key={keys[index] ?? index}>
                                            {columns.map((column) => (
                                                <td className="p-3 text-[0.8rem] text-icloud-text" key={column.name}>
                                                    {row[column.name] === null ? <span className="muted-cell">NULL</span> : String(row[column.name])}
                                                </td>
                                            ))}
                                            {editable && (
                                                <td className="p-3">
                                                    <div className="database-row-actions flex items-center gap-2">
                                                        <Link className="icloud-btn-ghost database-row-action is-edit" aria-label="Edit row" title="Edit row" href={`${appUrl('/admin/database/record/edit')}?table=${encodeURIComponent(table)}&key=${encodeURIComponent(keys[index])}`}>
                                                            <ActionIcon type="edit" />
                                                        </Link>
                                                        {table !== 'helpdesk_users' && <DeleteRow table={table} keyToken={keys[index]} />}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>
        </DashboardLayout>
    );
}
