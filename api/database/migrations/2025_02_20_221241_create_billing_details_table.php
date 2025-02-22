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
        Schema::create('billing_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_id')->constrained('billings')->onDelete('cascade');
            $table->foreignId('budget_id')->constrained('budgets')->onDelete('cascade');
            $table->string('budget_code');
            $table->string('reference')->nullable();
            $table->string('description');
            $table->decimal('price', 8, 2);
            $table->integer('quantity');
            $table->decimal('total', 8, 2)->storedAs('price * quantity');
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
