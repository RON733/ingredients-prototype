<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            if (!Schema::hasColumn('ingredients', 'cost')) {
                $table->decimal('cost', 10, 2)->default(0.00)->after('stock');
            }
            if (!Schema::hasColumn('ingredients', 'supplier_name')) {
                $table->string('supplier_name')->nullable()->after('category');
            }
            if (!Schema::hasColumn('ingredients', 'loyverse_item_id')) {
                $table->string('loyverse_item_id')->nullable()->after('low_threshold');
            }
            if (!Schema::hasColumn('ingredients', 'loyverse_variant_id')) {
                $table->string('loyverse_variant_id')->nullable()->after('loyverse_item_id');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'loyverse_item_id')) {
                $table->string('loyverse_item_id')->nullable()->after('is_available');
            }
            if (!Schema::hasColumn('products', 'loyverse_variant_id')) {
                $table->string('loyverse_variant_id')->nullable()->after('loyverse_item_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            if (Schema::hasColumn('ingredients', 'loyverse_variant_id')) {
                $table->dropColumn('loyverse_variant_id');
            }
            if (Schema::hasColumn('ingredients', 'loyverse_item_id')) {
                $table->dropColumn('loyverse_item_id');
            }
            if (Schema::hasColumn('ingredients', 'supplier_name')) {
                $table->dropColumn('supplier_name');
            }
            if (Schema::hasColumn('ingredients', 'cost')) {
                $table->dropColumn('cost');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'loyverse_variant_id')) {
                $table->dropColumn('loyverse_variant_id');
            }
            if (Schema::hasColumn('products', 'loyverse_item_id')) {
                $table->dropColumn('loyverse_item_id');
            }
        });
    }
};
