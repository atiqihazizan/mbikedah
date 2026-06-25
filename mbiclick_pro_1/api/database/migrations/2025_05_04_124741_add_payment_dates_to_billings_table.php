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
    Schema::table("billings", function (Blueprint $table) {
      $table->date("hod_approved_at")->nullable();
      $table->date("reviewed_at")->nullable();
      $table->date("verified_at")->nullable();
      $table->date("approved_at")->nullable();
      $table->date("paid_at")->nullable();
      $table->boolean("ceo_approved")->default(false);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table("billings", function (Blueprint $table) {
      $table->dropColumn(["hod_approved_at", "reviewed_at", "verified_at", "approved_at", "paid_at", "ceo_approved"]);
    });
  }
};
