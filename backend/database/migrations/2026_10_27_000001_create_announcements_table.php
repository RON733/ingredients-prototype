<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('badge')->default('Announcement');
            $table->string('badge_color')->default('orange'); // orange, emerald, blue, purple, rose, amber
            $table->text('description');
            $table->text('image_url')->nullable(); // Optional photo!
            $table->string('cta_text')->nullable(); // e.g. "Order Now", "Explore Menu"
            $table->string('cta_action')->nullable(); // "menu", "booking", "external", etc.
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
