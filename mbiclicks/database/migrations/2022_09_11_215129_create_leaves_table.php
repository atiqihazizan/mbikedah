<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeavesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->string('leave',100)->default('');
            //$table->string('fieldname',30)->default('');
            $table->string('unit',20)->default('');
            $table->integer('refid')->default(0)->comment('related');
            $table->tinyInteger('ctype')->default(0)->comment('counter type 0:decrease 1:increase');
            $table->tinyInteger('typ')->default(0)->comment('1:hour 2:daily 3:rm');
            $table->tinyInteger('limit')->default(0);
            $table->tinyInteger('sort')->default(0);
            $table->integer('def')->default(0)->comment('default value');
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
        Schema::dropIfExists('leaves');
    }
}
