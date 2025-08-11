<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void
	{
		Schema::table('budgets', function (Blueprint $table) {
			// Budget month management fields
			$table->json('budget_months')->nullable()->after('sort_order')->comment('Array of months that have budget (1-12)');
			$table->enum('budget_type', ['monthly', 'quarterly', 'yearly'])->default('monthly')->after('budget_months')->comment('Type of budget distribution');
			$table->integer('budget_month_count')->default(12)->after('budget_type')->comment('Number of months for this budget');
			
			// Applicant status
			$table->boolean('is_applicant')->default(false)->after('budget_month_count')->comment('Whether this budget is for applicant use');
			
			// Child count (depth is same as existing 'level' field)
			$table->integer('child_count')->default(0)->after('is_applicant')->comment('Number of child budgets');

			// Add indexes for performance
			$table->index(['budget_type', 'budget_month_count']);
			$table->index(['is_applicant']);
			$table->index(['child_count']);
		});
	}

	public function down(): void
	{
		Schema::table('budgets', function (Blueprint $table) {
			// Drop indexes
			$table->dropIndex(['budget_type', 'budget_month_count']);
			$table->dropIndex(['is_applicant']);
			$table->dropIndex(['child_count']);
			
			// Drop columns
			$table->dropColumn([
				'budget_months', 'budget_type', 'budget_month_count',
				'is_applicant', 'child_count'
			]);
		});
	}
};
