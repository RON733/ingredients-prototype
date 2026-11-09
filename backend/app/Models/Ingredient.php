<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'category',
        'supplier_name',
        'expiration_date',
        'stock',
        'cost',
        'unit',
        'low_threshold',
        'loyverse_item_id',
        'loyverse_variant_id',
    ];

    protected $casts = [
        'stock' => 'float',
        'cost' => 'float',
        'low_threshold' => 'float',
        'expiration_date' => 'date:Y-m-d',
    ];

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'ingredient_id', 'id');
    }
}

