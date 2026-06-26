<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePtypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ptypes', function (Blueprint $table) {
            $table->id();
            $table->json('seq1')->nullable();
            $table->json('seq2')->nullable();
            $table->boolean('shw')->default(1);
            $table->tinyInteger('yrbudget')->default(0);
            $table->json('lvtyp')->nullable();
            $table->json('preq')->nullable()->comment('petition request');
            $table->json('tmpl')->nullable()->comment('petition template for preview');
            $table->json('tempform')->nullable()->comment('template for form step');
            $table->json('validity')->nullable()->comment('form validation');
            $table->tinyInteger('cate')->default(0)->comment('1:finance 2:hr');
            $table->integer('refid')->default(0)->comment('ref id parent');
            $table->integer('pseq')->default(0)->comment('petition sequence');
            $table->string('code',10);
            $table->string('name',50);
            $table->string('short',50);
            $table->string('description',120);
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
        Schema::dropIfExists('ptypes');
    }
}
