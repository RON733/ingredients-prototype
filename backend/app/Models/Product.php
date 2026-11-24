<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'category',
        'price',
        'original_price',
        'discount_percent',
        'discount_type',
        'discount_value',
        'description',
        'customizations',
        'emoji',
        'image',
        'is_available',
    ];

    protected $casts = [
        'price' => 'float',
        'original_price' => 'float',
        'discount_percent' => 'float',
        'discount_value' => 'float',
        'is_available' => 'boolean',
        'customizations' => 'array',
    ];

    protected $appends = ['max_portions', 'stock_status', 'is_discounted'];

    public function getIsDiscountedAttribute()
    {
        return $this->original_price !== null && $this->original_price > $this->price && $this->discount_percent > 0;
    }

    public function getMaxPortionsAttribute()
    {
        return $this->is_available ? 999 : 0;
    }

    public function getStockStatusAttribute()
    {
        return $this->is_available ? 'available' : 'unavailable';
    }
}
