<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use App\Models\User;
use App\Services\LoyverseService;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        // Optional quick sync with Loyverse POS if requested or requested via button
        if ($request->boolean('sync')) {
            try {
                app(LoyverseService::class)->syncRecentReceipts();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Loyverse auto-sync during analytics overview: " . $e->getMessage());
            }
        }

        $range = $request->input('range', '30days'); // today, yesterday, this_week, this_month, last_month, this_year, 7days, 30days, month, custom, all
        $now = now();
        $startDate = null;
        $endDate = $now->copy()->endOfDay();
        $periodLabel = '';
        $grouping = 'day'; // 'hour', 'day', 'month'

        switch ($range) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodLabel = 'Today (' . $now->format('M j, Y') . ')';
                $grouping = 'hour';
                break;

            case 'yesterday':
                $startDate = $now->copy()->subDay()->startOfDay();
                $endDate = $now->copy()->subDay()->endOfDay();
                $periodLabel = 'Yesterday (' . $startDate->format('M j, Y') . ')';
                $grouping = 'hour';
                break;

            case 'this_week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                $periodLabel = 'This Week (' . $startDate->format('M j') . ' - ' . $endDate->format('M j, Y') . ')';
                $grouping = 'day';
                break;

            case 'this_month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $periodLabel = 'This Month (' . $now->format('F Y') . ')';
                $grouping = 'day';
                break;

            case 'last_month':
                $startDate = $now->copy()->subMonth()->startOfMonth();
                $endDate = $now->copy()->subMonth()->endOfMonth();
                $periodLabel = 'Last Month (' . $startDate->format('F Y') . ')';
                $grouping = 'day';
                break;

            case 'this_year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                $periodLabel = 'This Year (' . $now->format('Y') . ')';
                $grouping = 'month';
                break;

            case '7days':
                $startDate = $now->copy()->subDays(6)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodLabel = 'Last 7 Days';
                $grouping = 'day';
                break;

            case 'month':
                $targetYear = (int) $request->input('year', $now->year);
                $targetMonth = (int) $request->input('month', $now->month);
                $startDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->startOfMonth();
                $endDate = $startDate->copy()->endOfMonth();
                $periodLabel = $startDate->format('F Y');
                $grouping = 'day';
                break;

            case 'custom':
                $startInput = $request->input('start_date');
                $endInput = $request->input('end_date');
                $startDate = $startInput ? Carbon::parse($startInput)->startOfDay() : $now->copy()->subDays(29)->startOfDay();
                $endDate = $endInput ? Carbon::parse($endInput)->endOfDay() : $now->copy()->endOfDay();

                $diffDays = $startDate->diffInDays($endDate);
                $periodLabel = $startDate->format('M j, Y') . ' - ' . $endDate->format('M j, Y');
                if ($diffDays <= 2) {
                    $grouping = 'hour';
                } elseif ($diffDays <= 45) {
                    $grouping = 'day';
                } else {
                    $grouping = 'month';
                }
                break;

            case 'all':
                $firstOrder = Order::where('status', 'Completed')->oldest('created_at')->first();
                $startDate = $firstOrder ? $firstOrder->created_at->copy()->startOfDay() : $now->copy()->subDays(29)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodLabel = 'All Time';
                $diffDays = $startDate->diffInDays($endDate);
                $grouping = $diffDays > 45 ? 'month' : 'day';
                break;

            case '30days':
            default:
                $startDate = $now->copy()->subDays(29)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodLabel = 'Last 30 Days';
                $grouping = 'day';
                break;
        }

        $ordersQuery = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc');

        $completedOrders = $ordersQuery->get();

        $totalSales = (float) $completedOrders->sum('total_amount');
        $ordersCount = $completedOrders->count();
        $averageSales = $ordersCount > 0 ? ($totalSales / $ordersCount) : 0;

        // Initialize buckets in chronological order
        $buckets = [];

        if ($grouping === 'hour') {
            for ($h = 0; $h < 24; $h++) {
                $key = sprintf('%02d:00', $h);
                $label = date('g A', strtotime("2000-01-01 {$key}"));
                $buckets[$key] = [
                    'date' => $key,
                    'label' => $label,
                    'sales' => 0.0,
                    'orders' => 0,
                ];
            }

            foreach ($completedOrders as $order) {
                $hourKey = $order->created_at->format('H:00');
                if (isset($buckets[$hourKey])) {
                    $buckets[$hourKey]['sales'] += (float) $order->total_amount;
                    $buckets[$hourKey]['orders'] += 1;
                }
            }
        } elseif ($grouping === 'day') {
            $cursor = $startDate->copy();
            while ($cursor->lte($endDate)) {
                $dayKey = $cursor->format('Y-m-d');
                $label = $cursor->format('M j');
                $buckets[$dayKey] = [
                    'date' => $dayKey,
                    'label' => $label,
                    'sales' => 0.0,
                    'orders' => 0,
                ];
                $cursor->addDay();
            }

            foreach ($completedOrders as $order) {
                $dayKey = $order->created_at->format('Y-m-d');
                if (isset($buckets[$dayKey])) {
                    $buckets[$dayKey]['sales'] += (float) $order->total_amount;
                    $buckets[$dayKey]['orders'] += 1;
                }
            }
        } else { // month grouping
            $cursor = $startDate->copy()->startOfMonth();
            $monthEnd = $endDate->copy()->startOfMonth();
            while ($cursor->lte($monthEnd)) {
                $monthKey = $cursor->format('Y-m');
                $label = $cursor->format('M Y');
                $buckets[$monthKey] = [
                    'date' => $monthKey,
                    'label' => $label,
                    'sales' => 0.0,
                    'orders' => 0,
                ];
                $cursor->addMonth();
            }

            foreach ($completedOrders as $order) {
                $monthKey = $order->created_at->format('Y-m');
                if (isset($buckets[$monthKey])) {
                    $buckets[$monthKey]['sales'] += (float) $order->total_amount;
                    $buckets[$monthKey]['orders'] += 1;
                }
            }
        }

        $trendData = array_values($buckets);
        foreach ($trendData as &$pt) {
            $pt['sales'] = round($pt['sales'], 2);
        }
        unset($pt);

        $salesValues = array_column($trendData, 'sales');
        $highestDayAmount = !empty($salesValues) ? max($salesValues) : 0;

        // Top selling products scoped to this exact time period
        $topProducts = [];
        if ($completedOrders->isNotEmpty()) {
            $topProducts = OrderItem::whereIn('order_id', $completedOrders->pluck('id'))
                ->select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
                ->groupBy('product_name')
                ->orderByDesc('total_qty')
                ->limit(6)
                ->get();
        }

        // Low stock alerts count
        $lowStockIngredients = Ingredient::all()->filter(function ($i) {
            return $i->stock <= $i->low_threshold;
        })->values();

        // Customer & active orders counts
        $totalCustomers = User::where('role', 'customer')->count();
        $activeOrdersCount = Order::whereIn('status', ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'])->count();

        // Count Loyverse synced orders in this period
        $loyverseOrdersCount = $completedOrders->where('source', 'loyverse_pos')->count();
        $websiteOrdersCount = $completedOrders->where('source', '!=', 'loyverse_pos')->count();

        return response()->json([
            'range' => $range,
            'period_label' => $periodLabel,
            'start_date' => $startDate->toIso8601String(),
            'end_date' => $endDate->toIso8601String(),
            'total_sales' => round($totalSales, 2),
            'orders_count' => $ordersCount,
            'average_sales' => round($averageSales, 2),
            'highest_day' => round($highestDayAmount, 2),
            'active_orders_count' => $activeOrdersCount,
            'total_customers' => $totalCustomers,
            'loyverse_orders_count' => $loyverseOrdersCount,
            'website_orders_count' => $websiteOrdersCount,
            'trend_data' => $trendData,
            'top_products' => $topProducts,
            'low_stock_count' => $lowStockIngredients->count(),
            'low_stock_items' => $lowStockIngredients,
        ]);
    }
}
