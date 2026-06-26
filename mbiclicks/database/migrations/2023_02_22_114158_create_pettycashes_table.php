<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePettycashesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pettycashes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id');
            $table->foreignId('depart_id');
            $table->foreignId('petition_id');
            $table->tinyInteger('sts')->default(0)->comment('1:approved 2:serah 3:terima');
            $table->tinyInteger('type')->default(0)->comment('1:debit 2:credit');
            $table->tinyInteger('ststrans')->default(0)->comment('1:open 2:close 3:trans 4:modal');
            $table->decimal('amt',10,2)->default(0);
            $table->date('trandt')->nullable();
            $table->string('descrip')->nullable();
            $table->string('ref')->nullable();
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
        Schema::dropIfExists('pettycashes');
    }
}
