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
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->nullable()->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('requested_professional_id')->nullable()->constrained('professionals')->nullOnDelete();
            $table->string('service_type', 30);
            $table->text('description');
            $table->string('timing', 20);
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->nullable()->constrained()->nullOnDelete();
            $table->string('address')->nullable();
            $table->boolean('needs_site_visit')->default(false);
            $table->string('contact_channel', 20);
            $table->string('status', 20)->default('open')->index();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_requests');
    }
};
