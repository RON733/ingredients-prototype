<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiderNotice extends Model
{
    use HasFactory;

    protected $table = 'rider_notices';

    protected $fillable = [
        'driver_id',
        'driver_name',
        'driver_phone',
        'status',
        'reason',
        'proof_image',
        'is_acknowledged',
        'acknowledged_by',
        'acknowledged_at',
    ];

    protected $casts = [
        'is_acknowledged' => 'boolean',
        'acknowledged_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function acknowledgedByUser()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
