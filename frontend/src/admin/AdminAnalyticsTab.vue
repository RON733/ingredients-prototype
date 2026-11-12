<template>
<div class="space-y-6 sm:space-y-8">
      
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

      <!-- Sales Trend / Comparison Interactive Chart Card -->
      <div class="p-3.5 sm:p-5 lg:p-8 rounded-2xl bg-surface-800/90 border border-surface-700 space-y-3 sm:space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-700 pb-3 gap-2.5">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black text-white">
                {{ chartMode === 'line' ? 'Sales Trend' : 'Sales Comparison' }}
              </h3>
              <span class="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-surface-700 text-gray-300 font-semibold">
                {{ chartMode === 'line' ? trendViewLabel : comparisonBadgeLabel }}
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              <template v-if="chartMode === 'line'">
                Revenue trajectory and volume analysis for {{ analyticsData?.period_label || 'selected period' }}
              </template>
              <template v-else>
                {{ comparisonSubtitle }}
              </template>
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <!-- Chart Mode Toggle: Line Graph vs Bar Comparison -->
            <div class="flex items-center p-0.5 rounded-xl bg-surface-900 border border-surface-700 text-[11px]">
              <button
                type="button"
                @click="setChartMode('line')"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="chartMode === 'line' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-400 hover:text-white border border-transparent'">
                <i class="pi pi-chart-line text-[10px]"></i>
                <span>Line</span>
              </button>
              <button
                type="button"
                @click="setChartMode('bar')"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="chartMode === 'bar' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-400 hover:text-white border border-transparent'">
                <i class="pi pi-chart-bar text-[10px]"></i>
                <span>Compare</span>
              </button>
            </div>

            <!-- Mobile View Switcher (Detailed Scroll vs Fit Screen) -->
            <div v-if="activeItemCount > 8" class="sm:hidden flex items-center p-0.5 rounded-lg bg-surface-900 border border-surface-700 text-[10px]">
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
            <div v-if="chartMode === 'line' && hoveredPoint" class="hidden sm:flex px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold items-center gap-2">
              <span>{{ hoveredPoint.label }}:</span>
              <span class="text-white">₱{{ formatCurrency(hoveredPoint.sales) }}</span>
              <span class="text-[10px] text-gray-400 font-normal">({{ hoveredPoint.orders }} order{{ hoveredPoint.orders === 1 ? '' : 's' }})</span>
            </div>

            <!-- Active bar tooltip pill (Desktop sm+) -->
            <div v-if="chartMode === 'bar' && hoveredBar" class="hidden sm:flex px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold items-center gap-2">
              <span>{{ hoveredBar.label }}:</span>
              <span class="text-white">₱{{ formatCurrency(hoveredBar.primarySales) }}</span>
              <span v-if="compareScope === 'period'" class="text-[10px] text-sky-300 font-semibold">
                vs ₱{{ formatCurrency(hoveredBar.secondarySales) }} ({{ hoveredBar.prevLabel }})
              </span>
              <span v-else class="text-[10px] text-gray-300 font-normal">
                ({{ hoveredBar.orders }} ord{{ hoveredBar.orders === 1 ? '' : 's' }} • Avg ₱{{ formatCurrency(hoveredBar.avgTicket) }})
              </span>
              <span
                v-if="hoveredBar.changePct !== null && hoveredBar.changePct !== undefined"
                class="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                :class="hoveredBar.changePct >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                {{ hoveredBar.changePct >= 0 ? '+' : '' }}{{ hoveredBar.changePct }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Comparison Scope & Summary Strip (Only in Bar Comparison Mode) -->
        <div v-if="chartMode === 'bar'" class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <!-- Comparison Scope Selector -->
            <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-900/90 border border-surface-700/80 w-fit">
              <button
                v-if="comparisonPeriod"
                type="button"
                @click="setCompareScope('period')"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                :class="compareScope === 'period' ? 'bg-surface-750 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-neutral-400 hover:text-white border border-transparent'">
                Period vs Prior
              </button>
              <button
                type="button"
                @click="setCompareScope('months')"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                :class="compareScope === 'months' ? 'bg-surface-750 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-neutral-400 hover:text-white border border-transparent'">
                Past 12 Months
              </button>
              <button
                type="button"
                @click="setCompareScope('years')"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                :class="compareScope === 'years' ? 'bg-surface-750 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-neutral-400 hover:text-white border border-transparent'">
                Past Years
              </button>
            </div>

            <!-- Legend -->
            <div class="flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px] text-neutral-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                {{ compareScope === 'period' ? (analyticsData?.period_label || 'Current Period') : 'Revenue (₱)' }}
              </span>
              <span v-if="compareScope === 'period' && comparisonPeriod" class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-sky-400/80 inline-block"></span>
                {{ comparisonPeriod.previous_label }}
              </span>
            </div>
          </div>

          <!-- Comparison KPI Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div
              v-for="(stat, sIdx) in comparisonSummaryCards"
              :key="sIdx"
              class="p-2.5 sm:p-3 rounded-xl bg-surface-900/70 border border-surface-700/60 flex flex-col justify-between gap-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">{{ stat.title }}</span>
                <span
                  v-if="stat.badge !== null && stat.badge !== undefined"
                  class="text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0"
                  :class="stat.badge >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'">
                  {{ stat.badge >= 0 ? '+' : '' }}{{ stat.badge }}%
                </span>
              </div>
              <p class="text-sm sm:text-base font-extrabold text-white truncate">{{ stat.value }}</p>
              <p class="text-[10px] text-neutral-400 truncate">{{ stat.sub }}</p>
            </div>
          </div>
        </div>

        <!-- Prominent Mobile Active Point Details Bar (Line mode) -->
        <div v-if="chartMode === 'line' && hoveredPoint" class="sm:hidden p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in">
          <div class="flex items-center gap-2">
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-amber-300 font-mono font-bold">{{ hoveredPoint.label }}</span>
            <span class="text-sm font-black text-white">₱{{ formatCurrency(hoveredPoint.sales) }}</span>
            <span class="text-[10px] text-neutral-400">({{ hoveredPoint.orders }} ord{{ hoveredPoint.orders === 1 ? '' : 's' }})</span>
          </div>
          <button @click="hoveredIndex = null" class="w-5 h-5 rounded-full bg-surface-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px]" aria-label="Close"><i class="pi pi-times text-[9px]"></i></button>
        </div>

        <!-- Prominent Mobile Active Bar Details Bar (Bar mode) -->
        <div v-if="chartMode === 'bar' && hoveredBar" class="sm:hidden p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-amber-300 font-mono font-bold">{{ hoveredBar.label }}</span>
              <span class="text-sm font-black text-white">₱{{ formatCurrency(hoveredBar.primarySales) }}</span>
              <span
                v-if="hoveredBar.changePct !== null && hoveredBar.changePct !== undefined"
                class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                :class="hoveredBar.changePct >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                {{ hoveredBar.changePct >= 0 ? '+' : '' }}{{ hoveredBar.changePct }}%
              </span>
            </div>
            <p v-if="compareScope === 'period'" class="text-[10px] text-sky-300 mt-0.5 truncate">
              Prior ({{ hoveredBar.prevLabel }}): ₱{{ formatCurrency(hoveredBar.secondarySales) }} ({{ hoveredBar.secondaryOrders }} ord)
            </p>
            <p v-else class="text-[10px] text-neutral-400 mt-0.5 truncate">
              {{ hoveredBar.orders }} orders • Avg ₱{{ formatCurrency(hoveredBar.avgTicket) }} • POS ₱{{ formatCurrency(hoveredBar.posSales) }} / Web ₱{{ formatCurrency(hoveredBar.websiteSales) }}
            </p>
          </div>
          <button @click="hoveredBarIndex = null" class="w-5 h-5 rounded-full bg-surface-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px] shrink-0" aria-label="Close"><i class="pi pi-times text-[9px]"></i></button>
        </div>

        <!-- Mobile Scroll Hint (when in scroll mode) -->
        <div v-if="!chartFitMode && activeItemCount > 8" class="sm:hidden flex items-center justify-between text-[10px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
          <span class="flex items-center gap-1.5"><i class="pi pi-arrows-h text-[9px]"></i> Swipe to inspect all {{ activeItemCount }} periods</span>
          <span class="font-mono text-neutral-400 text-[9px]">Latest &rarr;</span>
        </div>

        <!-- Chart Container with Smooth Transition between Line & Bar Comparison -->
        <Transition name="chart-swap" mode="out-in">
          <!-- LINE GRAPH -->
          <div v-if="chartMode === 'line'" key="line-chart" class="relative bg-surface-900/60 rounded-xl sm:rounded-2xl border border-surface-700/60 p-2 sm:p-4">
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

          <!-- BAR COMPARISON GRAPH -->
          <div v-else key="bar-chart" class="relative bg-surface-900/60 rounded-xl sm:rounded-2xl border border-surface-700/60 p-2 sm:p-4">
            <div 
              ref="barScrollRef" 
              class="w-full overflow-x-auto no-scrollbar touch-pan-x pb-1" 
              style="-webkit-overflow-scrolling: touch;">
              <div :style="{ minWidth: barContainerMinWidth }" class="relative">
                <!-- Bars Area -->
                <div class="relative h-44 sm:h-56 flex items-end gap-1 sm:gap-2 px-1 sm:px-2 pt-6 pb-1 border-b border-surface-700/50">
                  <!-- Horizontal Grid Lines -->
                  <div class="absolute inset-x-0 top-6 bottom-1 pointer-events-none flex flex-col justify-between">
                    <div class="border-t border-dashed border-surface-700/50 w-full"></div>
                    <div class="border-t border-dashed border-surface-700/50 w-full"></div>
                    <div class="border-t border-dashed border-surface-700/50 w-full"></div>
                    <div></div>
                  </div>

                  <div
                    v-for="(bar, bIdx) in barChartItems"
                    :key="bar.key || bIdx"
                    class="relative z-10 flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                    @mouseenter="hoveredBarIndex = bIdx"
                    @mouseleave="onMouseLeaveBar"
                    @click.stop="toggleBar(bIdx)"
                    @touchstart.passive="hoveredBarIndex = bIdx">

                    <!-- Hover/Active highlight column -->
                    <div
                      class="absolute inset-y-0 -inset-x-0.5 rounded-lg transition-colors pointer-events-none"
                      :class="hoveredBarIndex === bIdx ? 'bg-white/[0.04]' : 'group-hover:bg-white/[0.03]'">
                    </div>

                    <!-- Value label above bar for Years or hovered bar -->
                    <span
                      v-if="(compareScope === 'years' || hoveredBarIndex === bIdx) && bar.primarySales > 0"
                      class="text-[9px] sm:text-[10px] font-bold text-amber-300 mb-1 whitespace-nowrap pointer-events-none">
                      ₱{{ formatCompactCurrency(bar.primarySales) }}
                    </span>

                    <!-- Bar Pair (Grouped in Period vs Prior, Single in Months/Years) -->
                    <div class="w-full h-full flex items-end justify-center gap-0.5 sm:gap-1 px-0.5">
                      <!-- Primary Bar (Current / Period Revenue) -->
                      <div
                        class="rounded-t-md sm:rounded-t-lg transition-all duration-500 ease-out"
                        :class="[
                          compareScope === 'period' ? 'w-1/2 max-w-[18px]' : 'w-full max-w-[38px]',
                          hoveredBarIndex === bIdx
                            ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.45)]'
                            : 'bg-gradient-to-t from-amber-500/80 to-yellow-400/95'
                        ]"
                        :style="{ height: getBarHeight(bar.primarySales) }">
                      </div>

                      <!-- Secondary Bar (Previous Period) -->
                      <div
                        v-if="compareScope === 'period'"
                        class="w-1/2 max-w-[18px] rounded-t-md sm:rounded-t-lg transition-all duration-500 ease-out"
                        :class="hoveredBarIndex === bIdx ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'bg-sky-400/65'"
                        :style="{ height: getBarHeight(bar.secondarySales) }">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- X-Axis Labels -->
                <div class="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 pt-1.5 h-6 text-[9px] sm:text-[11px] text-gray-400 font-mono">
                  <div
                    v-for="(bar, bIdx) in barChartItems"
                    :key="`lbl-${bIdx}`"
                    class="flex-1 text-center truncate transition-colors cursor-pointer"
                    :class="hoveredBarIndex === bIdx ? 'font-bold text-amber-300' : ''"
                    @click="toggleBar(bIdx)">
                    {{ shouldShowBarLabel(bIdx) ? bar.shortLabel : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
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
            <i class="pi pi-check-circle mr-1.5"></i>All kitchen raw ingredients are above minimum thresholds!
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
    const barScrollRef = Vue.ref(null);
    const chartFitMode = Vue.ref(false);
    const chartMode = Vue.ref('line'); // 'line' | 'bar'
    const compareScope = Vue.ref('period'); // 'period' | 'months' | 'years'
    const hoveredBarIndex = Vue.ref(null);

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
        if (barScrollRef.value && !chartFitMode.value) {
          barScrollRef.value.scrollLeft = barScrollRef.value.scrollWidth;
        }
      });
    };

    const setChartFitMode = (mode) => {
      chartFitMode.value = mode;
      if (!mode) {
        scrollChartToEnd();
      }
    };

    const setChartMode = (mode) => {
      chartMode.value = mode;
      hoveredIndex.value = null;
      hoveredBarIndex.value = null;
      if (mode === 'bar' && compareScope.value === 'period' && !comparisonPeriod.value) {
        compareScope.value = 'months';
      }
      scrollChartToEnd();
    };

    const setCompareScope = (scope) => {
      compareScope.value = scope;
      hoveredBarIndex.value = null;
      scrollChartToEnd();
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
        if (compareScope.value === 'period' && !res.data?.comparison_period) {
          compareScope.value = 'months';
        }
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

    const comparisonPeriod = Vue.computed(() => analyticsData.value?.comparison_period || null);
    const monthlyComparison = Vue.computed(() => analyticsData.value?.monthly_comparison || []);
    const yearlyComparison = Vue.computed(() => analyticsData.value?.yearly_comparison || []);

    const comparisonBadgeLabel = Vue.computed(() => {
      if (compareScope.value === 'years') return 'Year-over-Year';
      if (compareScope.value === 'months') return 'Past 12 Months';
      return 'Period vs Prior';
    });

    const comparisonSubtitle = Vue.computed(() => {
      if (compareScope.value === 'years') {
        return 'Annual revenue, order volume, and average ticket across past years';
      }
      if (compareScope.value === 'months') {
        return 'Month-over-month revenue, orders, and channel split across the past 12 months';
      }
      const prevLbl = comparisonPeriod.value?.previous_label || 'prior period';
      return `Side-by-side comparison: ${analyticsData.value?.period_label || 'Current'} vs ${prevLbl}`;
    });

    const barChartItems = Vue.computed(() => {
      if (compareScope.value === 'months') {
        return monthlyComparison.value.map((m) => ({
          key: m.date,
          label: m.label,
          shortLabel: m.short_label || m.label,
          primarySales: Number(m.sales || 0),
          secondarySales: 0,
          orders: m.orders || 0,
          avgTicket: Number(m.avg_ticket || 0),
          posSales: Number(m.pos_sales || 0),
          websiteSales: Number(m.website_sales || 0),
          changePct: m.change_pct,
        }));
      }
      if (compareScope.value === 'years') {
        return yearlyComparison.value.map((y) => ({
          key: y.date,
          label: y.label,
          shortLabel: y.label,
          primarySales: Number(y.sales || 0),
          secondarySales: 0,
          orders: y.orders || 0,
          avgTicket: Number(y.avg_ticket || 0),
          posSales: Number(y.pos_sales || 0),
          websiteSales: Number(y.website_sales || 0),
          changePct: y.change_pct,
        }));
      }
      const series = comparisonPeriod.value?.series || [];
      return series.map((item, idx) => ({
        key: `${idx}-${item.label}`,
        label: item.label,
        shortLabel: item.label,
        prevLabel: item.prev_label,
        primarySales: Number(item.current_sales || 0),
        secondarySales: Number(item.previous_sales || 0),
        orders: item.current_orders || 0,
        secondaryOrders: item.previous_orders || 0,
        avgTicket: item.current_orders > 0 ? Number(item.current_sales || 0) / item.current_orders : 0,
        changePct: item.change_pct,
      }));
    });

    const barMaxVal = Vue.computed(() => {
      const items = barChartItems.value;
      if (!items.length) return 100;
      const vals = items.flatMap((i) =>
        compareScope.value === 'period' ? [i.primarySales, i.secondarySales] : [i.primarySales]
      );
      return Math.max(...vals, 100);
    });

    const getBarHeight = (val) => {
      if (!val || val <= 0) return '3px';
      const pct = Math.max(4, Math.round((val / barMaxVal.value) * 100));
      return `${pct}%`;
    };

    const activeItemCount = Vue.computed(() => {
      return chartMode.value === 'line' ? trendItems.value.length : barChartItems.value.length;
    });

    const barContainerMinWidth = Vue.computed(() => {
      if (chartFitMode.value) return '100%';
      const count = barChartItems.value.length;
      if (count <= 12) return '100%';
      return `${Math.max(640, count * 28)}px`;
    });

    const shouldShowBarLabel = (idx) => {
      const total = barChartItems.value.length;
      if (total <= 14) return true;
      const targetCount = chartFitMode.value ? 6 : 9;
      const step = Math.ceil(total / targetCount);
      if (idx === total - 1) return true;
      if (idx % step === 0 && (total - 1) - idx >= Math.ceil(step * 0.6)) return true;
      return false;
    };

    const hoveredBar = Vue.computed(() => {
      if (hoveredBarIndex.value === null || !barChartItems.value[hoveredBarIndex.value]) return null;
      return barChartItems.value[hoveredBarIndex.value];
    });

    const toggleBar = (idx) => {
      hoveredBarIndex.value = (hoveredBarIndex.value === idx) ? null : idx;
    };

    const onMouseLeaveBar = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 640) {
        hoveredBarIndex.value = null;
      }
    };

    const formatCompactCurrency = (val) => {
      const num = Number(val || 0);
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
      return num.toFixed(0);
    };

    const comparisonSummaryCards = Vue.computed(() => {
      if (compareScope.value === 'period' && comparisonPeriod.value) {
        const cp = comparisonPeriod.value;
        const curSales = Number(analyticsData.value?.total_sales || 0);
        const curOrders = Number(analyticsData.value?.orders_count || 0);
        const curAvg = Number(analyticsData.value?.average_sales || 0);
        return [
          {
            title: 'Revenue vs Prior',
            value: `₱${formatCurrency(curSales)}`,
            sub: `Prior: ₱${formatCurrency(cp.previous_total_sales)}`,
            badge: cp.sales_change_pct,
          },
          {
            title: 'Orders vs Prior',
            value: `${curOrders}`,
            sub: `Prior: ${cp.previous_orders_count} orders`,
            badge: cp.orders_change_pct,
          },
          {
            title: 'Avg Ticket vs Prior',
            value: `₱${formatCurrency(curAvg)}`,
            sub: `Prior: ₱${formatCurrency(cp.previous_average_sales)}`,
            badge: cp.avg_change_pct,
          },
          {
            title: 'Channel Split',
            value: `POS ₱${formatCompactCurrency(cp.current_pos_sales)}`,
            sub: `Website: ₱${formatCurrency(cp.current_web_sales)}`,
            badge: null,
          },
        ];
      }

      if (compareScope.value === 'months') {
        const items = monthlyComparison.value;
        const total = items.reduce((acc, i) => acc + Number(i.sales || 0), 0);
        const totalOrders = items.reduce((acc, i) => acc + Number(i.orders || 0), 0);
        const avg = items.length ? total / items.length : 0;
        const best = items.reduce((top, i) => (i.sales > (top?.sales ?? -1) ? i : top), null);
        const latest = items[items.length - 1] || null;
        return [
          {
            title: '12-Month Total',
            value: `₱${formatCurrency(total)}`,
            sub: `${totalOrders} fulfilled orders`,
            badge: null,
          },
          {
            title: 'Monthly Average',
            value: `₱${formatCurrency(avg)}`,
            sub: 'Across last 12 months',
            badge: null,
          },
          {
            title: 'Peak Month',
            value: best ? `₱${formatCurrency(best.sales)}` : '₱0.00',
            sub: best ? `${best.label} (${best.orders} ord)` : 'No data',
            badge: null,
          },
          {
            title: 'Latest Month',
            value: latest ? `₱${formatCurrency(latest.sales)}` : '₱0.00',
            sub: latest ? `${latest.label} vs prior` : 'No data',
            badge: latest ? latest.change_pct : null,
          },
        ];
      }

      // Yearly summary
      const items = yearlyComparison.value;
      const total = items.reduce((acc, i) => acc + Number(i.sales || 0), 0);
      const totalOrders = items.reduce((acc, i) => acc + Number(i.orders || 0), 0);
      const best = items.reduce((top, i) => (i.sales > (top?.sales ?? -1) ? i : top), null);
      const latest = items[items.length - 1] || null;
      return [
        {
          title: 'All-Years Revenue',
          value: `₱${formatCurrency(total)}`,
          sub: `${totalOrders} fulfilled orders`,
          badge: null,
        },
        {
          title: 'Best Year',
          value: best ? `₱${formatCurrency(best.sales)}` : '₱0.00',
          sub: best ? `Year ${best.label} (${best.orders} ord)` : 'No data',
          badge: null,
        },
        {
          title: latest ? `Year ${latest.label}` : 'Current Year',
          value: latest ? `₱${formatCurrency(latest.sales)}` : '₱0.00',
          sub: latest ? `Avg ticket ₱${formatCurrency(latest.avg_ticket)}` : 'No data',
          badge: latest ? latest.change_pct : null,
        },
        {
          title: 'Latest Channel Mix',
          value: latest ? `POS ₱${formatCompactCurrency(latest.pos_sales)}` : '₱0',
          sub: latest ? `Website: ₱${formatCurrency(latest.website_sales)}` : 'No data',
          badge: null,
        },
      ];
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
      barScrollRef,
      chartFitMode,
      setChartFitMode,
      chartMode,
      setChartMode,
      compareScope,
      setCompareScope,
      hoveredBarIndex,
      hoveredBar,
      toggleBar,
      onMouseLeaveBar,
      comparisonPeriod,
      comparisonBadgeLabel,
      comparisonSubtitle,
      comparisonSummaryCards,
      barChartItems,
      getBarHeight,
      activeItemCount,
      barContainerMinWidth,
      shouldShowBarLabel,
      formatCompactCurrency,
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
<style scoped>
.chart-swap-enter-active,
.chart-swap-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.chart-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.chart-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
