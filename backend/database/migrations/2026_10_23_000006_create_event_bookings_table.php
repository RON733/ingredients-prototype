<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('client_name');
            $table->string('client_phone');
            $table->string('client_email')->nullable();
            $table->string('event_type')->default('Mobile Bar'); // Mobile Bar, Catering, Bulk Order, Corporate Event
            $table->date('event_date');
            $table->string('event_time')->nullable();
            $table->integer('guest_count')->default(50);
            $table->string('location');
            $table->string('package_name')->nullable();
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->string('status')->default('Pending'); // Pending, Approved, Declined, Completed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_bookings');
    }
};
