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
            <section className="icloud-section">
                <div className="icloud-section-head">
                    <div>
                        <p className="eyebrow">{table}</p>
                        <h1 className="icloud-title">{mode === 'create' ? 'Add row' : 'Edit row'}</h1>
                        <p className="icloud-subtitle">Update fields in the selected table.</p>
                    </div>
                    <Link className="icloud-btn-secondary database-page-button" href={`${appUrl('/admin/database/table')}?table=${encodeURIComponent(table)}`}>← Back to table</Link>
                </div>
                <section className="icloud-card p-5">
                    <form className="account-form database-record-form" onSubmit={(event) => {
                        event.preventDefault();
                        form.post(appUrl('/admin/database/record/save'));
                    }}>
                        {fields.map((field) => {
                            const error = form.errors[`values.${field.name}`] || form.errors[field.name];
                            const id = `database-field-${field.name}`;
                            return (
                                <label key={field.name} htmlFor={id}>
                                    {field.name}
                                    <input
                                        id={id}
                                        className="icloud-input w-full"
                                        type={inputType(field)}
                                        value={form.data.values[field.name] ?? ''}
                                        required={!field.nullable && field.default === null}
                                        onChange={(event) => form.setData('values', { ...form.data.values, [field.name]: event.target.value })}
                                    />
                                    <small>{field.type}{field.nullable ? ', optional' : ''}{field.default !== null ? `, default ${field.default}` : ''}</small>
                                    {error && <span className="text-[0.75rem] text-icloud-danger" role="alert">{error}</span>}
                                </label>
                            );
                        })}
                        {form.errors.form && <p className="text-[0.75rem] text-icloud-danger" role="alert">{form.errors.form}</p>}
                        <div className="form-actions flex flex-wrap items-center gap-3 border-t border-icloud-border pt-4">
                            <button className="icloud-btn" type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save row'}</button>
                            <Link className="icloud-btn-secondary database-page-button" href={`${appUrl('/admin/database/table')}?table=${encodeURIComponent(table)}`}>Cancel</Link>
                        </div>
                    </form>
                </section>
            </section>
        </DashboardLayout>
    );
}
