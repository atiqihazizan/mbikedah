<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePanelLedgersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('panel_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staffid');
            $table->foreignId('panelid');
            $table->decimal('lamt',10,2);
            $table->date('ldate');
            $table->string('remark',200)->nullable();
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
        Schema::dropIfExists('panel_ledgers');
    }
}
