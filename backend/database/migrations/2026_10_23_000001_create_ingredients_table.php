<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingredients', function (Blueprint $table) {
            $table->string('id')->primary(); // slug e.g. 'brioche-bun'
            $table->string('name');
            $table->string('category')->default('General'); // Bakery, Meat, Dairy, Produce, etc.
            $table->decimal('stock', 10, 2)->default(0);
            $table->string('unit')->default('pcs'); // pcs, slices, cups, scoops
            $table->decimal('low_threshold', 10, 2)->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
