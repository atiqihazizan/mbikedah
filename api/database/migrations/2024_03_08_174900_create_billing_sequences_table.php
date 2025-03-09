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
        Schema::create('billing_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('prefix', 10)->default('INV');
            $table->integer('sequence')->default(0);
            $table->integer('year');
            $table->integer('padding')->default(3);
            $table->timestamps();

            $table->unique(['prefix', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_sequences');
    }
};
