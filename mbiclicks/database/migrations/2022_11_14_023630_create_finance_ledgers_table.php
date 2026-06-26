<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceLedgersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petition_id');
            $table->foreignId('finance_id');
            $table->boolean('type')->nullable()->comment('1:debit 2:credit');
            $table->integer('yrmth')->default(0);
            $table->date('datetx')->nullable()->comment('date transaction');
            $table->decimal('amt',10,2)->default(0);
            $table->string('description')->nullable();
            $table->string('fcode',15)->nullable();
            $table->string('fname',100)->nullable();
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
        Schema::dropIfExists('finance_ledgers');
    }
}
