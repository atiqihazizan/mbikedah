<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            // Fix default value - should be null, not 0
            $table->foreignId('parent_id')->nullable()->change();
        });
        
        // Update existing records with parent_id = 0 to null
        DB::table('budgets')->where('parent_id', 0)->update(['parent_id' => null]);
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->default(0)->change();
        });
    }
};