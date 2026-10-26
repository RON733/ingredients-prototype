<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_name',
        'client_phone',
        'client_email',
        'event_type',
        'event_date',
        'event_time',
        'guest_count',
        'location',
        'package_name',
        'estimated_cost',
        'status',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'guest_count' => 'integer',
        'estimated_cost' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
