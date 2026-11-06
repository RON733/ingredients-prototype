<template>
<div class="pt-4 sm:pt-8 pb-32 sm:pb-20 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 animate-fade-in">
      
      <!-- Back to Store / Menu Button & Refresh Header -->
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <button 
          @click="backToHome"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-xs font-semibold text-gray-300 hover:text-white border border-surface-700/60 transition-colors shadow-sm cursor-pointer">
          <i class="pi pi-arrow-left text-[11px]"></i>
          <span>Back to Store</span>
        </button>

        <button 
          @click="loadOrders(true)"
          :disabled="isLoading"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-xs font-semibold text-gray-300 hover:text-white border border-surface-700/60 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          title="Refresh orders">
          <i class="pi pi-sync text-[11px]" :class="{ 'animate-spin text-yellow-400': isLoading }"></i>
          <span class="hidden xs:inline">{{ isLoading ? 'Refreshing...' : 'Refresh' }}</span>
        </button>
      </div>

      <!-- Section Title & Counter (Matches Figure 13 + Mobile Enhancements) -->
      <div class="text-center mb-6 sm:mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-yellow-400 text-[11px] font-bold uppercase tracking-wider mb-2">
          <i class="pi pi-history text-xs"></i>
          <span>Your Orders</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight">Order History</h2>
        <p class="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
          View, track live fulfillment status, and quickly reorder your favorite items
        </p>
      </div>

      <!-- User Account Context Bar -->
      <div class="mb-5 p-3 sm:p-4 rounded-2xl bg-surface-900/90 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div class="flex items-center gap-3">
          <div v-if="store.user" class="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-yellow-400 text-sm overflow-hidden shrink-0">
            <img v-if="store.user.avatar" :src="store.user.avatar" class="w-full h-full object-cover" />
            <span v-else>{{ (store.user.name || 'U').charAt(0).toUpperCase() }}</span>
          </div>
          <div v-else class="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-gray-400 text-sm shrink-0">
            <i class="pi pi-user"></i>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white truncate">
                {{ store.user ? store.user.name : 'Guest Customer' }}
              </span>
              <span 
                class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                :class="store.user ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-surface-700 text-gray-300 border border-surface-600'">
                {{ store.user ? (store.user.role || 'Member') : 'Device Session' }}
              </span>
            </div>
            <p class="text-[11px] text-gray-400 truncate">
              {{ store.user ? (store.user.email || store.user.phone || 'Signed in account') : 'Orders placed on this device are automatically tracked here' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button 
            v-if="!store.user"
            @click="store.authModalOpen = true"
            class="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
            <i class="pi pi-sign-in text-[11px]"></i>
            <span>Sign In / Register</span>
          </button>
          <span v-else class="text-[11px] text-gray-400 font-medium">
            {{ allCustomerOrders.length }} total order{{ allCustomerOrders.length === 1 ? '' : 's' }}
          </span>
        </div>
      </div>

      <!-- Quick Filter Pills & Search Bar (Mobile-Optimized) -->
      <div class="mb-6 space-y-3">
        <!-- Horizontal Scrollable Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button 
            @click="activeFilter = 'all'"
            class="px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeFilter === 'all' ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <span>All</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="activeFilter === 'all' ? 'bg-black/20 text-black' : 'bg-surface-700 text-gray-300'">
              {{ allCustomerOrders.length }}
            </span>
          </button>

          <button 
            @click="activeFilter = 'active'"
            class="px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeFilter === 'active' ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="activeFilter === 'active' ? 'bg-black/20 text-black' : 'bg-surface-700 text-gray-300'">
              {{ ongoingCount }}
            </span>
          </button>

          <button 
            @click="activeFilter = 'completed'"
            class="px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeFilter === 'completed' ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <span>Completed</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="activeFilter === 'completed' ? 'bg-black/20 text-black' : 'bg-surface-700 text-gray-300'">
              {{ completedCount }}
            </span>
          </button>

          <button 
            @click="activeFilter = 'cancelled'"
            class="px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
            :class="activeFilter === 'cancelled' ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20' : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <span>Cancelled</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="activeFilter === 'cancelled' ? 'bg-black/20 text-black' : 'bg-surface-700 text-gray-300'">
              {{ cancelledCount }}
            </span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="localSearch" 
            type="text" 
            placeholder="Search by Order # or item name..." 
            class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-900 border border-surface-700/70 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors" />
          <button 
            v-if="localSearch" 
            @click="localSearch = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 text-xs">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div v-if="customerOrders.length > 0" class="space-y-4 sm:space-y-6">
        <div 
          v-for="order in customerOrders" 
          :key="order.id"
          class="rounded-2xl sm:rounded-3xl bg-surface-900/90 border border-surface-800 p-4 sm:p-6 space-y-4 shadow-xl hover:border-yellow-400/40 transition-all">
          
          <!-- Card Header (Order # and Status Badge) -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-800/80 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-black text-white tracking-tight">ORDER {{ order.order_number }}</span>
                <button 
                  @click="copyOrderNumber(order.order_number)" 
                  class="p-1 rounded text-gray-400 hover:text-yellow-400 transition-colors text-xs cursor-pointer" 
                  title="Copy Order Number">
                  <i class="pi pi-copy text-[11px]"></i>
                </button>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(order.created_at) }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              <span 
                class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border"
                :class="getStatusBadgeClass(order.status)">
                <i :class="getStatusIcon(order.status)" class="text-[10px]"></i>
                <span>{{ order.status }}</span>
              </span>
            </div>
          </div>

          <!-- Metadata Chips (Type, Payment, Driver) -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <!-- Order Type -->
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800 border border-surface-700/60 text-gray-300">
              <i :class="order.order_type === 'Delivery' ? 'pi pi-send text-emerald-400' : 'pi pi-home text-yellow-400'" class="text-[11px]"></i>
              <span class="font-semibold">{{ order.order_type || 'Dine-In' }}</span>
            </div>

            <!-- Payment Method -->
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800 border border-surface-700/60 text-gray-300">
              <i class="pi pi-wallet text-brand-400 text-[11px]"></i>
              <span class="font-medium">{{ order.payment_method }}</span>
              <span 
                v-if="order.payment_status" 
                class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase"
                :class="order.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'">
                {{ order.payment_status }}
              </span>
            </div>

            <!-- Driver Info if assigned -->
            <div v-if="order.driver" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <i class="pi pi-compass text-[11px]"></i>
              <span class="font-medium">Rider: {{ order.driver.name }}</span>
              <a 
                v-if="order.driver.phone" 
                :href="'tel:' + order.driver.phone" 
                class="underline text-[10px] ml-1 font-bold hover:text-white"
                title="Call Driver">
                {{ order.driver.phone }}
              </a>
            </div>
          </div>

          <!-- Items Ordered Grid -->
          <div class="bg-surface-950/60 p-3.5 sm:p-4 rounded-xl border border-surface-800/80 space-y-2">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ITEMS ORDERED</p>
            <div v-for="item in order.items" :key="item.id" class="space-y-0.5 border-b border-surface-800/40 pb-2 last:border-0 last:pb-0">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-gray-200 font-medium">
                  <span class="text-yellow-400 font-black mr-1">x{{ item.quantity }}</span> {{ item.product_name }}
                </span>
                <span class="text-white font-bold">?{{ Number(item.subtotal || (item.unit_price * item.quantity)).toFixed(2) }}</span>
              </div>
              <div v-if="item.customization" class="text-[11px] text-gray-400 pl-5">
                {{ formatCustomization(item.customization) }}
              </div>
            </div>
          </div>

          <!-- Delivery Address & Notes (if delivery) -->
          <div v-if="order.order_type === 'Delivery' && order.delivery_address" class="text-[11px] text-gray-400 flex items-start gap-1.5">
            <i class="pi pi-map-marker text-rose-400 text-xs mt-0.5 shrink-0"></i>
            <span class="break-words">Deliver to: <strong class="text-gray-200">{{ order.delivery_address }}</strong></span>
          </div>

          <!-- Price Summary & Footer Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-800">
            <!-- Price Summary -->
            <div class="flex items-center gap-3 text-xs">
              <div v-if="Number(order.delivery_fee) > 0" class="text-gray-400">
                <span>Delivery: </span>
                <span class="text-gray-200 font-semibold">?{{ Number(order.delivery_fee).toFixed(2) }}</span>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-gray-400 text-[11px] uppercase font-bold tracking-wider">Total:</span>
                <span class="text-base sm:text-lg font-black text-yellow-400">?{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Footer Action Buttons (Touch Friendly) -->
            <div class="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <button 
                @click="trackThisOrder(order)"
                class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                :class="isOrderOngoing(order.status) 
                  ? 'bg-yellow-400 text-black font-black hover:bg-yellow-300 shadow-md shadow-yellow-400/20' 
                  : 'bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700'">
                <i class="pi pi-map-marker text-[11px]"></i>
                <span>{{ isOrderOngoing(order.status) ? 'Track Live' : 'View Tracker' }}</span>
              </button>

              <button 
                @click="reorder(order)"
                class="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-yellow-400/10 hover:bg-yellow-400 text-yellow-400 hover:text-black border border-yellow-400/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <i class="pi pi-replay text-[11px]"></i>
                <span>Reorder Items</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 sm:py-16 bg-surface-900/60 rounded-3xl border border-surface-800 p-6 sm:p-8 space-y-4">
        <div class="w-16 h-16 rounded-3xl bg-surface-800/80 border border-surface-700 flex items-center justify-center mx-auto text-3xl text-yellow-400 shadow-inner">
          ??
        </div>

        <div class="max-w-sm mx-auto">
          <h3 class="text-base sm:text-lg font-bold text-white">
            {{ localSearch || activeFilter !== 'all' ? 'No orders match your filter' : 'No previous orders found' }}
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            {{ localSearch || activeFilter !== 'all' 
              ? 'Try resetting your filter or search keywords to view all orders.' 
              : 'Discover our delicious milk teas, fruity floats, espresso drinks, and hot snacks!' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button 
            v-if="localSearch || activeFilter !== 'all'"
            @click="localSearch = ''; activeFilter = 'all'"
            class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold border border-surface-700 cursor-pointer">
            Reset Filters
          </button>
          
          <button 
            @click="backToHome"
            class="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-lg shadow-yellow-500/20 cursor-pointer">
            Explore Menu
          </button>
        </div>

        <!-- Guest Order Lookup Tool (Find by Phone or Order #) -->
        <div v-if="!store.user && !localSearch && activeFilter === 'all'" class="mt-8 pt-6 border-t border-surface-800/80 max-w-md mx-auto text-left space-y-2">
          <p class="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <i class="pi pi-search text-brand-400"></i>
            <span>Looking for an order placed on another phone?</span>
          </p>
          <p class="text-[11px] text-gray-400">
            Enter your mobile number or Order Reference number to look up your order status.
          </p>
          <div class="flex items-center gap-2 pt-1">
            <input 
              v-model="guestLookup"
              @keyup.enter="searchGuestOrders"
              type="text" 
              placeholder="e.g. 09123456789 or GST-..." 
              class="flex-1 px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
            <button 
              @click="searchGuestOrders" 
              :disabled="isSearchingGuest || !guestLookup.trim()"
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-yellow-400 border border-yellow-400/40 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer">
              {{ isSearchingGuest ? 'Searching...' : 'Find Order' }}
            </button>
          </div>
        </div>

      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas ? Customer Order History Component (Matches Figure 13 + Mobile Enhancements)
export default {
  name: 'OrderHistoryView',
  setup() {
    const store = useGShotStore();
    const isLoading = Vue.ref(false);
    const activeFilter = Vue.ref('all'); // 'all' | 'active' | 'completed' | 'cancelled'
    const localSearch = Vue.ref('');
    const guestLookup = Vue.ref('');
    const guestSearchedOrders = Vue.ref([]);
    const isSearchingGuest = Vue.ref(false);

    const getLocalOrderIds = () => {
      try {
        const list = JSON.parse(localStorage.getItem('gst_local_order_history') || '[]');
        const activeId = localStorage.getItem('gst_active_order_id');
        if (activeId && !list.includes(String(activeId)) && !list.includes(Number(activeId))) {
          list.unshift(String(activeId));
        }
        return list.map(id => String(id));
      } catch (e) {
        return [];
      }
    };

    const loadOrders = async (silent = false) => {
      if (!silent) isLoading.value = true;
      try {
        const params = store.user?.id ? { user_id: store.user.id } : {};
        await store.fetchOrders(params);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        isLoading.value = false;
      }
    };

    Vue.onMounted(() => {
      loadOrders();
    });

    const isOrderOngoing = (status) => {
      return ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(status);
    };

    // All customer orders belonging to the active user or local device session
    const allCustomerOrders = Vue.computed(() => {
      const localIds = getLocalOrderIds();
      const user = store.user;
      
      const allPool = [...(store.orders || [])];
      guestSearchedOrders.value.forEach(gOrder => {
        if (!allPool.some(o => o.id === gOrder.id)) {
          allPool.push(gOrder);
        }
      });

      let matched = [];
      if (user) {
        matched = allPool.filter(o => {
          const matchesUserId = o.user_id && Number(o.user_id) === Number(user.id);
          const matchesName = o.customer_name && user.name && o.customer_name.trim().toLowerCase() === user.name.trim().toLowerCase();
          const matchesPhone = o.customer_phone && user.phone && o.customer_phone.trim() === user.phone.trim();
          const matchesEmail = o.customer_email && user.email && o.customer_email.trim().toLowerCase() === user.email.trim().toLowerCase();
          const matchesLocal = localIds.includes(String(o.id)) || localIds.includes(String(o.order_number));
          return matchesUserId || matchesName || matchesPhone || matchesEmail || matchesLocal;
        });
      } else {
        // Guest mode: only orders placed from this device or explicitly searched
        if (localIds.length > 0 || guestSearchedOrders.value.length > 0) {
          matched = allPool.filter(o => {
            const matchesLocal = localIds.includes(String(o.id)) || localIds.includes(String(o.order_number));
            const matchesSearch = guestSearchedOrders.value.some(g => g.id === o.id);
            return matchesLocal || matchesSearch;
          });
        } else {
          matched = [];
        }
      }

      matched.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return matched;
    });

    const ongoingCount = Vue.computed(() => {
      return allCustomerOrders.value.filter(o => isOrderOngoing(o.status)).length;
    });

    const completedCount = Vue.computed(() => {
      return allCustomerOrders.value.filter(o => o.status === 'Completed').length;
    });

    const cancelledCount = Vue.computed(() => {
      return allCustomerOrders.value.filter(o => o.status === 'Cancelled').length;
    });

    // Filtered orders after filter tab and search query
    const customerOrders = Vue.computed(() => {
      let filtered = allCustomerOrders.value;

      if (activeFilter.value === 'active') {
        filtered = filtered.filter(o => isOrderOngoing(o.status));
      } else if (activeFilter.value === 'completed') {
        filtered = filtered.filter(o => o.status === 'Completed');
      } else if (activeFilter.value === 'cancelled') {
        filtered = filtered.filter(o => o.status === 'Cancelled');
      }

      if (localSearch.value && localSearch.value.trim()) {
        const q = localSearch.value.trim().toLowerCase();
        filtered = filtered.filter(o => {
          const num = (o.order_number || '').toLowerCase();
          const type = (o.order_type || '').toLowerCase();
          const itemsStr = (o.items || []).map(i => i.product_name).join(' ').toLowerCase();
          return num.includes(q) || type.includes(q) || itemsStr.includes(q);
        });
      }

      return filtered;
    });

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

    const formatCustomization = (cust) => {
      if (!cust) return '';
      let c = cust;
      if (typeof c === 'string') {
        try {
          c = JSON.parse(c);
        } catch (e) {
          return c;
        }
      }
      const parts = [];
      if (c.size) parts.push(`Size: ${c.size}`);
      if (c.sugar) parts.push(`Sugar: ${c.sugar}`);
      if (c.ice) parts.push(`Ice: ${c.ice}`);
      if (c.toppings && Array.isArray(c.toppings) && c.toppings.length) {
        parts.push(`Toppings: ${c.toppings.join(', ')}`);
      }
      return parts.join(' ? ');
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Completed':
          return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'Out for Delivery':
          return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse';
        case 'Ready for Pickup':
          return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        case 'Preparing':
          return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
        case 'Pending':
          return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40';
        case 'Cancelled':
          return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        default:
          return 'bg-surface-700 text-gray-300 border-surface-600';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Completed': return 'pi pi-check-circle';
        case 'Out for Delivery': return 'pi pi-send';
        case 'Ready for Pickup': return 'pi pi-box';
        case 'Preparing': return 'pi pi-spin pi-spinner';
        case 'Pending': return 'pi pi-clock';
        case 'Cancelled': return 'pi pi-times-circle';
        default: return 'pi pi-info-circle';
      }
    };

    const copyOrderNumber = (num) => {
      if (!num) return;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(num);
        store.notify(`Copied ${num} to clipboard!`, 'info');
      }
    };

    const backToHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const trackThisOrder = (ord) => {
      store.activeOrder = ord;
      localStorage.setItem('gst_active_order_id', ord.id);
      store.currentView = 'track';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const reorder = (ord) => {
      if (!ord?.items?.length) return;
      ord.items.forEach(item => {
        const product = store.products.find(p => p.id === item.product_id) || {
          id: item.product_id,
          name: item.product_name,
          price: item.unit_price,
          category: 'Drinks',
        };
        let parsedCustomization = null;
        if (item.customization) {
          if (typeof item.customization === 'string') {
            try {
              parsedCustomization = JSON.parse(item.customization);
            } catch (e) {
              parsedCustomization = item.customization;
            }
          } else {
            parsedCustomization = item.customization;
          }
        }
        store.addToCart(product, parsedCustomization);
      });
      store.cartOpen = true;
      store.notify(`Re-added ${ord.items.length} item(s) to your cart!`, 'success');
    };

    const searchGuestOrders = async () => {
      const query = guestLookup.value.trim();
      if (!query) return;
      isSearchingGuest.value = true;
      try {
        const res = await GST_API.getOrders({ search: query });
        const results = res.data?.data || res.data || [];
        if (results.length > 0) {
          guestSearchedOrders.value = results;
          const localIds = getLocalOrderIds();
          results.forEach(r => {
            if (!localIds.includes(String(r.id))) {
              localIds.unshift(String(r.id));
            }
          });
          localStorage.setItem('gst_local_order_history', JSON.stringify(localIds.slice(0, 50)));
          store.notify(`Found ${results.length} order(s)!`, 'success');
        } else {
          store.notify('No orders found matching that inquiry.', 'warning');
        }
      } catch (err) {
        store.notify('Could not search orders. Please try again.', 'error');
      } finally {
        isSearchingGuest.value = false;
      }
    };

    return {
      store,
      isLoading,
      activeFilter,
      localSearch,
      guestLookup,
      isSearchingGuest,
      allCustomerOrders,
      customerOrders,
      ongoingCount,
      completedCount,
      cancelledCount,
      isOrderOngoing,
      formatDate,
      formatCustomization,
      getStatusBadgeClass,
      getStatusIcon,
      copyOrderNumber,
      backToHome,
      trackThisOrder,
      reorder,
      searchGuestOrders,
      loadOrders,
    };
  },
};
</script>
