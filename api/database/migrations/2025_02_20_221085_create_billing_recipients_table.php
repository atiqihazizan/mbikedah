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
        Schema::create('billing_recipients', function (Blueprint $table) {
            $table->id();
            $table->string('short')->nullable();
            $table->string('name');
            $table->string('attn')->nullable();
            $table->string('hp')->nullable();
            $table->string('tel')->nullable();
            $table->string('fax')->nullable();
            $table->string('addr')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_recipients');
    }
};
