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
        Schema::create('professionals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('slug')->nullable()->unique();
            $table->string('full_name');
            $table->string('business_name')->nullable();
            $table->string('headline')->nullable();
            $table->string('phone', 20);
            $table->boolean('is_on_whatsapp')->default(false);
            $table->string('email')->nullable()->unique();
            $table->foreignId('city_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('address')->nullable();
            $table->string('service_area')->nullable();
            $table->decimal('starting_rate', 12, 2)->nullable();
            $table->string('rate_unit', 10)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->unsignedTinyInteger('experience_years')->nullable();
            $table->string('registry_number', 50)->nullable();
            $table->string('tax_id', 50)->nullable();
            $table->text('bio')->nullable();
            $table->string('preferred_language', 2)->default('fr');
            $table->string('photo_path')->nullable();
            $table->string('identity_document_path')->nullable();
            $table->string('business_registration_path')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('review_status', 20)->default('pending')->index();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('onboarded_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('rating_average', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professionals');
    }
};
