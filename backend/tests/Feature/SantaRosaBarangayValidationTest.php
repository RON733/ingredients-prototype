<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
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

        $ingredient = Ingredient::create([
            'id' => 'ing-tea',
            'name' => 'Black Tea Base',
            'stock' => 500,
            'unit' => 'ml',
            'min_stock' => 10,
        ]);

        $product = Product::create([
            'id' => 'prod-classic',
            'name' => 'Classic Milk Tea',
            'category' => 'Milk Tea',
            'price' => 110,
            'is_available' => true,
        ]);

        // Omit Recipe row so SQLite :memory: tests do not hit PostgreSQL ::numeric stock update SQL

        return [$customer, $product];
    }

    public function test_all_18_barangays_and_aliases_are_detected_with_etas(): void
    {
        $samples = [
            'Block 1 Lot 2, Brgy. Aplaya, Santa Rosa, Laguna' => ['Aplaya', '20–30 Mins'],
            'Manila South Road, Balibago Complex, Santa Rosa, Laguna' => ['Balibago', '25–35 Mins'],
            'Purok 3, Caingin, Santa Rosa, Laguna' => ['Caingin', '20–30 Mins'],
            'Golden City, Dila, Santa Rosa, Laguna' => ['Dila', '25–35 Mins'],
            'Brgy. Dita, Santa Rosa, Laguna' => ['Dita', '30–40 Mins'],
            'Paseo de Santa Rosa, Don Jose, Laguna' => ['Don Jose', '40–55 Mins'],
            'Brgy. Ibaba, Santa Rosa, Laguna' => ['Ibaba', '15–25 Mins'],
            'Rizal Blvd, Poblacion Uno, Santa Rosa' => ['Kanluran (Poblacion Uno)', '15–25 Mins'],
            'Brgy. Labas, Santa Rosa, Laguna' => ['Labas', '20–30 Mins'],
            'Macabling, Santa Rosa, Laguna' => ['Macabling', '25–35 Mins'],
            'Brgy. Malitlit, Santa Rosa, Laguna' => ['Malitlit', '35–45 Mins'],
            'Malusak, Santa Rosa, Laguna' => ['Malusak (Poblacion Dos)', '15–25 Mins'],
            'Market Area, Santa Rosa, Laguna' => ['Market Area (Poblacion Tres)', '15–25 Mins'],
            'Brgy. Pook, Santa Rosa, Laguna' => ['Pooc (Pook)', '20–30 Mins'],
            'Pulong Sta. Cruz, Santa Rosa, Laguna' => ['Pulong Santa Cruz', '30–45 Mins'],
            'Sto. Domingo, Santa Rosa, Laguna' => ['Santo Domingo', '40–55 Mins'],
            'Amira Townhomes, Brgy. Sinalhan, Santa Rosa' => ['Sinalhan', '15–20 Mins'],
            'Near SM City, Tagapo, Santa Rosa, Laguna' => ['Tagapo', '20–30 Mins'],
        ];

        $this->assertCount(18, SantaRosaDeliveryService::BARANGAYS);

        foreach ($samples as $address => [$expectedName, $expectedEta]) {
            $res = SantaRosaDeliveryService::detectFromText($address);
            $this->assertTrue($res['matched'], "Failed to match: {$address}");
            $this->assertSame($expectedName, $res['barangay']['name']);
            $this->assertSame($expectedEta, $res['barangay']['eta']);
        }
    }

    public function test_outside_cities_and_substring_false_positives_are_rejected(): void
    {
        $rejected = [
            '123 Main St, Biñan, Laguna',
            'Brgy. Santo Domingo, Biñan, Laguna',
            'Brgy. Aplaya, Calamba, Laguna',
            'Pulo, Cabuyao, Laguna',
            'Ayala Ave, Makati, Metro Manila',
            '123 Padilla St, Rita Ave, Santa Rosa, Laguna',
            'Santa Rosa, Laguna',
        ];

        foreach ($rejected as $address) {
            $res = SantaRosaDeliveryService::detectFromText($address);
            $this->assertFalse($res['matched'], "Should have rejected: {$address}");
        }
    }

    public function test_order_store_rejects_outside_barangay_and_accepts_valid_santa_rosa_barangay(): void
    {
        [$customer, $product] = $this->seedOrderFixtures();

        // 1. Reject outside city / missing supported barangay
        $rejectRes = $this->actingAs($customer, 'sanctum')
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

        $rejectRes->assertStatus(422)
            ->assertJsonPath('outside_delivery_area', true);

        // 2. Accept supported Santa Rosa barangay with ETA
        $acceptRes = $this->actingAs($customer, 'sanctum')
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

        $acceptRes->assertStatus(201)
            ->assertJsonPath('detected_barangay', 'Balibago')
            ->assertJsonPath('estimated_delivery_time', '25–35 Mins');

        // 3. Store Pickup does not require a delivery barangay
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

    public function test_reverse_geocode_marks_santa_rosa_serviceable_and_outside_cities_rejected(): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::sequence()
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

        // Inside Santa Rosa (Brgy. Balibago)
        $okRes = $this->getJson('/api/reverse-geocode?lat=14.2934&lng=121.1082');
        $okRes->assertStatus(200)
            ->assertJsonPath('is_serviceable', true)
            ->assertJsonPath('detected_barangay', 'Balibago')
            ->assertJsonPath('estimated_delivery_time', '25–35 Mins');

        // Outside Santa Rosa (Biñan)
        $badRes = $this->getJson('/api/reverse-geocode?lat=14.3400&lng=121.0800');
        $badRes->assertStatus(200)
            ->assertJsonPath('is_serviceable', false)
            ->assertJsonPath('detected_barangay', null);
    }
}