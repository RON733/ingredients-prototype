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
        if (!Schema::hasTable('rider_notices')) {
            Schema::create('rider_notices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('driver_name');
                $table->string('driver_phone')->nullable();
                $table->string('status')->default('unavailable'); // unavailable, available
                $table->text('reason');
                $table->text('proof_image')->nullable();
                $table->boolean('is_acknowledged')->default(false);
                $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('acknowledged_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'availability_reason')) {
                $table->text('availability_reason')->nullable();
            }
            if (!Schema::hasColumn('users', 'availability_proof_image')) {
                $table->text('availability_proof_image')->nullable();
            }
            if (!Schema::hasColumn('users', 'availability_updated_at')) {
                $table->timestamp('availability_updated_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rider_notices');

        Schema::table('users', function (Blueprint $table) {
            $colsToDrop = [];
            if (Schema::hasColumn('users', 'availability_reason')) {
                $colsToDrop[] = 'availability_reason';
            }
            if (Schema::hasColumn('users', 'availability_proof_image')) {
                $colsToDrop[] = 'availability_proof_image';
            }
            if (Schema::hasColumn('users', 'availability_updated_at')) {
                $colsToDrop[] = 'availability_updated_at';
            }
            if (!empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }
};
