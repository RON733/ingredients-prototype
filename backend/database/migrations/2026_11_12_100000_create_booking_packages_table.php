<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_packages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->string('badge')->nullable();
            $table->string('accent_color')->default('amber');
            $table->decimal('price', 10, 2)->default(3500);
            $table->string('pricing_type')->default('per_pack'); // per_pack | per_guest | flat
            $table->integer('base_pax')->default(50);
            $table->string('option_label')->nullable();
            $table->text('description')->nullable();
            $table->json('inclusions')->nullable();
            $table->longText('image_url')->nullable();
            $table->boolean('show_in_banner')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_packages');
    }
};