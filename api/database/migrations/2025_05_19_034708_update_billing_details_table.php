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
        Schema::table('billing_details', function (Blueprint $table) {
            // Remove old columns
            $table->dropColumn(['old_budget_id', 'old_budget_code']);

            // Add new columns
            $table->boolean('accept')->default(false);
            $table->boolean('approve')->default(false);
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Add index    
            $table->index(['accept', 'approve'], 'billing_details_accept_approve_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_details', function (Blueprint $table) {
            $table->dropIndex('billing_details_accept_approve_index');

            // Remove new columns
            $table->dropColumn(['accept', 'approve', 'reviewed_by']);

            // Add back old columns
            $table->foreignId('old_budget_id')
              ->default(0)
              ->constrained('budgets')
              ->onDelete('set null');
            $table->varchar('old_budget_code', 50)->nullable();
            
        });
    }
};
