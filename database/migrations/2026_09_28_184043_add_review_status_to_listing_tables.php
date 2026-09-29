<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (['professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('review_status', 20)->default('pending')->after('verified_at');
                $table->timestamp('submitted_at')->nullable()->after('review_status');
                $table->index('review_status');
            });

            DB::table($tableName)->whereNotNull('verified_at')->update(['review_status' => 'approved']);
            DB::table($tableName)->update(['submitted_at' => DB::raw('created_at')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropIndex(['review_status']);
                $table->dropColumn(['review_status', 'submitted_at']);
            });
        }
    }
};
