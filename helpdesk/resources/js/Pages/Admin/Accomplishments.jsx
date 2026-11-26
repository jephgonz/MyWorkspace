import React, { useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import DashboardLayout from '../../Components/DashboardLayout';
import Collapse from '../../Components/Collapse';
import ActionIcon from '../../Components/ActionIcon';
import { appUrl } from '../../url';

const statusLabels = { todo: 'To do', completed: 'Completed', cancelled: 'Cancelled' };

function CalendarView({ tasks, currentDate, onDateClick }) {
    const monthStart = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const monthEnd = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const todayKey = dateKey(new Date());

    const tasksByDate = useMemo(() => {
        const map = {};
        tasks.forEach((task) => {
            if (task.due_date) {
                const key = task.due_date.slice(0, 10);
                if (!map[key]) map[key] = [];
                map[key].push(task);
            }
        });
        return map;
    }, [tasks]);

    const prevMonth = () => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const weeks = useMemo(() => {
        const result = [];
        let week = [];
        for (let i = 0; i < startDay; i++) week.push(null);
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) {
                result.push(week);
                week = [];
            }
        }
        if (week.length > 0) {
            while (week.length < 7) week.push(null);
            result.push(week);
        }
        return result;
    }, [startDay, daysInMonth]);

    return (
        <div className="icloud-card p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-black hover:bg-slate-100/60 transition-colors" onClick={prevMonth} aria-label="Previous month">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h2 className="text-lg font-bold text-[#1d1d1f]">
                        {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h2>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-black hover:bg-slate-100/60 transition-colors" onClick={nextMonth} aria-label="Next month">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => onDateClick(new Date())}
                    aria-label="Go to today"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </button>
            </div>
            <div className="p-4 bg-slate-50/50 border-b border-slate-200/60">
                <div className="grid grid-cols-7 gap-0.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1.5">
                            {day}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-3">
                <div className="grid grid-cols-7 gap-0.5">
                    {weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                            if (day === null) {
                                return <div key={`${weekIndex}-${dayIndex}`} className="aspect-square" />;
                            }
                            const dateKeyStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayTasks = tasksByDate[dateKeyStr] || [];
                            const isToday = dateKeyStr === todayKey;
                            const isPast = !isToday && new Date(dateKeyStr) < new Date(todayKey);
                            return (
                                <button
                                    key={`${weekIndex}-${dayIndex}`}
                                    type="button"
                                    className={`relative aspect-square rounded-xl p-2 text-left transition-all ${
                                        isToday
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : isPast
                                            ? 'bg-slate-50/80 text-slate-400'
                                            : 'bg-white hover:bg-slate-50 border border-slate-200/60'
                                    }`}
                                    onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                    disabled={dayTasks.length === 0 && !isToday}
                                    style={{ opacity: dayTasks.length === 0 && !isToday ? 0.6 : 1 }}
                                >
                                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : isPast ? 'text-slate-400' : 'text-[#1d1d1f]'}`}>
                                        {day}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <div className="mt-1.5 space-y-1 max-h-[100px] overflow-y-auto">
                                            {dayTasks.slice(0, 3).map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                                                        task.status === 'completed'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : task.status === 'cancelled'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                    }`}
                                                    title={task.title}
                                                >
                                                    {task.status === 'completed' ? '✓ ' : task.status === 'cancelled' ? '✕ ' : ''}{task.title}
                                                </div>
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <div className="text-[10px] text-slate-500 text-center">+{dayTasks.length - 3} more</div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
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
                        <option value="cancelled">Cancelled</option>
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
    const [viewMode, setViewMode] = useState('list');
    const [calendarDate, setCalendarDate] = useState(new Date());
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
        cancelled: accomplishments.filter((task) => task.status === 'cancelled').length,
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
            <section className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Personal Work Tracker</p>
                        <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">Accomplishments</h1>
                        <p className="text-sm text-slate-500 mt-1">Track your work and browse completed tasks by week, month, or quarter.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-100/60 rounded-lg p-1" role="group">
                            <button
                                type="button"
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                                onClick={() => setViewMode('list')}
                                aria-pressed={viewMode === 'list'}
                            >
                                List
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                                onClick={() => setViewMode('calendar')}
                                aria-pressed={viewMode === 'calendar'}
                            >
                                Calendar
                            </button>
                        </div>
                        <button className="icloud-btn shadow-md" type="button" onClick={() => { setEditingTask(null); setShowForm((open) => !open); }}>{showForm ? 'Close form' : '+ Add task'}</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <article className="icloud-card p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">To do</p>
                        <p className="text-3xl font-extrabold text-[#1d1d1f] mt-1">{counts.todo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Waiting to start</p>
                    </article>
                    <article className="icloud-card p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed this week</p>
                        <p className="text-3xl font-extrabold text-[#1d1d1f] mt-1">{periodStats.weekCount}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{periodStats.weekRange}</p>
                    </article>
                    <article className="icloud-card p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed this month</p>
                        <p className="text-3xl font-extrabold text-[#1d1d1f] mt-1">{periodStats.monthCount}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{periodStats.monthLabel}</p>
                    </article>
                    <article className="icloud-card p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed this quarter</p>
                        <p className="text-3xl font-extrabold text-[#1d1d1f] mt-1">{completedThisQuarter}</p>
                        <p className="text-xs text-slate-500 mt-0.5">For Q{currentQuarter} {currentDate.getFullYear()}</p>
                    </article>
                </div>
                <Collapse open={showForm}>
                    <section className="icloud-card p-6 mb-6">
                        <div className="mb-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New task</p>
                            <h2 className="text-xl font-bold text-[#1d1d1f] mt-1">Add an accomplishment</h2>
                            <p className="text-sm text-slate-500 mt-1">Completed tasks are dated automatically.</p>
                        </div>
                        <AccomplishmentForm key="new" onCancel={closeForm} onSaved={closeForm} />
                    </section>
                </Collapse>

                {viewMode === 'calendar' ? (
                    <CalendarView
                        tasks={accomplishments}
                        currentDate={calendarDate}
                        onDateClick={setCalendarDate}
                    />
                ) : (
                    <section className="icloud-card p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#1d1d1f]">Tasks and accomplishments</h2>
                                <p className="text-xs text-slate-500 mt-1">{counts.completed} completed · {counts.todo} still open · {counts.cancelled} cancelled</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{accomplishments.length} total</span>
                        </div>
                        <div className="p-5 border-b border-slate-200/60 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2" role="group">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Show</span>
                            {[['all', 'All'], ['todo', 'To do'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([value, label]) => (
                                <button
                                    key={value}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        statusFilter === value
                                            ? 'bg-white border-slate-200/80 text-blue-600 shadow-sm'
                                            : 'border-transparent text-slate-600 hover:text-black'
                                    }`}
                                    type="button"
                                    onClick={() => { setStatusFilter(value); if (value !== 'completed') setPeriodFilter('all'); }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2" role="group">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Period</span>
                                {[['all', 'Any time'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter']].map(([value, label]) => (
                                    <button
                                        key={value}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            periodFilter === value
                                                ? 'bg-white border-slate-200/80 text-blue-600 shadow-sm'
                                                : 'border-transparent text-slate-600 hover:text-black'
                                        }`}
                                        type="button"
                                        onClick={() => { setPeriodFilter(value); if (value !== 'all') setStatusFilter('completed'); }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                                {periodFilter === 'week' && <div className="flex items-center gap-2"><button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200/80 bg-white text-black hover:bg-slate-50 transition-colors" type="button" onClick={() => shiftSelectedWeek(-1)}>‹</button><span className="text-xs font-semibold text-black min-w-[120px] text-center">{weekLabel}</span><button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200/80 bg-white text-black hover:bg-slate-50 transition-colors disabled:opacity-50" type="button" disabled={selectedWeek >= dateKey(currentWeekStart)} onClick={() => shiftSelectedWeek(1)}>›</button></div>}
                                {periodFilter === 'month' && <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Month</label><input type="month" className="h-8 px-2 text-xs rounded-lg border border-slate-200/80" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></div>}
                                {periodFilter === 'quarter' && <div className="flex items-center gap-3"><div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quarter</label><select className="h-8 px-2 text-xs rounded-lg border border-slate-200/80" value={selectedQuarter} onChange={(event) => setSelectedQuarter(event.target.value)}>{[1, 2, 3, 4].map((quarter) => <option key={quarter} value={quarter}>Q{quarter}</option>)}</select></div><div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Year</label><input type="number" className="h-8 px-2 text-xs rounded-lg border border-slate-200/80 w-20" min="2000" max="2100" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} /></div></div>}
                        </div>
                    </div>
                    <div className="p-5">
                        {visibleTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-4xl mb-3 block">✓</span>
                            <strong className="text-lg font-medium text-[#1d1d1f] block">{accomplishments.length === 0 ? 'Your board is ready' : 'No tasks in this view'}</strong>
                            <p className="mt-1 text-sm text-slate-500">{accomplishments.length === 0 ? 'Add your first task to start tracking your work.' : 'Choose another filter to see more tasks.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3 p-5">
                            {visibleTasks.map((task) => (
                                <article className="icloud-card p-5 flex items-start gap-4 fade-in-up" key={task.id}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="text-sm font-bold text-[#1d1d1f]">{task.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                task.status === 'completed'
                                                    ? ' border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : task.status === 'cancelled'
                                                    ? ' border-amber-200 bg-amber-50 text-amber-700'
                                                    : ' border-blue-200 bg-blue-50 text-blue-700'
                                            }`}>
                                                {statusLabels[task.status]}
                                            </span>
                                        </div>
                                        {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
                                        <div className="flex items-center gap-4 mt-3 text-[11px] font-medium text-slate-500">
                                            {task.due_date && <span>Due: {formatDueDate(task.due_date)}</span>}
                                            {task.completed_at && <span>Completed: {formatDate(task.completed_at)}</span>}
                                        </div>
                                        {editingTask?.id === task.id && (
                                            <Collapse open>
                                                <div className="mt-4 border-t pt-4">
                                                    <AccomplishmentForm key={task.id} task={task} onCancel={() => setEditingTask(null)} onSaved={() => setEditingTask(null)} />
                                                </div>
                                            </Collapse>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {task.status !== 'completed' && (
                                            <button className="w-9 h-9 rounded-lg border border-slate-200/80 bg-white text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors" title="Mark complete" disabled={pendingAction !== null} onClick={() => completeTask(task)}>
                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" /></svg>
                                            </button>
                                        )}
                                        <button className="w-9 h-9 rounded-lg border border-slate-200/80 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-colors" title="Edit" onClick={() => { setShowForm(false); setEditingTask((current) => current?.id === task.id ? null : task); }}>
                                            <ActionIcon type="edit" />
                                        </button>
                                        <button className="w-9 h-9 rounded-lg border border-slate-200/80 bg-white text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors" title="Remove" onClick={() => removeTask(task)}>
                                            <ActionIcon type="remove" />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    </div>
                </section>
                )}
            </section>
        </DashboardLayout>
    );
}
