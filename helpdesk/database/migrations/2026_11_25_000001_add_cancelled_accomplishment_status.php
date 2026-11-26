<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // The status column is already a string(20), so 'cancelled' fits.
        // This migration ensures any existing data is valid and documents the new status.
    }

    public function down(): void
    {
        // Revert any cancelled tasks to 'todo' since their previous state cannot be inferred.
        DB::table('helpdesk_accomplishments')
            ->where('status', 'cancelled')
            ->update(['status' => 'todo', 'completed_at' => null]);
    }
};