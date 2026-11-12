<template>
  <div class="min-h-screen bg-surface-950 text-gray-100 py-3 sm:py-6 px-3 sm:px-6 max-w-6xl mx-auto space-y-4 font-sans">
    
    <!-- Top Fleet Operations Header -->
    <div class="bg-surface-900 border border-surface-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 text-amber-400 flex items-center justify-center text-lg shrink-0">
          <i class="pi pi-compass"></i>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-base sm:text-lg font-bold text-white truncate">Delivery Fleet</h1>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-950 text-emerald-400 border border-surface-800">
              Live
            </span>
          </div>
          <p class="text-[11px] text-gray-400 truncate">{{ store.user?.name || 'Operations Staff' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          type="button"
          @click="refreshAll"
          :disabled="loading"
          class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 text-xs font-semibold border border-surface-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
          <i class="pi pi-refresh text-xs" :class="{ 'animate-spin': loading }"></i>
          <span>Refresh</span>
        </button>

        <button 
          type="button"
          @click="returnToConsole"
          class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
          <i class="pi pi-arrow-left text-xs"></i>
          <span>{{ store.isStaffOnly ? 'Console' : 'Admin' }}</span>
        </button>
      </div>
    </div>

    <!-- Rider Notice Pending Staff Approval Alert Banner -->
    <div 
      v-if="pendingNotices.length > 0" 
      class="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-2xl text-amber-400 shrink-0"></i>
        <div>
          <p class="font-black text-sm text-white">
            {{ pendingNotices.length }} Rider Unavailable Request{{ pendingNotices.length > 1 ? 's' : '' }} Pending Staff Action
          </p>
          <p class="text-[11px] text-amber-300/90 mt-0.5">
            Rider <strong class="text-white">{{ pendingNotices[0].driver_name }}</strong> requested break/unavailable: 
            <span class="italic">"{{ pendingNotices[0].reason }}"</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          v-if="pendingNotices[0].proof_image"
          type="button"
          @click="openProofPreview(pendingNotices[0].proof_image)"
          class="px-3 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-750 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5">
          <i class="pi pi-image text-xs"></i> Proof Photo
        </button>
        <button 
          type="button"
          @click="handleAcceptNotice(pendingNotices[0].id)" 
          class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-colors shadow cursor-pointer">
          Accept Notice
        </button>
      </div>
    </div>

    <!-- Pending COD Remittance Handover Alert Banner -->
    <div
      v-if="pendingRemittances.length > 0"
      class="p-4 rounded-2xl bg-emerald-950/35 border border-emerald-500/40 text-emerald-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-lg shrink-0"><i class="pi pi-wallet"></i></div>
        <div>
          <p class="font-black text-sm text-white">
            {{ pendingRemittances.length }} COD Remittance Handover{{ pendingRemittances.length > 1 ? 's' : '' }} Pending Acceptance
          </p>
          <p class="text-[11px] text-emerald-200/90 mt-0.5">
            Rider <strong class="text-white">{{ pendingRemittances[0].driver_name }}</strong> submitted
            <strong class="text-amber-300 font-mono">₱{{ Number(pendingRemittances[0].amount).toFixed(2) }}</strong>
            ({{ pendingRemittances[0].reference_number }} • {{ pendingRemittances[0].orders_count }} order{{ pendingRemittances[0].orders_count === 1 ? '' : 's' }}).
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="activeTab = 'remittances'"
          class="px-3 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors cursor-pointer">
          View Details
        </button>
        <button
          type="button"
          @click="handleAcceptRemittance(pendingRemittances[0])"
          class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-colors shadow cursor-pointer">
          Accept Remittance
        </button>
      </div>
    </div>

    <!-- Fleet Overview Stat Cards (4 Cards) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- 1. Available Riders -->
      <div 
        @click="activeTab = 'riders'; riderFilter = 'available'"
        class="bg-surface-900 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
        :class="activeTab === 'riders' && riderFilter === 'available' ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-surface-800 hover:border-surface-700'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-emerald-400">Available Riders</span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" :class="{ '': availableRiders.length > 0 }"></span>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ availableRiders.length }}</div>
        <p class="text-[11px] text-neutral-400 mt-1 font-medium">Ready for order dispatch</p>
      </div>

      <!-- 2. In Delivery Right Now -->
      <div 
        @click="activeTab = 'in_delivery'"
        class="bg-surface-900 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
        :class="activeTab === 'in_delivery' ? 'border-cyan-500/60 bg-cyan-500/5' : 'border-surface-800 hover:border-surface-700'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-cyan-400">In Delivery Right Now</span>
          <i class="pi pi-send text-xs text-cyan-400"></i>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ activeDeliveries.length }}</div>
        <p class="text-[11px] text-neutral-400 mt-1 font-medium">{{ activeDeliveries.length > 0 ? 'Active ongoing dispatches' : 'No ongoing deliveries' }}</p>
      </div>

      <!-- 3. On Break / Offline -->
      <div 
        @click="activeTab = 'riders'; riderFilter = 'offline'"
        class="bg-surface-900 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
        :class="activeTab === 'riders' && riderFilter === 'offline' ? 'border-amber-500/60 bg-amber-500/5' : 'border-surface-800 hover:border-surface-700'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">On Break / Offline</span>
          <i class="pi pi-pause text-xs text-amber-400"></i>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ offlineRiders.length }}</div>
        <p class="text-[11px] text-neutral-400 mt-1 font-medium">Resting or off-duty</p>
      </div>

      <!-- 4. Total Deliveries Completed -->
      <div 
        @click="activeTab = 'history'"
        class="bg-surface-900 border rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
        :class="activeTab === 'history' ? 'border-purple-500/60 bg-purple-500/5' : 'border-surface-800 hover:border-surface-700'">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-purple-400">Delivered History</span>
          <i class="pi pi-check-circle text-xs text-purple-400"></i>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ deliveredHistory.length }}</div>
        <p class="text-[11px] text-neutral-400 mt-1 font-medium">All completed deliveries</p>
      </div>
    </div>

    <!-- Navigation Tabs: Available Riders | In Delivery | History | Remittances -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-surface-900 border border-surface-800 shadow-md">
      <!-- Tab 1: Available Riders -->
      <button 
        type="button"
        @click="activeTab = 'riders'"
        class="flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border"
        :class="activeTab === 'riders' 
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
          : 'text-neutral-400 hover:text-white border-transparent hover:bg-surface-800/60'">
        <i class="pi pi-users text-sm"></i>
        <span>Available Riders</span>
        <span 
          class="px-2 py-0.5 rounded-full text-[10px] font-black"
          :class="activeTab === 'riders' ? 'bg-amber-500 text-black' : 'bg-surface-800 text-neutral-300'">
          {{ availableRiders.length }} / {{ riders.length }}
        </span>
      </button>

      <!-- Tab 2: In Delivery Right Now -->
      <button 
        type="button"
        @click="activeTab = 'in_delivery'"
        class="flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border relative"
        :class="activeTab === 'in_delivery' 
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
          : 'text-neutral-400 hover:text-white border-transparent hover:bg-surface-800/60'">
        <i class="pi pi-compass text-sm"></i>
        <span>In Delivery Right Now</span>
        <span 
          class="px-2 py-0.5 rounded-full text-[10px] font-black"
          :class="activeDeliveries.length > 0 ? 'bg-cyan-500 text-black' : 'bg-surface-800 text-neutral-300'">
          {{ activeDeliveries.length }}
        </span>
      </button>

      <!-- Tab 3: Their History -->
      <button 
        type="button"
        @click="activeTab = 'history'"
        class="flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border"
        :class="activeTab === 'history' 
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' 
          : 'text-neutral-400 hover:text-white border-transparent hover:bg-surface-800/60'">
        <i class="pi pi-history text-sm"></i>
        <span>Delivery History</span>
        <span 
          class="px-2 py-0.5 rounded-full text-[10px] font-black"
          :class="activeTab === 'history' ? 'bg-purple-500 text-black' : 'bg-surface-800 text-neutral-300'">
          {{ deliveredHistory.length }}
        </span>
      </button>

      <!-- Tab 4: COD Remittances -->
      <button 
        type="button"
        @click="activeTab = 'remittances'"
        class="flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border"
        :class="activeTab === 'remittances' 
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
          : 'text-neutral-400 hover:text-white border-transparent hover:bg-surface-800/60'">
        <i class="pi pi-wallet text-sm"></i>
        <span>Remittances</span>
        <span 
          class="px-2 py-0.5 rounded-full text-[10px] font-black"
          :class="pendingRemittances.length > 0 ? 'bg-rose-500 text-white ' : (activeTab === 'remittances' ? 'bg-emerald-500 text-black' : 'bg-surface-800 text-neutral-300')">
          {{ pendingRemittances.length > 0 ? pendingRemittances.length + ' Pending' : (store.remittances?.length || 0) }}
        </span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: WHO'S AVAILABLE RIDERS              -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'riders'" class="space-y-4 animate-fade-in">
      <!-- Filter Bar for Riders -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-900 border border-surface-800 rounded-2xl p-3.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <button 
            type="button"
            @click="riderFilter = 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
            :class="riderFilter === 'all' ? 'bg-surface-800 text-white border-surface-600' : 'text-neutral-400 border-transparent hover:text-white'">
            All Riders ({{ riders.length }})
          </button>
          <button 
            type="button"
            @click="riderFilter = 'available'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5"
            :class="riderFilter === 'available' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-neutral-400 border-transparent hover:text-emerald-300'">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available ({{ availableRiders.length }})</span>
          </button>
          <button 
            type="button"
            @click="riderFilter = 'delivering'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5"
            :class="riderFilter === 'delivering' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-neutral-400 border-transparent hover:text-cyan-300'">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Delivering ({{ deliveringRiders.length }})</span>
          </button>
          <button 
            type="button"
            @click="riderFilter = 'offline'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5"
            :class="riderFilter === 'offline' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'text-neutral-400 border-transparent hover:text-amber-300'">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>On Break ({{ offlineRiders.length }})</span>
          </button>
        </div>

        <!-- Rider Search -->
        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
          <input 
            v-model="riderSearch" 
            type="text" 
            placeholder="Search rider name or phone..."
            class="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50" />
        </div>
      </div>

      <!-- Empty State for Riders -->
      <div v-if="filteredRiders.length === 0" class="bg-surface-900 border border-surface-800 rounded-2xl p-10 text-center space-y-3 shadow-xl">
        <div class="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 mx-auto flex items-center justify-center text-2xl text-neutral-500">
          <i class="pi pi-users text-2xl"></i>
        </div>
        <h3 class="text-base font-bold text-white">No Riders Found</h3>
        <p class="text-xs text-neutral-400 max-w-sm mx-auto">
          No delivery riders match the selected filter or search keyword.
        </p>
        <button 
          type="button" 
          @click="riderFilter = 'all'; riderSearch = ''" 
          class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-amber-400 border border-surface-700 transition-colors cursor-pointer">
          Reset Filter
        </button>
      </div>

      <!-- Riders Grid Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="rider in filteredRiders" 
          :key="rider.id"
          class="bg-surface-900 border border-surface-800 hover:border-surface-700 rounded-2xl p-5 shadow-xl transition-all space-y-4 relative overflow-hidden group">
          
          <!-- Top Card Row: Avatar, Name & Status Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div 
                v-if="rider.avatar" 
                class="w-12 h-12 rounded-2xl overflow-hidden border border-surface-700 shrink-0 shadow-sm">
                <img :src="rider.avatar" :alt="rider.name" class="w-full h-full object-cover" />
              </div>
              <div 
                v-else 
                class="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-base font-black text-amber-400 shrink-0 shadow-sm tracking-wider">
                {{ getInitials(rider.name) }}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm sm:text-base font-black text-white truncate">{{ rider.name }}</h4>
                <p class="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <i class="pi pi-phone text-[10px] text-emerald-400"></i>
                  <span>{{ rider.phone || 'No phone provided' }}</span>
                </p>
              </div>
            </div>

            <!-- Status Pill Badge -->
            <div class="shrink-0">
              <span 
                v-if="rider.driver_status === 'on_delivery'"
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-cyan-400 "></span>
                On Delivery • Gone ({{ rider.active_deliveries_count || 0 }})
              </span>
              <span 
                v-else-if="rider.active_deliveries_count > 0"
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-sky-400 "></span>
                At Store • {{ rider.active_deliveries_count }} Queued
              </span>
              <span 
                v-else-if="rider.pending_notice"
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-amber-400 "></span>
                Break Pending
              </span>
              <span 
                v-else-if="rider.is_available"
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-400 "></span>
                Available for Orders
              </span>
              <span 
                v-else
                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-neutral-500"></span>
                On Break / Offline
              </span>
            </div>
          </div>

          <!-- Active Ongoing Order Preview if in delivery -->
          <div 
            v-if="rider.active_deliveries_count > 0" 
            class="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-cyan-400 font-bold flex items-center gap-1.5">
                <i class="pi pi-send text-[11px]"></i>
                {{ rider.driver_status === 'on_delivery' ? 'On Delivery (Dispatches Locked)' : 'Queued at Store (Can Still Add Orders)' }}
              </span>
              <button 
                type="button"
                @click="viewRiderActiveDelivery(rider)"
                class="text-[11px] text-cyan-300 hover:text-white font-bold underline cursor-pointer">
                View in Live Tracker &rarr;
              </button>
            </div>
            <div v-if="rider.active_orders && rider.active_orders.length > 0" class="space-y-1 text-xs">
              <div 
                v-for="actOrder in rider.active_orders" 
                :key="actOrder.id" 
                class="flex items-center justify-between text-neutral-300 bg-surface-950/60 p-2 rounded-xl border border-surface-800">
                <span class="font-bold text-white">#{{ actOrder.order_number }}</span>
                <span class="text-neutral-400 text-[11px] truncate max-w-[180px]">{{ actOrder.delivery_address || actOrder.customer_name }}</span>
                <span class="font-mono text-amber-400 font-bold">₱{{ actOrder.total_amount }}</span>
              </div>
            </div>
          </div>

          <!-- Reason Alert if offline or pending notice -->
          <div 
            v-else-if="rider.availability_reason || rider.pending_notice" 
            class="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/25 text-xs text-amber-200/90 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-[11px]">Reason Note:</span>
              <button 
                v-if="rider.availability_proof_image || rider.pending_notice?.proof_image"
                type="button"
                @click="openProofPreview(rider.availability_proof_image || rider.pending_notice?.proof_image)"
                class="text-[10px] text-amber-400 hover:text-white underline cursor-pointer">
                View Photo Proof
              </button>
            </div>
            <p class="italic text-[11px] text-amber-300">
              "{{ rider.pending_notice?.reason || rider.availability_reason }}"
            </p>
            <div v-if="rider.pending_notice" class="pt-1.5 flex justify-end">
              <button 
                type="button" 
                @click="handleAcceptNotice(rider.pending_notice.id)"
                class="px-3 py-1 rounded-xl bg-amber-500 text-black text-[11px] font-black hover:bg-amber-400 cursor-pointer shadow">
                Accept Notice
              </button>
            </div>
          </div>

          <!-- Rider Activity Metrics Grid -->
          <div class="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-surface-950/70 border border-surface-800/80 text-center text-xs">
            <div>
              <div class="text-[10px] font-bold text-neutral-400 uppercase">Active</div>
              <div class="text-sm font-black mt-0.5" :class="rider.active_deliveries_count > 0 ? 'text-cyan-400' : 'text-neutral-400'">
                {{ rider.active_deliveries_count || 0 }}
              </div>
            </div>
            <div class="border-x border-surface-800">
              <div class="text-[10px] font-bold text-neutral-400 uppercase">Today</div>
              <div class="text-sm font-black text-amber-400 mt-0.5">
                {{ rider.completed_today_count || 0 }}
              </div>
            </div>
            <div>
              <div class="text-[10px] font-bold text-neutral-400 uppercase">All-Time</div>
              <div class="text-sm font-black text-purple-400 mt-0.5">
                {{ rider.total_completed_count || 0 }}
              </div>
            </div>
          </div>

          <!-- COD Cash to Remit Status Strip -->
          <div class="p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs"
            :class="rider.pending_remittance
              ? 'bg-amber-500/10 border-amber-500/40'
              : (Number(rider.unremitted_cash || 0) > 0 ? 'bg-surface-950/70 border-surface-800' : 'bg-surface-950/40 border-surface-800/60')">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">COD Cash to Remit</span>
              <span class="font-mono font-black text-sm" :class="Number(rider.unremitted_cash || 0) > 0 ? 'text-amber-300' : 'text-emerald-400'">
                ₱{{ Number(rider.unremitted_cash || 0).toFixed(2) }}
              </span>
            </div>
            <button
              v-if="rider.pending_remittance"
              type="button"
              @click="handleAcceptRemittance(rider.pending_remittance)"
              class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black transition-colors cursor-pointer shadow">
              Accept Remittance
            </button>
            <span v-else class="text-[10px] font-semibold" :class="Number(rider.unremitted_cash || 0) > 0 ? 'text-neutral-400' : 'text-emerald-400'">
              {{ Number(rider.unremitted_cash || 0) > 0 ? 'Not handed over yet' : 'Settled' }}
            </span>
          </div>

          <!-- Bottom Action Buttons for Staff Control -->
          <div class="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-surface-800/60">
            <button 
              type="button"
              @click="filterHistoryByRider(rider.id)"
              class="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              <i class="pi pi-history text-[11px] text-purple-400"></i>
              <span>View History</span>
            </button>

            <a 
              v-if="rider.phone"
              :href="'tel:' + rider.phone"
              class="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              <i class="pi pi-phone text-[11px]"></i>
              <span>Call Rider</span>
            </a>

            <button 
              type="button"
              @click="toggleRiderStatus(rider)"
              class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center"
              :class="rider.is_available 
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25' 
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'">
              {{ rider.is_available ? 'Set On Break' : 'Set Available' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: ARE THEY IN A DELIVERY RIGHT NOW   -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'in_delivery'" class="space-y-4 animate-fade-in">
      <div 
        v-if="activeDeliveries.length === 0" 
        class="bg-surface-900 border border-surface-800 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-2xl max-w-2xl mx-auto">
        <div class="w-16 h-16 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center text-3xl shadow-lg">
          <i class="pi pi-send text-3xl text-cyan-400"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-lg font-black text-white">No Riders Currently In Delivery</h3>
          <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            All active deliveries have been delivered, or no orders are currently out on the road. When kitchen staff marks a delivery order as <strong class="text-cyan-400">Out for Delivery</strong>, it will appear here immediately.
          </p>
        </div>
        <div class="pt-2 flex items-center justify-center gap-3">
          <button 
            type="button" 
            @click="activeTab = 'riders'" 
            class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-xs font-bold text-white border border-surface-700 transition-colors cursor-pointer">
            Check Available Riders
          </button>
          <button 
            type="button" 
            @click="refreshAll" 
            class="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-2">
            <i class="pi pi-refresh text-xs" :class="{ 'animate-spin': loading }"></i>
            Refresh Active Orders
          </button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="order in activeDeliveries" 
          :key="order.id"
          class="bg-surface-900 border border-surface-800 hover:border-cyan-500/50 rounded-2xl p-5 sm:p-3.5 sm:p-5 shadow-2xl transition-all space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-800">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full bg-cyan-400 "></span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-white font-mono">Order #{{ order.order_number }}</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Out for Delivery
                  </span>
                </div>
                <p class="text-xs text-neutral-400 mt-0.5">
                  Dispatched: {{ formatTime(order.updated_at || order.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-400 font-mono text-base">₱{{ order.total_amount }}</span>
              <span 
                class="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                :class="order.payment_method === 'Cash on Delivery' || order.payment_method === 'COD' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'">
                {{ order.payment_method === 'Cash on Delivery' || order.payment_method === 'COD' ? 'COD Cash' : 'Paid Online' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Column 1: Courier In-Charge -->
            <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Courier In-Charge</span>
                <i class="pi pi-compass text-xs text-cyan-400"></i>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-sm font-black text-cyan-400 shrink-0 tracking-wider">
                  {{ getInitials(getDriverName(order)) }}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-white text-sm truncate">{{ getDriverName(order) }}</div>
                  <div class="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                    <i class="pi pi-phone text-[10px] text-emerald-400"></i>
                    <span>{{ getDriverPhone(order) || 'Rider' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="getDriverPhone(order)" class="pt-1">
                <a 
                  :href="'tel:' + getDriverPhone(order)" 
                  class="w-full py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5">
                  <i class="pi pi-phone text-xs"></i>
                  <span>Call Rider</span>
                </a>
              </div>
            </div>

            <!-- Column 2: Customer & Delivery Address -->
            <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Customer & Drop-off</span>
                <i class="pi pi-map-marker text-xs text-emerald-400"></i>
              </div>
              <div>
                <div class="font-bold text-white text-sm">{{ order.customer_name }}</div>
                <div class="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <i class="pi pi-phone text-[10px] text-emerald-400"></i>
                  <span>{{ order.customer_phone || 'No phone' }}</span>
                </div>
              </div>
              <div class="text-xs text-neutral-300 bg-surface-900 p-2.5 rounded-xl border border-surface-800/80 leading-relaxed">
                <span class="text-neutral-500 text-[10px] block uppercase font-bold">Delivery Address:</span>
                {{ order.delivery_address || 'Santa Rosa, Laguna' }}
              </div>
              <div class="flex gap-2">
                <a 
                  v-if="order.customer_phone"
                  :href="'tel:' + order.customer_phone" 
                  class="flex-1 py-1.5 px-2.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 text-xs font-bold border border-surface-700 transition-colors flex items-center justify-center gap-1">
                  <i class="pi pi-phone text-xs text-emerald-400"></i>
                  <span>Call Customer</span>
                </a>
                <a 
                  :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(order.delivery_address || 'Santa Rosa Laguna')"
                  target="_blank"
                  class="py-1.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 text-xs font-bold border border-surface-700 transition-colors flex items-center justify-center gap-1">
                  <i class="pi pi-external-link text-xs text-amber-400"></i>
                  <span>Map</span>
                </a>
              </div>
            </div>

            <!-- Column 3: Order Items & Delivery Summary -->
            <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Order Items</span>
                <span class="text-[10px] text-neutral-500 font-mono">{{ order.items?.length || 0 }} items</span>
              </div>
              <div class="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                <div 
                  v-for="(item, idx) in order.items" 
                  :key="idx" 
                  class="text-xs text-neutral-300 flex items-start justify-between gap-2 border-b border-surface-900 pb-1 last:border-0">
                  <span class="font-medium text-white truncate">{{ item.quantity }}x {{ item.product_name }}</span>
                  <span class="font-mono text-neutral-400 shrink-0">₱{{ item.subtotal || item.unit_price }}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-surface-800">
                <button 
                  type="button"
                  @click="markOrderDelivered(order)"
                  class="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md">
                  <i class="pi pi-check text-xs font-black"></i>
                  <span>Confirm Delivered (Staff Override)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: THEIR HISTORY                      -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'history'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-900 border border-surface-800 rounded-2xl p-3.5">
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-neutral-400 whitespace-nowrap">Filter by Rider:</label>
          <select 
            v-model="historyRiderFilter" 
            class="bg-surface-950 border border-surface-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50">
            <option value="all">All Fleet Riders ({{ deliveredHistory.length }})</option>
            <option v-for="r in riders" :key="r.id" :value="r.id">
              {{ r.name }} ({{ countRiderCompleted(r.id) }})
            </option>
          </select>
        </div>

        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
          <input 
            v-model="historySearch" 
            type="text" 
            placeholder="Search order #, customer, address..."
            class="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50" />
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-neutral-400 px-2 font-medium">
        <span>Showing <strong class="text-white">{{ filteredHistory.length }}</strong> completed delivery record{{ filteredHistory.length === 1 ? '' : 's' }}</span>
        <span>Total Delivery Revenue: <strong class="text-amber-400 font-mono">₱{{ totalHistoryAmount.toLocaleString() }}</strong></span>
      </div>

      <div v-if="filteredHistory.length === 0" class="bg-surface-900 border border-surface-800 rounded-2xl p-10 text-center space-y-3 shadow-xl">
        <div class="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 mx-auto flex items-center justify-center text-2xl text-neutral-500">
          <i class="pi pi-history text-2xl"></i>
        </div>
        <h3 class="text-base font-bold text-white">No Delivery History Records</h3>
        <p class="text-xs text-neutral-400 max-w-sm mx-auto">
          No completed deliveries found matching the current filters.
        </p>
        <button 
          type="button" 
          @click="historyRiderFilter = 'all'; historySearch = ''" 
          class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-xs font-bold text-purple-400 border border-surface-700 transition-colors cursor-pointer">
          Reset Filter
        </button>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="order in filteredHistory" 
          :key="order.id"
          class="bg-surface-900 border border-surface-800 hover:border-surface-700 rounded-2xl p-4 sm:p-5 shadow-lg transition-all space-y-3">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400">
                <i class="pi pi-check text-xs font-bold text-purple-400"></i>
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-black text-white font-mono">Order #{{ order.order_number }}</h4>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Delivered
                  </span>
                </div>
                <p class="text-[11px] text-neutral-400 mt-0.5">
                  Delivered on {{ formatDateTime(order.delivered_at || order.updated_at || order.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-white text-sm">₱{{ order.total_amount }}</span>
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold border"
                :class="order.payment_method === 'Cash on Delivery' || order.payment_method === 'COD' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'">
                {{ order.payment_method === 'Cash on Delivery' || order.payment_method === 'COD' ? 'COD' : 'Online Paid' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-surface-800/60">
            <div class="bg-surface-950/50 p-2.5 rounded-xl border border-surface-800/80">
              <span class="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Delivered By:</span>
              <div class="font-bold text-white flex items-center gap-1.5">
                <i class="pi pi-user text-xs text-amber-400"></i>
                <span>{{ getDriverName(order) }}</span>
              </div>
              <div v-if="getDriverPhone(order)" class="text-[11px] text-neutral-400 mt-0.5">
                {{ getDriverPhone(order) }}
              </div>
            </div>

            <div class="bg-surface-950/50 p-2.5 rounded-xl border border-surface-800/80">
              <span class="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Customer / Location:</span>
              <div class="font-bold text-white truncate">{{ order.customer_name }}</div>
              <div class="text-[11px] text-neutral-400 truncate mt-0.5">{{ order.delivery_address || 'Santa Rosa Hub' }}</div>
            </div>

            <div class="bg-surface-950/50 p-2.5 rounded-xl border border-surface-800/80">
              <span class="text-[10px] font-bold uppercase text-neutral-500 block mb-1">Items Delivered ({{ order.items?.length || 0 }}):</span>
              <div class="text-neutral-300 truncate">
                {{ order.items?.map(i => i.quantity + 'x ' + i.product_name).join(', ') || 'Milk Tea Products' }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 4: COD REMITTANCES & HISTORY           -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'remittances'">
      <AdminRemittancesTab />
    </div>

    <!-- Photo Proof Lightbox Modal -->
    <div 
      v-if="activeProofImage" 
      @click="activeProofImage = null"
      class="fixed inset-0 bg-black/85 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in cursor-pointer">
      <div 
        @click.stop 
        class="bg-surface-900 border border-surface-700 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl relative">
        <div class="flex items-center justify-between pb-2 border-b border-surface-800">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="pi pi-image text-amber-400"></i> Rider Proof of Unavailability
          </h4>
          <button 
            type="button" 
            @click="activeProofImage = null" 
            class="text-neutral-400 hover:text-white p-1 text-base flex items-center justify-center">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="rounded-2xl overflow-hidden border border-surface-800 bg-surface-950 max-h-[70vh] flex items-center justify-center">
          <img :src="activeProofImage" alt="Proof photo" class="w-full h-auto object-contain max-h-[65vh]" />
        </div>
        <div class="text-right">
          <button 
            type="button" 
            @click="activeProofImage = null" 
            class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-xs font-bold text-white transition-colors">
            Close Preview
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';
import AdminRemittancesTab from '@/admin/AdminRemittancesTab.vue';

export default {
  name: 'DeliveryFleetView',
  components: { AdminRemittancesTab },
  setup() {
    const store = useGShotStore();

    const loading = ref(false);
    const riders = ref([]);
    const activeDeliveries = ref([]);
    const deliveredHistory = ref([]);
    
    // Tabs: 'riders' | 'in_delivery' | 'history'
    const activeTab = ref('riders');
    
    // Filters
    const riderFilter = ref('all'); // 'all' | 'available' | 'delivering' | 'offline'
    const riderSearch = ref('');
    const historyRiderFilter = ref('all');
    const historySearch = ref('');
    const activeProofImage = ref(null);

    let pollInterval = null;

    const fetchRiders = async () => {
      try {
        const res = await GST_API.getDrivers();
        riders.value = res.data || [];
      } catch (err) {
        console.error('Failed to load fleet riders:', err);
      }
    };

    const fetchOrders = async () => {
      try {
        // 1. Fetch active ongoing deliveries
        const activeRes = await GST_API.getOrders({
          order_type: 'Delivery',
          status: 'Out for Delivery',
          per_page: 100
        });
        const activeData = activeRes.data?.data || activeRes.data || [];
        activeDeliveries.value = Array.isArray(activeData) ? activeData : [];

        // 2. Fetch completed delivery history
        const histRes = await GST_API.getOrders({
          order_type: 'Delivery',
          status: 'Completed',
          per_page: 100
        });
        const histData = histRes.data?.data || histRes.data || [];
        deliveredHistory.value = Array.isArray(histData) ? histData : [];
      } catch (err) {
        console.error('Failed to load fleet orders:', err);
      }
    };

    const refreshAll = async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchRiders(),
          fetchOrders(),
          store.fetchRiderNotices(true),
          store.fetchRemittances({}, true)
        ]);
      } finally {
        loading.value = false;
      }
    };

    const availableRiders = computed(() => {
      return riders.value.filter(r => r.is_available && r.driver_status !== 'on_delivery');
    });

    const deliveringRiders = computed(() => {
      return riders.value.filter(r => r.driver_status === 'on_delivery' || (r.active_deliveries_count && r.active_deliveries_count > 0));
    });

    const offlineRiders = computed(() => {
      return riders.value.filter(r => !r.is_available);
    });

    const pendingNotices = computed(() => {
      return (store.riderNotices || []).filter(n => !n.is_acknowledged);
    });

    const pendingRemittances = computed(() => {
      return (store.remittances || []).filter(r => r.status === 'pending');
    });

    const filteredRiders = computed(() => {
      let list = riders.value;
      if (riderFilter.value === 'available') {
        list = availableRiders.value;
      } else if (riderFilter.value === 'delivering') {
        list = deliveringRiders.value;
      } else if (riderFilter.value === 'offline') {
        list = offlineRiders.value;
      }

      if (riderSearch.value.trim()) {
        const q = riderSearch.value.trim().toLowerCase();
        list = list.filter(r => 
          (r.name && r.name.toLowerCase().includes(q)) || 
          (r.phone && r.phone.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q))
        );
      }
      return list;
    });

    const filteredHistory = computed(() => {
      let list = deliveredHistory.value;
      if (historyRiderFilter.value !== 'all') {
        list = list.filter(o => o.driver_id == historyRiderFilter.value);
      }
      if (historySearch.value.trim()) {
        const q = historySearch.value.trim().toLowerCase();
        list = list.filter(o => 
          (o.order_number && o.order_number.toString().toLowerCase().includes(q)) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
          (o.delivery_address && o.delivery_address.toLowerCase().includes(q)) ||
          (o.driver?.name && o.driver.name.toLowerCase().includes(q))
        );
      }
      return list;
    });

    const totalHistoryAmount = computed(() => {
      return filteredHistory.value.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    });

    const countRiderCompleted = (driverId) => {
      return deliveredHistory.value.filter(o => o.driver_id == driverId).length;
    };

    const getInitials = (name) => {
      if (!name) return 'R';
      const clean = name.replace(/\([^)]*\)/g, '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return (clean.slice(0, 2) || 'R').toUpperCase();
    };

    const getDriverName = (order) => {
      if (order.driver && order.driver.name) return order.driver.name;
      if (order.driver_id) {
        const found = riders.value.find(r => r.id == order.driver_id);
        if (found) return found.name;
      }
      return 'Assigned Courier';
    };

    const getDriverPhone = (order) => {
      if (order.driver && order.driver.phone) return order.driver.phone;
      if (order.driver_id) {
        const found = riders.value.find(r => r.id == order.driver_id);
        if (found) return found.phone;
      }
      return '';
    };

    const formatTime = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };

    const returnToConsole = () => {
      store.currentView = 'admin';
      store.adminTab = 'orders';
    };

    const filterHistoryByRider = (driverId) => {
      historyRiderFilter.value = driverId;
      activeTab.value = 'history';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const viewRiderActiveDelivery = (rider) => {
      activeTab.value = 'in_delivery';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleRiderStatus = async (rider) => {
      try {
        const newStatus = !rider.is_available;
        await GST_API.toggleDriverAvailability(newStatus, rider.id);
        rider.is_available = newStatus;
        rider.driver_status = newStatus ? 'available' : 'offline';
        store.notify('Rider ' + rider.name + ' marked ' + (newStatus ? 'Available for Orders' : 'On Break') + '.', 'success');
        await fetchRiders();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to update rider status.', 'error');
      }
    };

    const handleAcceptNotice = async (noticeId) => {
      try {
        await store.acceptRiderNotice(noticeId);
        await refreshAll();
      } catch (err) {
        // error notification handled by store
      }
    };

    const handleAcceptRemittance = async (rem) => {
      if (!confirm('Accept COD remittance of ₱' + Number(rem.amount).toFixed(2) + ' from ' + rem.driver_name + ' (' + rem.reference_number + ')?')) return;
      try {
        await store.acceptRemittance(rem.id);
        await refreshAll();
      } catch (err) {
        // handled by store
      }
    };

    const markOrderDelivered = async (order) => {
      if (!confirm('Confirm order #' + order.order_number + ' has been delivered successfully by the rider?')) return;
      try {
        await GST_API.updateOrderStatus(order.id, 'Completed');
        store.notify('Order #' + order.order_number + ' marked Delivered!', 'success');
        await refreshAll();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to update order status.', 'error');
      }
    };

    const openProofPreview = (imageUrl) => {
      activeProofImage.value = imageUrl;
    };

    onMounted(async () => {
      await refreshAll();
      pollInterval = setInterval(async () => {
        await Promise.all([
          fetchRiders(),
          fetchOrders(),
          store.fetchRemittances({}, true)
        ]);
      }, 10000);
    });

    onUnmounted(() => {
      if (pollInterval) clearInterval(pollInterval);
    });

    return {
      store,
      loading,
      riders,
      activeDeliveries,
      deliveredHistory,
      activeTab,
      riderFilter,
      riderSearch,
      historyRiderFilter,
      historySearch,
      activeProofImage,
      availableRiders,
      deliveringRiders,
      offlineRiders,
      pendingNotices,
      pendingRemittances,
      filteredRiders,
      filteredHistory,
      totalHistoryAmount,
      countRiderCompleted,
      getInitials,
      getDriverName,
      getDriverPhone,
      formatTime,
      formatDateTime,
      returnToConsole,
      filterHistoryByRider,
      viewRiderActiveDelivery,
      toggleRiderStatus,
      handleAcceptNotice,
      handleAcceptRemittance,
      markOrderDelivered,
      openProofPreview,
      refreshAll
    };
  }
};
</script>
