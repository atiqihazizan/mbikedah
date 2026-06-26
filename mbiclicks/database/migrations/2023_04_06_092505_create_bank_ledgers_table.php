<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBankLedgersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bank_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tx_by')->default(0)->comment('transaction by');
            $table->foreignId('bankid')->default(0);
//            $table->foreignId('accid')->default(0);
            $table->foreignId('pettid')->default(0)->comment('petition id');
            $table->foreignId('paidto')->default(0)->comment('paid to vendor/supplier/staff');
            $table->date('txdate')->nullable()->comment('transaction date');
            $table->tinyInteger('txtype')->default(0)->comment('1:debit 2:kredit');
            $table->tinyInteger('txsts')->default(0)->comment('1:open 2:transaction 3:closed');
            $table->decimal('txamt',15,2)->default(0);
            $table->decimal('balamt',15,2)->default(0);
            $table->string('description')->nullable();
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
        Schema::dropIfExists('bank_ledgers');
    }
}
