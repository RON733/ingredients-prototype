<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiderRemittance extends Model
{
    use HasFactory;

    protected $table = 'rider_remittances';

    protected $fillable = [
        'reference_number',
        'driver_id',
        'driver_name',
        'driver_phone',
        'amount',
        'orders_count',
        'order_ids',
        'order_numbers',
        'status',
        'rider_notes',
        'staff_notes',
        'accepted_by',
        'accepted_by_name',
        'accepted_by_role',
        'accepted_at',
        'rejected_by',
        'rejected_by_name',
        'rejected_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'orders_count' => 'integer',
        'order_ids' => 'array',
        'order_numbers' => 'array',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function acceptedByUser()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function rejectedByUser()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'remittance_id');
    }
}
