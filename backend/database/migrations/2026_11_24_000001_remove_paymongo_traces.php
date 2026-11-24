<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->whereIn('key', ['paymongo_available'])
                ->delete();
        }

        if (Schema::hasTable('orders')) {
            DB::table('orders')
                ->where('payment_method', 'PayMongo')
                ->update(['payment_method' => 'Cash']);

            Schema::table('orders', function (Blueprint $table) {
                $cols = [];
                foreach (['paymongo_session_id', 'paymongo_payment_id', 'paymongo_checkout_url', 'paymongo_qr_image'] as $col) {
                    if (Schema::hasColumn('orders', $col)) {
                        $cols[] = $col;
                    }
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'paymongo_session_id')) {
                    $table->string('paymongo_session_id')->nullable();
                }
                if (!Schema::hasColumn('orders', 'paymongo_payment_id')) {
                    $table->string('paymongo_payment_id')->nullable();
                }
                if (!Schema::hasColumn('orders', 'paymongo_checkout_url')) {
                    $table->text('paymongo_checkout_url')->nullable();
                }
                if (!Schema::hasColumn('orders', 'paymongo_qr_image')) {
                    $table->text('paymongo_qr_image')->nullable();
                }
            });
        }
    }
};