<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Services\SantaRosaDeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SantaRosaBarangayValidationTest extends TestCase
{
    use RefreshDatabase;

    private function seedOrderFixtures(): array
    {
        $customer = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@test.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
            'status' => 'active',
        ]);

        $product = Product::create([
            'id' => 'prod-classic',
            'name' => 'Classic Milk Tea',
            'category' => 'Milk Tea',
            'price' => 110,
            'is_available' => true,
        ]);

        return [$customer, $product];
    }

    public function test_all_9_supported_barangays_and_aliases_are_detected_with_etas(): void
    {
        $samples = [
            'Block 1 Lot 2, Brgy. Aplaya, Santa Rosa, Laguna' => ['Aplaya', '20–30 Mins'],
            'Purok 3, Caingin, Santa Rosa, Laguna' => ['Caingin', '20–30 Mins'],
            'Brgy. Ibaba, Santa Rosa, Laguna' => ['Ibaba', '15–25 Mins'],
            'Rizal Blvd, Poblacion Uno, Santa Rosa' => ['Kanluran (Poblacion Uno)', '15–25 Mins'],
            'Brgy. Labas, Santa Rosa, Laguna' => ['Labas', '20–30 Mins'],
            'Malusak, Santa Rosa, Laguna' => ['Malusak (Poblacion Dos)', '15–25 Mins'],
            'Market Area, Santa Rosa, Laguna' => ['Market Area (Poblacion Tres)', '15–25 Mins'],
            'Amira Townhomes, Brgy. Sinalhan, Santa Rosa' => ['Sinalhan', '15–20 Mins'],
            'Near SM City, Tagapo, Santa Rosa, Laguna' => ['Tagapo', '20–30 Mins'],
        ];

        $this->assertCount(9, SantaRosaDeliveryService::BARANGAYS);

        foreach ($samples as $address => [$expectedName, $expectedEta]) {
            $res = SantaRosaDeliveryService::detectFromText($address);
            $this->assertTrue($res['matched'], "Failed to match: {$address}");
            $this->assertSame($expectedName, $res['barangay']['name']);
            $this->assertSame($expectedEta, $res['barangay']['eta']);
        }
    }

    public function test_outside_cities_unsupported_barangays_and_false_positives_are_rejected(): void
    {
        $rejected = [
            '123 Main St, Biñan, Laguna',
            'Brgy. Santo Domingo, Biñan, Laguna',
            'Brgy. Aplaya, Calamba, Laguna',
            'Pulo, Cabuyao, Laguna',
            'Ayala Ave, Makati, Metro Manila',
            '123 Padilla St, Rita Ave, Santa Rosa, Laguna',
            'Santa Rosa, Laguna',
            'Manila South Road, Balibago Complex, Santa Rosa, Laguna',
            'Paseo de Santa Rosa, Don Jose, Laguna',
            'Golden City, Dila, Santa Rosa, Laguna',
            'Macabling, Santa Rosa, Laguna',
            'Brgy. Malitlit, Santa Rosa, Laguna',
        ];

        foreach ($rejected as $address) {
            $res = SantaRosaDeliveryService::detectFromText($address);
            $this->assertFalse($res['matched'], "Should have rejected: {$address}");
        }
    }

    public function test_order_store_rejects_outside_barangay_and_accepts_valid_santa_rosa_barangay(): void
    {
        [$customer, $product] = $this->seedOrderFixtures();

        // 1. Reject outside city
        $rejectCityRes = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', [
                'user_id' => $customer->id,
                'customer_name' => 'Maria Santos',
                'customer_phone' => '09171234567',
                'order_type' => 'Delivery',
                'delivery_address' => '123 National Hwy, Cabuyao, Laguna',
                'payment_method' => 'Cash',
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
            ]);

        $rejectCityRes->assertStatus(422)
            ->assertJsonPath('outside_delivery_area', true);

        // 2. Reject unsupported Santa Rosa barangay
        $rejectBrgyRes = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', [
                'user_id' => $customer->id,
                'customer_name' => 'Maria Santos',
                'customer_phone' => '09171234567',
                'order_type' => 'Delivery',
                'delivery_address' => 'Blk 2 Lot 8, Brgy. Balibago, Santa Rosa, Laguna',
                'payment_method' => 'Cash',
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
            ]);

        $rejectBrgyRes->assertStatus(422)
            ->assertJsonPath('outside_delivery_area', true);

        // 3. Accept supported Santa Rosa barangay with ETA
        $acceptRes = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', [
                'user_id' => $customer->id,
                'customer_name' => 'Maria Santos',
                'customer_phone' => '09171234567',
                'order_type' => 'Delivery',
                'delivery_address' => 'Blk 2 Lot 8, Brgy. Tagapo, Santa Rosa, Laguna',
                'payment_method' => 'Cash',
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
            ]);

        $acceptRes->assertStatus(201)
            ->assertJsonPath('detected_barangay', 'Tagapo')
            ->assertJsonPath('estimated_delivery_time', '20–30 Mins');

        // 4. Store Pickup does not require a delivery barangay
        $pickupRes = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/orders', [
                'user_id' => $customer->id,
                'customer_name' => 'Maria Santos',
                'customer_phone' => '09171234567',
                'order_type' => 'Store Pickup',
                'delivery_address' => '',
                'payment_method' => 'Cash',
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 1],
                ],
            ]);

        $pickupRes->assertStatus(201);
    }

    public function test_reverse_geocode_marks_supported_barangay_serviceable_and_unsupported_rejected(): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::sequence()
                ->push([
                    'address' => [
                        'road' => 'National Highway',
                        'quarter' => 'Tagapo',
                        'city' => 'Santa Rosa',
                        'state' => 'Laguna',
                    ],
                ], 200)
                ->push([
                    'address' => [
                        'road' => 'F. Reyes Street',
                        'quarter' => 'Balibago',
                        'city' => 'Santa Rosa',
                        'state' => 'Laguna',
                    ],
                ], 200)
                ->push([
                    'address' => [
                        'road' => 'National Highway',
                        'quarter' => 'Poblacion',
                        'city' => 'Biñan',
                        'state' => 'Laguna',
                    ],
                ], 200),
        ]);

        // Supported Santa Rosa barangay (Brgy. Tagapo)
        $okRes = $this->getJson('/api/reverse-geocode?lat=14.3101&lng=121.1035');
        $okRes->assertStatus(200)
            ->assertJsonPath('is_serviceable', true)
            ->assertJsonPath('detected_barangay', 'Tagapo')
            ->assertJsonPath('estimated_delivery_time', '20–30 Mins');

        // Unsupported Santa Rosa barangay (Brgy. Balibago)
        $unsupportedRes = $this->getJson('/api/reverse-geocode?lat=14.2934&lng=121.1082');
        $unsupportedRes->assertStatus(200)
            ->assertJsonPath('is_serviceable', false)
            ->assertJsonPath('detected_barangay', null);

        // Outside Santa Rosa (Biñan)
        $badRes = $this->getJson('/api/reverse-geocode?lat=14.3400&lng=121.0800');
        $badRes->assertStatus(200)
            ->assertJsonPath('is_serviceable', false)
            ->assertJsonPath('detected_barangay', null);
    }
}
