<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use App\Models\User;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $range = $request->input('range', '7days'); // 7days, 30days, all

        $ordersQuery = Order::where('status', 'Completed');

        if ($range === '7days') {
            $ordersQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($range === '30days') {
            $ordersQuery->where('created_at', '>=', now()->subDays(30));
        }

        $completedOrders = $ordersQuery->get();

        $totalSales = $completedOrders->sum('total_amount');
        $ordersCount = $completedOrders->count();
        $averageSales = $ordersCount > 0 ? ($totalSales / $ordersCount) : 0;

        // Group by date to find highest day and sales trend
        $dailyTotals = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = now()->subDays($i)->format('Y-m-d');
            $dailyTotals[$d] = 0;
        }

        foreach ($completedOrders as $order) {
            $date = $order->created_at->format('Y-m-d');
            if (!isset($dailyTotals[$date])) {
                $dailyTotals[$date] = 0;
            }
            $dailyTotals[$date] += $order->total_amount;
        }

        $highestDayAmount = count($dailyTotals) > 0 ? max(array_values($dailyTotals)) : 0;

        // Format trend data for chart
        $trendData = [];
        foreach ($dailyTotals as $date => $amt) {
            $trendData[] = [
                'date' => $date,
                'label' => date('M j', strtotime($date)),
                'sales' => round($amt, 2),
            ];
        }

        // Top selling products
        $topProducts = OrderItem::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(6)
            ->get();

        // Low stock alerts count
        $lowStockIngredients = Ingredient::all()->filter(function ($i) {
            return $i->stock <= $i->low_threshold;
        })->values();

        // Customer count
        $totalCustomers = User::where('role', 'customer')->count();
        $activeOrdersCount = Order::whereIn('status', ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'])->count();

        return response()->json([
            'total_sales' => round($totalSales, 2),
            'orders_count' => $ordersCount,
            'average_sales' => round($averageSales, 2),
            'highest_day' => round($highestDayAmount, 2),
            'active_orders_count' => $activeOrdersCount,
            'total_customers' => $totalCustomers,
            'trend_data' => $trendData,
            'top_products' => $topProducts,
            'low_stock_count' => $lowStockIngredients->count(),
            'low_stock_items' => $lowStockIngredients,
        ]);
    }
}
