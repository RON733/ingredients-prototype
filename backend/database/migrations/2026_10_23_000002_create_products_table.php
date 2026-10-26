<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary(); // slug e.g. 'classic-cheeseburger'
            $table->string('name');
            $table->string('category'); // Drinks, Burgers, Pizza, RiceMeals, Sides, Coffee
            $table->decimal('price', 10, 2);
            $table->text('description')->nullable();
            $table->string('emoji')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
