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
            <section className="icloud-section">
                <div className="icloud-section-head mb-6">
                    <div>
                        <p className="eyebrow">ADMIN TOOLS</p>
                        <h1 className="icloud-title">Monthly CSV plan</h1>
                        <p className="icloud-subtitle">Download a CSV with one row for each weekday in the selected month.</p>
                    </div>
                </div>

                <section className="admin-card allocation-planner-card icloud-card p-0">
                    <div className="admin-card-heading p-5 border-b border-icloud-border"><div><span className="step-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Monthly CSV</span><h2 className="text-lg font-bold text-icloud-text">Select a month</h2><p className="allocation-description text-[0.8rem] text-icloud-text-secondary">The CSV matches your example columns: number, datetime, value, refnumber, and ads. It includes weekdays only, uses times from 8:00–11:59 AM, and applies your month-end allocation rule: extra below PHP 500 goes to the last day; PHP 500 or more is split across the final two days.</p></div></div>

                    <div className="allocation-controls p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="allocation-field flex flex-col gap-1.5">
                            <span className="icloud-label">Month</span>
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
                        <label className="allocation-field flex flex-col gap-1.5">
                            <span className="icloud-label">Monthly target (PHP)</span>
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
                        <label className="allocation-field flex flex-col gap-1.5">
                            <span className="icloud-label">Base weekday amount (PHP)</span>
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
                        <div className="allocation-actions flex flex-col md:flex-row md:items-end gap-3">
                            <button className="icloud-btn" type="button" onClick={downloadPlan} disabled={processing || !validAmounts}>
                                {processing ? 'Preparing CSV…' : 'Download CSV'}
                            </button>
                            <button
                                className="icloud-btn-secondary"
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
                    </div>
                    {!validAmounts && <p className="px-5 pb-4"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">Enter positive whole-peso values for the monthly target and base weekday amount.</div></p>}

                    <div className="allocation-summary p-5 border-t border-icloud-border/50 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div><span className="block text-[0.7rem] font-semibold text-icloud-text-tertiary">Monthly target</span><strong className="text-icloud-text">{formatAmount(validTarget ? numericTarget : 0)}</strong></div>
                        <div><span className="block text-[0.7rem] font-semibold text-icloud-text-tertiary">Weekdays scheduled</span><strong className="text-icloud-text">{plan.length}</strong></div>
                        <div><span className="block text-[0.7rem] font-semibold text-icloud-text-tertiary">Base weekday amount</span><strong className="text-icloud-text">{formatAmount(baseAmount)}</strong></div>
                        <div><span className="block text-[0.7rem] font-semibold text-icloud-text-tertiary">Final two weekday amounts</span><strong className="text-icloud-text">{finalTwoWeekdayAmounts}</strong></div>
                    </div>

                    <div className="table-wrap allocation-table-wrap p-5 border-t border-icloud-border/50 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead><tr className="border-b border-icloud-border/50"><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">CSV date</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Weekday</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Value</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Reference number</th><th className="pb-2 text-[0.7rem] font-semibold text-icloud-text-tertiary">Ad path</th></tr></thead>
                            <tbody>
                                {plan.map((entry) => (
                                    <tr key={entry.date} className="border-b border-icloud-border/50 hover:bg-icloud-bg transition-colors">
                                        <td className="py-2 text-[0.8rem] text-icloud-text">{entry.date}</td>
                                        <td className="py-2 text-[0.8rem] text-icloud-text-secondary">{formatDate(entry.date)}</td>
                                        <td className="py-2 text-[0.8rem] text-icloud-text-secondary">{formatAmount(entry.amount)}</td>
                                        <td className="py-2 text-[0.8rem] text-icloud-text-secondary">{entry.referenceNumber}</td>
                                        <td className="allocation-ad-path py-2 text-[0.8rem] text-icloud-text-secondary" title={entry.adPath}>{entry.adPath || 'No ad assets configured'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {error && <p className="px-5 py-4"><div className="p-3 border border-red-100 bg-red-50 rounded-xl text-[0.8rem] text-red-700" role="alert">{error}</div></p>}
                    {downloaded && <p className="px-5 py-4 text-[0.8rem] text-green-700 bg-green-50 rounded-xl border border-green-100" role="status">The monthly CSV has been downloaded.</p>}
                </section>
            </section>
        </DashboardLayout>
    );
}
