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
                ->where('key', 'like', 'loyverse%')
                ->delete();
        }

        if (Schema::hasTable('orders')) {
            if (Schema::hasColumn('orders', 'loyverse_receipt_id')) {
                try {
                    Schema::table('orders', function (Blueprint $table) {
                        $table->dropUnique(['loyverse_receipt_id']);
                    });
                } catch (\Throwable $e) {
                    // Index may already be absent or named differently
                }
            }

            Schema::table('orders', function (Blueprint $table) {
                $cols = array_values(array_filter(
                    ['loyverse_receipt_id', 'source'],
                    fn ($col) => Schema::hasColumn('orders', $col)
                ));
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $cols = array_values(array_filter(
                    ['loyverse_item_id', 'loyverse_variant_id', 'loyverse_discount_id'],
                    fn ($col) => Schema::hasColumn('products', $col)
                ));
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }

        if (Schema::hasTable('ingredients')) {
            Schema::table('ingredients', function (Blueprint $table) {
                $cols = array_values(array_filter(
                    ['loyverse_item_id', 'loyverse_variant_id'],
                    fn ($col) => Schema::hasColumn('ingredients', $col)
                ));
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
                if (!Schema::hasColumn('orders', 'source')) {
                    $table->string('source')->default('web')->after('order_number');
                }
                if (!Schema::hasColumn('orders', 'loyverse_receipt_id')) {
                    $table->string('loyverse_receipt_id')->nullable()->unique()->after('source');
                }
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'loyverse_item_id')) {
                    $table->string('loyverse_item_id')->nullable()->after('is_available');
                }
                if (!Schema::hasColumn('products', 'loyverse_variant_id')) {
                    $table->string('loyverse_variant_id')->nullable()->after('loyverse_item_id');
                }
                if (!Schema::hasColumn('products', 'loyverse_discount_id')) {
                    $table->string('loyverse_discount_id')->nullable()->after('loyverse_variant_id');
                }
            });
        }
    }
};
