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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base', 3)->default('USD');
            $table->string('quote', 3)->default('CDF');
            $table->decimal('rate', 14, 4);
            $table->string('source', 10);
            $table->timestamp('effective_at');
            $table->timestamps();

            $table->index(['source', 'effective_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
