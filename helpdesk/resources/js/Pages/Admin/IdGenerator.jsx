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
        <section className="space-y-6">
            <div>
                <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Employee Services</p>
                <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">ID card generator</h1>
                <p className="text-sm text-slate-500 mt-1">Create and download an official employee identification card.</p>
            </div>
            {errors.form && <div className="p-4 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700" role="alert">{errors.form}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="icloud-card overflow-hidden">
                    <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 01</span>
                            <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Employee details</h2>
                        </div>
                    </div>
                    <form className="p-6 space-y-4" onSubmit={(event) => { event.preventDefault(); form.post(appUrl('/admin/tools/id-generator')); }}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">ID picture</label>
                            <FilePicker id="id-photo" inputRef={input} accept="image/jpeg,.jpg,.jpeg" selectedFile={form.data.image} buttonText="Choose photo" emptyText="No photo selected" required onChange={(event) => form.setData('image', event.target.files[0] || null)} />
                            <p className="text-[10px] text-slate-400 ml-1">JPEG image with a clean background.</p>
                            {errors.image && <p className="text-xs text-rose-500">{errors.image}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nickname</label>
                            <input className="icloud-input" value={form.data.nickname} onChange={(event) => form.setData('nickname', event.target.value)} required placeholder="e.g. Jeph" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full name</label>
                            <input className="icloud-input" value={form.data.fullname} onChange={(event) => form.setData('fullname', event.target.value)} required placeholder="e.g. Jephthah Gonzalez" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Position</label>
                            <input className="icloud-input" value={form.data.position} onChange={(event) => form.setData('position', event.target.value)} required placeholder="e.g. Lead Administrator" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Employee number</label>
                            <input type="number" min="1" className="icloud-input" value={form.data.empnumber} onChange={(event) => form.setData('empnumber', event.target.value)} required placeholder="001" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name font size</label>
                                <input type="number" min="10" max="120" className="icloud-input" value={form.data.fontsize} onChange={(event) => form.setData('fontsize', event.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Position font size</label>
                                <input type="number" min="10" max="80" className="icloud-input" value={form.data.fontsize2} onChange={(event) => form.setData('fontsize2', event.target.value)} />
                            </div>
                        </div>
                        <button className="icloud-btn w-full h-10 shadow-md mt-2" type="submit" disabled={form.processing}>{form.processing ? 'Generating…' : <>Generate ID <span className="ml-1" aria-hidden="true">→</span></>}</button>
                    </form>
                </section>
                <section className="icloud-card overflow-hidden flex flex-col justify-between">
                    <div className="flex-1 flex flex-col">
                        <div className="p-6 border-b border-black/[0.06]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 02</span>
                            <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Card preview</h2>
                        </div>
                        <div className="p-6 flex-1 flex items-center justify-center bg-slate-50/50 min-h-[520px]">
                            <img src={card ? appUrl(`/admin/tools/id-generator/preview/${encodeURIComponent(card)}`) : appUrl('/public/tools/sp-id-generator/id.png')} alt={card ? 'Generated employee ID card' : 'Sample employee ID card template'} className="w-full h-full object-contain max-h-[600px] rounded-2xl border border-black/[0.1] shadow-2xl bg-white p-2" />
                        </div>
                    </div>
                    <div className="p-6 border-t border-black/[0.06] flex justify-end bg-white">
                        {card ? <a className="icloud-btn h-10 px-6 shadow-md" href={appUrl(`/admin/tools/id-generator/download/${encodeURIComponent(card)}`)}>↓ Download ID card</a> : <p className="text-xs text-slate-400 font-medium">Your generated card will appear here.</p>}
                    </div>
                </section>
            </div>
        </section>
    </DashboardLayout>;
}
