<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffLeaveLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('staff_leave_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idlv')->comment('leave table');
            $table->foreignId('idslv')->comment('table staff leave');
            $table->foreignId('idstaff');
            $table->dateTime('logdt');
            $table->integer('taken');
            $table->string('remark')->nullable();
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
        Schema::dropIfExists('staff_leave_logs');
    }
}
