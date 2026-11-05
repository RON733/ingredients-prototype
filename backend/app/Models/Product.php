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
    ];

    protected $appends = ['max_portions', 'stock_status', 'is_discounted'];

    public function getIsDiscountedAttribute()
    {
        return $this->original_price !== null && $this->original_price > $this->price && $this->discount_percent > 0;
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'product_id', 'id')->with('ingredient');
    }

    public function getMaxPortionsAttribute()
    {
        if (!$this->is_available) {
            return 0;
        }

        $recipes = $this->recipes;
        if ($recipes->isEmpty()) {
            return 999; // If no recipe defined, unlimited
        }

        $max = INF;
        foreach ($recipes as $recipe) {
            if (!$recipe->ingredient || $recipe->qty <= 0) {
                continue;
            }
            $possible = floor($recipe->ingredient->stock / $recipe->qty);
            if ($possible < $max) {
                $max = $possible;
            }
        }

        return $max === INF ? 0 : (int)$max;
    }

    public function getStockStatusAttribute()
    {
        if (!$this->is_available) {
            return 'unavailable';
        }
        $portions = $this->max_portions;
        if ($portions <= 0) {
            return 'soldout';
        }
        if ($portions <= 3) {
            return 'low';
        }
        return 'available';
    }
}

