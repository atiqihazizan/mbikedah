<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNecessitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('necessities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent')->default(0);
            $table->tinyInteger('ntyp')->default(0)->comment('necessitie type 1:booking 2:tempahan 3:advance');
            $table->boolean('db')->default(false);
            $table->boolean('actv')->default(true);
            $table->string('dbname')->default('');
            $table->string('item',50);
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
        Schema::dropIfExists('necessities');
    }
}
