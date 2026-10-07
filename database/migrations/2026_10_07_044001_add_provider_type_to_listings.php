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
        foreach (['pro_applications', 'professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('provider_type', 20)->default('individual')->after('user_id')->index();
            });
        }

        Schema::table('vehicle_providers', function (Blueprint $table) {
            $table->string('business_registration_path')->nullable()->after('identity_document_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_providers', function (Blueprint $table) {
            $table->dropColumn('business_registration_path');
        });

        foreach (['pro_applications', 'professionals', 'vehicle_providers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropIndex(['provider_type']);
                $table->dropColumn('provider_type');
            });
        }
    }
};
