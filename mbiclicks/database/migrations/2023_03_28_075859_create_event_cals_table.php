<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventCalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('event_cals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uid')->default(0);
            $table->foreignId('deptid')->default(0);
            $table->tinyInteger('typ')->default(0);
            $table->string('title',150)->nullable(true);
            $table->datetime('start')->nullable(true);
            $table->datetime('end')->nullable(true);
            $table->json('evtprop')->nullable(true);
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
        Schema::dropIfExists('event_cals');
    }
}
