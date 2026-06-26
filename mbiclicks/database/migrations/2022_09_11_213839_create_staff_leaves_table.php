<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffLeavesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('staff_leaves', function (Blueprint $table) {
            $table->id();
            $table->year('yr')->default(0);
            $table->foreignId('staff_id')->default(0);
            $table->foreignId('leaves_id')->default(0);
            $table->tinyInteger('ctype')->comment('Counter type')->default(0);
            $table->tinyInteger('typ')->comment('1:hour, 2:daily 3:rm')->default(1);
            $table->integer('refid')->default(0)->comment('ref leaveid ');
            $table->integer('limit')->default(0)->comment('limit/balance entitlement');
            $table->integer('taken')->default(0)->comment('total taken entitlement');
            $table->integer('basic')->default(0)->comment('basic entitlement');
            $table->integer('b1')->default(0);
            $table->integer('b2')->default(0);
            $table->integer('b3')->default(0);
            $table->integer('b4')->default(0);
            $table->integer('b5')->default(0);
            $table->integer('b6')->default(0);
            $table->integer('b7')->default(0);
            $table->integer('b8')->default(0);
            $table->integer('b9')->default(0);
            $table->integer('b10')->default(0);
            $table->integer('b11')->default(0);
            $table->integer('b12')->default(0);
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
        Schema::dropIfExists('staff_leaves');
    }
}
