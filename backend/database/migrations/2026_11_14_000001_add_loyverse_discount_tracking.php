<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'loyverse_discount_id')) {
                $table->string('loyverse_discount_id')->nullable()->after('loyverse_variant_id');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'original_unit_price')) {
                $table->decimal('original_unit_price', 10, 2)->nullable()->after('unit_price');
            }
            if (!Schema::hasColumn('order_items', 'discount_amount')) {
                $table->decimal('discount_amount', 10, 2)->default(0)->after('subtotal');
            }
            if (!Schema::hasColumn('order_items', 'discount_label')) {
                $table->string('discount_label')->nullable()->after('discount_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'loyverse_discount_id')) {
                $table->dropColumn('loyverse_discount_id');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            $cols = array_filter(
                ['original_unit_price', 'discount_amount', 'discount_label'],
                fn ($col) => Schema::hasColumn('order_items', $col)
            );
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
