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
        foreach (['professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('nif_number', 50)->nullable()->after('tax_id');
                $table->string('arsp_number', 50)->nullable()->after('nif_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['nif_number', 'arsp_number']);
            });
        }
    }
};
