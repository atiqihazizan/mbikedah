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
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_hod')->constrained('users')->onDelete('cascade');
            $table->foreignId('review_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('verified_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('paid_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('billing_recipients')->onDelete('cascade');
            $table->integer('status_id')->default(1);
            $table->decimal('total_amount', 8, 2);
            $table->date('issued_at');
            $table->date('payment_due')->nullable();
            $table->string('running_no')->nullable();
            $table->string('reference')->default('N/A');
            $table->string('description');
            $table->enum('payment_method',['cheque','online','cash'])->default('online');
            $table->boolean('is_archived')->default(false);
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
