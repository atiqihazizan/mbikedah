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
      $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('approved_hod')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('review_by')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null');
      $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
      $table->foreignId('recipient_id')->nullable()->constrained('billing_recipients')->onDelete('set null');
      $table->unsignedTinyInteger('status_id')->default(1);
      $table->decimal('total_amount', 12, 2);
      $table->date('issued_at')->default(now());
      $table->date('payment_due')->nullable();
      $table->string('running_no')->nullable();
      $table->string('no_project')->default('N/A');
      $table->string('description')->nullable();
      $table->enum('payment_method', ['cek', 'online', 'tunai'])->nullable()->default('cek');
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
