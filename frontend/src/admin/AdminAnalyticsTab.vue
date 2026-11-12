<template>
<div class="space-y-4 sm:space-y-6 lg:space-y-8">
      
      <!-- Top Header & Filter Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] sm:text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
              <i class="pi pi-chart-line"></i> ANALYTICS DASHBOARD
            </span>
            <span v-if="analyticsData?.period_label" class="px-2 sm:px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/25 text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
              <i class="pi pi-calendar text-[9px] sm:text-[10px]"></i> {{ analyticsData.period_label }}
            </span>
          </div>
          <h2 class="text-lg sm:text-2xl font-bold text-white mt-1">Sales Analytics</h2>
          <p class="text-[11px] sm:text-xs text-gray-400 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-0.5">
            <span>Track physical POS and online channels.</span>
            <span v-if="analyticsData" class="inline-flex items-center gap-1.5 sm:gap-2 bg-surface-800/80 px-2 py-0.5 rounded-lg border border-surface-700/60 text-[10px]">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              POS: <strong class="text-emerald-400">{{ analyticsData.loyverse_orders_count || 0 }}</strong>
              <span class="text-gray-600">|</span>
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              Website: <strong class="text-sky-400">{{ analyticsData.website_orders_count || 0 }}</strong>
            </span>
          </p>
        </div>

        <!-- Filter Controls Toolbar -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Range Dropdown -->
          <div class="relative flex-1 sm:flex-initial">
            <select 
              v-model="timeRange"
              @change="onRangeChange"
              class="w-full sm:w-auto px-3 py-2 pr-8 rounded-xl bg-surface-800 text-xs font-semibold text-gray-200 border border-surface-700 focus:outline-none focus:border-brand-500 cursor-pointer appearance-none shadow-sm">
              <option value="today">Today (Ngayong Araw)</option>
              <option value="yesterday">Yesterday (Kahapon)</option>
              <option value="this_week">This Week (Ngayong Linggo)</option>
              <option value="this_month">This Month (Ngayong Buwan)</option>
              <option value="last_month">Last Month (Nakaraang Buwan)</option>
              <option value="this_year">This Year (Ngayong Taon)</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="month">Specific Month (Pumili ng Buwan)...</option>
              <option value="custom">Custom Date Range (Custom Petsa)...</option>
              <option value="all">All Time (Lahat)</option>
            </select>
            <i class="pi pi-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>

          <!-- Specific Month Picker (Shown when "Specific Month" is selected) -->
          <div v-if="timeRange === 'month'" class="flex items-center gap-1.5 bg-surface-850 p-1 rounded-xl border border-surface-700">
            <select 
              v-model="selectedMonth" 
              @change="loadAnalytics"
              class="px-2 py-1 rounded-lg bg-surface-800 text-xs text-white border border-surface-700 focus:outline-none cursor-pointer">
              <option v-for="(m, idx) in monthsList" :key="idx" :value="idx + 1">{{ m }}</option>
            </select>
            <select 
              v-model="selectedYear" 
              @change="loadAnalytics"
              class="px-2 py-1 rounded-lg bg-surface-800 text-xs text-white border border-surface-700 focus:outline-none cursor-pointer">
              <option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <!-- Custom Date Range Picker (Shown when "Custom Date Range" is selected) -->
          <div v-if="timeRange === 'custom'" class="flex flex-wrap items-center gap-1.5 bg-surface-850 p-1 rounded-xl border border-surface-700">
            <input 
              type="date" 
              v-model="customStartDate"
              class="px-2 py-1 rounded-lg bg-surface-800 text-xs text-white border border-surface-700 focus:outline-none" 
            />
            <span class="text-xs text-gray-500">to</span>
            <input 
              type="date" 
              v-model="customEndDate"
              class="px-2 py-1 rounded-lg bg-surface-800 text-xs text-white border border-surface-700 focus:outline-none" 
            />
            <button 
              @click="loadAnalytics"
              class="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors">
              Apply
            </button>
          </div>

          <!-- Loyverse POS Live Indicator -->
          <div class="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1.5 shrink-0" title="POS sales automatically synchronize every minute in the background">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 "></span>
            <span class="hidden sm:inline">POS Auto-Sync Active</span>
            <span class="sm:hidden">POS Live</span>
          </div>

          <!-- Refresh Button -->
          <button 
            @click="loadAnalytics"
            :disabled="loading"
            class="p-2 sm:p-2.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors cursor-pointer shrink-0"
            title="Refresh Analytics">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards (2-column on mobile, 4-column on desktop) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <!-- Total Sales -->
        <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1">
            <p class="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider truncate">Total Sales</p>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-surface-800 border border-surface-700/60 flex items-center justify-center text-neutral-300 shrink-0">
              <i class="pi pi-dollar text-[11px] sm:text-xs"></i>
            </div>
          </div>
          <div class="my-1.5 sm:my-2">
            <p class="text-base sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
              ₱{{ formatCurrency(analyticsData?.total_sales) }}
            </p>
          </div>
          <p class="text-[9px] sm:text-[11px] text-neutral-400/80 truncate">Completed revenue</p>
        </div>

        <!-- Highest Day / Peak Sales -->
        <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1">
            <p class="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider truncate">Highest Period</p>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
              <i class="pi pi-trophy text-[11px] sm:text-xs"></i>
            </div>
          </div>
          <div class="my-1.5 sm:my-2">
            <p class="text-base sm:text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight truncate">
              ₱{{ formatCurrency(analyticsData?.highest_day) }}
            </p>
          </div>
          <p class="text-[9px] sm:text-[11px] text-neutral-400/80 truncate">Peak revenue</p>
        </div>

        <!-- Average Sales -->
        <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1">
            <p class="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider truncate">Average Ticket</p>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <i class="pi pi-chart-bar text-[11px] sm:text-xs"></i>
            </div>
          </div>
          <div class="my-1.5 sm:my-2">
            <p class="text-base sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight truncate">
              ₱{{ formatCurrency(analyticsData?.average_sales) }}
            </p>
          </div>
          <p class="text-[9px] sm:text-[11px] text-neutral-400/80 truncate">Average per order</p>
        </div>

        <!-- Total Orders -->
        <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1">
            <p class="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider truncate">Orders</p>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              <i class="pi pi-check-circle text-[11px] sm:text-xs"></i>
            </div>
          </div>
          <div class="my-1.5 sm:my-2">
            <p class="text-lg sm:text-2xl lg:text-3xl font-extrabold text-sky-300 tracking-tight truncate">
              {{ analyticsData?.orders_count || 0 }}
            </p>
          </div>
          <p class="text-[9px] sm:text-[11px] text-neutral-400/80 truncate">Fulfilled orders</p>
        </div>
      </div>

      <!-- Sales Trend Interactive Chart Card -->
      <div class="p-3.5 sm:p-3.5 sm:p-5 lg:p-8 rounded-2xl sm:rounded-2xl bg-surface-800/90 border border-surface-700  space-y-3 sm:space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-700 pb-3 gap-2">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black text-white">Sales Trend</h3>
              <span class="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-surface-700 text-gray-300 font-semibold">
                {{ trendViewLabel }}
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-gray-400 mt-0.5">Revenue trajectory and volume analysis for {{ analyticsData?.period_label || 'selected period' }}</p>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-2">
            <!-- Mobile View Switcher (Detailed Scroll vs Fit Screen) -->
            <div v-if="trendItems.length > 8" class="sm:hidden flex items-center p-0.5 rounded-lg bg-surface-900 border border-surface-700 text-[10px]">
              <button 
                type="button" 
                @click="setChartFitMode(false)" 
                class="px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1"
                :class="!chartFitMode ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-400'">
                <i class="pi pi-arrows-h text-[9px]"></i>
                <span>Scroll</span>
              </button>
              <button 
                type="button" 
                @click="setChartFitMode(true)" 
                class="px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1"
                :class="chartFitMode ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-400'">
                <i class="pi pi-compress text-[9px]"></i>
                <span>Fit</span>
              </button>
            </div>

            <!-- Active point tooltip pill (Desktop sm+) -->
            <div v-if="hoveredPoint" class="hidden sm:flex px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold items-center gap-2">
              <span>{{ hoveredPoint.label }}:</span>
              <span class="text-white">₱{{ formatCurrency(hoveredPoint.sales) }}</span>
              <span class="text-[10px] text-gray-400 font-normal">({{ hoveredPoint.orders }} order{{ hoveredPoint.orders === 1 ? '' : 's' }})</span>
            </div>
          </div>
        </div>

        <!-- Prominent Mobile Active Point Details Bar (Tappable on phone) -->
        <div v-if="hoveredPoint" class="sm:hidden p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in">
          <div class="flex items-center gap-2">
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-amber-300 font-mono font-bold">{{ hoveredPoint.label }}</span>
            <span class="text-sm font-black text-white">₱{{ formatCurrency(hoveredPoint.sales) }}</span>
            <span class="text-[10px] text-neutral-400">({{ hoveredPoint.orders }} ord{{ hoveredPoint.orders === 1 ? '' : 's' }})</span>
          </div>
          <button @click="hoveredIndex = null" class="w-5 h-5 rounded-full bg-surface-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px]">✕</button>
        </div>

        <!-- Mobile Scroll Hint (when in scroll mode) -->
        <div v-if="!chartFitMode && trendItems.length > 8" class="sm:hidden flex items-center justify-between text-[10px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
          <span class="flex items-center gap-1.5"><i class="pi pi-arrows-h text-[9px]"></i> Swipe to inspect all {{ trendItems.length }} dates</span>
          <span class="font-mono text-neutral-400 text-[9px]">Latest &rarr;</span>
        </div>

        <!-- Chart Container with Smooth Horizontal Scroll on Phone -->
        <div class="relative bg-surface-900/60 rounded-xl sm:rounded-2xl border border-surface-700/60 p-2 sm:p-4">
          <div 
            ref="chartScrollRef" 
            class="w-full overflow-x-auto no-scrollbar touch-pan-x pb-1" 
            style="-webkit-overflow-scrolling: touch;">
            <div :style="{ minWidth: chartContainerMinWidth }" class="relative">
              <div class="w-full h-36 sm:h-48 relative">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none" @click.self="hoveredIndex = null">
                  <!-- Grid lines -->
                  <line x1="0" y1="45" x2="700" y2="45" stroke="#27272a" stroke-dasharray="4" />
                  <line x1="0" y1="90" x2="700" y2="90" stroke="#27272a" stroke-dasharray="4" />
                  <line x1="0" y1="135" x2="700" y2="135" stroke="#27272a" stroke-dasharray="4" />

                  <!-- Area Fill Gradient -->
                  <defs>
                    <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#facc15" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#facc15" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>

                  <!-- Filled Area -->
                  <path v-if="chartPoints.length > 1" :d="chartAreaPath" fill="url(#salesGrad)" />

                  <!-- Stroke Line with vector-effect to keep stroke uniform -->
                  <path 
                    v-if="chartPoints.length > 1"
                    :d="chartPath" 
                    fill="none" 
                    stroke="#facc15" 
                    stroke-width="3" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                    class="filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                  />

                  <!-- Data Dots & Hover/Touch Hit Targets -->
                  <g v-for="(pt, idx) in chartPoints" :key="idx">
                    <!-- Visible Circle -->
                    <circle 
                      :cx="pt.x" 
                      :cy="pt.y" 
                      :r="hoveredIndex === idx ? 6.5 : (pt.sales > 0 ? (chartFitMode && trendItems.length > 15 ? 2.5 : 4) : 2)" 
                      :fill="hoveredIndex === idx ? '#facc15' : '#ffffff'" 
                      :stroke="hoveredIndex === idx ? '#ffffff' : '#facc15'" 
                      stroke-width="2"
                      class="transition-all duration-150 cursor-pointer pointer-events-none"
                    />
                    <!-- Transparent larger touch & hover hit target -->
                    <circle 
                      :cx="pt.x" 
                      :cy="pt.y" 
                      r="18" 
                      fill="transparent"
                      class="cursor-pointer"
                      @mouseenter="hoveredIndex = idx"
                      @mouseleave="onMouseLeavePoint"
                      @click.stop="togglePoint(idx)"
                      @touchstart.passive="hoveredIndex = idx"
                    />
                  </g>
                </svg>
              </div>

              <!-- X-Axis Labels (Positioned exactly at corresponding points) -->
              <div class="relative h-6 text-[9px] sm:text-[11px] text-gray-400 font-mono pt-1.5 border-t border-surface-700/50">
                <span 
                  v-for="(item, idx) in displayedAxisLabels" 
                  :key="idx"
                  class="absolute -translate-x-1/2 text-center whitespace-nowrap transition-colors cursor-pointer"
                  :style="{ left: `${getLabelPosition(item.index)}%` }"
                  :class="{ 'font-bold text-amber-300': hoveredIndex === item.index }"
                  @click="togglePoint(item.index)">
                  {{ item.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Bottom Section: Top Products & Low Stock Warnings -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8">
        
        <!-- Top Selling Products Table -->
        <div class="lg:col-span-7 p-3.5 sm:p-3.5 sm:p-5 lg:p-8 rounded-2xl sm:rounded-2xl bg-surface-800/90 border border-surface-700  space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between border-b border-surface-700 pb-3">
            <div>
              <h3 class="text-sm sm:text-base font-black text-white">Top Selling Menu Items</h3>
              <p class="text-[10px] sm:text-[11px] text-gray-400">Ranked by volume in {{ analyticsData?.period_label || 'this period' }}</p>
            </div>
            <span class="text-xs text-brand-400 font-bold">By Volume</span>
          </div>

          <div v-if="analyticsData?.top_products?.length > 0" class="space-y-2 sm:space-y-3">
            <div 
              v-for="(prod, idx) in analyticsData.top_products" 
              :key="idx"
              class="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-xs">
              <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-surface-800 text-brand-400 font-black flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                  #{{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate">{{ prod.product_name }}</p>
                  <p class="text-[10px] text-gray-400">{{ prod.total_qty }} orders placed</p>
                </div>
              </div>
              <span class="font-black text-white text-xs sm:text-sm shrink-0 ml-2">
                ₱{{ formatCurrency(prod.total_revenue) }}
              </span>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-500 text-xs">
            No product sales data recorded for {{ analyticsData?.period_label || 'this period' }}.
          </div>
        </div>

        <!-- Raw Ingredient Alerts -->
        <div class="lg:col-span-5 p-3.5 sm:p-3.5 sm:p-5 lg:p-8 rounded-2xl sm:rounded-2xl bg-surface-800/90 border border-surface-700  space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between border-b border-surface-700 pb-3">
            <div>
              <h3 class="text-sm sm:text-base font-black text-white">Kitchen Inventory Watch</h3>
              <p class="text-[10px] sm:text-[11px] text-gray-400">Ingredients tracked and auto-deducted</p>
            </div>
            <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
              {{ lowStockCount }} Alerts
            </span>
          </div>

          <div v-if="lowStockList.length > 0" class="space-y-2 sm:space-y-2.5 max-h-64 overflow-y-auto">
            <div 
              v-for="ing in lowStockList" 
              :key="ing.id"
              class="p-2.5 sm:p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 flex items-center justify-between text-xs">
              <div class="min-w-0 flex-1 mr-2">
                <p class="font-bold text-white truncate">{{ ing.name }}</p>
                <p class="text-[10px] text-amber-400 font-medium truncate">
                  Stock: {{ ing.stock }} {{ ing.unit }} (Min: {{ ing.low_threshold }})
                </p>
              </div>
              <button 
                @click="goToInventory"
                class="px-2 sm:px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-surface-950 transition-colors cursor-pointer shrink-0">
                Restock
              </button>
            </div>
          </div>
          <div v-else class="text-center py-6 text-emerald-400 text-xs">
            ✓ All kitchen raw ingredients are above minimum thresholds!
          </div>
        </div>

      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

export default {
  name: 'AdminAnalyticsTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const isSyncing = Vue.ref(false);
    const timeRange = Vue.ref('30days');
    const analyticsData = Vue.ref(null);
    const hoveredIndex = Vue.ref(null);
    const chartScrollRef = Vue.ref(null);
    const chartFitMode = Vue.ref(false);

    const currentDate = new Date();
    const selectedMonth = Vue.ref(currentDate.getMonth() + 1);
    const selectedYear = Vue.ref(currentDate.getFullYear());

    // Custom date pickers defaulting to last 30 days
    const formatDateYMD = (d) => d.toISOString().split('T')[0];
    const customEndDate = Vue.ref(formatDateYMD(currentDate));
    const prior30 = new Date();
    prior30.setDate(prior30.getDate() - 29);
    const customStartDate = Vue.ref(formatDateYMD(prior30));

    const monthsList = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const yearsList = [2024, 2025, 2026, 2027];

    const scrollChartToEnd = () => {
      Vue.nextTick(() => {
        if (chartScrollRef.value && !chartFitMode.value) {
          chartScrollRef.value.scrollLeft = chartScrollRef.value.scrollWidth;
        }
      });
    };

    const setChartFitMode = (mode) => {
      chartFitMode.value = mode;
      if (!mode) {
        scrollChartToEnd();
      }
    };

    const togglePoint = (idx) => {
      hoveredIndex.value = (hoveredIndex.value === idx) ? null : idx;
    };

    const onMouseLeavePoint = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 640) {
        hoveredIndex.value = null;
      }
    };

    Vue.onMounted(() => {
      loadAnalytics();
    });

    const onRangeChange = () => {
      if (timeRange.value !== 'month' && timeRange.value !== 'custom') {
        loadAnalytics();
      }
    };

    const loadAnalytics = async () => {
      loading.value = true;
      try {
        const params = { range: timeRange.value };
        if (timeRange.value === 'month') {
          params.month = selectedMonth.value;
          params.year = selectedYear.value;
        } else if (timeRange.value === 'custom') {
          params.start_date = customStartDate.value;
          params.end_date = customEndDate.value;
        }
        const res = await GST_API.getAnalytics(params);
        analyticsData.value = res.data;
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        loading.value = false;
        scrollChartToEnd();
      }
    };

    const syncLoyverseAndReload = async () => {
      isSyncing.value = true;
      try {
        await store.syncLoyverseSales();
        await loadAnalytics();
      } catch (err) {
        console.error('Loyverse sync failed:', err);
      } finally {
        isSyncing.value = false;
      }
    };

    const formatCurrency = (val) => {
      if (val === undefined || val === null) return '0.00';
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const trendItems = Vue.computed(() => {
      return analyticsData.value?.trend_data || [];
    });

    const trendViewLabel = Vue.computed(() => {
      const items = trendItems.value;
      if (!items.length) return 'Timeline';
      if (timeRange.value === 'today' || timeRange.value === 'yesterday') return 'Hourly View';
      if (timeRange.value === 'this_year') return 'Monthly View';
      return 'Daily View';
    });

    const chartPoints = Vue.computed(() => {
      const items = trendItems.value;
      if (!items.length) return [];

      const maxVal = Math.max(...items.map(i => i.sales), 100);
      const width = 700;
      const height = 180;
      const step = items.length > 1 ? width / (items.length - 1) : 0;

      return items.map((item, idx) => {
        const x = items.length === 1 ? width / 2 : idx * step;
        const normalized = item.sales / maxVal;
        const y = height - (normalized * (height - 30)) - 15;
        return { 
          x, 
          y, 
          sales: item.sales, 
          label: item.label, 
          date: item.date,
          orders: item.orders ?? 0,
          index: idx 
        };
      });
    });

    const hoveredPoint = Vue.computed(() => {
      if (hoveredIndex.value === null || !chartPoints.value[hoveredIndex.value]) return null;
      return chartPoints.value[hoveredIndex.value];
    });

    const chartContainerMinWidth = Vue.computed(() => {
      if (chartFitMode.value) return '100%';
      const count = trendItems.value.length;
      if (count <= 8) return '100%';
      return `${Math.max(620, count * 24)}px`;
    });

    const displayedAxisLabels = Vue.computed(() => {
      const items = trendItems.value;
      const total = items.length;
      if (!total) return [];
      const targetCount = chartFitMode.value ? 5 : 8;
      if (total <= targetCount) {
        return items.map((it, idx) => ({ label: it.label, index: idx }));
      }
      const step = Math.ceil(total / targetCount);
      const sampled = [];
      for (let i = 0; i < total; i += step) {
        sampled.push({ label: items[i].label, index: i });
      }
      const lastIndex = sampled[sampled.length - 1].index;
      if (lastIndex !== total - 1) {
        // If the last sampled point is too close to the end point, replace it
        // so dates do not collide or overlap at the end of the chart.
        if ((total - 1) - lastIndex < Math.ceil(step * 0.75)) {
          sampled[sampled.length - 1] = { label: items[total - 1].label, index: total - 1 };
        } else {
          sampled.push({ label: items[total - 1].label, index: total - 1 });
        }
      }
      return sampled;
    });

    const getLabelPosition = (index) => {
      const pts = chartPoints.value;
      if (!pts || !pts[index]) return 50;
      const pct = (pts[index].x / 700) * 100;
      return Math.max(3, Math.min(97, pct));
    };

    const chartPath = Vue.computed(() => {
      const pts = chartPoints.value;
      if (!pts.length) return '';
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const cpX = (prev.x + cur.x) / 2;
        d += ` C ${cpX} ${prev.y}, ${cpX} ${cur.y}, ${cur.x} ${cur.y}`;
      }
      return d;
    });

    const chartAreaPath = Vue.computed(() => {
      const pts = chartPoints.value;
      if (!pts.length) return '';
      const baseLine = chartPath.value;
      const last = pts[pts.length - 1];
      const first = pts[0];
      return `${baseLine} L ${last.x} 180 L ${first.x} 180 Z`;
    });

    const lowStockList = Vue.computed(() => {
      return store.ingredients.filter(i => i.stock <= i.low_threshold);
    });

    const lowStockCount = Vue.computed(() => lowStockList.value.length);

    const goToInventory = () => {
      store.adminTab = 'inventory';
    };

    return {
      store,
      loading,
      isSyncing,
      timeRange,
      selectedMonth,
      selectedYear,
      customStartDate,
      customEndDate,
      monthsList,
      yearsList,
      analyticsData,
      trendItems,
      trendViewLabel,
      chartPoints,
      chartPath,
      chartAreaPath,
      hoveredIndex,
      hoveredPoint,
      chartScrollRef,
      chartFitMode,
      setChartFitMode,
      togglePoint,
      onMouseLeavePoint,
      chartContainerMinWidth,
      displayedAxisLabels,
      getLabelPosition,
      lowStockList,
      lowStockCount,
      onRangeChange,
      loadAnalytics,
      syncLoyverseAndReload,
      formatCurrency,
      goToInventory,
    };
  },
};
</script>
