<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('rider_remittances')) {
            Schema::create('rider_remittances', function (Blueprint $table) {
                $table->id();
                $table->string('reference_number')->unique();
                $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('driver_name');
                $table->string('driver_phone')->nullable();
                $table->decimal('amount', 10, 2)->default(0);
                $table->integer('orders_count')->default(0);
                $table->json('order_ids')->nullable();
                $table->json('order_numbers')->nullable();
                $table->string('status')->default('pending'); // pending, accepted, rejected, cancelled
                $table->text('rider_notes')->nullable();
                $table->text('staff_notes')->nullable();
                $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('accepted_by_name')->nullable();
                $table->string('accepted_by_role')->nullable();
                $table->timestamp('accepted_at')->nullable();
                $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('rejected_by_name')->nullable();
                $table->timestamp('rejected_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'remittance_id')) {
                $table->foreignId('remittance_id')->nullable()->constrained('rider_remittances')->nullOnDelete();
            }
            if (!Schema::hasColumn('orders', 'remitted_at')) {
                $table->timestamp('remitted_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'remittance_id')) {
                $table->dropConstrainedForeignId('remittance_id');
            }
            if (Schema::hasColumn('orders', 'remitted_at')) {
                $table->dropColumn('remitted_at');
            }
        });

        Schema::dropIfExists('rider_remittances');
    }
};
