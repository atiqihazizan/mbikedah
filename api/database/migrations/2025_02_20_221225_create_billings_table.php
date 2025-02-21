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
        Schema::create('billings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('billing_statuses')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('billings_recipients')->onDelete('cascade');
            $table->date('issued_at');
            $table->date('payment_due')->nullable();
            $table->string('running_no');
            $table->string('reference')->default('N/A');
            $table->string('description');
            $table->enum('payment_method',['cheque','online','cash'])->default('online');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
