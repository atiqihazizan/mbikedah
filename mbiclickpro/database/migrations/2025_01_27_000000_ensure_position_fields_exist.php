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
            // Pastikan field 'code' wujud
            if (!Schema::hasColumn('positions', 'code')) {
                $table->string('code')->nullable()->after('name');
            }
            
            // Pastikan field 'description' wujud
            if (!Schema::hasColumn('positions', 'description')) {
                $table->text('description')->nullable()->after('code');
            }
            
            // Pastikan field 'is_active' wujud
            if (!Schema::hasColumn('positions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Tidak perlu rollback untuk migration ini
        // kerana ia hanya memastikan field wujud
    }
};
