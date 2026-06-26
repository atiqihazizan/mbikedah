<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeaveEntitlementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('leave_entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idgrp')->default(0);
            $table->foreignId('idleave')->default(0);
            $table->integer('yr_up')->default(0)->comment('Year up to');
            $table->integer('entitle')->default(0);
            $table->integer('maxbfwd')->default(0)->comment('Max Bring Foward');
            $table->integer('maxbal')->default(0)->comment('Max Balance');
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
        Schema::dropIfExists('leave_entitlements');
    }
}
