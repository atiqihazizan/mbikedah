<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		Schema::create('billing_details', function (Blueprint $table) {
			$table->id();
			$table->foreignId('billing_id')->constrained('billings')->onDelete('cascade');
			$table->foreignId('budget_id')->nullable()->constrained('budgets')->onDelete('set null');
			$table->string('budget_code', 50);
			$table->foreignId('old_budget_id')->default(0);
			$table->string('old_budget_code', 50)->nullable();
			$table->string('reference')->nullable();
			$table->string('description');
			$table->string('purpose')->nullable();
			$table->decimal('price', 12, 2);
			$table->integer('quantity');
			$table->string('unit')->nullable();
			$table->decimal('total', 12, 2)->storedAs('price * quantity');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('billing_details');
	}
};
