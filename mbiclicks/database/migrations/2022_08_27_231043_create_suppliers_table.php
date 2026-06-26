<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSuppliersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staffid')->default(0);
            $table->string('short',20)->default('');
            $table->string('name')->default('');
            $table->string('attn',100)->default('');
            $table->string('hp',16)->default('');
            $table->string('tel',16)->default('');
            $table->string('fax',16)->default('');
            $table->string('addr')->default('');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('suppliers');
    }
}
