<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Env;
use Tests\TestCase;

class ChatbotStockAwarenessTest extends TestCase
{
    use RefreshDatabase;

    public function test_chatbot_reports_out_of_stock_and_in_stock_menu_items(): void
    {
        Env::getRepository()->set('GEMINI_API_KEY', '');

        Product::create([
            'id' => 'classic-milk-tea',
            'name' => 'Classic Milk Tea',
            'category' => 'Milk Tea',
            'price' => 89,
            'description' => 'Signature brewed black tea with creamy milk.',
            'is_available' => true,
        ]);

        Product::create([
            'id' => 'wintermelon-latte',
            'name' => 'Wintermelon Latte',
            'category' => 'Milk Tea',
            'price' => 99,
            'description' => 'Sweet wintermelon milk tea.',
            'is_available' => false,
        ]);

        Product::create([
            'id' => 'cheesy-burger',
            'name' => 'Cheesy Burger',
            'category' => 'Burgers',
            'price' => 120,
            'description' => 'Beef patty with melted cheese.',
            'is_available' => false,
        ]);

        $menuResponse = $this->postJson('/api/chatbot', [
            'message' => 'What items are out of stock on the menu?',
        ]);

        $menuResponse->assertOk();
        $reply = $menuResponse->json('reply');
        $this->assertStringContainsString('Wintermelon Latte', $reply);
        $this->assertStringContainsString('Cheesy Burger', $reply);
        $this->assertStringContainsStringIgnoringCase('out of stock', $reply);
        $this->assertStringContainsString('Classic Milk Tea', $reply);

        $specificOos = $this->postJson('/api/chatbot', [
            'message' => 'Is Cheesy Burger available?',
        ]);

        $specificOos->assertOk();
        $this->assertStringContainsString('Cheesy Burger', $specificOos->json('reply'));
        $this->assertStringContainsStringIgnoringCase('out of stock', $specificOos->json('reply'));

        $specificInStock = $this->postJson('/api/chatbot', [
            'message' => 'Is Classic Milk Tea available?',
        ]);

        $specificInStock->assertOk();
        $this->assertStringContainsString('Classic Milk Tea', $specificInStock->json('reply'));
        $this->assertStringContainsStringIgnoringCase('in stock', $specificInStock->json('reply'));
    }
}
