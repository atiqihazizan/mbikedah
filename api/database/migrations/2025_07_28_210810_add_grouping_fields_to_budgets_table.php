<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void
	{
		Schema::table('budgets', function (Blueprint $table) {
			$table->boolean('is_group')->default(false)->after('type');
			$table->string('group_type')->nullable()->after('is_group');
			$table->integer('sort_order')->default(0)->after('level');

			$table->index(['parent_id', 'level']);
			$table->index(['is_group', 'level']);
		});
	}

	public function down(): void
	{
		Schema::table('budgets', function (Blueprint $table) {
			$table->dropIndex(['parent_id', 'level']);
			$table->dropIndex(['is_group', 'level']);
			$table->dropColumn(['is_group', 'group_type', 'sort_order']);
		});
	}
};
