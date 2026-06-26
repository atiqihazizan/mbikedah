<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePosAllowancesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pos_allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aid')->default(0)->comment('allowance id');
            //$table->foreignId('posid')->default(0)->comment('position id');
            $table->integer('distance')->default(0);
            $table->decimal('amt',10,2)->default(0);
            $table->tinyInteger('alwcate')->default(0)->comment('allowance level');
//            $table->json('posid')->nullable()->comment('position id');
//            $table->string('item',70)->nullable();
//            $table->string('unit',20)->nullable();
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
        Schema::dropIfExists('pos_allowances');
    }
}
