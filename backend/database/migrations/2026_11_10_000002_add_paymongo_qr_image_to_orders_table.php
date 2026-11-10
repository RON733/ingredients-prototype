<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'paymongo_qr_image')) {
                $table->text('paymongo_qr_image')->nullable()->after('paymongo_checkout_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'paymongo_qr_image')) {
                $table->dropColumn('paymongo_qr_image');
            }
        });
    }
};