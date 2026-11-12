<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <i class="pi pi-wallet text-amber-400"></i>
          <span>COD Rider Remittances</span>
        </h2>
        <p class="text-xs text-neutral-400 mt-1">
          Verify physical cash handovers from delivery riders before resetting their COD balance to ₱0.00, and review complete remittance history.
        </p>
      </div>
      <button
        type="button"
        @click="refreshData"
        :disabled="loading"
        class="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-neutral-200 text-xs font-bold border border-surface-750 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
        <i class="pi pi-refresh text-xs" :class="{ 'animate-spin': loading }"></i>
        <span>{{ loading ? 'Refreshing...' : 'Refresh Remittances' }}</span>
      </button>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-surface-900 border rounded-2xl p-4 shadow-lg" :class="pendingRemittances.length > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-surface-800'">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">Pending Acceptance</span>
          <span v-if="pendingRemittances.length > 0" class="w-2.5 h-2.5 rounded-full bg-amber-400 "></span>
        </div>
        <div class="text-lg sm:text-xl font-bold text-white font-mono">₱{{ Number(summary.pending_amount || 0).toFixed(2) }}</div>
        <p class="text-[11px] text-neutral-400 mt-1">{{ pendingRemittances.length }} handover request(s)</p>
      </div>

      <div class="bg-surface-900 border border-surface-800 rounded-2xl p-4 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-black uppercase tracking-wider text-emerald-400">Accepted Today</span>
          <i class="pi pi-check-circle text-xs text-emerald-400"></i>
        </div>
        <div class="text-2xl font-black text-emerald-400 font-mono">₱{{ Number(summary.accepted_today_amount || 0).toFixed(2) }}</div>
        <p class="text-[11px] text-neutral-400 mt-1">Verified &amp; settled today</p>
      </div>

      <div class="bg-surface-900 border border-surface-800 rounded-2xl p-4 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-black uppercase tracking-wider text-purple-400">All-Time Remitted</span>
          <i class="pi pi-chart-bar text-xs text-purple-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-bold text-white font-mono">₱{{ Number(summary.total_accepted_amount || 0).toFixed(2) }}</div>
        <p class="text-[11px] text-neutral-400 mt-1">Total verified COD cash</p>
      </div>

      <div class="bg-surface-900 border border-surface-800 rounded-2xl p-4 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-black uppercase tracking-wider text-cyan-400">Riders Holding Cash</span>
          <i class="pi pi-users text-xs text-cyan-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-bold text-white">{{ ridersHoldingCashCount }}</div>
        <p class="text-[11px] text-neutral-400 mt-1">Unremitted balance &gt; ₱0.00</p>
      </div>
    </div>

    <!-- Live Rider COD Balances Overview -->
    <div v-if="ridersUnremitted.length > 0" class="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-3 shadow-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <i class="pi pi-wallet text-amber-400"></i>
          <span>Current Rider COD Cash on Hand</span>
        </h3>
        <span class="text-[11px] text-neutral-500">Click a rider to filter history</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <button
          v-for="r in ridersUnremitted"
          :key="r.id"
          type="button"
          @click="riderFilter = (riderFilter == r.id ? 'all' : r.id)"
          class="p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
          :class="riderFilter == r.id
            ? 'bg-amber-500/15 border-amber-500/50'
            : 'bg-surface-950/70 border-surface-800 hover:border-surface-700'">
          <div class="min-w-0">
            <p class="text-xs font-bold text-white truncate">{{ r.name }}</p>
            <p class="text-[10px] text-neutral-400 mt-0.5">
              <span v-if="r.pending_remittance" class="text-amber-300 font-bold inline-flex items-center gap-1"><i class="pi pi-clock text-[10px]"></i>Handover Pending</span>
              <span v-else-if="r.unremitted_orders_count > 0">{{ r.unremitted_orders_count }} unremitted COD order(s)</span>
              <span v-else class="text-emerald-400">Settled (₱0.00)</span>
            </p>
          </div>
          <span
            class="font-mono font-black text-sm shrink-0"
            :class="r.unremitted_amount > 0 ? 'text-amber-300' : 'text-emerald-400'">
            ₱{{ Number(r.unremitted_amount || 0).toFixed(2) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Pending Handovers Requiring Staff / Admin Acceptance -->
    <div v-if="pendingRemittances.length > 0" class="space-y-3">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 "></span>
        <h3 class="text-sm font-black text-white uppercase tracking-wider">
          Pending Handover Requests ({{ pendingRemittances.length }})
        </h3>
      </div>

      <div
        v-for="rem in pendingRemittances"
        :key="rem.id"
        class="bg-amber-950/25 border border-amber-500/40 rounded-2xl p-5  space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              <i class="pi pi-wallet"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base font-black text-white">{{ rem.driver_name }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-900 text-amber-300 border border-amber-500/30">
                  {{ rem.reference_number }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 ">
                  Awaiting Acceptance
                </span>
              </div>
              <p class="text-xs text-amber-200/80 mt-0.5">
                {{ rem.driver_phone || 'Rider' }} • Submitted {{ formatDateTime(rem.created_at) }} • {{ rem.orders_count }} COD order{{ rem.orders_count === 1 ? '' : 's' }}
              </p>
            </div>
          </div>

          <div class="text-left md:text-right">
            <p class="text-[10px] font-bold uppercase tracking-wider text-amber-300">Cash to Receive</p>
            <p class="text-lg sm:text-xl font-bold text-white font-mono">₱{{ Number(rem.amount).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Order Breakdown -->
        <div v-if="rem.orders && rem.orders.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="ord in rem.orders"
            :key="ord.id"
            class="p-2.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center justify-between text-xs">
            <div class="min-w-0 pr-2">
              <p class="font-mono font-bold text-white truncate">{{ ord.order_number }}</p>
              <p class="text-[10px] text-neutral-400 truncate">{{ ord.customer_name }}</p>
            </div>
            <span class="font-mono font-bold text-amber-300 shrink-0">₱{{ Number(ord.total_amount).toFixed(2) }}</span>
          </div>
        </div>
        <div v-else-if="rem.order_numbers && rem.order_numbers.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="ordNum in rem.order_numbers"
            :key="ordNum"
            class="px-2.5 py-1 rounded-lg bg-surface-950/80 border border-surface-800 font-mono text-xs text-neutral-200">
            {{ ordNum }}
          </span>
        </div>

        <p v-if="rem.rider_notes" class="text-xs text-amber-100 bg-surface-950/60 p-3 rounded-xl border border-amber-500/20">
          <strong class="text-amber-300">Rider Note:</strong> "{{ rem.rider_notes }}"
        </p>

        <!-- Staff Verification Note + Accept / Reject Controls -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <input
            v-model="staffNotesMap[rem.id]"
            type="text"
            placeholder="Optional verification note (e.g. Cash counted &amp; stored in POS drawer)"
            class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500" />
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              :disabled="processingId === rem.id"
              @click="handleReject(rem)"
              class="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50">
              <i class="pi pi-times mr-1 text-[10px]"></i>Reject
            </button>
            <button
              type="button"
              :disabled="processingId === rem.id"
              @click="handleAccept(rem)"
              class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95">
              <i class="pi" :class="processingId === rem.id ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              <span>Accept Remittance (₱{{ Number(rem.amount).toFixed(2) }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Remittance History Section -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <i class="pi pi-history text-purple-400"></i>
          <span>Remittance History</span>
        </h3>
        <span class="text-xs text-neutral-400">
          Showing <strong class="text-white">{{ filteredHistory.length }}</strong> record(s)
        </span>
      </div>

      <!-- Filters -->
      <div class="bg-surface-900 border border-surface-800 rounded-2xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="st in [{id:'all',label:'All'},{id:'pending',label:'Pending'},{id:'accepted',label:'Accepted'},{id:'rejected',label:'Rejected'},{id:'cancelled',label:'Cancelled'}]"
            :key="st.id"
            type="button"
            @click="statusFilter = st.id"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
            :class="statusFilter === st.id ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-surface-950 text-neutral-400 border-surface-800 hover:text-white'">
            {{ st.label }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="riderFilter"
            class="bg-surface-950 border border-surface-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50">
            <option value="all">All Riders</option>
            <option v-for="r in riderFilterOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>

          <input
            v-model="dateFilter"
            type="date"
            class="bg-surface-950 border border-surface-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]" />

          <div class="relative flex-1 sm:w-52">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search ref #, rider, staff..."
              class="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50" />
          </div>

          <button
            v-if="statusFilter !== 'all' || riderFilter !== 'all' || dateFilter || searchQuery"
            type="button"
            @click="resetFilters"
            class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-xs font-bold text-neutral-300 cursor-pointer">
            Clear
          </button>
        </div>
      </div>

      <!-- Empty History -->
      <div v-if="filteredHistory.length === 0" class="bg-surface-900 border border-surface-800 rounded-2xl p-10 text-center space-y-2 ">
        <div class="w-12 h-12 rounded-2xl bg-surface-800 text-gray-400 flex items-center justify-center text-2xl mx-auto"><i class="pi pi-receipt"></i></div>
        <h4 class="text-base font-bold text-white">No Remittance Records Found</h4>
        <p class="text-xs text-neutral-400">No rider remittance handovers match the selected filters.</p>
      </div>

      <!-- History Cards -->
      <div v-else class="space-y-3">
        <div
          v-for="rem in filteredHistory"
          :key="rem.id"
          class="bg-surface-900 border border-surface-800 hover:border-surface-700 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg transition-all text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-800/80">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono font-black text-white text-sm">{{ rem.reference_number }}</span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  :class="rem.status === 'accepted'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : (rem.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30')">
                  {{ rem.status }}
                </span>
                <span class="text-neutral-300 font-bold">• {{ rem.driver_name }}</span>
              </div>
              <p class="text-[11px] text-neutral-400 mt-0.5">
                Submitted: {{ formatDateTime(rem.created_at) }} • {{ rem.orders_count }} COD order{{ rem.orders_count === 1 ? '' : 's' }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg font-black font-mono" :class="rem.status === 'accepted' ? 'text-emerald-400' : 'text-white'">
                ₱{{ Number(rem.amount).toFixed(2) }}
              </span>
              <button
                v-if="rem.status === 'pending'"
                type="button"
                :disabled="processingId === rem.id"
                @click="handleAccept(rem)"
                class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors cursor-pointer">
                Accept
              </button>
            </div>
          </div>

          <div v-if="rem.order_numbers && rem.order_numbers.length" class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-bold uppercase text-neutral-500 mr-1">Orders:</span>
            <span
              v-for="ordNum in rem.order_numbers"
              :key="ordNum"
              class="px-2 py-0.5 rounded-md bg-surface-950 border border-surface-800 font-mono text-[11px] text-neutral-300">
              {{ ordNum }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
            <div v-if="rem.rider_notes" class="p-2.5 rounded-xl bg-surface-950/60 border border-surface-800 text-neutral-300">
              <span class="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">Rider Note:</span>
              {{ rem.rider_notes }}
            </div>

            <div v-if="rem.status === 'accepted'" class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              <span class="text-[10px] font-bold uppercase text-emerald-400/80 block mb-0.5">Accepted &amp; Verified By:</span>
              <strong>{{ rem.accepted_by_name || 'Staff / Admin' }}</strong>
              <span v-if="rem.accepted_by_role" class="uppercase text-[10px] opacity-80 ml-1">({{ rem.accepted_by_role }})</span>
              <span class="block text-[10px] font-mono text-emerald-300/80 mt-0.5">{{ formatDateTime(rem.accepted_at) }}</span>
              <span v-if="rem.staff_notes" class="block text-[11px] text-emerald-200 mt-1 italic">"{{ rem.staff_notes }}"</span>
            </div>

            <div v-else-if="rem.status === 'rejected'" class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
              <span class="text-[10px] font-bold uppercase text-rose-400/80 block mb-0.5">Rejected By:</span>
              <strong>{{ rem.rejected_by_name || 'Staff / Admin' }}</strong>
              <span class="block text-[10px] font-mono text-rose-300/80 mt-0.5">{{ formatDateTime(rem.rejected_at) }}</span>
              <span v-if="rem.staff_notes" class="block text-[11px] text-rose-200 mt-1 italic">"{{ rem.staff_notes }}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';

export default {
  name: 'AdminRemittancesTab',
  setup() {
    const store = useGShotStore();
    const loading = ref(false);
    const processingId = ref(null);
    const staffNotesMap = reactive({});

    const statusFilter = ref('all');
    const riderFilter = ref('all');
    const dateFilter = ref('');
    const searchQuery = ref('');

    let poller = null;

    const refreshData = async () => {
      loading.value = true;
      try {
        await store.fetchRemittances({}, true);
      } finally {
        loading.value = false;
      }
    };

    const summary = computed(() => store.remittanceSummary || {});
    const ridersUnremitted = computed(() => summary.value.riders_unremitted || []);
    const ridersHoldingCashCount = computed(() => ridersUnremitted.value.filter(r => Number(r.unremitted_amount) > 0).length);

    const pendingRemittances = computed(() => {
      return (store.remittances || []).filter(r => r.status === 'pending');
    });

    const riderFilterOptions = computed(() => {
      const map = new Map();
      for (const r of ridersUnremitted.value) {
        map.set(String(r.id), { id: r.id, name: r.name });
      }
      for (const rem of (store.remittances || [])) {
        if (rem.driver_id && !map.has(String(rem.driver_id))) {
          map.set(String(rem.driver_id), { id: rem.driver_id, name: rem.driver_name });
        }
      }
      return Array.from(map.values());
    });

    const filteredHistory = computed(() => {
      let list = store.remittances || [];
      if (statusFilter.value !== 'all') {
        list = list.filter(r => r.status === statusFilter.value);
      }
      if (riderFilter.value !== 'all') {
        list = list.filter(r => String(r.driver_id) === String(riderFilter.value));
      }
      if (dateFilter.value) {
        list = list.filter(r => {
          const d = new Date(r.created_at);
          if (isNaN(d.getTime())) return false;
          const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          return key === dateFilter.value;
        });
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase();
        list = list.filter(r =>
          (r.reference_number && r.reference_number.toLowerCase().includes(q)) ||
          (r.driver_name && r.driver_name.toLowerCase().includes(q)) ||
          (r.accepted_by_name && r.accepted_by_name.toLowerCase().includes(q)) ||
          (Array.isArray(r.order_numbers) && r.order_numbers.some(o => String(o).toLowerCase().includes(q)))
        );
      }
      return list;
    });

    const resetFilters = () => {
      statusFilter.value = 'all';
      riderFilter.value = 'all';
      dateFilter.value = '';
      searchQuery.value = '';
    };

    const handleAccept = async (rem) => {
      if (processingId.value) return;
      if (!confirm(`Confirm receipt of ₱${Number(rem.amount).toFixed(2)} COD cash from ${rem.driver_name} (${rem.reference_number})? This will reset those orders' remittance balance to ₱0.00.`)) {
        return;
      }
      processingId.value = rem.id;
      try {
        await store.acceptRemittance(rem.id, staffNotesMap[rem.id] || '');
        delete staffNotesMap[rem.id];
      } finally {
        processingId.value = null;
      }
    };

    const handleReject = async (rem) => {
      if (processingId.value) return;
      const reason = staffNotesMap[rem.id] || prompt('Optional reason for rejecting/returning this remittance:', 'Cash amount does not match') || '';
      processingId.value = rem.id;
      try {
        await store.rejectRemittance(rem.id, reason);
        delete staffNotesMap[rem.id];
      } finally {
        processingId.value = null;
      }
    };

    const formatDateTime = (dt) => {
      if (!dt) return '';
      const d = new Date(dt);
      if (isNaN(d.getTime())) return dt;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    onMounted(() => {
      refreshData();
      poller = setInterval(() => store.fetchRemittances({}, true), 8000);
    });

    onUnmounted(() => {
      if (poller) clearInterval(poller);
    });

    return {
      store,
      loading,
      processingId,
      staffNotesMap,
      statusFilter,
      riderFilter,
      dateFilter,
      searchQuery,
      summary,
      ridersUnremitted,
      ridersHoldingCashCount,
      pendingRemittances,
      riderFilterOptions,
      filteredHistory,
      resetFilters,
      refreshData,
      handleAccept,
      handleReject,
      formatDateTime,
    };
  },
};
</script>
