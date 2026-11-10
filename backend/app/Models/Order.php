<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'source',
        'loyverse_receipt_id',
        'user_id',
        'driver_id',
        'customer_name',
        'customer_phone',
        'order_type',
        'delivery_address',
        'customer_lat',
        'customer_lng',
        'driver_lat',
        'driver_lng',
        'driver_notes',
        'payment_method',
        'payment_status',
        'gcash_ref',
        'proof_image',
        'paymongo_session_id',
        'paymongo_payment_id',
                'paymongo_checkout_url',
        'paymongo_qr_image',
        'status',
        'delivered_at',
        'on_the_way_notified_at',
        'subtotal',
        'delivery_fee',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'total_amount' => 'float',
        'customer_lat' => 'float',
        'customer_lng' => 'float',
        'driver_lat' => 'float',
        'driver_lng' => 'float',
        'delivered_at' => 'datetime',
        'on_the_way_notified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
