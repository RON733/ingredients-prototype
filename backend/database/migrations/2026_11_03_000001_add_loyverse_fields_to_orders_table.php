<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'source')) {
                $table->string('source')->default('web')->after('order_number');
            }
            if (!Schema::hasColumn('orders', 'loyverse_receipt_id')) {
                $table->string('loyverse_receipt_id')->nullable()->unique()->after('source');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'loyverse_receipt_id')) {
                $table->dropColumn('loyverse_receipt_id');
            }
            if (Schema::hasColumn('orders', 'source')) {
                $table->dropColumn('source');
            }
        });
    }
};
