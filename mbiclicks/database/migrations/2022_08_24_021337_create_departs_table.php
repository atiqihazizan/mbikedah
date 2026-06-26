<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDepartsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('departs', function (Blueprint $table) {
            $table->id();
            $table->string('dcode',20)->unique();
            $table->string('name',100);
            $table->integer('fseq')->default(0)->comment('finance');
            $table->integer('hseq')->default(0)->comment('human resources');
            $table->string('fhead',15)->nullable();
            $table->string('hhead',15)->nullable();
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
        Schema::dropIfExists('departs');
    }
}
