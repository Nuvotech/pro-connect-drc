<?php

use App\Models\User;
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
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('phone', 20)->nullable()->unique()->after('email');
        });

        // Pros who already applied can sign in with the number they gave,
        // unless two accounts share it.
        DB::table('pro_applications')
            ->orderBy('id')
            ->get(['user_id', 'phone'])
            ->groupBy(fn (object $application) => User::normalizePhone($application->phone))
            ->filter(fn ($applications) => $applications->count() === 1)
            ->each(fn ($applications, string $phone) => DB::table('users')
                ->where('id', $applications->first()->user_id)
                ->update(['phone' => $phone]));
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropColumn('phone');
            $table->string('email')->nullable(false)->change();
        });
    }
};
