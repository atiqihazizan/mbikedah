<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBankSummariesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bank_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bankid')->default(0);
            $table->year('yr')->default(0);
            $table->decimal('mtotal',15,2)->default(0);
            $table->decimal('m1',15,2)->default(0);
            $table->decimal('m2',15,2)->default(0);
            $table->decimal('m3',15,2)->default(0);
            $table->decimal('m4',15,2)->default(0);
            $table->decimal('m5',15,2)->default(0);
            $table->decimal('m6',15,2)->default(0);
            $table->decimal('m7',15,2)->default(0);
            $table->decimal('m8',15,2)->default(0);
            $table->decimal('m9',15,2)->default(0);
            $table->decimal('m10',15,2)->default(0);
            $table->decimal('m11',15,2)->default(0);
            $table->decimal('m12',15,2)->default(0);
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
        Schema::dropIfExists('bank_summaries');
    }
}
