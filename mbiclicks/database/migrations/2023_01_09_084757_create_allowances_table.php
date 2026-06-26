<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAllowancesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('allowances', function (Blueprint $table) {
            $table->id();
            $table->string('name',70)->nullable();
            $table->string('unit',15)->nullable();
            $table->decimal('fixedcost',10,2)->default(0);
            $table->decimal('limitkm',10,3)->default(0);
            $table->tinyInteger('parent')->default(0);
            $table->boolean('stscost')->default(0)->comment('0: tiada fixed cost 1: ada fixed cost');
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
        Schema::dropIfExists('allowances');
    }
}
