<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSystemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('systems', function (Blueprint $table) {
            $table->id();
            $table->boolean('aacc')->default(0)->comment('active account');
            $table->boolean('abud')->default(0)->comment('active budget');
            $table->boolean('uacc')->default(0)->comment('update account');
            $table->boolean('ubud')->default(0)->comment('update budget');
            $table->year('yr')->default(0);
            $table->json('amtseq')->nullable();
            $table->string('agency',70)->default('MENTERI BESAR KEDAH INCORPORATED');
            $table->string('address')->default('Aras 2 Blok A, Wisma Darulaman, 05503 Alor Setar, Kedah Darulaman');
            $table->string('tel',30)->default('04 - 730 2137 / 731 0122');
            $table->string('fax',30)->default('04 - 774 4076');
            $table->text('inform')->nullable();
            $table->text('event')->nullable();
            $table->year('start_yr')->default(0);
            $table->year('current_yr')->default(0);
            $table->json('hajiumrah')->nullable();
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
        Schema::dropIfExists('systems');
    }
}
