<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVerificationLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
//        Schema::create('verification_logs', function (Blueprint $table) {
//            $table->id();
//            $table->foreignId('user_id');
//            $table->foreignId('petition_id');
//            $table->foreignId('depart_id');
//            $table->foreignId('ptype_id');
//            $table->foreignId('stepval')->default(0)->comment('bit step');
//            $table->integer('approved_by')->default(0);
//            $table->integer('status')->default(0)->comment('status verify');
//            $table->integer('stepcount')->default(0)->comment('step counter');
//            $table->text('data')->nullable();
//            $table->text('comment')->nullable();
//            $table->timestamp('readed')->nullable();
//            $table->timestamp('verified')->nullable();
//            $table->timestamps();
//        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('verification_logs');
    }
}
