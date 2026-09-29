<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Listings stop storing categories and locations as free text and point at
 * the `categories`, `cities` and `communes` reference tables instead. Run
 * with `migrate:fresh --seed`: existing listing rows are not converted.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('professionals', function (Blueprint $table) {
            $table->dropColumn(['categories', 'city', 'commune']);
        });

        Schema::table('professionals', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('user_id');
            $table->string('headline')->nullable()->after('business_name');
            $table->foreignId('city_id')->nullable()->after('email')->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->nullable()->after('city_id')->constrained()->restrictOnDelete();
            $table->string('service_area')->nullable()->after('address');
            $table->decimal('starting_rate', 12, 2)->nullable()->after('service_area');
            $table->string('rate_unit', 10)->nullable()->after('starting_rate');
            $table->string('currency', 3)->default('USD')->after('rate_unit');
            $table->decimal('rating_average', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
        });

        Schema::table('vehicle_providers', function (Blueprint $table) {
            $table->dropColumn(['city', 'commune']);
        });

        Schema::table('vehicle_providers', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('user_id');
            $table->foreignId('city_id')->nullable()->after('email')->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->nullable()->after('city_id')->constrained()->restrictOnDelete();
            $table->decimal('rating_average', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('vehicle_provider_id')->constrained()->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->string('category')->default('')->index();
        });

        Schema::table('vehicle_providers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('commune_id');
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'rating_average', 'reviews_count']);
            $table->string('city', 100)->default('');
            $table->string('commune', 100)->default('');
        });

        Schema::table('professionals', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('commune_id');
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'headline', 'service_area', 'starting_rate', 'rate_unit', 'currency', 'rating_average', 'reviews_count']);
            $table->json('categories')->default('[]');
            $table->string('city', 100)->default('');
            $table->string('commune', 100)->default('');
        });
    }
};
