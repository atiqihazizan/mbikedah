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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('budgets')->onDelete('cascade')->default(0);
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null')->default(0);
            $table->string('code');
            $table->string('name');
            $table->year('yearly')->default(0);
            $table->integer('type')->default(0);
            // budget amount
            $table->decimal('bdg1', 8, 2)->default(0);
            $table->decimal('bdg2', 8, 2)->default(0);
            $table->decimal('bdg3', 8, 2)->default(0);
            $table->decimal('bdg4', 8, 2)->default(0);
            $table->decimal('bdg5', 8, 2)->default(0);
            $table->decimal('bdg6', 8, 2)->default(0);
            $table->decimal('bdg7', 8, 2)->default(0);
            $table->decimal('bdg8', 8, 2)->default(0);
            $table->decimal('bdg9', 8, 2)->default(0);
            $table->decimal('bdg10', 8, 2)->default(0);
            $table->decimal('bdg11', 8, 2)->default(0);
            $table->decimal('bdg12', 8, 2)->default(0);
            $table->decimal('bdgtotal', 8, 2)->default(0);
            // actual amount
            $table->decimal('act1', 8, 2)->default(0);
            $table->decimal('act2', 8, 2)->default(0);
            $table->decimal('act3', 8, 2)->default(0);
            $table->decimal('act4', 8, 2)->default(0);
            $table->decimal('act5', 8, 2)->default(0);
            $table->decimal('act6', 8, 2)->default(0);
            $table->decimal('act7', 8, 2)->default(0);
            $table->decimal('act8', 8, 2)->default(0);
            $table->decimal('act9', 8, 2)->default(0);
            $table->decimal('act10', 8, 2)->default(0);
            $table->decimal('act11', 8, 2)->default(0);
            $table->decimal('act12', 8, 2)->default(0);
            $table->decimal('acttotal', 8, 2)->default(0);
            $table->decimal('balance', 8, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
