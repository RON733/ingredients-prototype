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
        'stock',
        'unit',
        'low_threshold',
    ];

    protected $casts = [
        'stock' => 'float',
        'low_threshold' => 'float',
    ];

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'ingredient_id', 'id');
    }
}
