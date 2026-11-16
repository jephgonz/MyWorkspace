import React, { useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import FilePicker from '../../Components/FilePicker';
import { appUrl } from '../../url';

export default function IdGenerator() {
    const { flash, errors } = usePage().props;
    const input = useRef(null);
    const form = useForm({ image: null, nickname: '', fullname: '', position: '', empnumber: '', fontsize: 70, fontsize2: 35 });
    const card = flash?.generatedCard;
    return <DashboardLayout title="ID Generator" activePage="id-generator">
        <section className="icloud-section">
            <div className="icloud-section-head mb-6">
                <div>
                    <p className="eyebrow">EMPLOYEE SERVICES</p>
                    <h1 className="icloud-title">ID card generator</h1>
                    <p className="icloud-subtitle">Create and download an employee identification card.</p>
                </div>
            </div>
            {errors.form && <div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700 mb-6" role="alert">{errors.form}</div>}
            <div className="admin-grid idgen-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="icloud-card p-0">
                    <div className="admin-card-heading p-5 border-b border-icloud-border flex items-center justify-between"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Step 01</span><h2 className="text-lg font-bold text-icloud-text">Employee details</h2><p className="text-[0.8rem] text-icloud-text-secondary">Enter the information exactly as it should appear on the card.</p></div><span className="section-mark text-xl text-icloud-blue">✎</span></div>
                    <form className="account-form idgen-form p-5 space-y-4" onSubmit={(event) => { event.preventDefault(); form.post(appUrl('/admin/tools/id-generator')); }}>
                        <div className="field flex flex-col gap-1.5">
                            <label className="idgen-photo-field icloud-label" htmlFor="id-photo">ID picture</label>
                            <FilePicker id="id-photo" inputRef={input} accept="image/jpeg,.jpg,.jpeg" selectedFile={form.data.image} buttonText="Choose photo" emptyText="No photo selected" required onChange={(event) => form.setData('image', event.target.files[0] || null)} />
                            <p className="text-[0.7rem] text-icloud-text-tertiary">JPEG image with a white background.</p>
                            {errors.image && <p className="text-[0.75rem] text-icloud-danger">{errors.image}</p>}
                        </div>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label">Nickname</label>
                            <input className="icloud-input" value={form.data.nickname} onChange={(event) => form.setData('nickname', event.target.value)} required />
                        </div>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label">Full name</label>
                            <input className="icloud-input" value={form.data.fullname} onChange={(event) => form.setData('fullname', event.target.value)} required />
                        </div>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label">Position</label>
                            <input className="icloud-input" value={form.data.position} onChange={(event) => form.setData('position', event.target.value)} required />
                        </div>
                        <div className="field flex flex-col gap-1.5">
                            <label className="icloud-label">Employee number</label>
                            <input type="number" min="1" className="icloud-input" value={form.data.empnumber} onChange={(event) => form.setData('empnumber', event.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="field flex flex-col gap-1.5">
                                <label className="icloud-label">Name font size</label>
                                <input type="number" min="10" max="120" className="icloud-input" value={form.data.fontsize} onChange={(event) => form.setData('fontsize', event.target.value)} />
                            </div>
                            <div className="field flex flex-col gap-1.5">
                                <label className="icloud-label">Position font size</label>
                                <input type="number" min="10" max="80" className="icloud-input" value={form.data.fontsize2} onChange={(event) => form.setData('fontsize2', event.target.value)} />
                            </div>
                        </div>
                        <button className="icloud-btn w-full" type="submit" disabled={form.processing}>{form.processing ? 'Generating…' : <>Generate ID <span aria-hidden="true">→</span></>}</button>
                    </form>
                </section>
                <section className="icloud-card p-0">
                    <div className="admin-card-heading p-5 border-b border-icloud-border flex items-center justify-between"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Step 02</span><h2 className="text-lg font-bold text-icloud-text">Card preview</h2><p className="text-[0.8rem] text-icloud-text-secondary">Review the generated card before downloading.</p></div></div>
                    <div className="idgen-preview p-5 flex items-center justify-center min-h-[320px] bg-white border border-icloud-border rounded-[calc(var(--radius-icloud)-4px)]"><img src={card ? appUrl(`/admin/tools/id-generator/preview/${encodeURIComponent(card)}`) : appUrl('/public/tools/sp-id-generator/id.png')} alt={card ? 'Generated employee ID card' : 'Sample employee ID card template'} className="max-w-full max-h-[300px] rounded-lg border border-icloud-border/50" /></div>
                    <div className="p-5 border-t border-icloud-border/50 flex justify-end">
                        {card ? <a className="icloud-btn" href={appUrl(`/admin/tools/id-generator/download/${encodeURIComponent(card)}`)}>↓ Download ID card</a> : <p className="text-[0.8rem] text-icloud-text-secondary">Your generated card will appear here.</p>}
                    </div>
                </section>
            </div>
        </section>
    </DashboardLayout>;
}
