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
        Schema::create('pro_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('business_name')->nullable();
            $table->string('phone', 20);
            $table->boolean('is_on_whatsapp')->default(false);
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->constrained()->restrictOnDelete();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->text('decision_message')->nullable();
            $table->foreignId('reviewed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro_applications');
    }
};
