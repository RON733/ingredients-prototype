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
        'final_cost',
        'downpayment_percentage',
        'downpayment_amount',
        'amount_paid',
        'remaining_balance',
        'payment_status',
        'downpayment_requested_at',
        'downpayment_requested_by',
        'downpayment_deadline',
        'payment_notes',
        'payment_method',
        'payment_reference',
        'payment_proof',
        'downpayment_submitted_at',
        'downpayment_verified_at',
        'downpayment_verified_by',
        'downpayment_rejection_reason',
        'final_payment_method',
        'final_payment_reference',
        'fully_paid_at',
        'status',
        'notes',
        'reviewed_by_name',
        'reviewed_by_role',
        'reviewed_at',
    ];

    protected $casts = [
        'event_date' => 'date',
        'guest_count' => 'integer',
        'estimated_cost' => 'float',
        'final_cost' => 'float',
        'downpayment_percentage' => 'float',
        'downpayment_amount' => 'float',
        'amount_paid' => 'float',
        'remaining_balance' => 'float',
        'downpayment_requested_at' => 'datetime',
        'downpayment_deadline' => 'datetime',
        'downpayment_submitted_at' => 'datetime',
        'downpayment_verified_at' => 'datetime',
        'fully_paid_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'is_payment_overdue',
    ];

    public function getIsPaymentOverdueAttribute(): bool
    {
        if ($this->status !== 'Awaiting Downpayment' || !$this->downpayment_deadline) {
            return false;
        }
        return now('Asia/Manila')->greaterThan($this->downpayment_deadline);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}