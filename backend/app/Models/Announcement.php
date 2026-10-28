<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'badge',
        'badge_color',
        'description',
        'image_url',
        'cta_text',
        'cta_action',
        'is_active',
        'priority',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];
}
