<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('helpdesk_accomplishments', 'helpdesk_task_tracker');

        Schema::table('helpdesk_task_tracker', function (Blueprint $table): void {
            $table->renameIndex('idx_accomplishments_owner_status', 'idx_task_tracker_owner_status');
            $table->renameIndex('idx_accomplishments_owner_completed', 'idx_task_tracker_owner_completed');
            $table->renameIndex('idx_accomplishments_owner_due', 'idx_task_tracker_owner_due');
        });
    }

    public function down(): void
    {
        Schema::table('helpdesk_task_tracker', function (Blueprint $table): void {
            $table->renameIndex('idx_task_tracker_owner_status', 'idx_accomplishments_owner_status');
            $table->renameIndex('idx_task_tracker_owner_completed', 'idx_accomplishments_owner_completed');
            $table->renameIndex('idx_task_tracker_owner_due', 'idx_accomplishments_owner_due');
        });

        Schema::rename('helpdesk_task_tracker', 'helpdesk_accomplishments');
    }
};