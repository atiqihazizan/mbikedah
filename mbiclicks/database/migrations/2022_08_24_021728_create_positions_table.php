<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePositionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('name',30)->nullable();
            $table->foreignId('idgrp')->default(0);
            $table->tinyInteger('alwcate')->default(0)->comment('allowance level');

            $table->foreignId('lvcate')->default(0)->comment('leave category');
            $table->tinyInteger('lvsrvc1')->default(0)->comment('leave for service 1 = bawah 2tahun');
            $table->tinyInteger('lvsrvc2')->default(0)->comment('leave for service 2 = atas 2tahun dan bawah 5tahun');
            $table->tinyInteger('lvsrvc3')->default(0)->comment('leave for service 3 = atas 5tahun');
            $table->tinyInteger('grpcate')->default(0)->comment('group categori');

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
        Schema::dropIfExists('positions');
    }
}
