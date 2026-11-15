<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\Ingredient;
use App\Models\AuditLog;
use App\Services\LoyverseService;

class IngredientController extends Controller
{
    protected ?LoyverseService $loyverse;

    public function __construct(?LoyverseService $loyverse = null)
    {
        $this->loyverse = $loyverse ?? app(LoyverseService::class);
    }

    public function index()
    {
        $fetchIngredients = function () {
            return Ingredient::orderBy('category')->orderBy('name')->get()->map(function ($ing) {
                $stock = max(0, (float) $ing->stock);
                $status = 'ok';
                if ($stock <= 0) {
                    $status = 'out_of_stock';
                } elseif ($stock <= $ing->low_threshold) {
                    $status = 'low_stock';
                }
                $row = $ing->toArray();
                $row['stock'] = $stock;
                $row['status'] = $status;
                return $row;
            })->values()->all();
        };

        // Cache plain associative arrays (never Eloquent objects/Collections) to prevent __PHP_Incomplete_Class on unserialize
        $ingredients = Cache::get('ingredients_all');
        if (!is_array($ingredients)) {
            Cache::forget('ingredients_all');
            $ingredients = Cache::remember('ingredients_all', 60, $fetchIngredients);
        }

        return response()->json($ingredients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:ingredients,id',
            'name' => 'required|string',
            'category' => 'required|string',
            'supplier_name' => 'nullable|string',
            'expiration_date' => 'nullable|date',
            'stock' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'required|string',
            'low_threshold' => 'required|numeric|min:0',
        ]);

        $ingredient = Ingredient::create($validated);
        Cache::forget('ingredients_all');
        Cache::forget('products_catalog_default');

        // Sync to Loyverse Advanced Inventory
        try {
            $this->loyverse->pushSingleIngredientStock($ingredient);
        } catch (\Exception $e) {
            // Non-blocking
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Ingredient Added',
            'details' => "Added ingredient {$ingredient->name} ({$ingredient->stock} {$ingredient->unit})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($ingredient, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'category' => 'sometimes|string',
            'supplier_name' => 'nullable|string',
            'expiration_date' => 'nullable|date',
            'stock' => 'sometimes|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'sometimes|string',
            'low_threshold' => 'sometimes|numeric|min:0',
        ]);

        if (array_key_exists('stock', $validated)) {
            $validated['stock'] = max(0, (float) $validated['stock']);
        }

        [$ingredient, $oldStock] = DB::transaction(function () use ($id, $validated) {
            $ing = Ingredient::where('id', $id)->lockForUpdate()->firstOrFail();
            $prevStock = (float) $ing->stock;
            $ing->update($validated);
            $ing->refresh();
            return [$ing, $prevStock];
        });

        Cache::forget('ingredients_all');
        Cache::forget('products_catalog_default');

        if (array_key_exists('stock', $validated)) {
            // Push updated stock to Loyverse even if unchanged locally so POS stays aligned
            try {
                $this->loyverse->pushSingleIngredientStock($ingredient);
            } catch (\Exception $e) {
                // Non-blocking
            }

            if (abs((float) $ingredient->stock - $oldStock) > 0.0001) {
                AuditLog::create([
                    'user_name' => $request->user()?->name ?? 'Staff',
                    'user_role' => $request->user()?->role ?? 'staff',
                    'action' => 'Stock Level Changed',
                    'details' => "Adjusted {$ingredient->name} stock from {$oldStock} to {$ingredient->stock} {$ingredient->unit}",
                    'ip_address' => $request->ip(),
                ]);
            }
        }

        return response()->json($ingredient);
    }

    public function quickAdjust(Request $request, $id)
    {
        $amount = (float) $request->input('amount', 0);

        $ingredient = DB::transaction(function () use ($id, $amount) {
            $ing = Ingredient::where('id', $id)->lockForUpdate()->firstOrFail();
            $baseStock = $amount > 0 ? max(0, (float) $ing->stock) : (float) $ing->stock;
            $ing->stock = max(0, $baseStock + $amount);
            $ing->save();
            return $ing;
        });

        $ingredient->refresh();
        $newStock = (float) $ingredient->stock;
        Cache::forget('ingredients_all');
        Cache::forget('products_catalog_default');

        // Push to Loyverse
        try {
            $this->loyverse->pushSingleIngredientStock($ingredient);
        } catch (\Exception $e) {
            // Non-blocking
        }

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role ?? 'staff',
            'action' => $amount >= 0 ? 'Stock Restocked' : 'Stock Depleted',
            'details' => ($amount >= 0 ? "+{$amount}" : "{$amount}") . " {$ingredient->unit} on {$ingredient->name}. New stock: {$newStock}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($ingredient);
    }

    public function destroy(Request $request, $id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $name = $ingredient->name;
        $ingredient->delete();
        Cache::forget('ingredients_all');
        Cache::forget('products_catalog_default');

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role ?? 'admin',
            'action' => 'Ingredient Deleted',
            'details' => "Removed ingredient {$name}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Ingredient deleted successfully']);
    }
}

