<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id');
            $table->foreignId('depart_id')->default(0);
            $table->json('ustep')->nullable()->comment('allow step');
            $table->tinyInteger('uability')->default(0)->comment('User ability setting');
            $table->tinyInteger('utype')->default(0)->comment('1:finance 2:HR');
            $table->boolean('is_admin')->default(0);
//            $table->boolean('lvpass')->default(0)->comment('untuk check cuti');
            $table->string('name');
            $table->string('username')->unique();
            // $table->string('email')->unique();
            // $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('priority_page')->default('home');
            // $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
