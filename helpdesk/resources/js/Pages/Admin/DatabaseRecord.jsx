import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import { appUrl } from '../../url';

function inputType(column) {
    if (/date$/.test(column.type) && !/datetime|timestamp/.test(column.type)) return 'date';
    if (/datetime|timestamp/.test(column.type)) return 'datetime-local';
    if (/int|decimal|float|double/.test(column.type)) return 'number';
    return 'text';
}

export default function DatabaseRecord({ table, mode, fields = [], record = {}, key: keyToken }) {
    const initial = Object.fromEntries(fields.map((field) => {
        let value = record[field.name] ?? '';
        if (value && /datetime|timestamp/.test(field.type)) {
            value = String(value).replace(' ', 'T').slice(0, 16);
        }
        return [field.name, value];
    }));
    const form = useForm({ table, mode, key: keyToken, values: initial });

    return (
        <DashboardLayout title={mode === 'create' ? 'Add database row' : 'Edit database row'} activePage="database">
            <section className="space-y-6">
                <div className="pb-4 border-b border-black/[0.06]">
                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">{table}</p>
                    <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">{mode === 'create' ? 'Add row' : 'Edit row'}</h1>
                    <p className="text-sm text-slate-500 mt-1">Update fields in the selected table.</p>
                </div>

                <section className="icloud-card p-8">
                    <form className="space-y-6" onSubmit={(event) => {
                        event.preventDefault();
                        form.post(appUrl('/admin/database/record/save'));
                    }}>
                        {fields.map((field) => {
                            const error = form.errors[`values.${field.name}`] || form.errors[field.name];
                            const id = `database-field-${field.name}`;
                            return (
                                <div key={field.name} className="flex flex-col gap-1.5">
                                    <label htmlFor={id} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        {field.name}
                                    </label>
                                    <input
                                        id={id}
                                        className="icloud-input w-full"
                                        type={inputType(field)}
                                        value={form.data.values[field.name] ?? ''}
                                        required={!field.nullable && field.default === null}
                                        onChange={(event) => form.setData('values', { ...form.data.values, [field.name]: event.target.value })}
                                    />
                                    <small className="text-[10px] text-slate-400 ml-1">
                                        {field.type}{field.nullable ? ', optional' : ''}{field.default !== null ? `, default ${field.default}` : ''}
                                    </small>
                                    {error && <p className="text-xs text-rose-600 font-medium" role="alert">{error}</p>}
                                </div>
                            );
                        })}
                        {form.errors.form && <p className="text-xs text-rose-600 font-medium" role="alert">{form.errors.form}</p>}

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/[0.06]">
                            <button className="icloud-btn w-full shadow-md" type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save row'}</button>
                            <Link className="icloud-btn-secondary w-full" href={`${appUrl('/admin/database/table')}?table=${encodeURIComponent(table)}`}>Cancel</Link>
                        </div>
                    </form>
                </section>
            </section>
        </DashboardLayout>
    );
}
