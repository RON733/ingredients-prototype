<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            if (!Schema::hasColumn('ingredients', 'expiration_date')) {
                $table->date('expiration_date')->nullable()->after('supplier_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            if (Schema::hasColumn('ingredients', 'expiration_date')) {
                $table->dropColumn('expiration_date');
            }
        });
    }
};
