<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverOnTheWay implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int|string $orderId;
    public string $orderNumber;
    public ?int $driverId;
    public string $driverName;
    public ?string $driverPhone;
    public ?float $driverLat;
    public ?float $driverLng;
    public string $notifiedAt;
    public bool $alreadyNotified;
    public string $message;

    public function __construct(
        $orderId,
        string $orderNumber,
        ?int $driverId,
        string $driverName,
        ?string $driverPhone = null,
        ?float $driverLat = null,
        ?float $driverLng = null,
        ?string $notifiedAt = null,
        bool $alreadyNotified = false,
        ?string $message = null
    ) {
        $this->orderId = $orderId;
        $this->orderNumber = $orderNumber;
        $this->driverId = $driverId;
        $this->driverName = $driverName;
        $this->driverPhone = $driverPhone;
        $this->driverLat = $driverLat !== null ? (float) $driverLat : null;
        $this->driverLng = $driverLng !== null ? (float) $driverLng : null;
        $this->notifiedAt = $notifiedAt ?? now()->toIso8601String();
        $this->alreadyNotified = $alreadyNotified;
        $this->message = $message ?? ("Rider " . $driverName . " is on the way to your doorstep!");
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders.' . $this->orderId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'DriverOnTheWay';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'order_number' => $this->orderNumber,
            'driver_id' => $this->driverId,
            'driver_name' => $this->driverName,
            'driver_phone' => $this->driverPhone,
            'driver_lat' => $this->driverLat,
            'driver_lng' => $this->driverLng,
            'notified_at' => $this->notifiedAt,
            'already_notified' => $this->alreadyNotified,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
