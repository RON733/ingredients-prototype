<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('event_bookings', 'reviewed_by_name')) {
                $table->string('reviewed_by_name')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('event_bookings', 'reviewed_by_role')) {
                $table->string('reviewed_by_role')->nullable()->after('reviewed_by_name');
            }
            if (!Schema::hasColumn('event_bookings', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by_role');
            }
        });
    }

    public function down(): void
    {
        Schema::table('event_bookings', function (Blueprint $table) {
            $cols = array_values(array_filter([
                Schema::hasColumn('event_bookings', 'reviewed_by_name') ? 'reviewed_by_name' : null,
                Schema::hasColumn('event_bookings', 'reviewed_by_role') ? 'reviewed_by_role' : null,
                Schema::hasColumn('event_bookings', 'reviewed_at') ? 'reviewed_at' : null,
            ]));
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};