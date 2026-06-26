<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePetitionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('petitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_id')->default(0)->comment('user penyedia'); // penyediaan
            $table->foreignId('depart_id')->default(0)->comment('handle penyedia dan ketua jabatan');
            $table->foreignId('staff_id')->comment('pemohon'); // request/applicant
            $table->foreignId('ptype_id')->comment('jenis pemohonan');
            $table->tinyInteger('psts')->default(1)->comment('1:apply 2:process 3:finished');
//            $table->tinyInteger('psts')->default(1)->comment('1:apply 2:process 3:approved 4:reject 5:paid 6:return');
            $table->tinyInteger('pcate')->default(0)->comment('1:finance 2:HR');
            $table->boolean('seen')->default(false);
            $table->boolean('needclaim')->default(false);
            $table->decimal('tamt',10,2)->default(0)->comment('total bayaran');
            // bahagian HR
            $table->foreignId('claimid')->default(0)->comment('claim by petition claim using id');
            $table->foreignId('slvid')->default(0)->comment('staff leave id');
            $table->foreignId('typlv')->default(0)->comment('Jenis cuti/rawatan');
//            $table->tinyInteger('lvsts')->default(0)->comment('status untuk ditambah atau dikurang');
//            $table->decimal('taken',10,2)->default(0);
            $table->foreignId('lvref')->default(0)->comment('bersangkut dengan cuti lain seperti timeoff dengan cuti tahunan');
            //
            $table->foreignId('attn')->default(0)->comment('untuk perhatian');
            $table->tinyInteger('stepnow')->default(0)->comment('id step 1,2,4,8,16,32,n..');
            $table->tinyInteger('stepcnt')->default(0)->comment('counter step 1,2,3,4,5...');
            $table->year('pyear')->default(0);
            $table->date('pdate');
            $table->json('rulestep')->nullable()->comment('rule permohonan dari mula hingga tamat');
            $table->json('routestep')->nullable()->comment('step yg dah lalu');
            $table->json('grpstaff')->nullable();
            $table->json('body')->nullable()->comment('data permohonan');
            $table->json('plist')->nullable()->comment('untuk list details');
            $table->json('verified')->nullable()->comment('info signature');
            $table->dateTime('stepdt')->nullable()->comment('untuk dapatkan delay setelah submit');
            $table->string('remark',100)->nullable();
            $table->string('pcode',15)->default(0)->comment('petition code 1/23/001');
            $table->string('slug')->unique();
            $table->string('status',30)->nullable();
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
        Schema::dropIfExists('petitions');
    }
}
