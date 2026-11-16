import React, { useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import ActionIcon from '../../Components/ActionIcon';
import { appUrl } from '../../url';

const statusLabels = { todo: 'To do', completed: 'Completed' };

function AccomplishmentForm({ task, onCancel, onSaved }) {
    const form = useForm({
        title: task?.title || '',
        description: task?.description || '',
        due_date: task?.due_date || '',
        status: task?.status || 'todo',
    });
    const submit = (event) => {
        event.preventDefault();
        form.post(appUrl(task ? `/admin/accomplishments/${task.id}` : '/admin/accomplishments'), { onSuccess: onSaved });
    };

    return (
        <form className="icloud-card p-5 space-y-4" onSubmit={submit}>
            <div className="field flex flex-col gap-1.5">
                <label className="icloud-label">Task title</label>
                <input className="icloud-input" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} maxLength="200" required placeholder="What did you work on?" />
                {form.errors.title && <p className="text-[0.75rem] text-icloud-danger">{form.errors.title}</p>}
            </div>
            <div className="field flex flex-col gap-1.5">
                <label className="icloud-label">Details</label>
                <textarea className="icloud-input icloud-textarea" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} rows="3" maxLength="5000" placeholder="Add context or an outcome for your report." />
                {form.errors.description && <p className="text-[0.75rem] text-icloud-danger">{form.errors.description}</p>}
            </div>
            <div className="accomplishment-form-row grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field flex flex-col gap-1.5">
                    <label className="icloud-label">Due date</label>
                    <input type="date" className="icloud-input" value={form.data.due_date} onChange={(event) => form.setData('due_date', event.target.value)} />
                    {form.errors.due_date && <p className="text-[0.75rem] text-icloud-danger">{form.errors.due_date}</p>}
                </div>
                <div className="field flex flex-col gap-1.5">
                    <label className="icloud-label">Status</label>
                    <select className="icloud-select" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                        <option value="todo">To do</option>
                        <option value="completed">Completed</option>
                    </select>
                    {form.errors.status && <p className="text-[0.75rem] text-icloud-danger">{form.errors.status}</p>}
                </div>
            </div>
            {form.errors.form && <p className="text-[0.75rem] text-icloud-danger">{form.errors.form}</p>}
            <div className="form-actions flex items-end gap-3 pt-3 border-t border-icloud-border">
                <button className="icloud-btn" type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : task ? 'Save changes' : 'Add to board'}</button>
                <button className="icloud-btn-ghost" type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

function formatDate(value) {
    if (!value) return '';
    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDueDate(value) {
    if (!value) return '';
    const datePart = value.slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfWeek(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
}

function CompletionChart({ items, label }) {
    const maxCount = Math.max(...items.map((item) => item.count), 1);
    const chartDescription = items.map((item) => `${item.label}: ${item.count}`).join(', ');

    return (
        <div className="accomplishment-stat-chart" role="img" aria-label={`${label}. ${chartDescription}`}>
            {items.map((item) => (
                <div className="accomplishment-stat-chart-item" key={item.label} title={`${item.label}: ${item.count}`}>
                    <small className="text-[0.7rem] text-icloud-text-tertiary">{item.count}</small>
                    <div className="accomplishment-stat-chart-track"><span style={{ height: `${Math.max((item.count / maxCount) * 100, 4)}%` }} /></div>
                    <span className="text-[0.7rem] text-icloud-text-secondary">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function Accomplishments({ accomplishments = [] }) {
    const currentDate = useMemo(() => new Date(), []);
    const currentWeekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [selectedWeek, setSelectedWeek] = useState(() => dateKey(currentWeekStart));
    const [selectedMonth, setSelectedMonth] = useState(() => dateKey(currentDate).slice(0, 7));
    const [selectedQuarter, setSelectedQuarter] = useState(String(Math.floor(currentDate.getMonth() / 3) + 1));
    const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const periodStats = useMemo(() => {
        const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
        const weekStartKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
        const weekEnd = new Date(startOfWeek);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekEndKey = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
        const monthEndDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const weekItems = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + index);
            return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), count: 0 };
        });
        const monthItems = Array.from(
            { length: Math.ceil(monthEndDay / 7) },
            (_, index) => ({ label: `${index * 7 + 1}-${Math.min((index + 1) * 7, monthEndDay)}`, count: 0 }),
        );
        let weekCount = 0;
        let monthCount = 0;

        accomplishments.forEach((task) => {
            if (task.status !== 'completed' || !task.completed_at) return;
            const completionDate = task.completed_at.slice(0, 10);
            if (completionDate >= weekStartKey && completionDate < weekEndKey) {
                const [year, month, day] = completionDate.split('-').map(Number);
                const dayIndex = (new Date(year, month - 1, day).getDay() + 6) % 7;
                weekItems[dayIndex].count += 1;
                weekCount += 1;
            }
            if (completionDate.slice(0, 7) === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`) {
                const dayOfMonth = Number(completionDate.slice(8, 10));
                monthItems[Math.floor((dayOfMonth - 1) / 7)].count += 1;
                monthCount += 1;
            }
        });

        const weekEndDate = new Date(weekEnd);
        weekEndDate.setDate(weekEndDate.getDate() - 1);
        const weekEndKeyLabel = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth() + 1).padStart(2, '0')}-${String(weekEndDate.getDate()).padStart(2, '0')}`;

        return {
            weekCount,
            weekRange: `${formatDate(weekStartKey)} - ${formatDate(weekEndKeyLabel)}`,
            weekItems,
            monthCount,
            monthLabel: currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
            monthItems,
        };
    }, [accomplishments, currentDate]);
    const periodRange = useMemo(() => {
        if (periodFilter === 'week') {
            const [year, month, day] = selectedWeek.split('-').map(Number);
            const start = new Date(year, month - 1, day);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            return { start: selectedWeek, end: dateKey(end) };
        }
        if (periodFilter === 'month' && /^\d{4}-\d{2}$/.test(selectedMonth)) {
            const [year, month] = selectedMonth.split('-').map(Number);
            if (month >= 1 && month <= 12) {
                return {
                    start: `${selectedMonth}-01`,
                    end: dateKey(new Date(year, month, 1)),
                };
            }
        }
        if (periodFilter === 'quarter' && /^\d{4}$/.test(selectedYear) && Number(selectedYear) >= 2000 && Number(selectedYear) <= 2100) {
            const quarter = Number(selectedQuarter);
            if (quarter >= 1 && quarter <= 4) {
                const startMonth = (quarter - 1) * 3;
                return {
                    start: `${selectedYear}-${String(startMonth + 1).padStart(2, '0')}-01`,
                    end: dateKey(new Date(Number(selectedYear), startMonth + 3, 1)),
                };
            }
        }

        return null;
    }, [periodFilter, selectedMonth, selectedQuarter, selectedWeek, selectedYear]);
    const counts = useMemo(() => ({
        todo: accomplishments.filter((task) => task.status === 'todo').length,
        completed: accomplishments.filter((task) => task.status === 'completed').length,
    }), [accomplishments]);
    const quarterStartMonth = Math.floor(currentDate.getMonth() / 3) * 3;
    const currentQuarterStart = `${currentDate.getFullYear()}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
    const currentQuarterEnd = dateKey(new Date(currentDate.getFullYear(), quarterStartMonth + 3, 1));
    const completedThisQuarter = accomplishments.filter((task) => task.status === 'completed' && task.completed_at >= currentQuarterStart && task.completed_at < currentQuarterEnd).length;
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const visibleTasks = accomplishments.filter((task) => {
        if (periodFilter !== 'all') {
            if (!periodRange) return false;
            return task.status === 'completed'
                && task.completed_at
                && task.completed_at.slice(0, 10) >= periodRange.start
                && task.completed_at.slice(0, 10) < periodRange.end;
        }

        return statusFilter === 'all' || task.status === statusFilter;
    });
    const [selectedWeekYear, selectedWeekMonth, selectedWeekDay] = selectedWeek.split('-').map(Number);
    const selectedWeekDate = new Date(selectedWeekYear, selectedWeekMonth - 1, selectedWeekDay);
    const selectedWeekEnd = new Date(selectedWeekDate);
    selectedWeekEnd.setDate(selectedWeekEnd.getDate() + 6);
    const weekLabel = selectedWeek === dateKey(currentWeekStart)
        ? 'This week'
        : `${formatDate(selectedWeek)} – ${formatDate(dateKey(selectedWeekEnd))}`;
    const shiftSelectedWeek = (amount) => {
        const nextWeek = new Date(selectedWeekDate);
        nextWeek.setDate(nextWeek.getDate() + (amount * 7));
        setSelectedWeek(dateKey(nextWeek));
        setStatusFilter('completed');
    };
    const closeForm = () => { setShowForm(false); setEditingTask(null); };
    const removeTask = (task) => {
        if (window.confirm(`Remove "${task.title}" from your accomplishment board?`)) {
            setPendingAction({ id: task.id, action: 'remove' });
            router.post(appUrl(`/admin/accomplishments/${task.id}/delete`), {}, {
                onFinish: () => setPendingAction(null),
            });
        }
    };
    const completeTask = (task) => {
        setPendingAction({ id: task.id, action: 'complete' });
        router.post(appUrl(`/admin/accomplishments/${task.id}/complete`), {}, {
            onFinish: () => setPendingAction(null),
        });
    };

    return (
        <DashboardLayout title="Accomplishments" activePage="accomplishments">
            <section className="icloud-section">
                <div className="icloud-section-head">
                    <div>
                        <p className="eyebrow">PERSONAL WORK TRACKER</p>
                        <h1 className="icloud-title">Accomplishments</h1>
                        <p className="icloud-subtitle">Track your work and browse completed tasks by week, month, or quarter.</p>
                    </div>
                    <button className="icloud-btn" type="button" onClick={() => { setEditingTask(null); setShowForm((open) => !open); }}>{showForm ? 'Close form' : '+ Add task'}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <article className="accomplishment-stat icloud-card p-4">
                        <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">To do</p>
                        <p className="text-2xl font-bold text-icloud-text">{counts.todo}</p>
                        <p className="text-[0.7rem] text-icloud-text-secondary">Waiting to start</p>
                    </article>
                    <article className="accomplishment-stat icloud-card p-4">
                        <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Completed this week</p>
                        <p className="text-2xl font-bold text-icloud-text">{periodStats.weekCount}</p>
                        <p className="text-[0.7rem] text-icloud-text-secondary">{periodStats.weekRange}</p>
                        <CompletionChart items={periodStats.weekItems} label="Completions by day this week" />
                    </article>
                    <article className="accomplishment-stat icloud-card p-4">
                        <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Completed this month</p>
                        <p className="text-2xl font-bold text-icloud-text">{periodStats.monthCount}</p>
                        <p className="text-[0.7rem] text-icloud-text-secondary">{periodStats.monthLabel}</p>
                        <CompletionChart items={periodStats.monthItems} label="Completions by week this month" />
                    </article>
                    <article className="accomplishment-stat icloud-card p-4">
                        <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Completed this quarter</p>
                        <p className="text-2xl font-bold text-icloud-text">{completedThisQuarter}</p>
                        <p className="text-[0.7rem] text-icloud-text-secondary">For Q{currentQuarter} {currentDate.getFullYear()}</p>
                    </article>
                </div>
                {showForm && <section className="icloud-card p-6 mb-6 accomplishment-editor"><div className="mb-4"><p className="text-[0.75rem] font-medium text-icloud-text-tertiary mb-1">New task</p><h2 className="text-lg font-bold text-icloud-text">Add an accomplishment</h2><p className="text-[0.8rem] text-icloud-text-secondary">Completed tasks are dated automatically so you can find them in the right period.</p></div><AccomplishmentForm key="new" onCancel={closeForm} onSaved={closeForm} /></section>}
                <section className="icloud-card p-0 accomplishment-board-card">
                    <div className="accomplishment-heading p-5 border-b border-icloud-border flex items-center justify-between">
                        <div>
                            <p className="text-[0.75rem] font-medium text-icloud-text-tertiary">Your work</p>
                            <h2 className="text-lg font-bold text-icloud-text">Tasks and accomplishments</h2>
                            <p className="text-[0.8rem] text-icloud-text-secondary">{counts.completed} completed · {counts.todo} still open</p>
                        </div>
                        <span className="text-[0.75rem] font-medium text-icloud-text-secondary">{accomplishments.length} total</span>
                    </div>
                    <div className="accomplishment-toolbar p-5 border-b border-icloud-border/50 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="accomplishment-filters flex items-center gap-2" role="group" aria-label="Filter tasks by status">
                            <span className="accomplishment-filter-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Show</span>
                            {[['all', 'All'], ['todo', 'To do'], ['completed', 'Completed']].map(([value, label]) => <button key={value} className={`filter-chip px-3 py-1.5 rounded-full border border-icloud-border text-[0.75rem] font-medium transition-colors${statusFilter === value ? ' bg-icloud-blue text-white border-icloud-blue' : ' bg-white text-icloud-text-secondary hover:bg-icloud-bg' }`} type="button" aria-pressed={statusFilter === value} onClick={() => { setStatusFilter(value); if (value !== 'completed') setPeriodFilter('all'); }}>{label}</button>)}
                        </div>
                        <div className="accomplishment-period-controls flex items-center gap-3 flex-wrap">
                            <div className="accomplishment-period-options flex items-center gap-2" role="group" aria-label="Filter completed tasks by period">
                                <span className="accomplishment-filter-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Completed in</span>
                                {[['all', 'Any time'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter']].map(([value, label]) => <button key={value} className={`filter-chip px-3 py-1.5 rounded-full border border-icloud-border text-[0.75rem] font-medium transition-colors${periodFilter === value ? ' bg-icloud-blue text-white border-icloud-blue' : ' bg-white text-icloud-text-secondary hover:bg-icloud-bg' }`} type="button" aria-pressed={periodFilter === value} onClick={() => { setPeriodFilter(value); if (value !== 'all') setStatusFilter('completed'); }}>{label}</button>)}
                            </div>
                            {periodFilter === 'week' && <div className="accomplishment-period-picker week-period-picker flex items-center gap-2"><button className="period-navigation-button w-8 h-8 rounded-lg border border-icloud-border bg-white text-icloud-text text-lg font-medium transition-colors hover:bg-icloud-bg disabled:opacity-40 disabled:cursor-not-allowed" type="button" aria-label="Previous week" onClick={() => shiftSelectedWeek(-1)}>‹</button><span className="text-[0.75rem] font-medium text-icloud-text min-w-[150px] text-center">{weekLabel}</span><button className="period-navigation-button w-8 h-8 rounded-lg border border-icloud-border bg-white text-icloud-text text-lg font-medium transition-colors hover:bg-icloud-bg disabled:opacity-40 disabled:cursor-not-allowed" type="button" aria-label="Next week" disabled={selectedWeek >= dateKey(currentWeekStart)} onClick={() => shiftSelectedWeek(1)}>›</button></div>}
                            {periodFilter === 'month' && <div className="accomplishment-period-picker flex items-center gap-2"><label className="accomplishment-filter-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Month</label><input aria-label="Completed month" type="month" className="icloud-input w-32" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></div>}
                            {periodFilter === 'quarter' && <div className="accomplishment-period-picker flex items-center gap-3"><div className="flex flex-col gap-1"><label className="accomplishment-filter-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Quarter</label><select aria-label="Completed quarter" className="icloud-select w-20" value={selectedQuarter} onChange={(event) => setSelectedQuarter(event.target.value)}>{[1, 2, 3, 4].map((quarter) => <option key={quarter} value={quarter}>Q{quarter}</option>)}</select></div><div className="flex flex-col gap-1"><label className="accomplishment-filter-label text-[0.7rem] font-semibold text-icloud-text-tertiary">Year</label><input aria-label="Completed year" type="number" className="icloud-input w-24" min="2000" max="2100" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} /></div></div>}
                        </div>
                    </div>
                    <div className="p-5">
                        {visibleTasks.length === 0 ? <div className="empty-state text-center py-10"><span className="text-3xl mb-2 block">✓</span><strong className="text-lg font-medium text-icloud-text block">{accomplishments.length === 0 ? 'Your board is ready' : periodFilter !== 'all' ? 'No completed tasks in this period' : 'No tasks in this view'}</strong><p className="mt-1 text-[0.8rem] text-icloud-text-secondary">{accomplishments.length === 0 ? 'Add your first task to start tracking your work.' : periodFilter !== 'all' ? 'Choose another week, month, or quarter to browse completions.' : 'Choose another status filter to see more tasks.'}</p></div> :
                            <div className="accomplishment-list space-y-3">{visibleTasks.map((task) => <article className="accomplishment-item icloud-card p-4 flex items-start gap-4" key={task.id}>
                                <div className="accomplishment-item-main flex-1 min-w-0"><div className="accomplishment-item-heading flex items-center gap-2 mb-1"><h3 className="text-sm font-semibold text-icloud-text leading-snug">{task.title}</h3><span className={`accomplishment-status inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold border${task.status === 'completed' ? ' border-green-200 bg-green-50 text-green-700' : ' border-blue-200 bg-blue-50 text-blue-700' }`}>{statusLabels[task.status]}</span></div>{task.description && <p className="text-[0.8rem] text-icloud-text-secondary mt-1 line-clamp-2">{task.description}</p>}<div className="accomplishment-dates flex items-center gap-3 mt-2 text-[0.7rem] text-icloud-text-tertiary">{task.due_date && <span className="flex items-center gap-1">⌚ Due {formatDueDate(task.due_date)}</span>}{task.completed_at && <span className="flex items-center gap-1">✓ Completed {formatDate(task.completed_at)}</span>}</div>{editingTask?.id === task.id && <div className="accomplishment-item-edit mt-4"><AccomplishmentForm key={task.id} task={task} onCancel={() => setEditingTask(null)} onSaved={() => setEditingTask(null)} /></div>}</div>
                                <div className="accomplishment-actions flex items-center gap-2 shrink-0">
                                    {task.status !== 'completed' && <button className="task-action complete w-8 h-8 rounded-lg border border-icloud-border bg-white text-icloud-blue flex items-center justify-center transition-colors hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Mark complete" title="Mark complete" disabled={pendingAction !== null} onClick={() => completeTask(task)}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6" /></svg></button>}
                                    <button className="task-action w-8 h-8 rounded-lg border border-icloud-border bg-white text-icloud-text-secondary flex items-center justify-center transition-colors hover:bg-icloud-bg disabled:opacity-40 disabled:cursor-not-allowed" type="button" aria-label={editingTask?.id === task.id ? 'Collapse edit task form' : 'Edit task'} title={editingTask?.id === task.id ? 'Collapse edit form' : 'Edit task'} aria-expanded={editingTask?.id === task.id} aria-controls={editingTask?.id === task.id ? `accomplishment-edit-${task.id}` : undefined} disabled={pendingAction !== null} onClick={() => { setShowForm(false); setEditingTask((current) => current?.id === task.id ? null : task); }}><ActionIcon type="edit" /></button>
                                    <button className="task-action remove w-8 h-8 rounded-lg border border-icloud-border bg-white text-icloud-text-secondary flex items-center justify-center transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed" type="button" aria-label="Remove task" title="Remove task" disabled={pendingAction !== null} onClick={() => removeTask(task)}><ActionIcon type="remove" /></button>
                                    {pendingAction?.id === task.id && <span className="accomplishment-action-pending text-[0.7rem] text-icloud-text-tertiary">{pendingAction.action === 'complete' ? 'Completing…' : 'Removing…'}</span>}
                                </div>
                            </article>)}</div>}
                    </div>
                </section>
            </section>
        </DashboardLayout>
    );
}
