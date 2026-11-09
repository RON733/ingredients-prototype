<template>
<div class="space-y-8">
      
      <!-- Top Header & Walk-in Cashier Mode Button -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Live Orders Feed</span>
          </div>
          <h2 class="text-2xl font-black text-white tracking-tight">Active Orders</h2>
          <p class="text-xs text-neutral-400 mt-0.5">Monitor and manage incoming store and delivery orders in real time.</p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2" title="Loyverse POS sales automatically sync every minute in the background">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="hidden sm:inline">POS Auto-Sync Active</span>
          </div>

          <button 
            v-if="store.isAdminOrSuper"
            @click="store.adminTab = 'settings'"
            class="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface-800 hover:bg-surface-750 text-neutral-200 border border-surface-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            title="Manage Store GCash QR Code & Number">
            <i class="pi pi-qrcode text-sky-400"></i>
            <span class="hidden sm:inline">GCash QR</span>
          </button>


          <button 
            @click="refresh"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 hover:text-white border border-surface-700 text-xs transition-colors cursor-pointer"
            title="Refresh Orders">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Active</p>
            <div class="w-8 h-8 rounded-xl bg-surface-800 border border-surface-700/60 flex items-center justify-center text-neutral-300">
              <i class="pi pi-list text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-white mt-2">{{ activeOrders.length }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Orders in progress</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pending Orders</p>
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
              <i class="pi pi-clock text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">{{ pendingOrdersCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Awaiting kitchen accept</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Preparing</p>
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
              <i class="pi pi-spin pi-spinner text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">{{ preparingOrdersCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Kitchen in preparation</p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-surface-850/80 border border-surface-750/70 hover:border-surface-700 transition-all shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Completed Today</p>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i class="pi pi-check-circle text-xs"></i>
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">{{ completedOrdersCount }}</p>
          <p class="text-[11px] text-neutral-400/80 mt-1">Fulfilled today</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-surface-900/80 border border-surface-750/70 rounded-xl max-w-full overflow-x-auto no-scrollbar touch-pan-x">
        <button 
          v-for="st in statusFilters" 
          :key="st.key"
          @click="selectedFilter = st.key"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
          :class="selectedFilter === st.key 
            ? 'bg-surface-750 text-white shadow-sm' 
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/40'">
          <span>{{ st.label }}</span>
          <span 
            v-if="getFilterCount(st.key) > 0" 
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
            :class="selectedFilter === st.key ? 'bg-amber-500/20 text-amber-300' : 'bg-surface-800 text-neutral-400'">
            {{ getFilterCount(st.key) }}
          </span>
        </button>
      </div>

      <!-- Pending Rider Notice Alert Banner (Alerts Kitchen Staff & Admins) -->
      <div 
        v-if="pendingRiderNotices.length > 0" 
        class="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs shadow-xl space-y-2.5 animate-fade-in">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            <span class="font-extrabold text-sm text-white">
              {{ pendingRiderNotices.length }} Delivery Rider {{ pendingRiderNotices.length === 1 ? 'Notice' : 'Notices' }} Awaiting Acceptance
            </span>
          </div>
          <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Action Required
          </span>
        </div>
        <div class="space-y-2 pt-1">
          <div 
            v-for="notice in pendingRiderNotices" 
            :key="notice.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-surface-900/80 border border-amber-500/30">
            <div>
              <p class="font-bold text-white text-xs">
                🛵 {{ notice.driver_name || 'Rider' }}: 
                <span class="text-amber-300 font-medium">"{{ notice.reason }}"</span>
              </p>
              <p class="text-[10px] text-gray-400 mt-0.5">
                Rider requested to be flagged unavailable. Orders will not be dispatched to him once accepted.
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button 
                v-if="notice.proof_image"
                type="button" 
                @click="ordersProofLightbox = notice.proof_image"
                class="px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-amber-300 border border-surface-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                <i class="pi pi-image text-[10px]"></i> Proof
              </button>
              <button 
                type="button" 
                @click="handleAcceptNotice(notice.id)"
                class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shadow-md flex items-center gap-1 cursor-pointer">
                <i class="pi pi-check text-xs font-black"></i>
                <span>Accept Notice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders List / Cards (Matches Figure 14) -->
      <div v-if="filteredOrders.length > 0" class="space-y-4">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="p-6 rounded-3xl bg-surface-800/80 border border-surface-700/70 hover:border-surface-600 transition-all shadow-xl space-y-4">
          
          <!-- Order Title, Customer Name, and Current Status -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-700/60 pb-4">
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <span class="text-xl font-black text-white">{{ order.order_number }}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0"
                :class="order.order_type === 'Delivery' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'">
                {{ order.order_type }}
              </span>
              <span v-if="order.source === 'loyverse_pos' || (order.order_number && order.order_number.startsWith('LV-'))" class="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <i class="pi pi-bolt text-[10px]"></i> Loyverse POS
              </span>
              <span v-if="order.driver" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1 shrink-0">
                <i class="pi pi-send text-[10px]"></i> {{ order.driver.name }}
              </span>
              <span class="text-xs text-gray-400 shrink-0">
                &bull; {{ formatTime(order.created_at) }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <!-- Payment Status Badge -->
              <span 
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                :class="order.payment_status === 'Verified' || order.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'">
                {{ order.payment_method }}: {{ order.payment_status }}
              </span>

              <!-- Status Badge -->
              <span 
                class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                :class="getStatusBadge(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Customer Details & Order Items Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <!-- Customer Info (Matches Figure 14: Customer details block) -->
            <div class="md:col-span-5 bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50 text-xs space-y-1.5">
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Customer Details</p>
              <p class="text-sm font-bold text-white">{{ order.customer_name }}</p>
              <p class="text-gray-400 font-mono"><i class="pi pi-phone text-[10px] text-brand-400 mr-1"></i>{{ order.customer_phone }}</p>
              <p v-if="order.delivery_address" class="text-gray-400 leading-relaxed">
                <i class="pi pi-map-marker text-[10px] text-brand-400 mr-1"></i>{{ order.delivery_address }}
              </p>
              <p v-if="order.gcash_ref" class="text-sky-400 font-mono font-semibold pt-1">
                GCash Ref: {{ order.gcash_ref }}
              </p>
              <div v-if="order.proof_image" class="pt-1.5">
                <button 
                  type="button"
                  @click="selectedReceiptImage = order.proof_image" 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[11px] font-bold border border-sky-500/40 transition-colors cursor-pointer">
                  <i class="pi pi-image text-xs"></i>
                  <span>View Receipt Screenshot</span>
                </button>
              </div>
              <p v-if="order.notes" class="text-gray-400 italic pt-1">
                Note: "{{ order.notes }}"
              </p>
            </div>

            <!-- Items Ordered -->
            <div class="md:col-span-7 space-y-2 text-xs">
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Order Items</p>
              <div v-for="item in order.items" :key="item.id" class="flex justify-between py-1.5 border-b border-surface-700/40">
                <div>
                  <span class="font-bold text-white">{{ item.quantity }}x {{ item.product_name }}</span>
                  <span v-if="item.customization?.size" class="text-[10px] text-brand-400 ml-1.5">
                    ({{ item.customization.size }}<span v-if="item.customization.sugar">, {{ item.customization.sugar }} sugar</span>)
                  </span>
                </div>
                <span class="font-bold text-gray-300">₱{{ Number(item.subtotal).toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-sm font-black text-white pt-2">
                <span>Total Amount:</span>
                <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>

          </div>

          <!-- Workflow Action Buttons (Staff & Admin Controls) -->
          <div class="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 border-t border-surface-700/50">
            <!-- Verify Payment button if GCash pending -->
            <button 
              v-if="order.payment_method === 'GCash' && order.payment_status !== 'Verified'"
              @click="verifyPayment(order)"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i class="pi pi-check"></i>
              <span>Verify GCash Payment</span>
            </button>

            <!-- State Transitions -->
            <button 
              v-if="order.status === 'Pending'"
              @click="updateStatus(order, 'Preparing')"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95">
              <i class="pi pi-play"></i>
              <span>Start Preparing</span>
            </button>

            <!-- If Preparing: Delivery orders trigger Dispatch Modal; Store Pickup triggers Ready for Pickup -->
            <button 
              v-if="order.status === 'Preparing' && order.order_type === 'Delivery'"
              @click="openDispatchModal(order)"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i class="pi pi-send"></i>
              <span>Dispatch Rider</span>
            </button>

            <button 
              v-else-if="order.status === 'Preparing'"
              @click="updateStatus(order, 'Ready for Pickup')"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i class="pi pi-check"></i>
              <span>Mark Ready for Pickup</span>
            </button>

            <!-- Complete Order: ONLY for Store Pickup / Walk-in! -->
            <button 
              v-if="(order.status === 'Preparing' || order.status === 'Ready for Pickup') && order.order_type !== 'Delivery'"
              @click="updateStatus(order, 'Completed')"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i class="pi pi-check-circle"></i>
              <span>Complete Order</span>
            </button>

            <!-- When a Delivery order is Out for Delivery: locked for staff! Only the assigned rider can complete it! -->
            <div 
              v-if="order.order_type === 'Delivery' && order.status === 'Out for Delivery'"
              class="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[11px] font-bold flex items-center justify-center gap-2">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <i class="pi pi-send text-xs"></i><span>Dispatched to {{ order.driver?.name || 'Rider' }} &bull; Awaiting Rider Completion</span>
            </div>

            <button 
              v-if="order.status !== 'Completed' && order.status !== 'Cancelled'"
              @click="updateStatus(order, 'Cancelled')"
              class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors text-center cursor-pointer">
              Cancel Order
            </button>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-16 sm:py-20 px-6 rounded-3xl bg-surface-900/60 border border-surface-750/70 text-center flex flex-col items-center justify-center space-y-3 shadow-inner">
        <div class="w-14 h-14 rounded-2xl bg-surface-800/80 border border-surface-700/60 flex items-center justify-center text-neutral-400 shadow-sm">
          <i class="pi pi-inbox text-2xl text-neutral-400"></i>
        </div>
        <div class="space-y-1 max-w-sm">
          <h3 class="text-base font-bold text-white">No active orders matching this filter</h3>
          <p class="text-xs text-neutral-400 leading-relaxed">
            New incoming customer delivery and counter pickup orders will appear here automatically in real time.
          </p>
        </div>
      </div>


      <!-- Receipt Screenshot Lightbox Modal -->
      <div 
        v-if="selectedReceiptImage" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="selectedReceiptImage = null">
        <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-receipt text-sky-400"></i> Customer GCash Receipt Screenshot
            </h4>
            <button 
              @click="selectedReceiptImage = null" 
              type="button"
              class="w-7 h-7 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors"
              title="Close">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="max-h-[65vh] overflow-auto rounded-2xl bg-black border border-surface-800 p-2 flex items-center justify-center">
            <img :src="selectedReceiptImage" alt="Payment Receipt" class="max-h-[60vh] w-auto object-contain rounded-lg" />
          </div>
          <div class="text-right">
            <button 
              @click="selectedReceiptImage = null"
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors">
              Close Preview
            </button>
          </div>
        </div>
      </div>


      <!-- Dispatch Rider Selection Modal -->
      <div 
        v-if="dispatchModalOrder"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        @click.self="dispatchModalOrder = null">
        <div class="relative max-w-md w-full max-h-[92vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-scale-up">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-lg">
                <i class="pi pi-send text-brand-400"></i>
              </div>
              <div>
                <h3 class="text-sm font-black text-white">Dispatch Order {{ dispatchModalOrder.order_number }}</h3>
                <p class="text-[11px] text-gray-400">Select an available rider for delivery</p>
              </div>
            </div>
            <button 
              @click="dispatchModalOrder = null" 
              type="button"
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors"
              title="Close">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Order Summary Card -->
          <div class="p-3 rounded-2xl bg-surface-950 border border-surface-800 text-xs space-y-1">
            <p class="font-bold text-white flex items-center justify-between">
              <span>Customer: {{ dispatchModalOrder.customer_name }}</span>
              <span class="text-brand-400">₱{{ Number(dispatchModalOrder.total_amount).toFixed(2) }} ({{ dispatchModalOrder.payment_method }})</span>
            </p>
            <p class="text-[11px] text-gray-400 truncate" :title="dispatchModalOrder.delivery_address">
              <i class="pi pi-map-marker text-brand-400 text-xs"></i> {{ dispatchModalOrder.delivery_address || 'Santa Rosa, Laguna' }}
            </p>
          </div>

          <!-- Auto-Assign Quick Action -->
          <div class="flex justify-between items-center">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Fleet Riders</p>
            <button 
              type="button"
              @click="autoAssignRider"
              class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all">
              <i class="pi pi-bolt text-[10px]"></i> Auto-Assign First Available
            </button>
          </div>

          <!-- Rider List -->
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div v-if="driversList.length === 0" class="text-center py-6 text-xs text-gray-400">
              No delivery riders found in the system.
            </div>

            <div 
              v-for="driver in driversList" 
              :key="driver.id"
              @click="driver.is_available ? selectedDriverId = driver.id : null"
              class="p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3"
              :class="[
                !driver.is_available ? 'opacity-50 cursor-not-allowed bg-surface-950 border-surface-800' : 'cursor-pointer hover:border-brand-500/60',
                selectedDriverId === driver.id ? 'bg-brand-600/20 border-brand-500 ring-2 ring-brand-500/30' : 'bg-surface-850 border-surface-700/80'
              ]">
              
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-md"
                  :class="driver.is_available ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'">
                  <i class="pi pi-send text-xs"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-white text-xs truncate">{{ driver.name }}</p>
                    <span 
                      class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                      :class="driver.is_available ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'">
                      {{ driver.is_available ? (driver.active_deliveries_count > 0 ? 'Busy (' + driver.active_deliveries_count + ' active)' : 'Available') : 'Not Available (Break)' }}
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-0.5">{{ driver.phone || driver.email }}</p>
                  <div v-if="driver.pending_notice && driver.is_available" class="mt-1 flex flex-wrap items-center gap-2">
                    <span class="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                      ⏳ Notice Pending: "{{ driver.pending_notice.reason }}"
                    </span>
                    <button 
                      type="button" 
                      @click.stop="handleAcceptNotice(driver.pending_notice.id)"
                      class="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black cursor-pointer shadow-sm">
                      Accept Notice
                    </button>
                  </div>
                  <p v-if="!driver.is_available && driver.availability_reason" class="text-[11px] text-rose-300 font-medium mt-1">
                    Reason: "{{ driver.availability_reason }}"
                  </p>
                  <div v-if="!driver.is_available && driver.availability_proof_image" class="mt-1">
                    <button 
                      type="button" 
                      @click.stop="ordersProofLightbox = driver.availability_proof_image"
                      class="px-2 py-0.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer">
                      <i class="pi pi-image text-[9px]"></i> View Proof Photo
                    </button>
                  </div>
                </div>
              </div>

              <!-- Selection Radio Check -->
              <div class="shrink-0">
                <span 
                  class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]"
                  :class="selectedDriverId === driver.id ? 'bg-brand-500 border-white text-white' : 'border-surface-600'">
                  <i v-if="selectedDriverId === driver.id" class="pi pi-check"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-surface-800">
            <button 
              type="button" 
              @click="dispatchModalOrder = null"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold transition-colors text-center cursor-pointer">
              Cancel
            </button>
            <button 
              type="button" 
              @click="confirmDispatch"
              :disabled="!selectedDriverId || isDispatching"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i class="pi pi-send"></i>
              <span>{{ isDispatching ? 'Dispatching...' : 'Confirm & Dispatch Rider' }}</span>
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

// G Shot Teas - Admin & Staff Active Orders Tab (Matches Figure 14)
export default {
  name: 'AdminOrdersTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const selectedFilter = Vue.ref('active');
    const selectedReceiptImage = Vue.ref(null);


    const statusFilters = [
      { key: 'active', label: 'All Active' },
      { key: 'Pending', label: 'Pending' },
      { key: 'Preparing', label: 'Preparing' },
      { key: 'Ready for Pickup', label: 'Ready / Dispatch' },
      { key: 'all', label: 'All Orders' },
    ];

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchOrders();
      } finally {
        loading.value = false;
      }
    };

    Vue.onMounted(() => {
      refresh();
      const interval = setInterval(refresh, 6000);
      Vue.onUnmounted(() => clearInterval(interval));
    });

    const activeOrders = Vue.computed(() => {
      return store.orders.filter(o => ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status));
    });

    const pendingOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Pending').length;
    });

    const preparingOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Preparing').length;
    });

    const completedOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => o.status === 'Completed').length;
    });

    const filteredOrders = Vue.computed(() => {
      if (selectedFilter.value === 'active') {
        return activeOrders.value;
      }
      if (selectedFilter.value === 'all') {
        return store.orders;
      }
      return store.orders.filter(o => o.status === selectedFilter.value);
    });

    const getFilterCount = (key) => {
      if (key === 'active') return activeOrders.value.length;
      if (key === 'Pending') return pendingOrdersCount.value;
      if (key === 'Preparing') return preparingOrdersCount.value;
      if (key === 'Ready for Pickup') {
        return store.orders.filter(o => o.status === 'Ready for Pickup' || o.status === 'Out for Delivery').length;
      }
      if (key === 'all') return store.orders.length;
      return 0;
    };

    const getStatusBadge = (s) => {
      if (s === 'Pending') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      if (s === 'Preparing') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      if (s === 'Ready for Pickup' || s === 'Out for Delivery') return 'bg-sky-500/15 text-sky-300 border border-sky-500/30';
      if (s === 'Completed') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    };

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Instant 0ms Optimistic UI Updates: UI responds instantaneously, syncs in background!
    const updateStatus = async (order, newStatus) => {
      const prevStatus = order.status;

      // 1. Instant 0ms Optimistic Update
      order.status = newStatus;
      const storeItem = store.orders.find(o => o.id === order.id);
      if (storeItem) storeItem.status = newStatus;

      store.notify(`Order ${order.order_number} moved to ${newStatus}`);

      // 2. Background sync to cloud database
      try {
        await GST_API.updateOrderStatus(order.id, newStatus);
      } catch (err) {
        // Rollback on network failure
        order.status = prevStatus;
        if (storeItem) storeItem.status = prevStatus;
        store.notify('Failed to update order status on server. Rolled back.', 'error');
      }
    };

    // Instant 0ms Optimistic UI for GCash Payment Verification
    const verifyPayment = async (order) => {
      const prevPaymentStatus = order.payment_status;

      // 1. Instant 0ms Optimistic Update
      order.payment_status = 'Verified';
      const storeItem = store.orders.find(o => o.id === order.id);
      if (storeItem) storeItem.payment_status = 'Verified';

      store.notify(`GCash Payment verified for ${order.order_number}`);

      // 2. Background sync to cloud database
      try {
        await GST_API.verifyPayment(order.id);
      } catch (err) {
        order.payment_status = prevPaymentStatus;
        if (storeItem) storeItem.payment_status = prevPaymentStatus;
        store.notify('Error verifying payment on server. Rolled back.', 'error');
      }
    };



    // Rider Dispatch Modal State & Logic for Staff
    const dispatchModalOrder = Vue.ref(null);
    const driversList = Vue.ref([]);
    const selectedDriverId = Vue.ref(null);
    const isDispatching = Vue.ref(false);
    const ordersProofLightbox = Vue.ref(null);
    const isSyncingLoyverse = Vue.ref(false);

    // Quick Order Availability Notice Modal State (Staff, Admin, Super Admin)
    const showAreaNoteModal = Vue.ref(false);
    const editAreaNoteText = Vue.ref(store.orderAreaNote || 'Orders are only available in Santa Rosa bayan.');
    const editAreaNoteEnabled = Vue.ref(store.isOrderAreaNoteEnabled);
    const isSavingQuickAreaNote = Vue.ref(false);

    const openAreaNoteModal = () => {
      editAreaNoteText.value = store.orderAreaNote || 'Orders are only available in Santa Rosa bayan.';
      editAreaNoteEnabled.value = store.isOrderAreaNoteEnabled;
      showAreaNoteModal.value = true;
    };

    const saveQuickAreaNote = async () => {
      if (!editAreaNoteText.value.trim()) {
        store.notify('Please provide notice text.', 'error');
        return;
      }
      isSavingQuickAreaNote.value = true;
      try {
        await store.updateOrderAreaNote(editAreaNoteText.value.trim(), editAreaNoteEnabled.value);
        showAreaNoteModal.value = false;
      } catch (err) {
        // Handled by store
      } finally {
        isSavingQuickAreaNote.value = false;
      }
    };

    const handleSyncLoyverse = async () => {
      isSyncingLoyverse.value = true;
      try {
        await store.syncLoyverseSales();
      } finally {
        isSyncingLoyverse.value = false;
      }
    };

    const openDispatchModal = async (order) => {
      dispatchModalOrder.value = order;
      selectedDriverId.value = null;
      try {
        const res = await GST_API.getDrivers();
        driversList.value = res.data;
        const firstAvail = driversList.value.find(d => d.is_available);
        if (firstAvail) selectedDriverId.value = firstAvail.id;
      } catch (err) {
        store.notify('Could not load fleet drivers.', 'error');
      }
    };

    const pendingRiderNotices = Vue.computed(() => {
      return (store.riderNotices || []).filter(n => !n.is_acknowledged && n.status !== 'available');
    });

    const handleAcceptNotice = async (noticeId) => {
      try {
        await store.acceptRiderNotice(noticeId);
        const res = await GST_API.getDrivers();
        driversList.value = res.data;
        if (selectedDriverId.value && !driversList.value.find(d => d.id === selectedDriverId.value)?.is_available) {
          const nextAvail = driversList.value.find(d => d.is_available);
          selectedDriverId.value = nextAvail ? nextAvail.id : null;
        }
      } catch (err) {}
    };

    const autoAssignRider = () => {
      const avail = driversList.value.filter(d => d.is_available && !d.pending_notice);
      if (avail.length > 0) {
        avail.sort((a, b) => (a.active_deliveries_count || 0) - (b.active_deliveries_count || 0));
        selectedDriverId.value = avail[0].id;
        store.notify('Auto-selected least busy rider: ' + avail[0].name, 'info');
      } else {
        store.notify('No available riders on duty right now. All riders are offline or on break.', 'warning');
      }
    };

    const confirmDispatch = async () => {
      if (!dispatchModalOrder.value || !selectedDriverId.value) return;
      const assignedDriver = driversList.value.find(d => d.id === selectedDriverId.value);
      if (assignedDriver && !assignedDriver.is_available) {
        store.notify('Cannot dispatch: Rider ' + (assignedDriver ? assignedDriver.name : 'selected') + ' is flagged unavailable.', 'error');
        return;
      }
      isDispatching.value = true;
      try {
        await GST_API.assignDriver(dispatchModalOrder.value.id, selectedDriverId.value);
        
        dispatchModalOrder.value.status = 'Out for Delivery';
        dispatchModalOrder.value.driver_id = selectedDriverId.value;
        dispatchModalOrder.value.driver = assignedDriver;

        const storeItem = store.orders.find(o => o.id === dispatchModalOrder.value.id);
        if (storeItem) {
          storeItem.status = 'Out for Delivery';
          storeItem.driver_id = selectedDriverId.value;
          storeItem.driver = assignedDriver;
        }

        store.notify(`Order ${dispatchModalOrder.value.order_number} dispatched to ${assignedDriver?.name}!`, 'success');
        dispatchModalOrder.value = null;
      } catch (err) {
        store.notify('Failed to dispatch rider.', 'error');
      } finally {
        isDispatching.value = false;
      }
    };

    return {
      store,
      loading,
      selectedFilter,
      statusFilters,
      getFilterCount,
      activeOrders,
      pendingOrdersCount,
      preparingOrdersCount,
      completedOrdersCount,
      filteredOrders,
      getStatusBadge,
      formatTime,
      updateStatus,
      verifyPayment,
      refresh,
      selectedReceiptImage,
      dispatchModalOrder,
      driversList,
      selectedDriverId,
      isDispatching,
      openDispatchModal,
      autoAssignRider,
      confirmDispatch,
      isSyncingLoyverse,
      handleSyncLoyverse,
      ordersProofLightbox,
      pendingRiderNotices,
      handleAcceptNotice,
      showAreaNoteModal,
      editAreaNoteText,
      editAreaNoteEnabled,
      isSavingQuickAreaNote,
      openAreaNoteModal,
      saveQuickAreaNote,
    };
  },
};
</script>
