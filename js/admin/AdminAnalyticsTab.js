// G Shot Teas — Sales Analytics Tab (Matches Figure 15)
const AdminAnalyticsTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header & Filter Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-chart-line"></i> ANALYTICS DASHBOARD
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Sales Analytics</h2>
          <p class="text-xs text-gray-400">Track revenue performance and order analytics in real time with live insights and breakdowns.</p>
        </div>

        <div class="flex items-center gap-3">
          <select 
            v-model="timeRange"
            @change="loadAnalytics"
            class="px-3.5 py-2 rounded-xl bg-surface-800 text-xs font-semibold text-gray-300 border border-surface-700 focus:outline-none focus:border-brand-500 cursor-pointer">
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button 
            @click="loadAnalytics"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors"
            title="Refresh Analytics">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards (Matches Figure 15: Total Sales, Highest Day, Average Sales) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Sales -->
        <div class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
          <p class="text-3xl font-black text-brand-400">
            ₱{{ formatCurrency(analyticsData?.total_sales) }}
          </p>
          <p class="text-[11px] text-gray-500 font-medium">Completed orders revenue</p>
        </div>

        <!-- Highest Day -->
        <div class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-1">
          <p class="text-xs font-bold text-amber-400 uppercase tracking-wider">Highest Day</p>
          <p class="text-3xl font-black text-amber-400">
            ₱{{ formatCurrency(analyticsData?.highest_day) }}
          </p>
          <p class="text-[11px] text-gray-500 font-medium">Peak revenue date</p>
        </div>

        <!-- Average Sales -->
        <div class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-1">
          <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Average Sales</p>
          <p class="text-3xl font-black text-emerald-400">
            ₱{{ formatCurrency(analyticsData?.average_sales) }}
          </p>
          <p class="text-[11px] text-gray-500 font-medium">Average ticket per order</p>
        </div>

        <!-- Total Orders -->
        <div class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-1">
          <p class="text-xs font-bold text-purple-400 uppercase tracking-wider">Completed Orders</p>
          <p class="text-3xl font-black text-purple-400">
            {{ analyticsData?.orders_count || 0 }}
          </p>
          <p class="text-[11px] text-gray-500 font-medium">Fulfilled customer orders</p>
        </div>
      </div>

      <!-- Sales Trend Interactive Chart Card (Matches Figure 15) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-6">
        <div class="flex items-center justify-between border-b border-surface-700 pb-4">
          <div>
            <h3 class="text-lg font-black text-white">Sales Trend</h3>
            <p class="text-xs text-gray-400">Daily revenue trajectory and volume analysis</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-surface-700 text-gray-300 font-semibold">
            Daily View
          </span>
        </div>

        <!-- SVG Interactive Spline Curve Chart -->
        <div class="relative h-64 w-full bg-surface-900/60 rounded-2xl border border-surface-700/60 p-4 flex flex-col justify-between">
          <div class="w-full h-48 relative">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="45" x2="700" y2="45" stroke="#252a3a" stroke-dasharray="4" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#252a3a" stroke-dasharray="4" />
              <line x1="0" y1="135" x2="700" y2="135" stroke="#252a3a" stroke-dasharray="4" />

              <!-- Area Fill Gradient -->
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ea580c" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#ea580c" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Filled Area -->
              <path :d="chartAreaPath" fill="url(#salesGrad)" />

              <!-- Stroke Line (Matches glowing red/orange curve in Figure 15) -->
              <path 
                :d="chartPath" 
                fill="none" 
                stroke="#ff3b30" 
                stroke-width="3.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                class="filter drop-shadow-[0_0_10px_rgba(255,59,48,0.6)]"
              />

              <!-- Data Dots -->
              <circle 
                v-for="(pt, idx) in chartPoints" 
                :key="idx"
                :cx="pt.x" 
                :cy="pt.y" 
                r="4.5" 
                fill="#ffffff" 
                stroke="#ff3b30" 
                stroke-width="2.5"
                class="hover:scale-150 transition-transform cursor-pointer"
              />
            </svg>
          </div>

          <!-- X-Axis Labels -->
          <div class="flex justify-between text-[11px] text-gray-400 font-mono pt-2 border-t border-surface-700/50">
            <span v-for="(item, idx) in trendItems" :key="idx">
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Two Column Bottom Section: Top Products & Low Stock Warnings -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Top Selling Products Table -->
        <div class="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-surface-700 pb-3">
            <h3 class="text-base font-black text-white">Top Selling Menu Items</h3>
            <span class="text-xs text-brand-400 font-bold">By Volume</span>
          </div>

          <div v-if="analyticsData?.top_products?.length > 0" class="space-y-3">
            <div 
              v-for="(prod, idx) in analyticsData.top_products" 
              :key="idx"
              class="flex items-center justify-between p-3 rounded-xl bg-surface-900/60 border border-surface-700/50 text-xs">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg bg-surface-800 text-brand-400 font-black flex items-center justify-center text-xs">
                  #{{ idx + 1 }}
                </span>
                <div>
                  <p class="font-bold text-white">{{ prod.product_name }}</p>
                  <p class="text-[10px] text-gray-400">{{ prod.total_qty }} orders placed</p>
                </div>
              </div>
              <span class="font-black text-white text-sm">
                ₱{{ formatCurrency(prod.total_revenue) }}
              </span>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-xs">
            No product sales data available yet.
          </div>
        </div>

        <!-- Raw Ingredient Alerts (The Ingredient Prototype connection!) -->
        <div class="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-surface-700 pb-3">
            <h3 class="text-base font-black text-white">Kitchen Inventory Watch</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
              {{ lowStockCount }} Alerts
            </span>
          </div>

          <div v-if="lowStockList.length > 0" class="space-y-2.5 max-h-64 overflow-y-auto">
            <div 
              v-for="ing in lowStockList" 
              :key="ing.id"
              class="p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 flex items-center justify-between text-xs">
              <div>
                <p class="font-bold text-white">{{ ing.name }}</p>
                <p class="text-[10px] text-amber-400 font-medium">
                  Current stock: {{ ing.stock }} {{ ing.unit }} (Min: {{ ing.low_threshold }})
                </p>
              </div>
              <button 
                @click="goToInventory"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-surface-950 transition-colors">
                Restock
              </button>
            </div>
          </div>
          <div v-else class="text-center py-8 text-emerald-400 text-xs">
            ✓ All kitchen raw ingredients are above minimum thresholds!
          </div>
        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const timeRange = Vue.ref('7days');
    const analyticsData = Vue.ref(null);

    Vue.onMounted(() => {
      loadAnalytics();
    });

    const loadAnalytics = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getAnalytics({ range: timeRange.value });
        analyticsData.value = res.data;
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (val) => {
      if (val === undefined || val === null) return '0.00';
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const trendItems = Vue.computed(() => {
      return analyticsData.value?.trend_data || [];
    });

    const chartPoints = Vue.computed(() => {
      const items = trendItems.value;
      if (!items.length) return [];

      const maxVal = Math.max(...items.map(i => i.sales), 100);
      const width = 700;
      const height = 180;
      const step = width / (items.length - 1 || 1);

      return items.map((item, idx) => {
        const x = idx * step;
        const normalized = item.sales / maxVal;
        const y = height - (normalized * (height - 30)) - 15;
        return { x, y, sales: item.sales };
      });
    });

    const chartPath = Vue.computed(() => {
      const pts = chartPoints.value;
      if (!pts.length) return '';
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
      timeRange,
      analyticsData,
      trendItems,
      chartPoints,
      chartPath,
      chartAreaPath,
      lowStockList,
      lowStockCount,
      loadAnalytics,
      formatCurrency,
      goToInventory,
    };
  },
};
