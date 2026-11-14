<template>
<div class="space-y-6 sm:space-y-8">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-book"></i> RECIPE & PORTION CALCULATION ENGINE
          </span>
          <h2 class="text-lg sm:text-2xl font-bold text-white mt-1">Product Recipes & Portions</h2>
          <p class="text-xs text-gray-400">
            Each menu item is composed of specific raw ingredients. The system automatically computes maximum portions and blocks orders if any ingredient is depleted.
          </p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Filter & Search Toolbar (Always Visible) -->
      <div class="p-3.5 sm:p-4 rounded-2xl bg-surface-850/80 border border-surface-700/70 space-y-3">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <!-- Category Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              @click="selectedCategory = cat"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5"
              :class="selectedCategory === cat
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold shadow-sm'
                : 'bg-surface-800/80 text-gray-400 hover:text-white border-surface-700/70'">
              <span>{{ cat }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-surface-900/80 text-gray-300 font-mono">
                {{ getCategoryCount(cat) }}
              </span>
            </button>
          </div>

          <!-- Search, Capacity Status & Sort Controls -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Search Input -->
            <div class="relative flex-1 sm:w-64 min-w-[180px]">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search recipe or ingredient..."
                class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs border border-surface-700 focus:outline-none focus:border-amber-500"
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                title="Clear search">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Capacity Status Filter -->
            <select
              v-model="statusFilter"
              class="px-3 py-2 rounded-xl bg-surface-800 text-gray-200 text-xs border border-surface-700 focus:outline-none focus:border-amber-500 cursor-pointer">
              <option value="all">All Capacities</option>
              <option value="healthy">Healthy (&gt; 8 portions)</option>
              <option value="low">Low (1–8 portions)</option>
              <option value="depleted">Depleted (0 portions)</option>
              <option value="no-recipe">No Recipe Linked</option>
            </select>

            <!-- Sort Order -->
            <select
              v-model="sortBy"
              class="px-3 py-2 rounded-xl bg-surface-800 text-gray-200 text-xs border border-surface-700 focus:outline-none focus:border-amber-500 cursor-pointer">
              <option value="default">Default Order</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="portions-asc">Capacity (Low to High)</option>
              <option value="portions-desc">Capacity (High to Low)</option>
            </select>

            <!-- Reset Filters -->
            <button
              v-if="hasActiveFilters"
              type="button"
              @click="resetFilters"
              class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-300 border border-surface-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
              <i class="pi pi-filter-slash text-[11px]"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div v-if="paginatedProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in paginatedProducts" 
          :key="product.id"
          class="p-3.5 sm:p-5 rounded-2xl bg-surface-800/90 border border-surface-700 flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-all">
          
          <div>
            <!-- Header: Title, Category, and Available Portions -->
            <div class="flex items-start justify-between gap-3 border-b border-surface-700/60 pb-3">
              <div>
                <span class="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-amber-400 text-xs shrink-0"><i class="pi pi-box"></i></span>
                <h3 class="text-base font-black text-white mt-1">{{ product.name }}</h3>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ product.category }} • ₱{{ Number(product.price).toFixed(2) }}</span>
              </div>

              <!-- Computed Portions Pill -->
              <div class="text-right">
                <span 
                  class="px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5"
                  :class="product.max_portions > 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (product.max_portions > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')">
                  {{ product.max_portions }} portions
                </span>
                <p class="text-[9px] text-gray-500 mt-0.5">Kitchen capacity</p>
              </div>
            </div>

            <!-- Recipe Ingredient Breakdown -->
            <div class="mt-4 space-y-2.5">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Required Raw Ingredients</span>
                <span class="text-[10px] font-normal text-gray-500">Per Portion</span>
              </p>

              <div v-if="product.recipes && product.recipes.length > 0" class="space-y-2 text-xs">
                <div 
                  v-for="rec in product.recipes" 
                  :key="rec.id"
                  class="p-2.5 rounded-xl bg-surface-900/60 border border-surface-700/50 flex items-center justify-between">
                  
                  <div>
                    <p class="font-bold text-white">
                      {{ rec.ingredient ? rec.ingredient.name : rec.ingredient_id }}
                    </p>
                    <p class="text-[10px] text-gray-400">
                      Recipe needs: <span class="text-brand-400 font-bold">{{ rec.qty }} {{ rec.ingredient ? rec.ingredient.unit : 'pcs' }}</span>
                    </p>
                  </div>

                  <!-- Stock indicator for this specific ingredient -->
                  <div class="text-right">
                    <span 
                      class="text-xs font-mono font-bold"
                      :class="rec.ingredient && rec.ingredient.stock >= rec.qty ? 'text-gray-300' : 'text-rose-400 font-black'">
                      {{ rec.ingredient ? rec.ingredient.stock : 0 }} in stock
                    </span>
                    <p v-if="rec.ingredient && rec.ingredient.stock < rec.qty" class="text-[9px] text-rose-400">
                      <i class="pi pi-exclamation-triangle mr-1 text-[9px]"></i>Depleted bottleneck!
                    </p>
                  </div>

                </div>
              </div>

              <div v-else class="text-center py-6 text-gray-500 text-xs italic">
                No recipe ingredients linked yet.
              </div>
            </div>
          </div>

          <!-- Quick Action to Restock Ingredients of this Dish -->
          <div class="pt-3 border-t border-surface-700/50 flex items-center justify-between text-xs">
            <span class="text-[10px] text-gray-500">Auto-deducted on checkout</span>
            <button 
              @click="store.adminTab = 'inventory'"
              class="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer">
              <span>Manage Stocks</span>
              <i class="pi pi-arrow-right text-[9px]"></i>
            </button>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-surface-800/40 rounded-2xl border border-surface-700/50">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-2xl mx-auto mb-3"><i class="pi pi-book"></i></div>
        <p class="text-base font-bold text-white">
          {{ (store.products || []).length === 0 ? 'No product recipes found' : 'No recipes match your filters' }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ (store.products || []).length === 0
            ? 'Add menu products and link raw ingredients to see portion calculations.'
            : 'Try adjusting your category, search query, or capacity filter.' }}
        </p>
        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="mt-4 px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-300 border border-surface-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer">
          <i class="pi pi-filter-slash text-xs"></i>
          <span>Reset Filters</span>
        </button>
      </div>

      <!-- Pagination & Footer Strip (Always Visible) -->
      <div class="px-4 sm:px-6 py-4 rounded-2xl bg-surface-900/90 border border-surface-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div class="flex flex-wrap items-center gap-3 text-gray-400">
          <div class="flex items-center gap-2">
            <i class="pi pi-book text-xs text-amber-400"></i>
            <span v-if="filteredProducts.length > 0">
              Showing <strong class="text-white">{{ (currentPage - 1) * pageSize + 1 }}</strong> to <strong class="text-white">{{ Math.min(currentPage * pageSize, filteredProducts.length) }}</strong> of <strong class="text-white">{{ filteredProducts.length }}</strong> recipes
            </span>
            <span v-else>No recipes to display</span>
          </div>

          <!-- Items Per Page Selector -->
          <div class="flex items-center gap-1.5 sm:pl-3 sm:border-l sm:border-surface-700/60">
            <span class="text-gray-400">Per page:</span>
            <select
              v-model.number="pageSize"
              class="bg-surface-800 text-white rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-amber-500 font-bold text-xs cursor-pointer">
              <option :value="6">6</option>
              <option :value="9">9</option>
              <option :value="12">12</option>
              <option :value="18">18</option>
              <option :value="24">24</option>
            </select>
          </div>
        </div>

        <!-- Pagination Controls (Always Visible) -->
        <div class="flex items-center gap-1.5 select-none">
          <button
            type="button"
            @click="prevPage"
            :disabled="currentPage <= 1"
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
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            title="Next Page">
            <span>Next</span>
            <i class="pi pi-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Recipes & Portion Breakdown Tab (THE INGREDIENT PROTOTYPE RECIPE ENGINE)
export default {
  name: 'AdminRecipesTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);

    // Filter & Sort State
    const selectedCategory = Vue.ref('All');
    const searchQuery = Vue.ref('');
    const statusFilter = Vue.ref('all');
    const sortBy = Vue.ref('default');

    // Pagination State
    const currentPage = Vue.ref(1);
    const pageSize = Vue.ref(6);

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchProducts();
        await store.fetchIngredients();
      } finally {
        loading.value = false;
      }
    };

    const categories = Vue.computed(() => {
      const set = new Set();
      (store.products || []).forEach(p => {
        if (p.category) set.add(p.category);
      });
      return ['All', ...Array.from(set)];
    });

    const getCategoryCount = (cat) => {
      const list = store.products || [];
      if (cat === 'All') return list.length;
      return list.filter(p => p.category === cat).length;
    };

    const hasActiveFilters = Vue.computed(() => {
      return (
        selectedCategory.value !== 'All' ||
        searchQuery.value.trim() !== '' ||
        statusFilter.value !== 'all' ||
        sortBy.value !== 'default'
      );
    });

    const resetFilters = () => {
      selectedCategory.value = 'All';
      searchQuery.value = '';
      statusFilter.value = 'all';
      sortBy.value = 'default';
      currentPage.value = 1;
    };

    const filteredProducts = Vue.computed(() => {
      let list = [...(store.products || [])];

      if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
      }

      if (statusFilter.value !== 'all') {
        list = list.filter(p => {
          const portions = Number(p.max_portions || 0);
          const hasRecipes = Array.isArray(p.recipes) && p.recipes.length > 0;
          if (statusFilter.value === 'healthy') return portions > 8;
          if (statusFilter.value === 'low') return portions > 0 && portions <= 8;
          if (statusFilter.value === 'depleted') return portions <= 0;
          if (statusFilter.value === 'no-recipe') return !hasRecipes;
          return true;
        });
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(p => {
          const ingredientNames = (p.recipes || [])
            .map(r => (r.ingredient ? r.ingredient.name : String(r.ingredient_id || '')))
            .join(' ');
          return (
            String(p.name || '').toLowerCase().includes(q) ||
            String(p.category || '').toLowerCase().includes(q) ||
            ingredientNames.toLowerCase().includes(q)
          );
        });
      }

      if (sortBy.value === 'name-asc') {
        list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
      } else if (sortBy.value === 'portions-asc') {
        list.sort((a, b) => Number(a.max_portions || 0) - Number(b.max_portions || 0));
      } else if (sortBy.value === 'portions-desc') {
        list.sort((a, b) => Number(b.max_portions || 0) - Number(a.max_portions || 0));
      }

      return list;
    });

    Vue.watch([selectedCategory, searchQuery, statusFilter, sortBy, pageSize], () => {
      currentPage.value = 1;
    });

    const totalPages = Vue.computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value)));

    Vue.watch(totalPages, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
    });

    const paginatedProducts = Vue.computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredProducts.value.slice(start, start + pageSize.value);
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

    return {
      store,
      loading,
      categories,
      selectedCategory,
      searchQuery,
      statusFilter,
      sortBy,
      hasActiveFilters,
      getCategoryCount,
      resetFilters,
      filteredProducts,
      paginatedProducts,
      currentPage,
      pageSize,
      totalPages,
      visiblePages,
      prevPage,
      nextPage,
      goToPage,
      refresh,
    };
  },
};
</script>
