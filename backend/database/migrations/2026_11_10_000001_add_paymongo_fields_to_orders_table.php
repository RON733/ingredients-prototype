<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'paymongo_session_id')) {
                $table->string('paymongo_session_id')->nullable()->after('proof_image');
            }
            if (!Schema::hasColumn('orders', 'paymongo_payment_id')) {
                $table->string('paymongo_payment_id')->nullable()->after('paymongo_session_id');
            }
            if (!Schema::hasColumn('orders', 'paymongo_checkout_url')) {
                $table->text('paymongo_checkout_url')->nullable()->after('paymongo_payment_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('orders', 'paymongo_session_id')) $cols[] = 'paymongo_session_id';
            if (Schema::hasColumn('orders', 'paymongo_payment_id')) $cols[] = 'paymongo_payment_id';
            if (Schema::hasColumn('orders', 'paymongo_checkout_url')) $cols[] = 'paymongo_checkout_url';
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
