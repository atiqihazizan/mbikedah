<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            // Tambah field yang hilang
            if (!Schema::hasColumn('positions', 'description')) {
                $table->text('description')->nullable()->after('code');
            }
            
            if (!Schema::hasColumn('positions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
            
            if (!Schema::hasColumn('positions', 'deleted_at')) {
                $table->softDeletes(); // Ini akan menambah deleted_at column
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            // Hapus field yang ditambah
            if (Schema::hasColumn('positions', 'description')) {
                $table->dropColumn('description');
            }
            
            if (Schema::hasColumn('positions', 'is_active')) {
                $table->dropColumn('is_active');
            }
            
            if (Schema::hasColumn('positions', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
