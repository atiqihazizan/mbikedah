<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('depart_id');
            $table->foreignId('position_id')->comment('jawatan');
            $table->foreignId('staffunit_id')->default(0)->comment('staff unit');
            $table->year('lvyr')->default(0);
            $table->date('service_at')->nullable()->comment('Tarikh mula berkhidmat');
            $table->integer('service_cnt')->default(0)->comment('lama berkhidmat');
            $table->boolean('lvsts')->default(1)->comment('update cuti');
            $table->integer('hajiumrah')->default(0)->comment('haji dan umrah kelayakan ikut hari');
            $table->decimal('hajiumrahrm',12,2)->default(0)->comment('haji dan umrah kelayakan dalam RM');
            $table->string('staffno',6)->unique();
            $table->string('fullname',150);
            $table->string('email',150)->nullable();
            $table->string('staff_unit',100)->nullable()->comment('staff unit untuk value string');
            $table->json('entitlement')->nullable();
            $table->binary('avatar')->nullable();
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
        Schema::dropIfExists('staff');
    }
}
