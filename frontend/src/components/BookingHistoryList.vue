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
            : b.status === 'Awaiting Downpayment'
              ? 'border-amber-400/60 ring-1 ring-amber-400/20'
              : ['Approved', 'Confirmed'].includes(b.status)
                ? 'border-emerald-500/40'
                : b.status === 'Downpayment Submitted'
                  ? 'border-purple-500/40'
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
            <p class="text-[10px] font-bold uppercase text-gray-500">{{ b.final_cost && Number(b.final_cost) !== Number(b.estimated_cost) ? 'Final Agreed Price' : 'Est. Base Cost' }}</p>
            <p class="font-black text-amber-400 mt-0.5">₱{{ formatPeso(effectiveCost(b)) }}</p>
            <p v-if="b.final_cost && Number(b.final_cost) !== Number(b.estimated_cost)" class="text-[10px] text-gray-500 line-through">
              Est: ₱{{ formatPeso(b.estimated_cost) }}
            </p>
          </div>
        </div>

        <!-- Option A Downpayment Section -->
        <div
          v-if="['Awaiting Downpayment', 'Downpayment Submitted', 'Confirmed', 'Completed'].includes(b.status) || Number(b.downpayment_amount) > 0"
          class="p-3 rounded-xl border space-y-2.5 text-[11px]"
          :class="b.status === 'Awaiting Downpayment'
            ? 'bg-amber-500/10 border-amber-500/40'
            : b.status === 'Downpayment Submitted'
              ? 'bg-purple-500/10 border-purple-500/35'
              : 'bg-emerald-500/10 border-emerald-500/30'">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400 block">Required Downpayment</span>
              <span class="font-black text-white">
                ₱{{ formatPeso(b.downpayment_amount || 0) }}
                <span v-if="b.downpayment_percentage" class="text-[10px] text-amber-300">({{ b.downpayment_percentage }}%)</span>
              </span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400 block">Amount Paid</span>
              <span class="font-black" :class="Number(b.amount_paid) > 0 ? 'text-emerald-300' : 'text-gray-300'">
                ₱{{ formatPeso(b.amount_paid || 0) }}
              </span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400 block">Remaining Balance</span>
              <span class="font-black" :class="remainingBalance(b) > 0 ? 'text-amber-300' : 'text-emerald-300'">
                ₱{{ formatPeso(remainingBalance(b)) }}
              </span>
            </div>
          </div>

          <div v-if="b.payment_notes" class="text-[11px] text-sky-200 bg-surface-950/60 px-2.5 py-1.5 rounded-lg border border-sky-500/20">
            <strong>Staff Breakdown:</strong> {{ b.payment_notes }}
          </div>

          <div v-if="b.status === 'Awaiting Downpayment' && b.payment_status === 'Rejected' && b.downpayment_rejection_reason" class="text-[11px] text-rose-200 bg-rose-500/15 px-2.5 py-2 rounded-lg border border-rose-500/35">
            <strong>Receipt Rejected:</strong> {{ b.downpayment_rejection_reason }} — Please upload a valid receipt below.
          </div>

          <div v-if="b.status === 'Awaiting Downpayment'" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div class="text-[10px]">
              <span v-if="b.downpayment_deadline" :class="b.is_payment_overdue ? 'text-rose-300 font-bold' : 'text-amber-200/90'">
                <i class="pi pi-clock mr-1"></i>
                Pay by: {{ formatSubmittedAt(b.downpayment_deadline) }}
                <span v-if="b.is_payment_overdue" class="ml-1 uppercase">(Overdue — contact staff before paying)</span>
              </span>
            </div>
            <button
              type="button"
              @click="openPayModal(b)"
              class="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-md shadow-yellow-400/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
              <i class="pi pi-wallet text-xs"></i>
              <span>{{ b.payment_status === 'Rejected' ? 'Re-upload Downpayment Proof' : `Pay Downpayment (₱${formatPeso(b.downpayment_amount)})` }}</span>
            </button>
          </div>

          <div v-else-if="b.status === 'Downpayment Submitted'" class="flex items-center justify-between gap-2 pt-1 text-[11px] text-purple-200">
            <div>
              Submitted via <strong>{{ b.payment_method }}</strong> • Ref: <strong class="font-mono text-white">{{ b.payment_reference }}</strong>
            </div>
            <img v-if="b.payment_proof" :src="b.payment_proof" alt="Uploaded proof" class="w-9 h-9 rounded-lg object-cover border border-purple-400/40 shrink-0" />
          </div>
        </div>

        <!-- Contact & Notes -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-0.5">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><i class="pi pi-user text-[10px] mr-1 text-gray-500"></i>{{ b.client_name }}</span>
            <span><i class="pi pi-phone text-[10px] mr-1 text-gray-500"></i>{{ b.client_phone }}</span>
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <span v-if="b.notes" class="italic text-gray-400 break-words">
              "{{ b.notes }}"
            </span>
            <button
              v-if="b.status === 'Pending'"
              type="button"
              @click="cancelPendingBooking(b)"
              :disabled="cancellingId === b.id"
              class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0">
              {{ cancellingId === b.id ? 'Cancelling...' : 'Cancel Request' }}
            </button>
          </div>
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

    <!-- Pay Downpayment Modal -->
    <div
      v-if="payModalOpen && payTargetBooking"
      class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      @click.self="payModalOpen = false">
      <div class="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-2xl p-4 sm:p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div class="flex items-start justify-between border-b border-surface-800 pb-3">
          <div>
            <h3 class="text-base sm:text-lg font-black text-white">Submit Downpayment — Booking #{{ payTargetBooking.id }}</h3>
            <p class="text-[11px] text-gray-400">Send exact downpayment and upload your receipt screenshot for verification.</p>
          </div>
          <button type="button" @click="payModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer"><i class="pi pi-times text-sm"></i></button>
        </div>

        <!-- Amount Summary -->
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/35 flex items-center justify-between gap-2">
          <div>
            <p class="text-[10px] font-bold uppercase text-amber-300">Amount to Send Now</p>
            <p class="text-lg font-black text-white">₱{{ formatPeso(payTargetBooking.downpayment_amount) }}</p>
          </div>
          <div class="text-right text-[11px]">
            <p class="text-gray-400">Final Price: <strong class="text-white">₱{{ formatPeso(effectiveCost(payTargetBooking)) }}</strong></p>
            <p class="text-gray-400">Balance Later: <strong class="text-amber-300">₱{{ formatPeso(Math.max(0, effectiveCost(payTargetBooking) - Number(payTargetBooking.downpayment_amount || 0))) }}</strong></p>
          </div>
        </div>

        <!-- Store Payment Receiving Accounts -->
        <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-2.5 text-xs">
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Send Downpayment To Any Of These Accounts</p>
          <div v-if="store.settings?.booking_payment_qr" class="flex justify-center p-2 bg-white rounded-xl max-w-[180px] mx-auto">
            <img :src="store.settings.booking_payment_qr" alt="Payment QR" class="w-40 h-40 object-contain" />
          </div>

          <div class="space-y-1.5">
            <div v-if="gcashAccount.number" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-900 border border-surface-800">
              <div>
                <span class="text-[10px] font-black text-sky-400 uppercase">GCash</span>
                <p class="font-bold text-white font-mono">{{ gcashAccount.number }}</p>
                <p class="text-[10px] text-gray-400">{{ gcashAccount.name }}</p>
              </div>
              <button type="button" @click="copyAccountText(gcashAccount.number)" class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-amber-300 text-[10px] font-bold cursor-pointer">Copy</button>
            </div>

            <div v-if="mayaAccount.number" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-900 border border-surface-800">
              <div>
                <span class="text-[10px] font-black text-emerald-400 uppercase">Maya</span>
                <p class="font-bold text-white font-mono">{{ mayaAccount.number }}</p>
                <p class="text-[10px] text-gray-400">{{ mayaAccount.name }}</p>
              </div>
              <button type="button" @click="copyAccountText(mayaAccount.number)" class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-amber-300 text-[10px] font-bold cursor-pointer">Copy</button>
            </div>

            <div v-if="bankAccount.number" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-900 border border-surface-800">
              <div>
                <span class="text-[10px] font-black text-amber-400 uppercase">{{ bankAccount.bank || 'Bank Transfer' }}</span>
                <p class="font-bold text-white font-mono">{{ bankAccount.number }}</p>
                <p class="text-[10px] text-gray-400">{{ bankAccount.name }}</p>
              </div>
              <button type="button" @click="copyAccountText(bankAccount.number)" class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-amber-300 text-[10px] font-bold cursor-pointer">Copy</button>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitDownpaymentForm" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-300 mb-1">Payment Method Used</label>
            <select v-model="payForm.payment_method" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white cursor-pointer">
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">Reference / Transaction Number</label>
            <input
              v-model="payForm.payment_reference"
              type="text"
              required
              minlength="4"
              maxlength="100"
              placeholder="e.g. 1029384756123"
              class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label class="block font-bold text-gray-300 mb-1">Upload Receipt Screenshot (JPG / PNG / WebP)</label>
            <div class="p-3 rounded-xl bg-surface-950 border border-dashed border-surface-700 space-y-2">
              <div v-if="payForm.payment_proof" class="relative rounded-xl overflow-hidden bg-black max-h-48 flex items-center justify-center">
                <img :src="payForm.payment_proof" alt="Receipt Preview" class="max-h-48 object-contain" />
              </div>
              <div class="flex items-center justify-between gap-2">
                <label class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-300 border border-surface-700 font-bold cursor-pointer flex items-center gap-1.5">
                  <i class="pi" :class="processingProof ? 'pi-spin pi-spinner' : 'pi-upload'"></i>
                  <span>{{ payForm.payment_proof ? 'Change Screenshot' : 'Choose Receipt Screenshot' }}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleProofFileChange" />
                </label>
                <button v-if="payForm.payment_proof" type="button" @click="payForm.payment_proof = ''" class="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer">Remove</button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-800">
            <button type="button" @click="payModalOpen = false" class="px-4 py-2 rounded-xl bg-surface-800 text-gray-300 font-bold cursor-pointer">Cancel</button>
            <button type="submit" :disabled="submittingPay || processingProof || !payForm.payment_proof" class="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
              <i class="pi" :class="submittingPay ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              <span>{{ submittingPay ? 'Submitting...' : 'Submit Downpayment Proof' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
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
    const cancellingId = ref(null);

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
      { key: 'Awaiting Downpayment', label: 'Pay DP', count: countByStatus('Awaiting Downpayment') },
      { key: 'Downpayment Submitted', label: 'Verifying', count: countByStatus('Downpayment Submitted') },
      { key: 'Confirmed', label: 'Confirmed', count: countByStatus('Confirmed') },
      { key: 'Completed', label: 'Completed', count: countByStatus('Completed') },
      { key: 'Declined', label: 'Declined', count: countByStatus('Declined') },
      { key: 'Cancelled', label: 'Cancelled', count: countByStatus('Cancelled') },
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
      const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const dt = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
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

    const effectiveCost = (b) => {
      if (!b) return 0;
      const fc = Number(b.final_cost);
      return Number.isFinite(fc) && fc > 0 ? fc : Number(b.estimated_cost || 0);
    };
    const remainingBalance = (b) => {
      if (!b) return 0;
      if (b.remaining_balance !== undefined && b.remaining_balance !== null) {
        return Math.max(0, Number(b.remaining_balance));
      }
      return Math.max(0, effectiveCost(b) - Number(b.amount_paid || 0));
    };
    const formatPeso = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getStatusLabel = (status) => {
      if (status === 'Pending') return 'Pending Approval';
      if (status === 'Approved') return 'Approved (For Discussion)';
      if (status === 'Downpayment Submitted') return 'Verifying Receipt';
      return status || 'Pending';
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Approved':
          return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
        case 'Awaiting Downpayment':
          return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        case 'Downpayment Submitted':
          return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
        case 'Confirmed':
          return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        case 'Completed':
          return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
        case 'Declined':
          return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        case 'Cancelled':
          return 'bg-surface-700/70 text-gray-300 border-surface-600';
        default:
          return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Approved':
          return 'pi pi-comments';
        case 'Awaiting Downpayment':
          return 'pi pi-wallet';
        case 'Downpayment Submitted':
          return 'pi pi-receipt';
        case 'Confirmed':
          return 'pi pi-check-circle';
        case 'Completed':
          return 'pi pi-verified';
        case 'Declined':
          return 'pi pi-times-circle';
        case 'Cancelled':
          return 'pi pi-ban';
        default:
          return 'pi pi-clock';
      }
    };

    const getApprovalBannerClass = (status) => {
      switch (status) {
        case 'Approved':
          return 'bg-teal-500/10 border-teal-500/30 text-teal-200';
        case 'Awaiting Downpayment':
          return 'bg-amber-500/10 border-amber-500/35 text-amber-100';
        case 'Downpayment Submitted':
          return 'bg-purple-500/10 border-purple-500/35 text-purple-200';
        case 'Confirmed':
          return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
        case 'Completed':
          return 'bg-sky-500/10 border-sky-500/30 text-sky-200';
        case 'Declined':
          return 'bg-rose-500/10 border-rose-500/30 text-rose-200';
        case 'Cancelled':
          return 'bg-surface-800/70 border-surface-700 text-gray-300';
        default:
          return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
      }
    };

    const getApprovalBannerIcon = (status) => {
      switch (status) {
        case 'Approved':
          return 'pi pi-comments text-teal-400';
        case 'Awaiting Downpayment':
          return 'pi pi-wallet text-amber-400';
        case 'Downpayment Submitted':
          return 'pi pi-receipt text-purple-400';
        case 'Confirmed':
          return 'pi pi-check-circle text-emerald-400';
        case 'Completed':
          return 'pi pi-star-fill text-sky-400';
        case 'Declined':
          return 'pi pi-exclamation-circle text-rose-400';
        case 'Cancelled':
          return 'pi pi-ban text-gray-400';
        default:
          return 'pi pi-hourglass text-amber-400';
      }
    };

    const getApprovalHeadline = (b) => {
      if (b.status === 'Approved') {
        const when = b.reviewed_at ? ` • ${formatSubmittedAt(b.reviewed_at)}` : '';
        return `Approved by ${formatReviewer(b)}${when} — Discussing Final Details`;
      }
      if (b.status === 'Awaiting Downpayment') {
        return b.payment_status === 'Rejected'
          ? 'Downpayment Proof Rejected — Please Re-upload'
          : 'Ready for Downpayment — Lock In Your Slot';
      }
      if (b.status === 'Downpayment Submitted') {
        return 'Downpayment Proof Submitted — Verifying Payment';
      }
      if (b.status === 'Confirmed') {
        return 'Booking Confirmed! Downpayment Verified';
      }
      if (b.status === 'Declined') {
        const when = b.reviewed_at ? ` • ${formatSubmittedAt(b.reviewed_at)}` : '';
        return `Declined by ${formatReviewer(b)}${when}`;
      }
      if (b.status === 'Cancelled') {
        const when = b.reviewed_at ? ` • ${formatSubmittedAt(b.reviewed_at)}` : '';
        return `Booking Cancelled${when}`;
      }
      if (b.status === 'Completed') {
        return 'Event Completed — Fully Paid';
      }
      return 'Waiting for Admin / Staff Approval';
    };

    const getApprovalSubtext = (b) => {
      if (b.status === 'Approved') {
        return 'Your date is approved! Our owner/staff will reach out to finalize flavors, setup, and final pricing. Once finalized, the Pay Downpayment button will unlock here.';
      }
      if (b.status === 'Awaiting Downpayment') {
        return 'Our team has finalized your booking terms. Send the required downpayment and upload your receipt below to lock in your date.';
      }
      if (b.status === 'Downpayment Submitted') {
        return 'Thank you! We received your receipt and reference number. Staff/Admin will verify it shortly to confirm your reservation.';
      }
      if (b.status === 'Confirmed') {
        return `Your slot is officially reserved! Remaining balance of ₱${formatPeso(remainingBalance(b))} is settled on or before event day.`;
      }
      if (b.status === 'Declined') {
        return 'Unfortunately this slot could not be accommodated. Contact Jefferson Alulod (0994 612 1933) or submit a new request.';
      }
      if (b.status === 'Cancelled') {
        return 'This booking request was cancelled and its time slot has been released.';
      }
      if (b.status === 'Completed') {
        return 'Thank you for celebrating your event with G Shot Teas!';
      }
      return 'Your request has been received. Wait for Admin/Staff approval before discussing final details and downpayment.';
    };

    // Pay Downpayment Modal State & Methods
    const payModalOpen = ref(false);
    const payTargetBooking = ref(null);
    const submittingPay = ref(false);
    const processingProof = ref(false);
    const payForm = reactive({
      payment_method: 'GCash',
      payment_reference: '',
      payment_proof: '',
    });

    const gcashAccount = computed(() => ({
      number: store.settings?.booking_gcash_number || '0994 612 1933',
      name: store.settings?.booking_gcash_name || 'Jefferson Alulod / G Shot Teas',
    }));
    const mayaAccount = computed(() => ({
      number: store.settings?.booking_maya_number || '',
      name: store.settings?.booking_maya_name || 'G Shot Teas',
    }));
    const bankAccount = computed(() => ({
      bank: store.settings?.booking_bank_name || '',
      number: store.settings?.booking_bank_account || '',
      name: store.settings?.booking_bank_account_name || '',
    }));

    const openPayModal = (b) => {
      payTargetBooking.value = b;
      payForm.payment_method = b.payment_method && ['GCash', 'Maya', 'Bank Transfer'].includes(b.payment_method)
        ? b.payment_method
        : 'GCash';
      payForm.payment_reference = '';
      payForm.payment_proof = '';
      payModalOpen.value = true;
    };

    const copyAccountText = async (txt) => {
      try {
        await navigator.clipboard.writeText(String(txt || ''));
        store.notify('Account number copied!', 'success');
      } catch {
        store.notify('Please copy the number manually.', 'info');
      }
    };

    const handleProofFileChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        store.notify('Please upload a JPG, PNG, or WebP receipt screenshot.', 'error');
        return;
      }
      processingProof.value = true;
      const reader = new FileReader();
      reader.onerror = () => {
        processingProof.value = false;
        store.notify('Could not read the selected image file.', 'error');
      };
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => {
          processingProof.value = false;
          store.notify('Invalid image file.', 'error');
        };
        img.onload = () => {
          const maxDim = 900;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const webp = canvas.toDataURL('image/webp', 0.84);
          payForm.payment_proof = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85);
          processingProof.value = false;
        };
        img.src = ev.target?.result;
      };
      reader.readAsDataURL(file);
    };

    const submitDownpaymentForm = async () => {
      if (!payTargetBooking.value?.id) return;
      if (!payForm.payment_proof) {
        store.notify('Please attach your payment receipt screenshot.', 'warning');
        return;
      }
      submittingPay.value = true;
      try {
        const res = await GST_API.submitBookingDownpayment(payTargetBooking.value.id, {
          payment_method: payForm.payment_method,
          payment_reference: payForm.payment_reference.trim(),
          payment_proof: payForm.payment_proof,
          client_phone: payTargetBooking.value.client_phone,
        });
        store.notify(res.data?.message || 'Downpayment proof submitted!', 'success');
        payModalOpen.value = false;
        await store.fetchMyBookings();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to submit downpayment proof.', 'error');
      } finally {
        submittingPay.value = false;
      }
    };

    const cancelPendingBooking = async (b) => {
      const confirmed = await store.confirmDialog({
        title: 'Cancel Booking Request',
        message: `Cancel booking #${b.id} for ${formatEventDate(b.event_date)} (${b.event_time || 'scheduled time'})? This will release the time slot.`,
        confirmText: 'Yes, Cancel Booking',
        cancelText: 'Keep Booking',
        variant: 'danger',
        icon: 'pi-ban',
      });
      if (!confirmed) return;
      cancellingId.value = b.id;
      try {
        await store.cancelBooking(b.id, { client_phone: b.client_phone });
      } finally {
        cancellingId.value = null;
      }
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
      cancellingId,
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
      effectiveCost,
      remainingBalance,
      formatPeso,
      payModalOpen,
      payTargetBooking,
      submittingPay,
      processingProof,
      payForm,
      gcashAccount,
      mayaAccount,
      bankAccount,
      openPayModal,
      copyAccountText,
      handleProofFileChange,
      submitDownpaymentForm,
      cancelPendingBooking,
      lookupBookings,
    };
  },
};
</script>