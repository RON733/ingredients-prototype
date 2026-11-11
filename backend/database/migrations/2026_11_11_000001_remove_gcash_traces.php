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
                ->whereIn('key', [
                    'gcash_account_name',
                    'gcash_account_number',
                    'gcash_qr_code',
                    'gcash_available',
                ])
                ->delete();
        }

        if (Schema::hasTable('orders')) {
            DB::table('orders')
                ->where('payment_method', 'GCash')
                ->update(['payment_method' => 'PayMongo']);

            Schema::table('orders', function (Blueprint $table) {
                $cols = [];
                if (Schema::hasColumn('orders', 'gcash_ref')) {
                    $cols[] = 'gcash_ref';
                }
                if (Schema::hasColumn('orders', 'proof_image')) {
                    $cols[] = 'proof_image';
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
                if (!Schema::hasColumn('orders', 'gcash_ref')) {
                    $table->string('gcash_ref')->nullable();
                }
                if (!Schema::hasColumn('orders', 'proof_image')) {
                    $table->longText('proof_image')->nullable();
                }
            });
        }
    }
};
