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
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:border-slate-200/80 hover:bg-slate-50 text-slate-500 hover:text-rose-600 transition-colors" type="submit" aria-label="Delete row" title="Delete row" disabled={form.processing}>
                <ActionIcon type="remove" />
            </button>
        </form>
    );
}

export default function DatabaseTable({ table, columns = [], rows = [], keys = [], editable, canCreate }) {
    return (
        <DashboardLayout title={`Table: ${table}`} activePage="database">
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Database Table</p>
                        <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">{table}</h1>
                        <p className="text-sm text-slate-500 mt-1">Showing the first {rows.length} rows.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link className="icloud-btn-secondary" href={appUrl('/admin/database')}>← Tables</Link>
                        {canCreate && <Link className="icloud-btn shadow-md" href={`${appUrl('/admin/database/record/create')}?table=${encodeURIComponent(table)}`}>+ Add row</Link>}
                    </div>
                </div>

                <section className="icloud-card overflow-hidden">
                    {rows.length === 0 ? (
                        <div className="p-16 text-center">
                            <span className="text-4xl mb-3 block">▤</span>
                            <strong className="text-lg font-medium text-[#1d1d1f] block">No rows found</strong>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200/60">
                                        {columns.map((column) => <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider" key={column.name}>{column.name}</th>)}
                                        {editable && <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/40">
                                    {rows.map((row, index) => (
                                        <tr className="hover:bg-slate-50/80 transition-colors fade-in-up" key={keys[index] ?? index}>
                                            {columns.map((column) => (
                                                <td className="px-6 py-4 text-xs text-slate-600 font-medium" key={column.name}>
                                                    {row[column.name] === null ? <span className="text-slate-400 font-normal italic">NULL</span> : String(row[column.name])}
                                                </td>
                                            ))}
                                            {editable && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <Link className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:border-slate-200/80 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors" aria-label="Edit row" title="Edit row" href={`${appUrl('/admin/database/record/edit')}?table=${encodeURIComponent(table)}&key=${encodeURIComponent(keys[index])}`}>
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
