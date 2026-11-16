<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('event_bookings', 'final_cost')) {
                $table->decimal('final_cost', 10, 2)->nullable()->after('estimated_cost');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_percentage')) {
                $table->decimal('downpayment_percentage', 5, 2)->nullable()->after('final_cost');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_amount')) {
                $table->decimal('downpayment_amount', 10, 2)->default(0)->after('downpayment_percentage');
            }
            if (!Schema::hasColumn('event_bookings', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('downpayment_amount');
            }
            if (!Schema::hasColumn('event_bookings', 'remaining_balance')) {
                $table->decimal('remaining_balance', 10, 2)->default(0)->after('amount_paid');
            }
            if (!Schema::hasColumn('event_bookings', 'payment_status')) {
                $table->string('payment_status')->default('Unpaid')->after('remaining_balance');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_requested_at')) {
                $table->timestamp('downpayment_requested_at')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_requested_by')) {
                $table->string('downpayment_requested_by')->nullable()->after('downpayment_requested_at');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_deadline')) {
                $table->timestamp('downpayment_deadline')->nullable()->after('downpayment_requested_by');
            }
            if (!Schema::hasColumn('event_bookings', 'payment_notes')) {
                $table->text('payment_notes')->nullable()->after('downpayment_deadline');
            }
            if (!Schema::hasColumn('event_bookings', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_notes');
            }
            if (!Schema::hasColumn('event_bookings', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('event_bookings', 'payment_proof')) {
                $table->longText('payment_proof')->nullable()->after('payment_reference');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_submitted_at')) {
                $table->timestamp('downpayment_submitted_at')->nullable()->after('payment_proof');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_verified_at')) {
                $table->timestamp('downpayment_verified_at')->nullable()->after('downpayment_submitted_at');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_verified_by')) {
                $table->string('downpayment_verified_by')->nullable()->after('downpayment_verified_at');
            }
            if (!Schema::hasColumn('event_bookings', 'downpayment_rejection_reason')) {
                $table->text('downpayment_rejection_reason')->nullable()->after('downpayment_verified_by');
            }
            if (!Schema::hasColumn('event_bookings', 'final_payment_method')) {
                $table->string('final_payment_method')->nullable()->after('downpayment_rejection_reason');
            }
            if (!Schema::hasColumn('event_bookings', 'final_payment_reference')) {
                $table->string('final_payment_reference')->nullable()->after('final_payment_method');
            }
            if (!Schema::hasColumn('event_bookings', 'fully_paid_at')) {
                $table->timestamp('fully_paid_at')->nullable()->after('final_payment_reference');
            }
        });
    }

    public function down(): void
    {
        Schema::table('event_bookings', function (Blueprint $table) {
            $columns = [
                'final_cost',
                'downpayment_percentage',
                'downpayment_amount',
                'amount_paid',
                'remaining_balance',
                'payment_status',
                'downpayment_requested_at',
                'downpayment_requested_by',
                'downpayment_deadline',
                'payment_notes',
                'payment_method',
                'payment_reference',
                'payment_proof',
                'downpayment_submitted_at',
                'downpayment_verified_at',
                'downpayment_verified_by',
                'downpayment_rejection_reason',
                'final_payment_method',
                'final_payment_reference',
                'fully_paid_at',
            ];

            $existing = array_values(array_filter(
                $columns,
                fn (string $col) => Schema::hasColumn('event_bookings', $col)
            ));

            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }
};