<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int|string $orderId;
    public string $status;
    public ?int $driverId;
    public ?array $driver;

    public function __construct($orderId, string $status, ?int $driverId = null, ?array $driver = null)
    {
        $this->orderId = $orderId;
        $this->status = $status;
        $this->driverId = $driverId;
        $this->driver = $driver;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders.' . $this->orderId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderStatusUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'status' => $this->status,
            'driver_id' => $this->driverId,
            'driver' => $this->driver,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
