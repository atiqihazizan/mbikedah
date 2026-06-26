<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePetitionLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('petition_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('petition_id');
            $table->foreignId('depart_id');
            $table->foreignId('ptype_id');
            $table->foreignId('step')->default(0);
            $table->foreignId('pass')->default(0);
            $table->tinyInteger('cnt')->default(0);
            $table->tinyInteger('psts')->default(0);
            $table->text('remark')->nullable();
            $table->dateTime('submit_at')->nullable();
            $table->string('status',30)->nullable();
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
        Schema::dropIfExists('petition_logs');
    }
}
