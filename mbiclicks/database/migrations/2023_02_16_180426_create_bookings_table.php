<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('refid');
            $table->foreignId('petition_id');
            $table->foreignId('staff_id');
            $table->foreignId('depart_id');
            $table->tinyInteger('cate')->default(0)->comment('1:booking car 2:booking hotel');
            $table->date('dtstart')->nullable();
            $table->date('dtuntil')->nullable();
            $table->date('dtreturn')->nullable();
            $table->string('descrip')->nullable();
            $table->string('ref',70)->nullable();
            $table->string('odobefore',15)->default(0);
            $table->string('odoafter',15)->default(0);
            $table->string('remark')->nullable();
            $table->string('remark2')->nullable();
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
        Schema::dropIfExists('bookings');
    }
}
