<template>
<div class="space-y-4 sm:space-y-6">
      
      <!-- Top Header & Primary Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-box"></i> KITCHEN INGREDIENTS & LOYVERSE PROTOTYPE
          </span>
          <h2 class="text-lg sm:text-2xl font-bold text-white mt-1">Raw Ingredient Inventory</h2>
          <p class="text-xs text-gray-400">
            Real-time kitchen raw ingredient tracking synchronized with Loyverse Advanced Inventory (Purchase Orders, Adjustments & Productions).
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2" title="Loyverse POS & Kitchen Inventory are automatically synchronized in real time">
            <span class="w-2 h-2 rounded-full bg-emerald-400 "></span>
            <span>Loyverse Auto-Sync Active</span>
          </div>

          <button 
            @click="openAddModal"
            class="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95">
            <i class="pi pi-plus"></i>
            <span>Add Raw Ingredient</span>
          </button>
          
          <button 
            @click="refresh"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 hover:text-white border border-surface-700 text-xs transition-colors cursor-pointer"
            title="Refresh Stock">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- Loyverse Advanced Inventory Live Sync Banner -->
      <div class="p-4 sm:p-5 rounded-2xl bg-surface-900 border border-surface-700/80 shadow-md">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <i class="pi pi-check-circle text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-sm text-white">Loyverse Advanced Inventory Integration Active</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Store: GSHOT
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">
                Two-way live synchronization enabled. Stock adjustments, Purchase Orders, and Inventory Counts in Loyverse reflect here immediately.
              </p>
            </div>
          </div>

          <!-- Feature Pills -->
          <div class="flex items-center gap-2 flex-wrap text-[11px]">
            <span class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700/80 text-amber-300 flex items-center gap-1.5">
              <i class="pi pi-file-edit text-[10px]"></i> Purchase Orders
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700/80 text-sky-300 flex items-center gap-1.5">
              <i class="pi pi-sliders-h text-[10px]"></i> Stock Adjustments
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700/80 text-purple-300 flex items-center gap-1.5">
              <i class="pi pi-cog text-[10px]"></i> Productions
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700/80 text-emerald-300 flex items-center gap-1.5">
              <i class="pi pi-chart-line text-[10px]"></i> Valuation
            </span>
          </div>
        </div>
      </div>

      <!-- Ingredient KPI Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Tracked</p>
            <div class="w-8 h-8 rounded-xl bg-surface-800 border border-surface-700/60 flex items-center justify-center text-neutral-300">
              <i class="pi pi-box text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-white mt-2">{{ safeIngredients.length }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Raw inventory items</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Healthy Stocks</p>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i class="pi pi-check-circle text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">{{ healthyCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Optimal stock levels</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Low Warnings</p>
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
              <i class="pi pi-exclamation-circle text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">{{ lowCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Below safety threshold</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Depleted</p>
            <div class="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <i class="pi pi-times-circle text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-2">{{ depletedCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Menu items blocked</p>
        </div>
      </div>

      <!-- Category Filter Pills & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            v-for="cat in ['All', 'Bakery', 'Meat', 'Dairy', 'Produce']" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
            :class="selectedCategory === cat ? 'bg-amber-500 text-surface-950 font-black shadow-md' : 'bg-surface-800 text-gray-400 hover:text-white border border-surface-700/60'">
            <span>{{ cat }}</span>
            <span 
              class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              :class="selectedCategory === cat ? 'bg-black/20 text-surface-950' : 'bg-surface-700/80 text-gray-300'">
              {{ getCategoryCount(cat) }}
            </span>
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search ingredient..." 
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs border border-surface-700 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <!-- Raw Ingredients Table & Mobile Cards -->
      <div class="rounded-2xl bg-surface-800/90 border border-surface-700 overflow-hidden ">
        <!-- Desktop Table (hidden on mobile) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4 whitespace-nowrap">Ingredient Name</th>
                <th class="px-6 py-4 whitespace-nowrap">Category</th>
                <th class="px-6 py-4 whitespace-nowrap">Supplier</th>
                <th class="px-6 py-4 whitespace-nowrap">Current Stock & Cost</th>
                <th class="px-6 py-4 whitespace-nowrap">Expiration Date</th>
                <th class="px-6 py-4 whitespace-nowrap">Status</th>
                <th class="px-6 py-4 whitespace-nowrap">Loyverse Sync</th>
                <th class="px-6 py-4 whitespace-nowrap">Low Threshold</th>
                <th class="px-6 py-4 text-center whitespace-nowrap">Quick Restock</th>
                <th class="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              <tr 
                v-for="ing in paginatedIngredients" 
                :key="ing.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <!-- Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="getStatusDot(ing)"></span>
                    <div>
                      <p class="font-bold text-white text-sm">{{ ing.name }}</p>
                      <p class="text-[10px] text-gray-500 font-mono">{{ ing.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    :class="getCategoryBadge(ing.category)">
                    {{ ing.category }}
                  </span>
                </td>

                <!-- Supplier -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <div class="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <i class="pi pi-building text-[10px]"></i>
                    </div>
                    <div>
                      <p class="font-bold text-neutral-200 text-xs">{{ ing.supplier_name || 'Ferabby Mercantile Inc.' }}</p>
                      <span class="text-[9px] text-gray-400">Balibago, Santa Rosa</span>
                    </div>
                  </div>
                </td>

                <!-- Stock Level & Cost -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-base font-black text-white">
                    {{ ing.stock }}
                  </span>
                  <span class="text-gray-400 ml-1 font-medium">{{ ing.unit }}</span>
                  <span class="block text-[10px] text-amber-300 font-semibold mt-0.5">
                    ₱{{ Number(ing.cost || 0).toFixed(2) }} / {{ ing.unit }}
                  </span>
                </td>

                <!-- Expiration Date -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="ing.expiration_date" class="space-y-1">
                    <span class="font-mono text-xs text-white font-bold block">
                      {{ formatDate(ing.expiration_date) }}
                    </span>
                    <span 
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold"
                      :class="getExpiryBadge(ing.expiration_date)">
                      <i class="pi pi-clock text-[8px]"></i>
                      {{ getExpiryStatus(ing.expiration_date) }}
                    </span>
                  </div>
                  <span v-else class="text-gray-500 text-[11px] italic">Not set</span>
                </td>

                <!-- Status Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs"
                    :class="getStatusBadge(ing)">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getStatusDot(ing)"></span>
                    <span>{{ getStatusText(ing) }}</span>
                  </span>
                </td>

                <!-- Loyverse Sync Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <i class="pi pi-check text-[9px]"></i> Tracked
                  </span>
                </td>

                <!-- Threshold -->
                <td class="px-6 py-4 text-gray-400 whitespace-nowrap">
                  Min: <span class="text-white font-bold">{{ ing.low_threshold }}</span> {{ ing.unit }}
                </td>

                <!-- Quick Restock Actions -->
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 bg-surface-900 px-2 py-1 rounded-xl border border-surface-700">
                    <button 
                      @click="quickAdjust(ing, 10)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +10
                    </button>
                    <button 
                      @click="quickAdjust(ing, 25)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +25
                    </button>
                    <button 
                      @click="quickAdjust(ing, 50)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +50
                    </button>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="openEditModal(ing)"
                      class="p-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-200 transition-colors"
                      title="Edit stock or threshold">
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                    <button 
                      @click="deleteIngredient(ing)"
                      class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                      title="Delete ingredient">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>

              </tr>

              <!-- Empty State -->
              <tr v-if="paginatedIngredients.length === 0">
                <td colspan="10" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <i class="pi pi-box text-3xl text-gray-600"></i>
                    <p class="font-bold text-gray-400 text-sm">No raw ingredients found</p>
                    <p class="text-xs text-gray-500">Try selecting another category or clearing your search filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View (md:hidden) -->
        <div class="md:hidden divide-y divide-surface-700/60 p-3.5 space-y-3.5">
          <div 
            v-if="paginatedIngredients.length === 0" 
            class="py-10 text-center text-gray-500 space-y-2">
            <i class="pi pi-box text-3xl text-gray-600"></i>
            <p class="font-bold text-gray-400 text-sm">No raw ingredients found</p>
            <p class="text-xs text-gray-500">Try selecting another category or clearing your search filter.</p>
          </div>

          <div 
            v-for="ing in paginatedIngredients" 
            :key="'mobile-' + ing.id" 
            class="pt-3.5 first:pt-0 space-y-3">
            
            <!-- Card Header: Dot, Name, ID, Category & Status Badges -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="getStatusDot(ing)"></span>
                <div class="min-w-0">
                  <h4 class="font-bold text-white text-sm truncate">{{ ing.name }}</h4>
                  <p class="text-[10px] text-gray-500 font-mono">{{ ing.id }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="getCategoryBadge(ing.category)">
                  {{ ing.category }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="getStatusBadge(ing)">
                  {{ getStatusText(ing) }}
                </span>
              </div>
            </div>

            <!-- Details Grid: Stock, Cost, Threshold, Expiry -->
            <div class="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-surface-900/80 border border-surface-700/60 text-xs">
              <div>
                <span class="text-[10px] uppercase font-bold text-gray-400 block">Current Stock</span>
                <span class="text-base font-black text-white">{{ ing.stock }}</span>
                <span class="text-gray-400 text-xs ml-1">{{ ing.unit }}</span>
                <span class="block text-[10px] text-amber-300 font-semibold">₱{{ Number(ing.cost || 0).toFixed(2) }} / {{ ing.unit }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-gray-400 block">Safety Threshold</span>
                <span class="text-xs text-gray-300">Min: <strong class="text-white">{{ ing.low_threshold }}</strong> {{ ing.unit }}</span>
                <div v-if="ing.expiration_date" class="mt-1">
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" :class="getExpiryBadge(ing.expiration_date)">
                    <i class="pi pi-clock text-[8px]"></i> {{ getExpiryStatus(ing.expiration_date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Supplier & Restock Controls Row -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <div class="flex items-center gap-1 text-[11px] text-gray-400 min-w-0 truncate">
                <i class="pi pi-building text-[10px] text-amber-400 shrink-0"></i>
                <span class="truncate">{{ ing.supplier_name || 'Ferabby Mercantile' }}</span>
              </div>

              <!-- Quick Restock Buttons -->
              <div class="inline-flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-surface-700 shrink-0">
                <span class="text-[9px] font-bold text-gray-500 uppercase px-1">Restock:</span>
                <button 
                  @click="quickAdjust(ing, 10)"
                  class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all cursor-pointer">
                  +10
                </button>
                <button 
                  @click="quickAdjust(ing, 25)"
                  class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all cursor-pointer">
                  +25
                </button>
                <button 
                  @click="quickAdjust(ing, 50)"
                  class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all cursor-pointer">
                  +50
                </button>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex items-center justify-end gap-2 pt-1 border-t border-surface-700/40">
              <button 
                @click="openEditModal(ing)"
                class="px-3 py-1.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                <i class="pi pi-pencil text-xs"></i>
                <span>Edit</span>
              </button>
              <button 
                @click="deleteIngredient(ing)"
                class="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                <i class="pi pi-trash text-xs"></i>
                <span>Delete</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Pagination & Footer Strip -->
        <div class="px-6 py-4 bg-surface-900/90 border-t border-surface-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div class="flex flex-wrap items-center gap-3 text-gray-400">
            <div class="flex items-center gap-2">
              <i class="pi pi-box text-xs text-amber-400"></i>
              <span v-if="filteredIngredients.length > 0">
                Showing <strong class="text-white">{{ (currentPage - 1) * pageSize + 1 }}</strong> to <strong class="text-white">{{ Math.min(currentPage * pageSize, filteredIngredients.length) }}</strong> of <strong class="text-white">{{ filteredIngredients.length }}</strong> ingredients
              </span>
              <span v-else>No ingredients to display</span>
            </div>

            <!-- Items Per Page Selector -->
            <div v-if="filteredIngredients.length > 0" class="flex items-center gap-1.5 sm:pl-3 sm:border-l sm:border-surface-700/60">
              <span class="text-gray-400">Per page:</span>
              <select 
                v-model.number="pageSize" 
                class="bg-surface-800 text-white rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-amber-500 font-bold text-xs cursor-pointer">
                <option :value="6">6</option>
                <option :value="8">8</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="25">25</option>
              </select>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex items-center gap-1.5 select-none">
            <button 
              type="button"
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              title="Previous Page">
              <i class="pi pi-chevron-left text-[10px]"></i>
              <span>Prev</span>
            </button>

            <button 
              v-for="page in visiblePages" 
              :key="page"
              type="button"
              @click="goToPage(page)"
              class="w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer border"
              :class="currentPage === page ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold shadow-sm' : 'bg-surface-800 text-gray-300 border-surface-700 hover:bg-surface-700 hover:text-white'">
              {{ page }}
            </button>

            <button 
              type="button"
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              title="Next Page">
              <span>Next</span>
              <i class="pi pi-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Ingredient Modal -->
      <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
        <div class="w-full max-w-md max-h-[92vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl p-3.5 sm:p-5 space-y-4  animate-scale-up">
          <div class="flex justify-between items-center border-b border-surface-700 pb-3">
            <h3 class="text-lg font-black text-white">
              {{ isEditing ? 'Edit Ingredient' : 'Add Raw Ingredient' }}
            </h3>
            <button @click="modalOpen = false" class="text-gray-400 hover:text-white p-1 flex items-center justify-center cursor-pointer" aria-label="Close"><i class="pi pi-times text-sm"></i></button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-gray-400 mb-1">Ingredient Name</label>
              <input v-model="form.name" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="e.g. Grass Jelly" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Category</label>
                <select v-model="form.category" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white">
                  <option value="Bakery">Bakery</option>
                  <option value="Meat">Meat</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Produce">Produce</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Unit of Measure</label>
                <input v-model="form.unit" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="pcs / cups / scoops" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Current Stock</label>
                <input v-model.number="form.stock" type="number" min="0" step="any" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Low Threshold</label>
                <input v-model.number="form.low_threshold" type="number" min="0" step="any" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Unit Cost (₱)</label>
                <input v-model.number="form.cost" type="number" min="0" step="0.01" placeholder="0.00" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Supplier Name</label>
                <input v-model="form.supplier_name" placeholder="e.g. Ferabby Mercantile Inc." class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>

            <div>
              <label class="block text-gray-400 mb-1">Expiration Date</label>
              <input v-model="form.expiration_date" type="date" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-surface-700">
            <button @click="modalOpen = false" class="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
            <button @click="saveIngredient" class="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-surface-950 rounded-xl">
              {{ isEditing ? 'Save Stock' : 'Add Ingredient' }}
            </button>
          </div>
        </div>
      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Kitchen Inventory Management Tab (THE INGREDIENT PROTOTYPE CORE)
export default {
  name: 'AdminInventoryTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const isSyncingLoyverse = Vue.ref(false);
    const isPullingLoyverse = Vue.ref(false);
    const isPushingLoyverse = Vue.ref(false);
    const isFullSyncingLoyverse = Vue.ref(false);

    const handleSyncLoyverse = async () => {
      isSyncingLoyverse.value = true;
      try {
        await store.syncLoyverseSales();
      } finally {
        isSyncingLoyverse.value = false;
      }
    };

    const handlePullLoyverseInventory = async () => {
      isPullingLoyverse.value = true;
      try {
        await store.pullLoyverseInventory();
      } finally {
        isPullingLoyverse.value = false;
      }
    };

    const handleFullAdvancedSync = async () => {
      isFullSyncingLoyverse.value = true;
      try {
        await store.fullLoyverseSync();
      } finally {
        isFullSyncingLoyverse.value = false;
      }
    };

    const selectedCategory = Vue.ref('All');
    const searchQuery = Vue.ref('');

    const modalOpen = Vue.ref(false);
    const isEditing = Vue.ref(false);
    const editingId = Vue.ref(null);

    const form = Vue.reactive({
      name: '',
      category: 'Produce',
      unit: 'cups',
      stock: 20,
      cost: 0,
      supplier_name: 'Ferabby Mercantile Inc.',
      expiration_date: '',
      low_threshold: 5,
    });

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchIngredients();
        await store.fetchProducts();
      } finally {
        loading.value = false;
      }
    };

    const safeIngredients = Vue.computed(() => {
      return Array.isArray(store.ingredients) ? store.ingredients.filter(Boolean) : [];
    });

    const healthyCount = Vue.computed(() => {
      return safeIngredients.value.filter(i => Number(i.stock) > Number(i.low_threshold)).length;
    });

    const lowCount = Vue.computed(() => {
      return safeIngredients.value.filter(i => Number(i.stock) > 0 && Number(i.stock) <= Number(i.low_threshold)).length;
    });

    const depletedCount = Vue.computed(() => {
      return safeIngredients.value.filter(i => Number(i.stock) <= 0).length;
    });

    const filteredIngredients = Vue.computed(() => {
      let list = [...safeIngredients.value];
      if (selectedCategory.value !== 'All') {
        list = list.filter(i => i.category === selectedCategory.value);
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(i =>
          String(i.name || '').toLowerCase().includes(q) ||
          String(i.id || '').toLowerCase().includes(q)
        );
      }
      return list;
    });

    // Pagination State (default 8 items per page to keep the list clean and compact)
    const currentPage = Vue.ref(1);
    const pageSize = Vue.ref(8);

    // Reset pagination to page 1 on category, search, or page size changes
    Vue.watch([selectedCategory, searchQuery, pageSize], () => {
      currentPage.value = 1;
    });

    const totalPages = Vue.computed(() => Math.max(1, Math.ceil(filteredIngredients.value.length / pageSize.value)));

    const paginatedIngredients = Vue.computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredIngredients.value.slice(start, start + pageSize.value);
    });

    Vue.watch(totalPages, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
    });

    const visiblePages = Vue.computed(() => {
      const pages = [];
      const total = totalPages.value;
      const cur = currentPage.value;

      let start = Math.max(1, cur - 2);
      let end = Math.min(total, start + 4);
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const goToPage = (p) => {
      if (p >= 1 && p <= totalPages.value) {
        currentPage.value = p;
      }
    };

    const getCategoryCount = (cat) => {
      if (cat === 'All') return safeIngredients.value.length;
      return safeIngredients.value.filter(i => i.category === cat).length;
    };

    const getStatusText = (ing) => {
      if (ing.stock <= 0) return 'Depleted';
      if (ing.stock <= ing.low_threshold) return 'Low Stock';
      return 'In Stock';
    };

    const getStatusBadge = (ing) => {
      if (ing.stock <= 0) return 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-xs shadow-rose-950/40';
      if (ing.stock <= ing.low_threshold) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs ';
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs shadow-emerald-950/40';
    };

    const getStatusDot = (ing) => {
      if (ing.stock <= 0) return 'bg-rose-500';
      if (ing.stock <= ing.low_threshold) return 'bg-amber-400 ';
      return 'bg-emerald-400';
    };

    const getCategoryBadge = (cat) => {
      if (cat === 'Meat') return 'bg-red-950/60 text-red-400 border border-red-800/50';
      if (cat === 'Dairy') return 'bg-blue-950/60 text-blue-400 border border-blue-800/50';
      if (cat === 'Produce') return 'bg-green-950/60 text-green-400 border border-green-800/50';
      return 'bg-zinc-900 text-amber-400 border border-amber-800/50';
    };

    const quickAdjust = async (ing, amt) => {
      try {
        await GST_API.adjustIngredientStock(ing.id, amt);
        store.notify(`Added +${amt} ${ing.unit} to ${ing.name} (synced to Loyverse)`);
        refresh();
      } catch (err) {
        store.notify('Error updating stock', 'error');
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      form.name = '';
      form.category = 'Produce';
      form.unit = 'cups';
      form.stock = 25;
      form.cost = 0;
      form.supplier_name = 'Ferabby Mercantile Inc.';
      form.expiration_date = '';
      form.low_threshold = 8;
      modalOpen.value = true;
    };

    const openEditModal = (ing) => {
      isEditing.value = true;
      editingId.value = ing.id;
      form.name = ing.name;
      form.category = ing.category;
      form.unit = ing.unit;
      form.stock = ing.stock;
      form.cost = ing.cost || 0;
      form.supplier_name = ing.supplier_name || 'Ferabby Mercantile Inc.';
      form.expiration_date = ing.expiration_date ? String(ing.expiration_date).split('T')[0] : '';
      form.low_threshold = ing.low_threshold;
      modalOpen.value = true;
    };

    const parseExpiryDate = (dateStr) => {
      if (!dateStr) return null;
      const clean = String(dateStr).split('T')[0];
      const [year, month, day] = clean.split('-');
      if (!year || !month || !day) return null;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = parseExpiryDate(dateStr);
      if (!d) return String(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getExpiryStatus = (dateStr) => {
      const exp = parseExpiryDate(dateStr);
      if (!exp) return '';
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Expired';
      if (diffDays === 0) return 'Expires Today';
      if (diffDays <= 7) return diffDays + 'd left (Soon)';
      if (diffDays <= 30) return diffDays + 'd left';
      return 'Fresh';
    };

    const getExpiryBadge = (dateStr) => {
      const exp = parseExpiryDate(dateStr);
      if (!exp) return '';
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      if (diffDays <= 7) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    };

    const saveIngredient = async () => {
      if (!form.name.trim()) return;

      try {
        if (isEditing.value) {
          await GST_API.updateIngredient(editingId.value, { ...form });
          store.notify('Ingredient stock updated & synced with Loyverse!');
        } else {
          const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await GST_API.createIngredient({
            id: slug,
            ...form,
          });
          store.notify('New raw ingredient added & synced to Loyverse!');
        }
        modalOpen.value = false;
        refresh();
      } catch (err) {
        store.notify('Failed to save ingredient', 'error');
      }
    };

    const deleteIngredient = async (ing) => {
      if (!confirm(`Delete ${ing.name}? This will remove it from all linked recipes.`)) return;
      try {
        await GST_API.deleteIngredient(ing.id);
        store.notify(`${ing.name} removed from inventory`);
        refresh();
      } catch (err) {
        store.notify('Failed to delete ingredient', 'error');
      }
    };

    Vue.onMounted(() => {
      store.fetchIngredients();
    });

    Vue.onActivated(() => {
      store.fetchIngredients();
    });

    return {
      store,
      safeIngredients,
      loading,
      selectedCategory,
      searchQuery,
      modalOpen,
      isEditing,
      form,
      healthyCount,
      lowCount,
      depletedCount,
      filteredIngredients,
      paginatedIngredients,
      currentPage,
      pageSize,
      totalPages,
      visiblePages,
      prevPage,
      nextPage,
      goToPage,
      getCategoryCount,
      getStatusText,
      getStatusBadge,
      getStatusDot,
      getCategoryBadge,
      quickAdjust,
      openAddModal,
      openEditModal,
      saveIngredient,
      deleteIngredient,
      refresh,
      formatDate,
      getExpiryStatus,
      getExpiryBadge,
      isSyncingLoyverse,
      handleSyncLoyverse,
      isPullingLoyverse,
      handlePullLoyverseInventory,
      isPushingLoyverse,
      isFullSyncingLoyverse,
      handleFullAdvancedSync,
    };
  },
};
</script>
