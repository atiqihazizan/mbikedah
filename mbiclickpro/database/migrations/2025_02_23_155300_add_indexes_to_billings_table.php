<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('billings', function (Blueprint $table) {
            // Add indexes for commonly filtered/searched columns
            $table->index('created_at');
            $table->index('status_id');
            $table->index('department_id');
            $table->index(['running_no', 'no_project', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billings', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status_id']);
            $table->dropIndex(['department_id']);
            $table->dropIndex(['running_no', 'no_project', 'description']);
        });
    }
};
