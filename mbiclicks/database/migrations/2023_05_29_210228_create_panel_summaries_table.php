<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePanelSummariesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('panel_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('panelid');
            $table->year('panelyr');
            $table->decimal('ptotal',10,2);
            $table->decimal('m1',10,2);
            $table->decimal('m2',10,2);
            $table->decimal('m3',10,2);
            $table->decimal('m4',10,2);
            $table->decimal('m5',10,2);
            $table->decimal('m6',10,2);
            $table->decimal('m7',10,2);
            $table->decimal('m8',10,2);
            $table->decimal('m9',10,2);
            $table->decimal('m10',10,2);
            $table->decimal('m11',10,2);
            $table->decimal('m12',10,2);
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
        Schema::dropIfExists('panel_summaries');
    }
}
