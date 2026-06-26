<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSteppersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('steppers', function (Blueprint $table) {
            $table->id();
            $table->string('code',10);
            $table->string('name',50);
            $table->string('description',50)->nullable();
            $table->json('act')->nullable()->comment('action 1:edit 2:del 3:approv/verify 4:return 5:reject 6:print and approve');
            $table->json('actsts')->nullable();
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
        Schema::dropIfExists('steppers');
    }
}
