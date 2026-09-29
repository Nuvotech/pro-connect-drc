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
        Schema::create('vehicle_providers', function (Blueprint $table) {
            $table->id();
            $table->string('contact_name');
            $table->string('business_name')->nullable();
            $table->string('phone', 20);
            $table->boolean('is_on_whatsapp')->default(false);
            $table->string('email')->nullable()->unique();
            $table->string('city', 100);
            $table->string('commune', 100);
            $table->string('address')->nullable();
            $table->string('registry_number', 50)->nullable();
            $table->string('tax_id', 50)->nullable();
            $table->string('preferred_language', 2)->default('fr');
            $table->string('identity_document_path')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('onboarded_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_providers');
    }
};
