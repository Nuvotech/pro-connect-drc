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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_provider_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('make', 100);
            $table->string('model', 100);
            $table->unsignedSmallInteger('year');
            $table->string('registration_number', 20);
            $table->string('transmission', 20);
            $table->string('fuel_type', 20);
            $table->unsignedSmallInteger('seats')->nullable();
            $table->decimal('payload_tonnes', 5, 1)->nullable();
            $table->string('driver_option', 20);
            $table->decimal('daily_rate', 12, 2);
            $table->string('currency', 3);
            $table->decimal('deposit', 12, 2)->nullable();
            $table->unsignedSmallInteger('minimum_rental_days')->default(1);
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->date('insurance_expires_on')->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();

            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
