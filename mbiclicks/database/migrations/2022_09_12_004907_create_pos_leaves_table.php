<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePosLeavesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pos_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leaves_id')->default(0);
            $table->integer('counter')->default(0);
            $table->integer('yrupto')->default(0)->comment('Year up to');
            $table->integer('maxbfwd')->default(0)->comment('max Bfwd');
            $table->integer('maxbal')->default(0)->comment('max balance');
            $table->tinyInteger('lvcate')->default(0)->comment('leave level');
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
        Schema::dropIfExists('pos_leaves');
    }
}
