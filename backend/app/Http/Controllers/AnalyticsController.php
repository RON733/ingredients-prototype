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

        // Comparison datasets for Bar Comparison mode
        $comparisonPeriod = $this->buildComparisonPeriod(
            $range,
            $startDate,
            $endDate,
            $grouping,
            $trendData,
            $totalSales,
            $ordersCount,
            $averageSales,
            $completedOrders
        );
        $monthlyComparison = $this->buildMonthlyComparison($now);
        $yearlyComparison = $this->buildYearlyComparison($now);

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
            'comparison_period' => $comparisonPeriod,
            'monthly_comparison' => $monthlyComparison,
            'yearly_comparison' => $yearlyComparison,
            'top_products' => $topProducts,
            'low_stock_count' => $lowStockIngredients->count(),
            'low_stock_items' => $lowStockIngredients,
        ]);
    }

    private function calcChangePct(float $current, float $previous): ?float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function buildComparisonPeriod(
        string $range,
        Carbon $startDate,
        Carbon $endDate,
        string $grouping,
        array $trendData,
        float $totalSales,
        int $ordersCount,
        float $averageSales,
        $completedOrders
    ): ?array {
        $prevStart = null;
        $prevEnd = null;
        $prevLabel = '';

        switch ($range) {
            case 'today':
                $prevStart = $startDate->copy()->subDay()->startOfDay();
                $prevEnd = $startDate->copy()->subDay()->endOfDay();
                $prevLabel = 'Yesterday (' . $prevStart->format('M j, Y') . ')';
                break;
            case 'yesterday':
                $prevStart = $startDate->copy()->subDay()->startOfDay();
                $prevEnd = $startDate->copy()->subDay()->endOfDay();
                $prevLabel = $prevStart->format('M j, Y');
                break;
            case 'this_week':
                $prevStart = $startDate->copy()->subWeek()->startOfWeek();
                $prevEnd = $startDate->copy()->subWeek()->endOfWeek();
                $prevLabel = 'Last Week (' . $prevStart->format('M j') . ' - ' . $prevEnd->format('M j, Y') . ')';
                break;
            case 'this_month':
                $prevStart = $startDate->copy()->subMonthNoOverflow()->startOfMonth();
                $prevEnd = $prevStart->copy()->endOfMonth();
                $prevLabel = 'Last Month (' . $prevStart->format('F Y') . ')';
                break;
            case 'last_month':
                $prevStart = $startDate->copy()->subMonthNoOverflow()->startOfMonth();
                $prevEnd = $prevStart->copy()->endOfMonth();
                $prevLabel = $prevStart->format('F Y');
                break;
            case 'this_year':
                $prevStart = $startDate->copy()->subYear()->startOfYear();
                $prevEnd = $prevStart->copy()->endOfYear();
                $prevLabel = 'Last Year (' . $prevStart->format('Y') . ')';
                break;
            case '7days':
                $prevEnd = $startDate->copy()->subDay()->endOfDay();
                $prevStart = $prevEnd->copy()->subDays(6)->startOfDay();
                $prevLabel = 'Prior 7 Days';
                break;
            case 'month':
                $prevStart = $startDate->copy()->subMonthNoOverflow()->startOfMonth();
                $prevEnd = $prevStart->copy()->endOfMonth();
                $prevLabel = $prevStart->format('F Y');
                break;
            case 'custom':
                $spanDays = max(1, (int) $startDate->copy()->startOfDay()->diffInDays($endDate->copy()->startOfDay()) + 1);
                $prevEnd = $startDate->copy()->subDay()->endOfDay();
                $prevStart = $prevEnd->copy()->subDays($spanDays - 1)->startOfDay();
                $prevLabel = $prevStart->format('M j, Y') . ' - ' . $prevEnd->format('M j, Y');
                break;
            case 'all':
                return null;
            case '30days':
            default:
                $prevEnd = $startDate->copy()->subDay()->endOfDay();
                $prevStart = $prevEnd->copy()->subDays(29)->startOfDay();
                $prevLabel = 'Prior 30 Days';
                break;
        }

        $prevOrders = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->select(['id', 'total_amount', 'source', 'created_at'])
            ->orderBy('created_at', 'asc')
            ->get();

        $prevTotalSales = (float) $prevOrders->sum('total_amount');
        $prevOrdersCount = $prevOrders->count();
        $prevAvgSales = $prevOrdersCount > 0 ? ($prevTotalSales / $prevOrdersCount) : 0.0;

        // Build previous buckets aligned by index with $trendData
        $prevBuckets = [];
        if ($grouping === 'hour') {
            for ($h = 0; $h < 24; $h++) {
                $key = sprintf('%02d:00', $h);
                $prevBuckets[$key] = ['label' => date('g A', strtotime("2000-01-01 {$key}")), 'sales' => 0.0, 'orders' => 0];
            }
            foreach ($prevOrders as $order) {
                $k = $order->created_at->format('H:00');
                if (isset($prevBuckets[$k])) {
                    $prevBuckets[$k]['sales'] += (float) $order->total_amount;
                    $prevBuckets[$k]['orders'] += 1;
                }
            }
        } elseif ($grouping === 'day') {
            $cursor = $prevStart->copy();
            while ($cursor->lte($prevEnd)) {
                $k = $cursor->format('Y-m-d');
                $prevBuckets[$k] = ['label' => $cursor->format('M j'), 'sales' => 0.0, 'orders' => 0];
                $cursor->addDay();
            }
            foreach ($prevOrders as $order) {
                $k = $order->created_at->format('Y-m-d');
                if (isset($prevBuckets[$k])) {
                    $prevBuckets[$k]['sales'] += (float) $order->total_amount;
                    $prevBuckets[$k]['orders'] += 1;
                }
            }
        } else {
            $cursor = $prevStart->copy()->startOfMonth();
            $mEnd = $prevEnd->copy()->startOfMonth();
            while ($cursor->lte($mEnd)) {
                $k = $cursor->format('Y-m');
                $prevBuckets[$k] = ['label' => $cursor->format('M Y'), 'sales' => 0.0, 'orders' => 0];
                $cursor->addMonth();
            }
            foreach ($prevOrders as $order) {
                $k = $order->created_at->format('Y-m');
                if (isset($prevBuckets[$k])) {
                    $prevBuckets[$k]['sales'] += (float) $order->total_amount;
                    $prevBuckets[$k]['orders'] += 1;
                }
            }
        }

        $prevList = array_values($prevBuckets);
        $series = [];
        foreach ($trendData as $idx => $cur) {
            $prev = $prevList[$idx] ?? ['label' => '—', 'sales' => 0.0, 'orders' => 0];
            $curSales = round((float) $cur['sales'], 2);
            $prvSales = round((float) $prev['sales'], 2);
            $series[] = [
                'label' => $cur['label'],
                'prev_label' => $prev['label'],
                'current_sales' => $curSales,
                'previous_sales' => $prvSales,
                'current_orders' => (int) ($cur['orders'] ?? 0),
                'previous_orders' => (int) ($prev['orders'] ?? 0),
                'change_pct' => $this->calcChangePct($curSales, $prvSales),
            ];
        }

        $curPosSales = (float) $completedOrders->where('source', 'loyverse_pos')->sum('total_amount');
        $curWebSales = (float) $completedOrders->where('source', '!=', 'loyverse_pos')->sum('total_amount');
        $prevPosSales = (float) $prevOrders->where('source', 'loyverse_pos')->sum('total_amount');
        $prevWebSales = (float) $prevOrders->where('source', '!=', 'loyverse_pos')->sum('total_amount');

        return [
            'previous_label' => $prevLabel,
            'previous_total_sales' => round($prevTotalSales, 2),
            'previous_orders_count' => $prevOrdersCount,
            'previous_average_sales' => round($prevAvgSales, 2),
            'sales_change_pct' => $this->calcChangePct($totalSales, $prevTotalSales),
            'orders_change_pct' => $this->calcChangePct((float) $ordersCount, (float) $prevOrdersCount),
            'avg_change_pct' => $this->calcChangePct($averageSales, $prevAvgSales),
            'current_pos_sales' => round($curPosSales, 2),
            'current_web_sales' => round($curWebSales, 2),
            'previous_pos_sales' => round($prevPosSales, 2),
            'previous_web_sales' => round($prevWebSales, 2),
            'series' => $series,
        ];
    }

    private function buildMonthlyComparison(Carbon $now): array
    {
        // Fetch 13 months so the first of the 12 displayed months has a valid MoM %
        $windowStart = $now->copy()->subMonthsNoOverflow(12)->startOfMonth();
        $windowEnd = $now->copy()->endOfMonth();

        $orders = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$windowStart, $windowEnd])
            ->select(['total_amount', 'source', 'created_at'])
            ->get();

        $buckets = [];
        $cursor = $windowStart->copy();
        while ($cursor->lte($windowEnd)) {
            $key = $cursor->format('Y-m');
            $buckets[$key] = [
                'date' => $key,
                'label' => $cursor->format('M Y'),
                'short_label' => $cursor->format('M'),
                'sales' => 0.0,
                'orders' => 0,
                'pos_sales' => 0.0,
                'website_sales' => 0.0,
                'pos_orders' => 0,
                'website_orders' => 0,
            ];
            $cursor->addMonth();
        }

        foreach ($orders as $order) {
            $key = $order->created_at->format('Y-m');
            if (!isset($buckets[$key])) {
                continue;
            }
            $amt = (float) $order->total_amount;
            $buckets[$key]['sales'] += $amt;
            $buckets[$key]['orders'] += 1;
            if ($order->source === 'loyverse_pos') {
                $buckets[$key]['pos_sales'] += $amt;
                $buckets[$key]['pos_orders'] += 1;
            } else {
                $buckets[$key]['website_sales'] += $amt;
                $buckets[$key]['website_orders'] += 1;
            }
        }

        $all = array_values($buckets);
        $result = [];
        // Skip index 0 (the 13th prior month), return last 12 months
        for ($i = 1; $i < count($all); $i++) {
            $cur = $all[$i];
            $prev = $all[$i - 1];
            $sales = round($cur['sales'], 2);
            $prevSales = round($prev['sales'], 2);
            $avgTicket = $cur['orders'] > 0 ? round($sales / $cur['orders'], 2) : 0.0;

            $result[] = [
                'date' => $cur['date'],
                'label' => $cur['label'],
                'short_label' => $cur['short_label'],
                'sales' => $sales,
                'orders' => $cur['orders'],
                'avg_ticket' => $avgTicket,
                'pos_sales' => round($cur['pos_sales'], 2),
                'website_sales' => round($cur['website_sales'], 2),
                'pos_orders' => $cur['pos_orders'],
                'website_orders' => $cur['website_orders'],
                'change_pct' => $this->calcChangePct($sales, $prevSales),
            ];
        }

        return $result;
    }

    private function buildYearlyComparison(Carbon $now): array
    {
        $orders = Order::where('status', 'Completed')
            ->select(['total_amount', 'source', 'created_at'])
            ->orderBy('created_at', 'asc')
            ->get();

        $currentYear = (int) $now->year;
        $earliestYear = $orders->isNotEmpty()
            ? (int) $orders->first()->created_at->year
            : $currentYear;
        $startYear = min($earliestYear, $currentYear - 2);

        $buckets = [];
        for ($y = $startYear; $y <= $currentYear; $y++) {
            $key = (string) $y;
            $buckets[$key] = [
                'date' => $key,
                'label' => $key,
                'sales' => 0.0,
                'orders' => 0,
                'pos_sales' => 0.0,
                'website_sales' => 0.0,
                'pos_orders' => 0,
                'website_orders' => 0,
            ];
        }

        foreach ($orders as $order) {
            $key = (string) $order->created_at->year;
            if (!isset($buckets[$key])) {
                continue;
            }
            $amt = (float) $order->total_amount;
            $buckets[$key]['sales'] += $amt;
            $buckets[$key]['orders'] += 1;
            if ($order->source === 'loyverse_pos') {
                $buckets[$key]['pos_sales'] += $amt;
                $buckets[$key]['pos_orders'] += 1;
            } else {
                $buckets[$key]['website_sales'] += $amt;
                $buckets[$key]['website_orders'] += 1;
            }
        }

        $list = array_values($buckets);
        $result = [];
        foreach ($list as $idx => $cur) {
            $sales = round($cur['sales'], 2);
            $prevSales = $idx > 0 ? round($list[$idx - 1]['sales'], 2) : null;
            $avgTicket = $cur['orders'] > 0 ? round($sales / $cur['orders'], 2) : 0.0;

            $result[] = [
                'date' => $cur['date'],
                'label' => $cur['label'],
                'sales' => $sales,
                'orders' => $cur['orders'],
                'avg_ticket' => $avgTicket,
                'pos_sales' => round($cur['pos_sales'], 2),
                'website_sales' => round($cur['website_sales'], 2),
                'pos_orders' => $cur['pos_orders'],
                'website_orders' => $cur['website_orders'],
                'change_pct' => $prevSales !== null ? $this->calcChangePct($sales, $prevSales) : null,
            ];
        }

        return $result;
    }
}
