<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskTrackerController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            $tasks = DB::table('helpdesk_task_tracker')
                ->where('created_by', $request->session()->get('user.id'))
                ->orderByRaw("CASE status WHEN 'todo' THEN 0 ELSE 1 END")
                ->orderByRaw("CASE WHEN status = 'todo' AND due_date IS NULL THEN 1 ELSE 0 END")
                ->orderByRaw("CASE WHEN status = 'todo' THEN due_date END ASC")
                ->orderByRaw("CASE WHEN status = 'completed' THEN completed_at END DESC")
                ->orderByDesc('created_at')
                ->get([
                    'id',
                    'title',
                    'description',
                    'due_date',
                    'status',
                    'completed_at',
                    'created_at',
                    'updated_at',
                ]);
        } catch (\Throwable $exception) {
            Log::error('Task tracker board could not load.', ['exception' => $exception]);
            $tasks = collect();
            session()->flash('error', 'The task tracker board is unavailable. Check that the application database is up to date.');
        }

        return Inertia::render('Admin/TaskTracker', [
            'tasks' => $tasks,
            'activePage' => 'task-tracker',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        try {
            DB::table('helpdesk_task_tracker')->insert([
                'created_by' => $request->session()->get('user.id'),
                'title' => trim($validated['title']),
                'description' => isset($validated['description']) ? trim($validated['description']) : null,
                'due_date' => $validated['due_date'] ?? null,
                'status' => $validated['status'],
                'completed_at' => $validated['status'] === 'completed' ? now() : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Task could not be created.', ['exception' => $exception]);

            return back()->withErrors(['form' => 'The task could not be saved. Check the database connection and schema.']);
        }

        return back()->with('success', 'Task added to your board.');
    }

    public function update(Request $request, int $task): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $userId = $request->session()->get('user.id');

        try {
            $updated = DB::transaction(function () use ($validated, $userId, $task): bool {
                $taskRecord = DB::table('helpdesk_task_tracker')
                    ->where('id', $task)
                    ->where('created_by', $userId)
                    ->lockForUpdate()
                    ->first(['status', 'completed_at']);
                if (! $taskRecord) {
                    return false;
                }

                $completedAt = $validated['status'] === 'completed'
                    ? ($taskRecord->status === 'completed' && $taskRecord->completed_at !== null ? $taskRecord->completed_at : now())
                    : null;
                DB::table('helpdesk_task_tracker')
                    ->where('id', $task)
                    ->where('created_by', $userId)
                    ->update([
                        'title' => trim($validated['title']),
                        'description' => isset($validated['description']) ? trim($validated['description']) : null,
                        'due_date' => $validated['due_date'] ?? null,
                        'status' => $validated['status'],
                        'completed_at' => $completedAt,
                        'updated_at' => now(),
                    ]);

                return true;
            });
            if (! $updated) {
                return back()->withErrors(['form' => 'The task was not found on your board.']);
            }
        } catch (\Throwable $exception) {
            Log::error('Task could not be updated.', ['exception' => $exception, 'task_id' => $task]);

            return back()->withErrors(['form' => 'The task could not be updated.']);
        }

        return back()->with('success', 'Task updated.');
    }

    public function complete(Request $request, int $task): RedirectResponse
    {
        $userId = $request->session()->get('user.id');

        try {
            $updated = DB::transaction(function () use ($userId, $task): bool {
                $taskRecord = DB::table('helpdesk_task_tracker')
                    ->where('id', $task)
                    ->where('created_by', $userId)
                    ->lockForUpdate()
                    ->first(['status', 'completed_at']);
                if (! $taskRecord) {
                    return false;
                }

                if ($taskRecord->status !== 'completed') {
                    DB::table('helpdesk_task_tracker')
                        ->where('id', $task)
                        ->where('created_by', $userId)
                        ->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                            'updated_at' => now(),
                        ]);
                }

                return true;
            });
            if (! $updated) {
                return back()->withErrors(['form' => 'The task was not found on your board.']);
            }
        } catch (\Throwable $exception) {
            Log::error('Task could not be completed.', ['exception' => $exception, 'task_id' => $task]);

            return back()->withErrors(['form' => 'The task could not be marked complete.']);
        }

        return back()->with('success', 'Task marked complete.');
    }

    public function destroy(Request $request, int $task): RedirectResponse
    {
        try {
            $deleted = DB::table('helpdesk_task_tracker')
                ->where('id', $task)
                ->where('created_by', $request->session()->get('user.id'))
                ->delete();
            if ($deleted === 0) {
                return back()->withErrors(['form' => 'The task was not found on your board.']);
            }
        } catch (\Throwable $exception) {
            Log::error('Task could not be deleted.', ['exception' => $exception, 'task_id' => $task]);

            return back()->withErrors(['form' => 'The task could not be deleted.']);
        }

        return back()->with('success', 'Task removed from your board.');
    }

    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['required', Rule::in(['todo', 'completed', 'cancelled'])],
        ];
    }
}
