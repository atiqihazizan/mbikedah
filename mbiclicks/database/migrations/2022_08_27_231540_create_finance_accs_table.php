<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceAccsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_accs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pid')->default(0)->comment('parent id');
            $table->tinyInteger('acclvl')->default(0)->comment('Level Account');
            $table->boolean('shw')->default(1);
            $table->boolean('type')->default(0)->comment('1:debit 2:credit');
            $table->boolean('btyp')->default(0)->comment('bajet type');
            $table->boolean('rtyp')->default(3)->comment('1:finanece 2:budjet 3:both report type');
            for($i=1;$i<13;$i++){$table->decimal('b'.$i,15,2)->default(0);}
            $table->decimal('btotal',15,2)->default(0);
            $table->string('code',15);
            $table->string('name',100);
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
        Schema::dropIfExists('finance');
    }
}
