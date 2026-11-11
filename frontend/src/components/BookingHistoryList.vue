<template>
  <div class="space-y-4">
    <!-- Filter Tabs & Refresh -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          @click="statusFilter = tab.key"
          class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
          :class="statusFilter === tab.key
            ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
            : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
          <span>{{ tab.label }}</span>
          <span
            class="text-[10px] px-1.5 py-0.2 rounded-full"
            :class="statusFilter === tab.key ? 'bg-black/20 text-black' : 'bg-surface-700 text-gray-300'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <button
        type="button"
        @click="refreshBookings"
        :disabled="isLoading"
        class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800/90 hover:bg-surface-700 text-[11px] font-semibold text-gray-300 hover:text-white border border-surface-700/60 transition-colors disabled:opacity-50 cursor-pointer shrink-0 self-end sm:self-auto"
        title="Refresh booking status">
        <i class="pi pi-sync text-[10px]" :class="{ 'animate-spin text-yellow-400': isLoading }"></i>
        <span>{{ isLoading ? 'Checking...' : 'Check Status' }}</span>
      </button>
    </div>

    <!-- Bookings Cards -->
    <div v-if="filteredBookings.length > 0" class="space-y-3.5">
      <div
        v-for="b in filteredBookings"
        :key="b.id"
        class="rounded-2xl bg-surface-900/90 border transition-all shadow-lg space-y-3"
        :class="[
          compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5',
          isHighlighted(b.id)
            ? 'border-yellow-400/70 ring-1 ring-yellow-400/30'
            : b.status === 'Approved'
              ? 'border-emerald-500/40'
              : 'border-surface-800 hover:border-surface-700'
        ]">

        <!-- Top Header: Booking #, Event Type, Status Badge -->
        <div class="flex flex-wrap items-start justify-between gap-2 border-b border-surface-800/80 pb-2.5">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-800 text-gray-300 border border-surface-700">
                #{{ b.id }}
              </span>
              <span
                v-if="isHighlighted(b.id)"
                class="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                Just Submitted
              </span>
              <span class="text-[10px] text-gray-400">
                Booked {{ formatSubmittedAt(b.created_at) }}
              </span>
            </div>
            <h4 class="text-sm sm:text-base font-black text-white mt-1 break-words">
              {{ b.event_type }}
            </h4>
          </div>

          <span
            class="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border shrink-0"
            :class="getStatusBadgeClass(b.status)">
            <i :class="getStatusIcon(b.status)" class="text-[10px]"></i>
            <span>{{ getStatusLabel(b.status) }}</span>
          </span>
        </div>

        <!-- Approval / Review Banner -->
        <div
          class="p-2.5 sm:p-3 rounded-xl border text-[11px] flex items-start gap-2.5"
          :class="getApprovalBannerClass(b.status)">
          <i :class="getApprovalBannerIcon(b.status)" class="text-sm mt-0.5 shrink-0"></i>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="font-bold leading-snug">{{ getApprovalHeadline(b) }}</p>
            <p class="opacity-85 text-[10px] sm:text-[11px] leading-relaxed">{{ getApprovalSubtext(b) }}</p>
          </div>
        </div>

        <!-- Booking Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs bg-surface-950/60 p-3 rounded-xl border border-surface-800/80">
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-500">Event Date & Time</p>
            <p class="font-bold text-white mt-0.5">{{ formatEventDate(b.event_date) }}</p>
            <p class="text-[10px] text-gray-400 truncate" :title="b.event_time || 'TBD'">{{ b.event_time || 'TBD' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-500">Guests</p>
            <p class="font-bold text-white mt-0.5">{{ b.guest_count }} pax</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-500">Venue / Location</p>
            <p class="font-bold text-white mt-0.5 break-words">{{ b.location }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-gray-500">Est. Base Cost</p>
            <p class="font-black text-amber-400 mt-0.5">₱{{ Number(b.estimated_cost || 0).toLocaleString() }}.00</p>
          </div>
        </div>

        <!-- Contact & Notes -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-0.5">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><i class="pi pi-user text-[10px] mr-1 text-gray-500"></i>{{ b.client_name }}</span>
            <span><i class="pi pi-phone text-[10px] mr-1 text-gray-500"></i>{{ b.client_phone }}</span>
          </div>
          <span v-if="b.notes" class="italic text-gray-400 break-words">
            "{{ b.notes }}"
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10 px-4 rounded-2xl bg-surface-900/60 border border-surface-800 space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mx-auto text-amber-400 text-xl">
        <i class="pi pi-calendar"></i>
      </div>
      <div class="max-w-sm mx-auto space-y-1">
        <p class="text-sm font-bold text-white">
          {{ statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} bookings` : 'No event bookings yet' }}
        </p>
        <p class="text-[11px] text-gray-400 leading-relaxed">
          {{ statusFilter !== 'all'
            ? 'Switch to All to see your other event booking requests.'
            : 'Once you submit a catering or mobile bar request, it will appear here so you can monitor approval from our admin and staff.' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
        <button
          v-if="statusFilter !== 'all'"
          type="button"
          @click="statusFilter = 'all'"
          class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold border border-surface-700 cursor-pointer">
          Show All Bookings
        </button>
        <button
          type="button"
          @click="$emit('book-new')"
          class="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-md shadow-yellow-400/20 cursor-pointer inline-flex items-center gap-1.5">
          <i class="pi pi-calendar-plus text-xs"></i>
          <span>Book an Event</span>
        </button>
      </div>
    </div>

    <!-- Guest Phone / Reference Lookup (for bookings made on another device) -->
    <div v-if="!store.user" class="p-3.5 rounded-2xl bg-surface-950/70 border border-surface-800/80 space-y-2">
      <p class="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
        <i class="pi pi-search text-amber-400 text-xs"></i>
        <span>Booked from another device? Look up by mobile number or Booking #</span>
      </p>
      <div class="flex items-center gap-2">
        <input
          v-model="lookupQuery"
          @keyup.enter="lookupBookings"
          type="text"
          placeholder="e.g. 09171234567 or #12"
          class="flex-1 px-3 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
        <button
          type="button"
          @click="lookupBookings"
          :disabled="isSearching || !lookupQuery.trim()"
          class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-yellow-400 border border-yellow-400/40 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shrink-0">
          {{ isSearching ? 'Searching...' : 'Find' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

export default {
  name: 'BookingHistoryList',
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
    highlightId: {
      type: [Number, String],
      default: null,
    },
  },
  emits: ['book-new'],
  setup(props) {
    const store = useGShotStore();
    const isLoading = ref(false);
    const statusFilter = ref('all');
    const lookupQuery = ref('');
    const isSearching = ref(false);

    const refreshBookings = async () => {
      isLoading.value = true;
      try {
        await store.fetchMyBookings();
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      refreshBookings();
    });

    const bookings = computed(() => {
      const list = Array.isArray(store.bookingsList) ? [...store.bookingsList] : [];
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return list;
    });

    const countByStatus = (status) => bookings.value.filter(b => b.status === status).length;

    const filterTabs = computed(() => [
      { key: 'all', label: 'All', count: bookings.value.length },
      { key: 'Pending', label: 'Pending', count: countByStatus('Pending') },
      { key: 'Approved', label: 'Approved', count: countByStatus('Approved') },
      { key: 'Completed', label: 'Completed', count: countByStatus('Completed') },
      { key: 'Declined', label: 'Declined', count: countByStatus('Declined') },
    ]);

    const filteredBookings = computed(() => {
      if (statusFilter.value === 'all') return bookings.value;
      return bookings.value.filter(b => b.status === statusFilter.value);
    });

    const isHighlighted = (id) => {
      return props.highlightId !== null && String(props.highlightId) === String(id);
    };

    const formatEventDate = (dateStr) => {
      if (!dateStr) return 'TBD';
      const parsed = new Date(dateStr);
      if (Number.isNaN(parsed.getTime())) return String(dateStr).slice(0, 10);
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatSubmittedAt = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatReviewer = (b) => {
      const roleMap = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        staff: 'Staff',
      };
      const roleLabel = roleMap[b.reviewed_by_role] || 'Admin / Staff';
      if (b.reviewed_by_name && b.reviewed_by_name !== 'Staff' && b.reviewed_by_name !== 'Store Staff') {
        return `${roleLabel} (${b.reviewed_by_name})`;
      }
      return roleLabel;
    };

    const getStatusLabel = (status) => {
      if (status === 'Pending') return 'Pending Approval';
      return status || 'Pending';
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Approved':
          return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        case 'Completed':
          return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
        case 'Declined':
          return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        default:
          return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Approved':
          return 'pi pi-check-circle';
        case 'Completed':
          return 'pi pi-verified';
        case 'Declined':
          return 'pi pi-times-circle';
        default:
          return 'pi pi-clock';
      }
    };

    const getApprovalBannerClass = (status) => {
      switch (status) {
        case 'Approved':
          return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
        case 'Completed':
          return 'bg-sky-500/10 border-sky-500/30 text-sky-200';
        case 'Declined':
          return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
        default:
          return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
      }
    };

    const getApprovalBannerIcon = (status) => {
      switch (status) {
        case 'Approved':
          return 'pi pi-check-circle text-emerald-400';
        case 'Completed':
          return 'pi pi-star-fill text-sky-400';
        case 'Declined':
          return 'pi pi-exclamation-circle text-rose-400';
        default:
          return 'pi pi-hourglass text-amber-400';
      }
    };

    const getApprovalHeadline = (b) => {
      if (b.status === 'Approved') {
        const when = b.reviewed_at ? ` • ${formatSubmittedAt(b.reviewed_at)}` : '';
        return `Approved by ${formatReviewer(b)}${when}`;
      }
      if (b.status === 'Declined') {
        const when = b.reviewed_at ? ` • ${formatSubmittedAt(b.reviewed_at)}` : '';
        return `Declined by ${formatReviewer(b)}${when}`;
      }
      if (b.status === 'Completed') {
        return 'Event Completed';
      }
      return 'Waiting for Admin / Staff Approval';
    };

    const getApprovalSubtext = (b) => {
      if (b.status === 'Approved') {
        return 'Your event booking is confirmed! Our team will coordinate setup details and transportation with you.';
      }
      if (b.status === 'Declined') {
        return 'Unfortunately this slot could not be accommodated. Contact Jefferson Alulod (0994 612 1933) or submit a new request.';
      }
      if (b.status === 'Completed') {
        return 'Thank you for celebrating your event with G Shot Teas!';
      }
      return 'Your request has been received. Once an Admin or Staff member reviews and approves it, the status above will turn green.';
    };

    const lookupBookings = async () => {
      const q = lookupQuery.value.trim();
      if (!q) return;
      isSearching.value = true;
      try {
        const res = await GST_API.getMyBookings({ search: q });
        const found = Array.isArray(res.data) ? res.data : [];
        if (found.length > 0) {
          found.forEach(item => store.saveLocalBookingId(item.id));
          await store.fetchMyBookings();
          store.notify(`Found ${found.length} booking request(s)!`, 'success');
          lookupQuery.value = '';
        } else {
          store.notify('No event bookings matched that mobile number or Booking #.', 'warning');
        }
      } catch (err) {
        store.notify('Could not search bookings right now. Please try again.', 'error');
      } finally {
        isSearching.value = false;
      }
    };

    return {
      store,
      isLoading,
      statusFilter,
      lookupQuery,
      isSearching,
      bookings,
      filterTabs,
      filteredBookings,
      isHighlighted,
      refreshBookings,
      formatEventDate,
      formatSubmittedAt,
      getStatusLabel,
      getStatusBadgeClass,
      getStatusIcon,
      getApprovalBannerClass,
      getApprovalBannerIcon,
      getApprovalHeadline,
      getApprovalSubtext,
      lookupBookings,
    };
  },
};
</script>