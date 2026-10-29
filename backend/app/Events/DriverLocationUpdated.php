<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int|string $orderId;
    public float $driverLat;
    public float $driverLng;
    public ?string $driverNotes;

    /**
     * Create a new event instance.
     */
    public function __construct($orderId, $driverLat, $driverLng, ?string $driverNotes = null)
    {
        $this->orderId = $orderId;
        $this->driverLat = (float) $driverLat;
        $this->driverLng = (float) $driverLng;
        $this->driverNotes = $driverNotes;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders.' . $this->orderId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'DriverLocationUpdated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'driver_lat' => $this->driverLat,
            'driver_lng' => $this->driverLng,
            'driver_notes' => $this->driverNotes,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
