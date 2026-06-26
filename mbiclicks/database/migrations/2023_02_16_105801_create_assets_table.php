<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAssetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->default(0);
            $table->foreignId('book_id')->default(0);
            $table->foreignId('staffidprev')->default(0)->comment('previous');
            $table->foreignId('bookidprev')->default(0)->comment('previous');
            $table->date('dtreturn')->nullable();
            $table->string('cate',70)->nullable();
            $table->string('model',50);
            $table->string('regno',30);
            $table->string('serial',30);
            $table->string('remark');
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
        Schema::dropIfExists('assets');
    }
}
