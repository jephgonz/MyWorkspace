import React, { useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../Components/DashboardLayout';
import { appUrl } from '../../url';
import {
    buildMonthlyAllocationPlan,
    MONTHLY_ALLOCATION_TARGET,
    WEEKDAY_ALLOCATION,
} from './monthlyAllocation';

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(date) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
        timeZone: 'UTC',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatMonthFilename(month) {
    return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric',
    }).replace(' ', '-');
}

function formatAmount(amount) {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

export default function MonthlyAllocationPlanner({
    monthlyTarget = MONTHLY_ALLOCATION_TARGET,
    weekdayAllocation = WEEKDAY_ALLOCATION,
    adPaths = [],
}) {
    const [month, setMonth] = useState(currentMonth);
    const [target, setTarget] = useState(String(monthlyTarget));
    const [baseWeekdayAmount, setBaseWeekdayAmount] = useState(String(weekdayAllocation));
    const [downloaded, setDownloaded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [previewRandomization, setPreviewRandomization] = useState(0);
    const [error, setError] = useState('');

    const numericTarget = Number(target);
    const validTarget = Number.isSafeInteger(numericTarget) && numericTarget > 0;
    const numericBaseWeekdayAmount = Number(baseWeekdayAmount);
    const validBaseWeekdayAmount = Number.isSafeInteger(numericBaseWeekdayAmount) && numericBaseWeekdayAmount > 0;
    const validAmounts = validTarget && validBaseWeekdayAmount;
    const plan = useMemo(
        () => validAmounts
            ? buildMonthlyAllocationPlan(month, numericTarget, adPaths, numericBaseWeekdayAmount)
            : [],
        [month, numericTarget, numericBaseWeekdayAmount, validAmounts, adPaths, previewRandomization],
    );
    const baseAmount = plan.length > 0
        ? numericTarget >= numericBaseWeekdayAmount * (plan.length - 2) + 2
            ? numericBaseWeekdayAmount
            : Math.min(numericBaseWeekdayAmount, Math.floor(numericTarget / plan.length))
        : 0;
    const finalTwoWeekdayAmounts = `${formatAmount(plan.at(-2)?.amount ?? 0)} + ${formatAmount(plan.at(-1)?.amount ?? 0)}`;

    const downloadPlan = async () => {
        setError('');
        setDownloaded(false);
        setProcessing(true);
        try {
            const response = await axios.post(appUrl('/admin/tools/monthly-allocation/download'), {
                month,
                target: numericTarget,
                base_amount: numericBaseWeekdayAmount,
                references: plan.map((entry) => entry.referenceNumber),
                ads: plan.map((entry) => entry.adPath),
            }, {
                responseType: 'blob',
                headers: { Accept: 'text/csv' },
                timeout: 30000,
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `monthly-plan-${formatMonthFilename(month)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setDownloaded(true);
        } catch (reason) {
            const responseData = reason.response?.data;
            if (responseData instanceof Blob) {
                try {
                    const payload = JSON.parse(await responseData.text());
                    setError(payload.message || 'CSV download failed.');
                } catch {
                    setError('CSV download failed.');
                }
            } else {
                setError(reason.response?.data?.message || 'CSV download failed.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <DashboardLayout title="Monthly CSV plan" activePage="monthly-allocation">
            <section className="space-y-6">
                <div>
                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Admin Tools</p>
                    <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">Monthly CSV plan</h1>
                    <p className="text-sm text-slate-500 mt-1">Download a CSV with one row for each weekday in the selected month.</p>
                </div>

                <section className="icloud-card overflow-hidden">
                    <div className="p-6 border-b border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly CSV</span>
                        <h2 className="text-xl font-bold text-[#1d1d1f] mt-0.5">Select a month</h2>
                        <p className="text-sm text-slate-500 mt-1">The CSV matches your example columns: number, datetime, value, refnumber, and ads. It includes weekdays only, uses times from 8:00–11:59 AM, and applies your month-end allocation rule.</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month</span>
                            <input
                                id="allocation-month"
                                type="month"
                                className="icloud-input"
                                value={month}
                                onChange={(event) => {
                                    if (!event.target.value) return;
                                    setMonth(event.target.value);
                                    setDownloaded(false);
                                }}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly target (PHP)</span>
                            <input
                                id="allocation-target"
                                type="number"
                                min="1"
                                max={Number.MAX_SAFE_INTEGER}
                                step="1"
                                className="icloud-input"
                                value={target}
                                onChange={(event) => {
                                    setTarget(event.target.value);
                                    setDownloaded(false);
                                }}
                            />
                        </label>
                        <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Base weekday amount (PHP)</span>
                            <input
                                id="allocation-base-amount"
                                type="number"
                                min="1"
                                max={Number.MAX_SAFE_INTEGER}
                                step="1"
                                className="icloud-input"
                                value={baseWeekdayAmount}
                                onChange={(event) => {
                                    setBaseWeekdayAmount(event.target.value);
                                    setDownloaded(false);
                                }}
                            />
                        </label>
                    </div>

                    <div className="p-6 border-t border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button className="icloud-btn h-10 px-6 shadow-md" type="button" onClick={downloadPlan} disabled={processing || !validAmounts}>
                                {processing ? 'Preparing CSV…' : 'Download CSV'}
                            </button>
                            <button
                                className="icloud-btn-secondary h-10 px-6"
                                type="button"
                                onClick={() => {
                                    setPreviewRandomization((value) => value + 1);
                                    setDownloaded(false);
                                }}
                                disabled={processing || adPaths.length === 0}
                            >
                                Rerandomize preview
                            </button>
                        </div>
                        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                        {downloaded && <p className="text-xs text-emerald-600 font-medium">The monthly CSV has been downloaded successfully.</p>}
                    </div>

                    {!validAmounts && <div className="px-6 pb-6"><div className="p-3 border border-rose-200 bg-rose-50 rounded-xl text-xs text-rose-700" role="alert">Enter positive whole-peso values for the monthly target and base weekday amount.</div></div>}

                    <div className="p-6 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-white">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/40"><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly target</span><strong className="text-base font-extrabold text-[#1d1d1f] mt-0.5 block">{formatAmount(validTarget ? numericTarget : 0)}</strong></div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/40"><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekdays scheduled</span><strong className="text-base font-extrabold text-[#1d1d1f] mt-0.5 block">{plan.length}</strong></div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/40"><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base weekday amount</span><strong className="text-base font-extrabold text-[#1d1d1f] mt-0.5 block">{formatAmount(baseAmount)}</strong></div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/40"><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final two weekdays</span><strong className="text-base font-extrabold text-[#1d1d1f] mt-0.5 block">{finalTwoWeekdayAmounts}</strong></div>
                    </div>

                    <div className="overflow-x-auto border-t border-slate-200/60">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">CSV date</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekday</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference number</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ad path</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/40">
                                {plan.map((entry) => (
                                    <tr key={entry.date} className="hover:bg-slate-50/80 transition-colors fade-in-up">
                                        <td className="px-6 py-3.5 text-xs font-bold text-[#1d1d1f]">{entry.date}</td>
                                        <td className="px-6 py-3.5 text-xs text-slate-600">{formatDate(entry.date)}</td>
                                        <td className="px-6 py-3.5 text-xs font-semibold text-slate-900">{formatAmount(entry.amount)}</td>
                                        <td className="px-6 py-3.5 text-xs font-mono text-slate-500">{entry.referenceNumber}</td>
                                        <td className="px-6 py-3.5 text-xs text-slate-500 truncate max-w-xs" title={entry.adPath}>{entry.adPath || 'No ad assets configured'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </DashboardLayout>
    );
}
