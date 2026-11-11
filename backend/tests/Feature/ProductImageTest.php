<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\LoyverseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ProductImageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $loyverseMock = Mockery::mock(LoyverseService::class);
        $loyverseMock->shouldReceive('pushSingleProductToLoyverse')->andReturnNull();
        $this->app->instance(LoyverseService::class, $loyverseMock);
    }

    public function test_can_create_product_with_data_url_image_and_defaults_when_empty(): void
    {
        $longDataUrl = 'data:image/webp;base64,' . str_repeat('QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=', 20);

        $response = $this->postJson('/api/v1/products', [
            'id' => 'avocado-boba-milk',
            'name' => 'Avocado Boba Milk',
            'category' => 'Drinks',
            'price' => 79,
            'description' => 'Creamy avocado boba.',
            'image' => $longDataUrl,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('image', $longDataUrl);
        $this->assertDatabaseHas('products', [
            'id' => 'avocado-boba-milk',
            'image' => $longDataUrl,
        ]);

        $fallbackResponse = $this->postJson('/api/v1/products', [
            'id' => 'default-drink',
            'name' => 'Default Drink',
            'category' => 'Drinks',
            'price' => 59,
            'image' => '   ',
        ]);

        $fallbackResponse->assertStatus(201);
        $fallbackResponse->assertJsonPath('image', '/assets/hero-banner.png');
    }

    public function test_can_update_product_image_and_reset_to_default(): void
    {
        Product::create([
            'id' => 'brown-sugar-boba',
            'name' => 'Brown Sugar Boba Milk',
            'category' => 'Drinks',
            'price' => 69,
            'image' => '/assets/hero-banner.png',
            'is_available' => true,
        ]);

        $newDataUrl = 'data:image/jpeg;base64,' . str_repeat('WFl6MTIzNDU2Nzg5MA==', 25);

        $updateResponse = $this->patchJson('/api/v1/products/brown-sugar-boba', [
            'image' => $newDataUrl,
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('image', $newDataUrl);

        $resetResponse = $this->patchJson('/api/v1/products/brown-sugar-boba', [
            'image' => '',
        ]);

        $resetResponse->assertStatus(200);
        $resetResponse->assertJsonPath('image', '/assets/hero-banner.png');
    }
}