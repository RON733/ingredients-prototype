<template>
<div class="space-y-6 sm:space-y-8">
      
      <!-- Top Header (Matches Figure 16) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-check-circle"></i> HISTORY & AUDITING
          </span>
          <h2 class="text-lg sm:text-2xl font-bold text-white mt-1">Completed Orders</h2>
          <p class="text-xs text-gray-400">
            Total completed: {{ completedOrders.length }} orders
            <span v-if="hasActiveFilters" class="text-emerald-400 font-semibold">
              ({{ filteredOrders.length }} matching filters)
            </span>
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
          <!-- Fulfillment Type Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <button
              v-for="typeOpt in ['All', 'Delivery', 'Pickup']"
              :key="typeOpt"
              type="button"
              @click="orderTypeFilter = typeOpt"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5"
              :class="orderTypeFilter === typeOpt
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                : 'bg-surface-800/80 text-gray-400 hover:text-white border-surface-700/70'">
              <span>{{ typeOpt }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-surface-900/80 text-gray-300 font-mono">
                {{ getOrderTypeCount(typeOpt) }}
              </span>
            </button>
          </div>

          <!-- Search, Payment, Date & Sort Controls -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Search Input -->
            <div class="relative flex-1 sm:w-64 min-w-[180px]">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search #, customer, item, rider..."
                class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs border border-surface-700 focus:outline-none focus:border-emerald-500"
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

            <!-- Payment Method Filter -->
            <select
              v-model="paymentFilter"
              class="px-3 py-2 rounded-xl bg-surface-800 text-gray-200 text-xs border border-surface-700 focus:outline-none focus:border-emerald-500 cursor-pointer">
              <option value="All">All Payments</option>
              <option v-for="pm in paymentMethods" :key="pm" :value="pm">{{ pm }}</option>
            </select>

            <!-- Date Range Filter -->
            <select
              v-model="dateFilter"
              class="px-3 py-2 rounded-xl bg-surface-800 text-gray-200 text-xs border border-surface-700 focus:outline-none focus:border-emerald-500 cursor-pointer">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <!-- Sort Order -->
            <select
              v-model="sortBy"
              class="px-3 py-2 rounded-xl bg-surface-800 text-gray-200 text-xs border border-surface-700 focus:outline-none focus:border-emerald-500 cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
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

      <!-- Completed Orders List (Matches Figure 16 Card Layout) -->
      <div v-if="paginatedOrders.length > 0" class="space-y-6">
        <div 
          v-for="order in paginatedOrders" 
          :key="order.id"
          class="p-3.5 sm:p-5 rounded-2xl bg-surface-800/90 border border-surface-700/80 space-y-6">
          
          <!-- Header: Order ID & Completed Badge -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-700/60 pb-4">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">ORDER {{ order.order_number }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Placed: {{ formatDate(order.created_at) }}</p>
              <p v-if="order.delivered_at || (order.order_type === 'Delivery' && order.status === 'Completed')" class="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <i class="pi pi-check-circle text-[10px]"></i>
                Delivered: {{ formatDate(order.delivered_at || order.updated_at) }}
              </p>
            </div>

            <span class="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              COMPLETED
            </span>
          </div>

          <!-- Customer & Address Block -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            <div class="md:col-span-5 bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50 space-y-1">
              <p class="text-[10px] text-gray-500 uppercase font-bold">Customer Details</p>
              <p class="text-sm font-bold text-white">{{ order.customer_name }}</p>
              <p class="text-gray-400 font-mono">{{ order.customer_phone }}</p>
              <p class="text-gray-400 leading-relaxed pt-1">{{ order.delivery_address || 'Store Pickup' }}</p>
            </div>

            <!-- Itemized List & Financial Totals -->
            <div class="md:col-span-7 space-y-2">
              <p class="text-[10px] text-gray-500 uppercase font-bold">Fulfilled Items</p>
              <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1 border-b border-surface-700/40">
                <span class="text-gray-300">
                  <span class="text-brand-400 font-bold">x{{ item.quantity }}</span> {{ item.product_name }}
                </span>
                <span class="text-white font-medium">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-xs text-gray-400 pt-2">
                <span>Fulfillment & Payment:</span>
                <span class="text-white font-bold">
                  {{ order.order_type }} • {{ order.payment_method }}
                  <span v-if="order.driver" class="text-sky-300 ml-1.5 font-semibold inline-flex items-center gap-1"><i class="pi pi-car text-[10px]"></i> {{ order.driver.name }}</span>
                </span>
              </div>

              <div class="flex justify-between text-base font-black text-white pt-2 border-t border-surface-700">
                <span>Total Amount:</span>
                <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-surface-800/40 rounded-2xl border border-surface-700/50">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3"><i class="pi pi-check-circle"></i></div>
        <p class="text-base font-bold text-white">
          {{ completedOrders.length === 0 ? 'No completed orders yet' : 'No completed orders match your filters' }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ completedOrders.length === 0
            ? 'Orders marked as completed in the kitchen will be preserved here.'
            : 'Try adjusting your search query, fulfillment type, payment method, or date range.' }}
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
            <i class="pi pi-check-circle text-xs text-emerald-400"></i>
            <span v-if="filteredOrders.length > 0">
              Showing <strong class="text-white">{{ (currentPage - 1) * pageSize + 1 }}</strong> to <strong class="text-white">{{ Math.min(currentPage * pageSize, filteredOrders.length) }}</strong> of <strong class="text-white">{{ filteredOrders.length }}</strong> completed orders
            </span>
            <span v-else>No completed orders to display</span>
          </div>

          <!-- Items Per Page Selector -->
          <div class="flex items-center gap-1.5 sm:pl-3 sm:border-l sm:border-surface-700/60">
            <span class="text-gray-400">Per page:</span>
            <select
              v-model.number="pageSize"
              class="bg-surface-800 text-white rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-emerald-500 font-bold text-xs cursor-pointer">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
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
            :class="currentPage === page ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold shadow-sm' : 'bg-surface-800 text-gray-300 border-surface-700 hover:bg-surface-700 hover:text-white'">
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

// G Shot Teas — Completed Orders Archive (Matches Figure 16)
export default {
  name: 'AdminCompletedTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);

    // Filter & Sort State
    const searchQuery = Vue.ref('');
    const orderTypeFilter = Vue.ref('All');
    const paymentFilter = Vue.ref('All');
    const dateFilter = Vue.ref('all');
    const sortBy = Vue.ref('newest');

    // Pagination State
    const currentPage = Vue.ref(1);
    const pageSize = Vue.ref(5);

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchOrders();
      } finally {
        loading.value = false;
      }
    };

    const completedOrders = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Completed');
    });

    const paymentMethods = Vue.computed(() => {
      const set = new Set();
      completedOrders.value.forEach(o => {
        if (o.payment_method) set.add(o.payment_method);
      });
      return Array.from(set).sort();
    });

    const getOrderTypeCount = (typeOpt) => {
      if (typeOpt === 'All') return completedOrders.value.length;
      return completedOrders.value.filter(o =>
        String(o.order_type || '').toLowerCase() === typeOpt.toLowerCase()
      ).length;
    };

    const hasActiveFilters = Vue.computed(() => {
      return (
        searchQuery.value.trim() !== '' ||
        orderTypeFilter.value !== 'All' ||
        paymentFilter.value !== 'All' ||
        dateFilter.value !== 'all' ||
        sortBy.value !== 'newest'
      );
    });

    const resetFilters = () => {
      searchQuery.value = '';
      orderTypeFilter.value = 'All';
      paymentFilter.value = 'All';
      dateFilter.value = 'all';
      sortBy.value = 'newest';
      currentPage.value = 1;
    };

    const filteredOrders = Vue.computed(() => {
      let list = [...completedOrders.value];

      if (orderTypeFilter.value !== 'All') {
        list = list.filter(o =>
          String(o.order_type || '').toLowerCase() === orderTypeFilter.value.toLowerCase()
        );
      }

      if (paymentFilter.value !== 'All') {
        list = list.filter(o => o.payment_method === paymentFilter.value);
      }

      if (dateFilter.value !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        list = list.filter(o => {
          const ts = new Date(o.delivered_at || o.updated_at || o.created_at).getTime();
          if (Number.isNaN(ts)) return false;
          if (dateFilter.value === 'today') return ts >= startOfToday;
          if (dateFilter.value === '7d') return ts >= now.getTime() - 7 * 86400000;
          if (dateFilter.value === '30d') return ts >= now.getTime() - 30 * 86400000;
          return true;
        });
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(o => {
          const itemsText = (o.items || []).map(i => i.product_name || '').join(' ');
          return (
            String(o.order_number || '').toLowerCase().includes(q) ||
            String(o.customer_name || '').toLowerCase().includes(q) ||
            String(o.customer_phone || '').toLowerCase().includes(q) ||
            String(o.delivery_address || '').toLowerCase().includes(q) ||
            String(o.driver?.name || '').toLowerCase().includes(q) ||
            itemsText.toLowerCase().includes(q)
          );
        });
      }

      list.sort((a, b) => {
        if (sortBy.value === 'oldest') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy.value === 'highest') {
          return Number(b.total_amount || 0) - Number(a.total_amount || 0);
        }
        if (sortBy.value === 'lowest') {
          return Number(a.total_amount || 0) - Number(b.total_amount || 0);
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });

      return list;
    });

    Vue.watch([searchQuery, orderTypeFilter, paymentFilter, dateFilter, sortBy, pageSize], () => {
      currentPage.value = 1;
    });

    const totalPages = Vue.computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / pageSize.value)));

    Vue.watch(totalPages, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
    });

    const paginatedOrders = Vue.computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredOrders.value.slice(start, start + pageSize.value);
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

    const formatDate = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return {
      store,
      loading,
      completedOrders,
      filteredOrders,
      paginatedOrders,
      searchQuery,
      orderTypeFilter,
      paymentFilter,
      dateFilter,
      sortBy,
      paymentMethods,
      hasActiveFilters,
      getOrderTypeCount,
      resetFilters,
      currentPage,
      pageSize,
      totalPages,
      visiblePages,
      prevPage,
      nextPage,
      goToPage,
      formatDate,
      refresh,
    };
  },
};
</script>
