<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price',
        'original_unit_price',
        'quantity',
        'subtotal',
        'discount_amount',
        'discount_label',
        'customization',
    ];

    protected $casts = [
        'unit_price' => 'float',
        'original_unit_price' => 'float',
        'quantity' => 'integer',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'customization' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
