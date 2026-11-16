<template>
<div class="space-y-6 sm:space-y-8">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-calendar"></i> RESERVATIONS & CATERING
          </span>
          <h2 class="text-lg sm:text-2xl font-bold text-white mt-1">Event Bookings</h2>
          <p class="text-xs text-gray-400">Manage customer reservations and edit booking packages, prices, pictures, and descriptions.</p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            v-if="activeSubTab === 'packages'"
            type="button"
            @click="openCreatePackageModal"
            class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/20">
            <i class="pi pi-plus text-xs"></i>
            <span>Add Package</span>
          </button>

          <button 
            type="button"
            @click="refreshAll"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors cursor-pointer"
            title="Refresh">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading || loadingPackages }"></i>
          </button>
        </div>
      </div>

      <!-- Sub-Tab Switcher: Requests vs Packages & Pricing -->
      <div class="flex flex-wrap items-center gap-2 border-b border-surface-800 pb-3">
        <button
          type="button"
          @click="activeSubTab = 'requests'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer"
          :class="activeSubTab === 'requests'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
            : 'bg-surface-900 text-gray-400 hover:text-white border-surface-800'">
          <i class="pi pi-inbox text-xs"></i>
          <span>Booking Requests</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-800 text-gray-300">
            {{ bookings.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeSubTab = 'packages'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer"
          :class="activeSubTab === 'packages'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
            : 'bg-surface-900 text-gray-400 hover:text-white border-surface-800'">
          <i class="pi pi-sliders-h text-xs"></i>
          <span>Packages, Prices & Flyers</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-800 text-gray-300">
            {{ store.bookingPackages.length }}
          </span>
        </button>
      </div>

      <!-- ================= TAB 1: BOOKING REQUESTS ================= -->
      <div v-if="activeSubTab === 'requests'" class="space-y-5">
        <!-- Status Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            v-for="tab in requestFilterTabs"
            :key="tab.key"
            type="button"
            @click="requestStatusFilter = tab.key"
            class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border"
            :class="requestStatusFilter === tab.key
              ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
              : tab.key === 'Downpayment Submitted' && tab.count > 0
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-surface-900 text-gray-300 hover:text-white border-surface-800'">
            <span>{{ tab.label }}</span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full font-black"
              :class="requestStatusFilter === tab.key ? 'bg-black/20 text-black' : 'bg-surface-800 text-gray-300'">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <div v-if="filteredBookings.length > 0" class="space-y-5">
          <div 
            v-for="b in filteredBookings" 
            :key="b.id"
            class="p-3.5 sm:p-5 rounded-2xl bg-surface-800/90 border space-y-4 transition-all"
            :class="b.status === 'Downpayment Submitted'
              ? 'border-amber-500/60 ring-1 ring-amber-500/25'
              : b.status === 'Confirmed'
                ? 'border-emerald-500/40'
                : 'border-surface-700'">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-700/60 pb-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-900 text-gray-400 border border-surface-700">#{{ b.id }}</span>
                  <span class="text-base font-bold text-white">{{ b.event_type }}</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">
                  Client: <span class="text-brand-400 font-semibold">{{ b.client_name }}</span> ({{ b.client_phone }})
                  <span v-if="b.client_email" class="text-gray-500"> • {{ b.client_email }}</span>
                </p>
              </div>

              <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <span
                  v-if="b.payment_status && b.payment_status !== 'Unpaid'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="getPaymentBadgeClass(b.payment_status)">
                  {{ b.payment_status }}
                </span>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                  :class="getStatusBadge(b.status)">
                  {{ b.status }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-surface-900/60 p-4 rounded-2xl border border-surface-700/50">
              <div>
                <p class="text-gray-500 font-bold uppercase text-[10px]">Date & Time</p>
                <p class="font-bold text-white mt-0.5">{{ formatDate(b.event_date) }}</p>
                <p class="text-gray-400 text-[11px]">{{ b.event_time || 'TBD' }}</p>
              </div>
              <div>
                <p class="text-gray-500 font-bold uppercase text-[10px]">Estimated Guests</p>
                <p class="font-bold text-white mt-0.5">{{ b.guest_count }} persons</p>
              </div>
              <div>
                <p class="text-gray-500 font-bold uppercase text-[10px]">Location</p>
                <p class="font-bold text-white mt-0.5 truncate" :title="b.location">{{ b.location }}</p>
              </div>
              <div>
                <p class="text-gray-500 font-bold uppercase text-[10px]">{{ b.final_cost && Number(b.final_cost) !== Number(b.estimated_cost) ? 'Final Agreed Cost' : 'Est. Package Cost' }}</p>
                <p class="font-bold text-amber-400 mt-0.5">₱{{ formatPeso(effectiveCost(b)) }}</p>
                <p v-if="b.final_cost && Number(b.final_cost) !== Number(b.estimated_cost)" class="text-[10px] text-gray-500 line-through">
                  Est: ₱{{ formatPeso(b.estimated_cost) }}
                </p>
              </div>
            </div>

            <!-- Financial / Downpayment Summary Strip -->
            <div
              v-if="Number(b.downpayment_amount) > 0 || ['Approved', 'Awaiting Downpayment', 'Downpayment Submitted', 'Confirmed', 'Completed'].includes(b.status)"
              class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-2xl bg-surface-950/70 border border-surface-700/60">
              <div>
                <p class="text-[10px] font-bold uppercase text-gray-500">Required Downpayment</p>
                <p class="font-black text-white mt-0.5">
                  {{ Number(b.downpayment_amount) > 0 ? `₱${formatPeso(b.downpayment_amount)}` : 'Pending Discussion' }}
                  <span v-if="b.downpayment_percentage" class="text-[10px] font-semibold text-amber-400">({{ b.downpayment_percentage }}%)</span>
                </p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase text-gray-500">Amount Paid</p>
                <p class="font-black mt-0.5" :class="Number(b.amount_paid) > 0 ? 'text-emerald-400' : 'text-gray-400'">
                  ₱{{ formatPeso(b.amount_paid || 0) }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase text-gray-500">Remaining Balance</p>
                <p class="font-black mt-0.5" :class="Number(remainingBalance(b)) > 0 ? 'text-amber-300' : 'text-emerald-400'">
                  ₱{{ formatPeso(remainingBalance(b)) }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase text-gray-500">Payment Deadline</p>
                <p v-if="b.downpayment_deadline" class="font-bold mt-0.5" :class="b.is_payment_overdue ? 'text-rose-400' : 'text-gray-200'">
                  {{ formatDateTime(b.downpayment_deadline) }}
                  <span v-if="b.is_payment_overdue" class="ml-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] uppercase">Overdue</span>
                </p>
                <p v-else class="text-gray-500 mt-0.5">—</p>
              </div>
            </div>

            <div v-if="b.payment_notes" class="text-xs text-sky-200 bg-sky-500/10 border border-sky-500/25 rounded-xl px-3 py-2 flex items-start gap-2">
              <i class="pi pi-info-circle text-sky-400 mt-0.5 shrink-0"></i>
              <span><strong>Agreed Notes:</strong> {{ b.payment_notes }}</span>
            </div>

            <!-- Submitted Downpayment Verification Card -->
            <div
              v-if="b.status === 'Downpayment Submitted' || (b.payment_proof && ['Confirmed', 'Completed'].includes(b.status))"
              class="p-3.5 rounded-2xl border space-y-3"
              :class="b.status === 'Downpayment Submitted' ? 'bg-amber-500/10 border-amber-500/40' : 'bg-emerald-500/10 border-emerald-500/30'">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="text-xs space-y-0.5">
                  <p class="font-black text-white flex items-center gap-1.5">
                    <i class="pi" :class="b.status === 'Downpayment Submitted' ? 'pi-receipt text-amber-400' : 'pi-verified text-emerald-400'"></i>
                    <span>{{ b.status === 'Downpayment Submitted' ? 'Downpayment Proof Submitted — Needs Verification' : 'Verified Downpayment Receipt' }}</span>
                  </p>
                  <p class="text-[11px] text-gray-300">
                    Method: <strong class="text-white">{{ b.payment_method }}</strong>
                    • Ref #: <strong class="font-mono text-amber-300">{{ b.payment_reference }}</strong>
                    <span v-if="b.downpayment_submitted_at" class="text-gray-400"> • Submitted {{ formatDateTime(b.downpayment_submitted_at) }}</span>
                  </p>
                  <p v-if="b.downpayment_verified_at" class="text-[11px] text-emerald-300">
                    Verified by {{ b.downpayment_verified_by || 'Staff' }} on {{ formatDateTime(b.downpayment_verified_at) }}
                    <span v-if="b.final_payment_method"> • Final Balance via {{ b.final_payment_method }} {{ b.final_payment_reference ? `(Ref: ${b.final_payment_reference})` : '' }}</span>
                  </p>
                </div>

                <button
                  v-if="b.payment_proof"
                  type="button"
                  @click="openProofViewer(b)"
                  class="px-3 py-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto">
                  <img :src="b.payment_proof" alt="Receipt" class="w-7 h-7 rounded object-cover border border-surface-700" />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>

            <div v-if="b.downpayment_rejection_reason && b.status !== 'Downpayment Submitted'" class="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <strong>Last Note / Rejection Reason:</strong> {{ b.downpayment_rejection_reason }}
            </div>

            <div v-if="b.notes" class="text-xs text-gray-400 italic">
              Special instructions: "{{ b.notes }}"
            </div>

            <!-- Actions -->
            <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-surface-700/50">
              <button
                v-if="!['Completed', 'Cancelled'].includes(b.status)"
                type="button"
                @click="openEditBookingModal(b)"
                class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-700 hover:bg-surface-600 text-gray-100 border border-surface-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <i class="pi pi-pencil text-[11px] text-amber-400"></i>
                <span>Edit Details / Package / Price</span>
              </button>
              <span v-else class="text-[11px] text-gray-500 italic">Closed booking</span>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap justify-end">
                <template v-if="b.status === 'Pending'">
                  <button 
                    type="button"
                    @click="updateStatus(b, 'Approved')"
                    class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer text-center">
                    Approve Booking (Start Discussion)
                  </button>
                  <button 
                    type="button"
                    @click="updateStatus(b, 'Declined')"
                    class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer text-center">
                    Decline
                  </button>
                </template>

                <template v-else-if="b.status === 'Approved'">
                  <span class="text-[11px] text-emerald-300/90 px-2 py-1">Done talking with client?</span>
                  <button 
                    type="button"
                    @click="openRequestDpModal(b)"
                    class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5">
                    <i class="pi pi-wallet text-xs"></i>
                    <span>Request Downpayment</span>
                  </button>
                  <button 
                    type="button"
                    @click="cancelByAdmin(b)"
                    class="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer text-center">
                    Cancel
                  </button>
                </template>

                <template v-else-if="b.status === 'Awaiting Downpayment'">
                  <button 
                    type="button"
                    @click="openRequestDpModal(b)"
                    class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-700 hover:bg-surface-600 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer text-center">
                    Edit DP Terms
                  </button>
                  <button 
                    type="button"
                    @click="cancelByAdmin(b, b.is_payment_overdue ? 'Payment deadline lapsed' : '')"
                    class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center border"
                    :class="b.is_payment_overdue ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500' : 'text-rose-400 hover:bg-rose-500/20 border-rose-500/30'">
                    {{ b.is_payment_overdue ? 'Overdue — Release Slot' : 'Cancel Booking' }}
                  </button>
                </template>

                <template v-else-if="b.status === 'Downpayment Submitted'">
                  <button 
                    type="button"
                    @click="verifyDownpayment(b)"
                    :disabled="actionLoadingId === b.id"
                    class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <i class="pi pi-check-circle text-xs"></i>
                    <span>Verify & Confirm Booking</span>
                  </button>
                  <button 
                    type="button"
                    @click="openRejectDpModal(b)"
                    class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 transition-colors cursor-pointer text-center">
                    Reject Proof
                  </button>
                </template>

                <template v-else-if="b.status === 'Confirmed'">
                  <button 
                    type="button"
                    @click="openCompleteModal(b)"
                    class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5">
                    <i class="pi pi-verified text-xs"></i>
                    <span>Complete & Settle Balance</span>
                  </button>
                  <button 
                    type="button"
                    @click="cancelByAdmin(b)"
                    class="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer text-center">
                    Cancel
                  </button>
                </template>
              </div>
            </div>

          </div>
        </div>

        <div v-else class="text-center py-20 bg-surface-800/40 rounded-2xl border border-surface-700/50">
          <div class="w-12 h-12 rounded-2xl bg-surface-800 text-gray-400 flex items-center justify-center text-2xl mx-auto mb-3"><i class="pi pi-calendar"></i></div>
          <p class="text-base font-bold text-white">{{ requestStatusFilter === 'all' ? 'No event booking requests' : 'No matching bookings in this tab' }}</p>
          <p class="text-xs text-gray-500 mt-1">Catering and mobile bar reservations will appear here.</p>
        </div>
      </div>

      <!-- ================= TAB 2: PACKAGES, PRICES & FLYERS ================= -->
      <div v-else class="space-y-5">
        <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="text-xs text-gray-300 space-y-0.5">
            <p class="font-bold text-white flex items-center gap-2">
              <i class="pi pi-info-circle text-amber-400"></i>
              <span>Live Booking Form & Showcase Controls</span>
            </p>
            <p class="text-[11px] text-gray-400">
              Changes to package selection, prices, pictures/flyers, and descriptions update the customer booking modal and website showcase immediately.
            </p>
          </div>
          <button
            type="button"
            @click="openCreatePackageModal"
            class="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
            <i class="pi pi-plus text-[11px]"></i>
            <span>New Booking Package</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div
            v-for="pkg in store.bookingPackages"
            :key="pkg.id"
            class="rounded-2xl bg-surface-900 border overflow-hidden flex flex-col justify-between shadow-lg transition-all"
            :class="pkg.is_active !== false ? 'border-surface-700 hover:border-amber-500/40' : 'border-dashed border-surface-700 opacity-75'">

            <div>
              <!-- Flyer / Picture Banner -->
              <div class="relative h-44 bg-surface-950 overflow-hidden border-b border-surface-800">
                <img
                  v-if="pkg.image_url"
                  :src="pkg.image_url"
                  :alt="pkg.name"
                  class="w-full h-full object-cover object-top"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-1.5">
                  <i class="pi pi-image text-2xl text-gray-600"></i>
                  <span class="text-[11px] font-semibold">No Flyer Picture Attached</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-black/30"></div>

                <!-- Top Badges -->
                <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow" :class="getBadgeColorClass(pkg.accent_color)">
                    {{ pkg.badge || pkg.name }}
                  </span>

                  <div class="flex items-center gap-1.5">
                    <span
                      v-if="pkg.show_in_banner"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-950/90 text-amber-300 border border-amber-500/40">
                      Quick Banner
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      :class="pkg.is_active !== false ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-surface-900 text-gray-400 border-surface-700'">
                      {{ pkg.is_active !== false ? 'Active' : 'Hidden' }}
                    </span>
                  </div>
                </div>

                <!-- Price Tag -->
                <div class="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-surface-950/90 border border-surface-700 text-xs font-black text-amber-400">
                  {{ formatPackagePrice(pkg) }}
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-5 space-y-3">
                <div>
                  <h3 class="text-base font-black text-white">{{ pkg.name }}</h3>
                  <p v-if="pkg.subtitle" class="text-[11px] text-amber-400 font-semibold mt-0.5">{{ pkg.subtitle }}</p>
                </div>

                <p class="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {{ pkg.description || 'No description provided.' }}
                </p>

                <div v-if="Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0" class="p-3 rounded-2xl bg-surface-950/60 border border-surface-800 space-y-1">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Inclusions ({{ pkg.inclusions.length }})</p>
                  <ul class="space-y-1 text-[11px] text-gray-300">
                    <li v-for="(inc, idx) in pkg.inclusions.slice(0, 3)" :key="idx" class="flex items-center gap-1.5 truncate">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span class="truncate">{{ inc }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Card Footer Actions -->
            <div class="px-5 py-3.5 bg-surface-950/50 border-t border-surface-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                @click="togglePackageVisibility(pkg)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5"
                :class="pkg.is_active !== false
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'">
                <i class="pi text-[11px]" :class="pkg.is_active !== false ? 'pi-eye-slash' : 'pi-eye'"></i>
                <span>{{ pkg.is_active !== false ? 'Hide' : 'Show' }}</span>
              </button>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openEditPackageModal(pkg)"
                  class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <i class="pi pi-pencil text-[11px]"></i>
                  <span>Edit Package</span>
                </button>

                <button
                  v-if="store.bookingPackages.length > 1"
                  type="button"
                  @click="confirmDeletePackage(pkg)"
                  class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs transition-colors cursor-pointer"
                  title="Delete Package">
                  <i class="pi pi-trash text-[11px]"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <!-- ================= EDIT / ADD BOOKING PACKAGE MODAL ================= -->
      <div
        v-if="packageModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="packageModalOpen = false">
        <div class="w-full max-w-3xl bg-surface-900 border border-surface-700 rounded-2xl p-3.5 sm:p-5 space-y-5 max-h-[92vh] overflow-y-auto ">

          <div class="flex items-start justify-between border-b border-surface-800 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">
                {{ editingPackage ? `Edit "${editingPackage.name}"` : 'Add New Booking Package' }}
              </h3>
              <p class="text-[11px] text-gray-400">
                Customize package selection name, pricing, flyer picture, and description shown to customers.
              </p>
            </div>
            <button type="button" @click="packageModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer flex items-center justify-center" aria-label="Close"><i class="pi pi-times text-sm"></i></button>
          </div>

          <form @submit.prevent="savePackage" class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start text-xs">
            <!-- Left Column: Package Details -->
            <div class="md:col-span-7 space-y-3.5">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Package Name <span class="text-rose-400">*</span></label>
                <input
                  v-model="pkgForm.name"
                  type="text"
                  maxlength="120"
                  required
                  placeholder="e.g. Coffee Package"
                  class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-gray-300 mb-1">Subtitle / Tagline</label>
                  <input
                    v-model="pkgForm.subtitle"
                    type="text"
                    maxlength="200"
                    placeholder="e.g. Featuring Coldbrew & Artisan Brews"
                    class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label class="block font-bold text-gray-300 mb-1">Badge Label</label>
                  <input
                    v-model="pkgForm.badge"
                    type="text"
                    maxlength="60"
                    placeholder="e.g. COFFEE PACKAGE"
                    class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <!-- Pricing Controls -->
              <div class="p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <i class="pi pi-tag text-amber-400"></i>
                    <span>Pricing Configuration</span>
                  </span>
                  <span class="text-[11px] font-black text-amber-400">
                    {{ previewPriceTag }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label class="block text-gray-400 mb-1 text-[11px]">Pricing Model</label>
                    <select
                      v-model="pkgForm.pricing_type"
                      class="w-full p-2 rounded-xl bg-surface-900 border border-surface-700 text-white cursor-pointer">
                      <option value="per_pack">Per Pax Block</option>
                      <option value="per_guest">Per Guest (₱/pax)</option>
                      <option value="flat">Flat Package Rate</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-gray-400 mb-1 text-[11px]">Price (₱)</label>
                    <input
                      v-model.number="pkgForm.price"
                      type="number"
                      min="0"
                      max="500000"
                      step="1"
                      required
                      class="w-full p-2 rounded-xl bg-surface-900 border border-surface-700 text-white font-bold"
                    />
                  </div>

                  <div v-if="pkgForm.pricing_type === 'per_pack'">
                    <label class="block text-gray-400 mb-1 text-[11px]">Pax Per Block</label>
                    <input
                      v-model.number="pkgForm.base_pax"
                      type="number"
                      min="1"
                      max="500"
                      step="1"
                      required
                      class="w-full p-2 rounded-xl bg-surface-900 border border-surface-700 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-300">Dropdown Option Text</label>
                  <button
                    type="button"
                    @click="syncOptionLabel"
                    class="text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer">
                    Reset to Auto
                  </button>
                </div>
                <input
                  v-model="pkgForm.option_label"
                  type="text"
                  maxlength="180"
                  :placeholder="autoOptionLabelPlaceholder"
                  class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                />
                <p class="text-[10px] text-gray-500 mt-1">Text shown inside the "Selected Event / Package" dropdown. Leave blank to auto-format from Name & Price.</p>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">Description (Shown in Booking Modal)</label>
                <textarea
                  v-model="pkgForm.description"
                  rows="3"
                  maxlength="1000"
                  placeholder="Describe cups, service hours, drink choices, and barista staff included..."
                  class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                ></textarea>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">Showcase Inclusions (One bullet per line)</label>
                <textarea
                  v-model="pkgForm.inclusionsText"
                  rows="3"
                  placeholder="50 Cups of 12oz servings&#10;3 Hours of Service with on-site barista staff&#10;5 Choices of Drinks"
                  class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 focus:border-amber-500 focus:outline-none text-white"
                ></textarea>
              </div>

              <!-- Accent Color, Sort Order & Visibility -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label class="block font-bold text-gray-300 mb-1.5">Accent Color</label>
                  <div class="flex items-center gap-2">
                    <button
                      v-for="c in accentColors"
                      :key="c.name"
                      type="button"
                      @click="pkgForm.accent_color = c.name"
                      :title="c.label"
                      class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer"
                      :class="[c.bg, pkgForm.accent_color === c.name ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100']">
                      <i v-if="pkgForm.accent_color === c.name" class="pi pi-check text-[10px] text-white font-bold"></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-gray-300 mb-1">Display Order</label>
                  <input
                    v-model.number="pkgForm.sort_order"
                    type="number"
                    min="0"
                    max="999"
                    class="w-full p-2 rounded-xl bg-surface-800 border border-surface-700 text-white"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-800/70 border border-surface-700 cursor-pointer">
                  <input v-model="pkgForm.is_active" type="checkbox" class="accent-amber-400 w-4 h-4" />
                  <div>
                    <span class="font-bold text-white block">Active Package</span>
                    <span class="text-[10px] text-gray-400">Available for customers to book</span>
                  </div>
                </label>

                <label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface-800/70 border border-surface-700 cursor-pointer">
                  <input v-model="pkgForm.show_in_banner" type="checkbox" class="accent-amber-400 w-4 h-4" />
                  <div>
                    <span class="font-bold text-white block">Show in Banner & Showcase</span>
                    <span class="text-[10px] text-gray-400">Display quick card & flyer photo</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Right Column: Picture / Flyer Upload & Preview -->
            <div class="md:col-span-5 space-y-3.5">
              <div
                @dragover.prevent="isDraggingImg = true"
                @dragleave.prevent="isDraggingImg = false"
                @drop.prevent="handlePackageImageDrop"
                class="p-4 rounded-2xl bg-surface-800/80 border transition-all space-y-3"
                :class="isDraggingImg ? 'border-amber-400 bg-amber-500/10' : 'border-surface-700'">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-white flex items-center gap-1.5">
                    <i class="pi pi-image text-amber-400"></i>
                    <span>Package Picture / Flyer</span>
                  </label>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-surface-900 text-gray-300 border border-surface-700">
                    {{ pkgForm.image_url ? 'Image Set' : 'No Image' }}
                  </span>
                </div>

                <!-- Live Preview Box -->
                <div class="relative w-full h-52 rounded-2xl bg-surface-950 border border-surface-700 overflow-hidden flex items-center justify-center">
                  <img
                    v-if="pkgForm.image_url"
                    :src="pkgForm.image_url"
                    alt="Package preview"
                    class="w-full h-full object-cover object-top"
                  />
                  <div v-else class="text-center p-4 text-gray-500 space-y-1">
                    <i class="pi pi-cloud-upload text-2xl text-gray-600"></i>
                    <p class="text-[11px]">Drop an image here or click Upload</p>
                  </div>
                </div>

                <!-- Upload & Presets -->
                <div class="flex flex-wrap items-center gap-2">
                  <label class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <i class="pi" :class="isUploadingImg ? 'pi-spin pi-spinner' : 'pi-upload'"></i>
                    <span>{{ pkgForm.image_url ? 'Change Photo' : 'Upload Photo' }}</span>
                    <input
                      ref="pkgImageInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handlePackageImageUpload"
                    />
                  </label>

                  <button
                    v-if="pkgForm.image_url"
                    type="button"
                    @click="pkgForm.image_url = ''"
                    class="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold cursor-pointer">
                    Remove
                  </button>
                </div>

                <div class="space-y-1.5">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Quick Presets</p>
                  <div class="flex flex-wrap gap-1.5">
                    <button type="button" @click="pkgForm.image_url = '/assets/booking-coffee-package.jpg'" class="px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-surface-700 border border-surface-700 text-gray-300 text-[11px] cursor-pointer inline-flex items-center gap-1.5"><i class="pi pi-sparkles text-[10px] text-amber-400"></i> Coffee Flyer</button>
                    <button type="button" @click="pkgForm.image_url = '/assets/booking-fruity-float.jpg'" class="px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-surface-700 border border-surface-700 text-gray-300 text-[11px] cursor-pointer inline-flex items-center gap-1.5"><i class="pi pi-sun text-[10px] text-amber-400"></i> Fruity Flyer</button>
                    <button type="button" @click="pkgForm.image_url = '/assets/menu-coffee.png'" class="px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-surface-700 border border-surface-700 text-gray-300 text-[11px] cursor-pointer inline-flex items-center gap-1.5"><i class="pi pi-star text-[10px] text-amber-400"></i> Drinks</button>
                    <button type="button" @click="pkgForm.image_url = '/assets/hero-banner.png'" class="px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-surface-700 border border-surface-700 text-gray-300 text-[11px] cursor-pointer inline-flex items-center gap-1.5"><i class="pi pi-shopping-bag text-[10px] text-amber-400"></i> Catering</button>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Or Image URL / Path</label>
                  <input
                    v-model="pkgForm.image_url"
                    type="text"
                    placeholder="/assets/booking-coffee-package.jpg or https://..."
                    class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 focus:border-amber-500 text-gray-200 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Modal Footer Buttons -->
              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  @click="packageModalOpen = false"
                  class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="savingPackage"
                  class="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  <i class="pi" :class="savingPackage ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                  <span>{{ editingPackage ? 'Save Package Changes' : 'Create Package' }}</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      <!-- ================= EDIT INDIVIDUAL BOOKING REQUEST MODAL ================= -->
      <div
        v-if="bookingEditModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="bookingEditModalOpen = false">
        <div class="w-full max-w-xl bg-surface-900 border border-surface-700 rounded-2xl p-3.5 sm:p-5 space-y-4 max-h-[92vh] overflow-y-auto ">
          <div class="flex items-start justify-between border-b border-surface-800 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Edit Booking #{{ editingBooking?.id }}</h3>
              <p class="text-[11px] text-gray-400">Adjust package selection, price, guest count, schedule, or notes.</p>
            </div>
            <button type="button" @click="bookingEditModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer flex items-center justify-center" aria-label="Close"><i class="pi pi-times text-sm"></i></button>
          </div>

          <form @submit.prevent="saveBookingEdit" class="space-y-3.5 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Client Name</label>
                <input v-model="bookingForm.client_name" type="text" maxlength="80" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">Contact Phone</label>
                <input v-model="bookingForm.client_phone" type="tel" maxlength="11" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Select Package Preset</label>
                <select
                  v-model="bookingForm.selected_pkg_id"
                  @change="onBookingEditPkgPresetChange"
                  class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white cursor-pointer">
                  <option :value="null">— Keep Custom / Current Label —</option>
                  <option v-for="pkg in store.bookingPackages" :key="pkg.id" :value="pkg.id">
                    {{ pkg.name }} ({{ formatPackagePrice(pkg) }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">Current Status</label>
                <div class="w-full p-2.5 rounded-xl bg-surface-950 border border-surface-700 text-amber-300 font-bold flex items-center justify-between">
                  <span>{{ bookingForm.status }}</span>
                  <span class="text-[10px] text-gray-400 font-normal">Via workflow actions</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Package / Event Label</label>
              <input v-model="bookingForm.event_type" type="text" maxlength="180" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Guest Count (10–500)</label>
                <input v-model.number="bookingForm.guest_count" type="number" min="10" max="500" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-300">Estimated Cost (₱)</label>
                  <button
                    v-if="bookingForm.selected_pkg_id"
                    type="button"
                    @click="recalculateBookingEditCost"
                    class="text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer">
                    Auto-Calculate
                  </button>
                </div>
                <input v-model.number="bookingForm.estimated_cost" type="number" min="0" step="0.01" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-amber-400 font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Event Date</label>
                <input v-model="bookingForm.event_date" type="date" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">Event Time</label>
                <input v-model="bookingForm.event_time" type="text" maxlength="60" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Venue / Location</label>
              <input v-model="bookingForm.location" type="text" maxlength="200" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Special Requests / Notes</label>
              <textarea v-model="bookingForm.notes" rows="2" maxlength="500" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-800">
              <button type="button" @click="bookingEditModalOpen = false" class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 font-bold cursor-pointer">Cancel</button>
              <button type="submit" :disabled="savingBooking" class="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black flex items-center gap-2 cursor-pointer disabled:opacity-50">
                <i class="pi" :class="savingBooking ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                <span>Save Booking</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= REQUEST DOWNPAYMENT MODAL (OPTION A) ================= -->
      <div
        v-if="requestDpModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="requestDpModalOpen = false">
        <div class="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-2xl p-4 sm:p-5 space-y-4 max-h-[92vh] overflow-y-auto">
          <div class="flex items-start justify-between border-b border-surface-800 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Request Downpayment — #{{ dpTargetBooking?.id }}</h3>
              <p class="text-[11px] text-gray-400">Finalize agreed price after talking with {{ dpTargetBooking?.client_name }}, then unlock payment.</p>
            </div>
            <button type="button" @click="requestDpModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer"><i class="pi pi-times text-sm"></i></button>
          </div>

          <form @submit.prevent="submitRequestDownpayment" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">Final Agreed Price (₱)</label>
              <input v-model.number="dpForm.final_cost" @input="syncDpAmountFromPercent" type="number" min="100" step="0.01" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-amber-400 font-black text-sm" />
              <p class="text-[10px] text-gray-400 mt-1">Original estimate: ₱{{ formatPeso(dpTargetBooking?.estimated_cost || 0) }} — adjust if transport fee or add-ons were agreed.</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-gray-300">Downpayment Percentage</label>
                <div class="flex items-center gap-1">
                  <button v-for="pct in [30, 50, 100]" :key="pct" type="button" @click="setDpPreset(pct)"
                    class="px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer border"
                    :class="Number(dpForm.downpayment_percentage) === pct ? 'bg-amber-500 text-black border-amber-400' : 'bg-surface-800 text-gray-300 border-surface-700'">
                    {{ pct }}%
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[10px] text-gray-400 mb-1">Percentage (%)</label>
                  <input v-model.number="dpForm.downpayment_percentage" @input="syncDpAmountFromPercent" type="number" min="1" max="100" step="0.5" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] text-gray-400 mb-1">Required Downpayment (₱)</label>
                  <input v-model.number="dpForm.downpayment_amount" @input="syncDpPercentFromAmount" type="number" min="1" :max="dpForm.final_cost" step="0.01" required class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-emerald-400 font-black" />
                </div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between">
              <span class="text-gray-400">Remaining Balance on Event Day:</span>
              <span class="font-black text-white">₱{{ formatPeso(Math.max(0, Number(dpForm.final_cost || 0) - Number(dpForm.downpayment_amount || 0))) }}</span>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Payment Deadline</label>
              <select v-model.number="dpForm.deadline_hours" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white cursor-pointer">
                <option :value="12">12 Hours</option>
                <option :value="24">24 Hours (1 Day)</option>
                <option :value="48">48 Hours (2 Days)</option>
                <option :value="72">72 Hours (3 Days)</option>
                <option :value="168">7 Days</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Agreed Terms / Breakdown Notes (Optional)</label>
              <textarea v-model="dpForm.payment_notes" rows="2" maxlength="500" placeholder="e.g. Includes ₱500 transport fee to Nuvali, 2 coffee flavors + pearl add-on" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-800">
              <button type="button" @click="requestDpModalOpen = false" class="px-4 py-2 rounded-xl bg-surface-800 text-gray-300 font-bold cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submittingDpRequest" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                <i class="pi" :class="submittingDpRequest ? 'pi-spin pi-spinner' : 'pi-send'"></i>
                <span>Open Downpayment for Client</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= REJECT DOWNPAYMENT PROOF MODAL ================= -->
      <div
        v-if="rejectDpModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="rejectDpModalOpen = false">
        <div class="w-full max-w-md bg-surface-900 border border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between border-b border-surface-800 pb-3">
            <div>
              <h3 class="text-base font-black text-white">Reject Downpayment Proof — #{{ rejectTargetBooking?.id }}</h3>
              <p class="text-[11px] text-gray-400">Client will be asked to re-upload a valid receipt.</p>
            </div>
            <button type="button" @click="rejectDpModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer"><i class="pi pi-times text-sm"></i></button>
          </div>
          <form @submit.prevent="submitRejectDownpayment" class="space-y-3 text-xs">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="preset in ['Blurry or unreadable receipt image', 'Reference number does not match our records', 'Amount sent is less than required downpayment', 'Payment not yet reflected in our account']"
                :key="preset"
                type="button"
                @click="rejectReason = preset"
                class="px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 border border-surface-700 text-[10px] cursor-pointer">
                {{ preset }}
              </button>
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">Reason for Rejection (Required)</label>
              <textarea v-model="rejectReason" rows="3" minlength="5" maxlength="500" required placeholder="Explain why the receipt was rejected..." class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white"></textarea>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-800">
              <button type="button" @click="rejectDpModalOpen = false" class="px-4 py-2 rounded-xl bg-surface-800 text-gray-300 font-bold cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submittingReject || rejectReason.trim().length < 5" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black cursor-pointer disabled:opacity-50">
                {{ submittingReject ? 'Rejecting...' : 'Reject & Notify Client' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= COMPLETE & SETTLE BALANCE MODAL ================= -->
      <div
        v-if="completeModalOpen"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="completeModalOpen = false">
        <div class="w-full max-w-md bg-surface-900 border border-sky-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between border-b border-surface-800 pb-3">
            <div>
              <h3 class="text-base font-black text-white">Complete & Settle Booking #{{ completeTargetBooking?.id }}</h3>
              <p class="text-[11px] text-gray-400">Record final balance payment and mark event completed.</p>
            </div>
            <button type="button" @click="completeModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer"><i class="pi pi-times text-sm"></i></button>
          </div>
          <form @submit.prevent="submitCompleteBooking" class="space-y-3 text-xs">
            <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 space-y-1.5">
              <div class="flex justify-between"><span class="text-gray-400">Final Agreed Cost:</span><span class="font-bold text-white">₱{{ formatPeso(effectiveCost(completeTargetBooking)) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Already Paid (DP):</span><span class="font-bold text-emerald-400">₱{{ formatPeso(completeTargetBooking?.amount_paid || 0) }}</span></div>
              <div class="flex justify-between border-t border-surface-800 pt-1.5"><span class="font-bold text-white">Remaining Balance to Collect:</span><span class="font-black text-amber-400">₱{{ formatPeso(remainingBalance(completeTargetBooking)) }}</span></div>
            </div>

            <template v-if="remainingBalance(completeTargetBooking) > 0">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Final Balance Payment Method</label>
                <select v-model="completeForm.final_payment_method" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white cursor-pointer">
                  <option value="Cash">Cash (On-site / Counter)</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div v-if="completeForm.final_payment_method !== 'Cash'">
                <label class="block font-bold text-gray-300 mb-1">Reference Number (Required)</label>
                <input v-model="completeForm.final_payment_reference" type="text" required minlength="4" maxlength="100" placeholder="Enter transaction reference #" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white font-mono" />
              </div>
            </template>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-800">
              <button type="button" @click="completeModalOpen = false" class="px-4 py-2 rounded-xl bg-surface-800 text-gray-300 font-bold cursor-pointer">Cancel</button>
              <button type="submit" :disabled="submittingComplete" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black cursor-pointer disabled:opacity-50">
                {{ submittingComplete ? 'Settling...' : 'Mark Completed & Fully Paid' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= RECEIPT PROOF LIGHTBOX MODAL ================= -->
      <div
        v-if="proofViewerBooking"
        class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        @click.self="proofViewerBooking = null">
        <div class="w-full max-w-xl bg-surface-900 border border-surface-700 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-surface-800 pb-2.5">
            <div class="text-xs">
              <p class="font-black text-white">Payment Receipt — Booking #{{ proofViewerBooking.id }}</p>
              <p class="text-gray-400">{{ proofViewerBooking.payment_method }} • Ref: <span class="font-mono text-amber-300">{{ proofViewerBooking.payment_reference }}</span></p>
            </div>
            <button type="button" @click="proofViewerBooking = null" class="text-gray-400 hover:text-white p-1 cursor-pointer"><i class="pi pi-times text-sm"></i></button>
          </div>
          <div class="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center p-2">
            <img :src="proofViewerBooking.payment_proof" alt="Payment Proof" class="max-w-full max-h-[65vh] object-contain rounded-lg" />
          </div>
        </div>
      </div>

    </div>
</template>
<script>
import * as Vue from 'vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Event & Catering Bookings & Package Management Tab (Admin & Staff)
export default {
  name: 'AdminBookingsTab',
  setup() {
    const store = useGShotStore();
    const activeSubTab = ref('requests');
    const loading = ref(false);
    const loadingPackages = ref(false);
    const bookings = ref([]);
    const requestStatusFilter = ref('all');
    const actionLoadingId = ref(null);

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
    const formatDateTime = (iso) => {
      if (!iso) return '—';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const requestFilterTabs = computed(() => {
      const list = bookings.value || [];
      const count = (s) => list.filter(b => b.status === s).length;
      const closedCount = list.filter(b => ['Declined', 'Cancelled'].includes(b.status)).length;
      return [
        { key: 'all', label: 'All', count: list.length },
        { key: 'Pending', label: 'Pending', count: count('Pending') },
        { key: 'Approved', label: 'Approved (Discuss)', count: count('Approved') },
        { key: 'Awaiting Downpayment', label: 'Awaiting DP', count: count('Awaiting Downpayment') },
        { key: 'Downpayment Submitted', label: 'For Verification', count: count('Downpayment Submitted') },
        { key: 'Confirmed', label: 'Confirmed', count: count('Confirmed') },
        { key: 'Completed', label: 'Completed', count: count('Completed') },
        { key: 'closed', label: 'Declined / Cancelled', count: closedCount },
      ];
    });

    const filteredBookings = computed(() => {
      const list = bookings.value || [];
      if (requestStatusFilter.value === 'all') return list;
      if (requestStatusFilter.value === 'closed') return list.filter(b => ['Declined', 'Cancelled'].includes(b.status));
      return list.filter(b => b.status === requestStatusFilter.value);
    });

    const requestDpModalOpen = ref(false);
    const dpTargetBooking = ref(null);
    const submittingDpRequest = ref(false);
    const dpForm = reactive({
      final_cost: 3500,
      downpayment_percentage: 50,
      downpayment_amount: 1750,
      deadline_hours: 48,
      payment_notes: '',
    });

    const syncDpAmountFromPercent = () => {
      const total = Math.max(0, Number(dpForm.final_cost || 0));
      const pct = Math.min(100, Math.max(1, Number(dpForm.downpayment_percentage || 50)));
      dpForm.downpayment_amount = Math.round(total * (pct / 100) * 100) / 100;
    };
    const syncDpPercentFromAmount = () => {
      const total = Math.max(1, Number(dpForm.final_cost || 1));
      const amt = Math.min(total, Math.max(1, Number(dpForm.downpayment_amount || 0)));
      dpForm.downpayment_percentage = Math.round((amt / total) * 10000) / 100;
    };
    const setDpPreset = (pct) => {
      dpForm.downpayment_percentage = pct;
      syncDpAmountFromPercent();
    };
    const openRequestDpModal = (b) => {
      dpTargetBooking.value = b;
      const defaultPct = Number(store.settings?.booking_downpayment_percent ?? 50);
      const defaultHrs = Number(store.settings?.booking_payment_deadline_hours ?? 48);
      dpForm.final_cost = effectiveCost(b);
      dpForm.downpayment_percentage = Number(b.downpayment_percentage || defaultPct);
      dpForm.downpayment_amount = Number(b.downpayment_amount) > 0
        ? Number(b.downpayment_amount)
        : Math.round(dpForm.final_cost * (dpForm.downpayment_percentage / 100) * 100) / 100;
      dpForm.deadline_hours = defaultHrs;
      dpForm.payment_notes = b.payment_notes || '';
      requestDpModalOpen.value = true;
    };
    const submitRequestDownpayment = async () => {
      if (!dpTargetBooking.value?.id) return;
      submittingDpRequest.value = true;
      try {
        const res = await GST_API.requestBookingDownpayment(dpTargetBooking.value.id, {
          final_cost: Number(dpForm.final_cost),
          downpayment_percentage: Number(dpForm.downpayment_percentage),
          downpayment_amount: Number(dpForm.downpayment_amount),
          deadline_hours: Number(dpForm.deadline_hours),
          payment_notes: dpForm.payment_notes.trim() || null,
        });
        store.notify(res.data?.message || 'Downpayment requested!', 'success');
        requestDpModalOpen.value = false;
        await refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to request downpayment.', 'error');
      } finally {
        submittingDpRequest.value = false;
      }
    };

    const proofViewerBooking = ref(null);
    const openProofViewer = (b) => { proofViewerBooking.value = b; };

    const verifyDownpayment = async (b) => {
      const ok = await store.confirmDialog({
        title: 'Verify Downpayment Receipt',
        message: `Confirm you received ₱${formatPeso(b.downpayment_amount)} via ${b.payment_method} (Ref: ${b.payment_reference}) for booking #${b.id}? This will lock the event slot as Confirmed.`,
        confirmText: 'Verify & Confirm Slot',
        cancelText: 'Review Again',
        variant: 'success',
        icon: 'pi-check-circle',
      });
      if (!ok) return;
      actionLoadingId.value = b.id;
      try {
        const res = await GST_API.verifyBookingDownpayment(b.id);
        store.notify(res.data?.message || 'Downpayment verified!', 'success');
        await refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Verification failed.', 'error');
      } finally {
        actionLoadingId.value = null;
      }
    };

    const rejectDpModalOpen = ref(false);
    const rejectTargetBooking = ref(null);
    const rejectReason = ref('');
    const submittingReject = ref(false);
    const openRejectDpModal = (b) => {
      rejectTargetBooking.value = b;
      rejectReason.value = '';
      rejectDpModalOpen.value = true;
    };
    const submitRejectDownpayment = async () => {
      if (!rejectTargetBooking.value?.id) return;
      submittingReject.value = true;
      try {
        const res = await GST_API.rejectBookingDownpayment(rejectTargetBooking.value.id, rejectReason.value.trim());
        store.notify(res.data?.message || 'Downpayment proof rejected.', 'info');
        rejectDpModalOpen.value = false;
        await refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Could not reject proof.', 'error');
      } finally {
        submittingReject.value = false;
      }
    };

    const completeModalOpen = ref(false);
    const completeTargetBooking = ref(null);
    const submittingComplete = ref(false);
    const completeForm = reactive({
      final_payment_method: 'Cash',
      final_payment_reference: '',
    });
    const openCompleteModal = (b) => {
      completeTargetBooking.value = b;
      completeForm.final_payment_method = 'Cash';
      completeForm.final_payment_reference = '';
      completeModalOpen.value = true;
    };
    const submitCompleteBooking = async () => {
      if (!completeTargetBooking.value?.id) return;
      submittingComplete.value = true;
      try {
        const res = await GST_API.completeBooking(completeTargetBooking.value.id, {
          final_payment_method: completeForm.final_payment_method,
          final_payment_reference: completeForm.final_payment_reference.trim() || null,
        });
        store.notify(res.data?.message || 'Booking completed!', 'success');
        completeModalOpen.value = false;
        await refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to complete booking.', 'error');
      } finally {
        submittingComplete.value = false;
      }
    };

    const cancelByAdmin = async (b, defaultReason = '') => {
      const ok = await store.confirmDialog({
        title: 'Cancel Booking & Release Slot',
        message: `Cancel booking #${b.id} for ${b.client_name} (${formatDate(b.event_date)})? This will reopen the date/time slot for other customers.`,
        confirmText: 'Yes, Cancel & Release',
        cancelText: 'Keep Booking',
        variant: 'danger',
        icon: 'pi-ban',
      });
      if (!ok) return;
      try {
        await GST_API.updateBookingStatus(b.id, 'Cancelled');
        store.notify(`Booking #${b.id} cancelled and slot released.`, 'info');
        await refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to cancel booking.', 'error');
      }
    };

    // Package Editor Modal State
    const packageModalOpen = ref(false);
    const editingPackage = ref(null);
    const savingPackage = ref(false);
    const isUploadingImg = ref(false);
    const isDraggingImg = ref(false);
    const pkgImageInputRef = ref(null);

    const accentColors = [
      { name: 'amber', label: 'Amber / Gold', bg: 'bg-amber-500' },
      { name: 'rose', label: 'Rose / Berry', bg: 'bg-rose-500' },
      { name: 'emerald', label: 'Emerald / Green', bg: 'bg-emerald-500' },
      { name: 'sky', label: 'Sky / Blue', bg: 'bg-sky-500' },
      { name: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    ];

    const pkgForm = reactive({
      name: '',
      subtitle: '',
      badge: '',
      accent_color: 'amber',
      price: 3500,
      pricing_type: 'per_pack',
      base_pax: 50,
      option_label: '',
      description: '',
      inclusionsText: '',
      image_url: '',
      show_in_banner: true,
      is_active: true,
      sort_order: 1,
    });

    // Individual Booking Edit Modal State
    const bookingEditModalOpen = ref(false);
    const editingBooking = ref(null);
    const savingBooking = ref(false);

    const bookingForm = reactive({
      client_name: '',
      client_phone: '',
      selected_pkg_id: null,
      event_type: '',
      package_name: '',
      guest_count: 50,
      estimated_cost: 3500,
      event_date: '',
      event_time: '',
      location: '',
      status: 'Pending',
      notes: '',
    });

    onMounted(() => {
      refreshAll();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getBookings();
        bookings.value = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const refreshPackages = async () => {
      loadingPackages.value = true;
      try {
        await store.fetchBookingPackages(true);
      } finally {
        loadingPackages.value = false;
      }
    };

    const refreshAll = async () => {
      await Promise.all([refresh(), refreshPackages()]);
    };

    const formatDate = (val) => {
      if (!val) return 'TBD';
      return String(val).slice(0, 10);
    };

    const getStatusBadge = (s) => {
      if (s === 'Confirmed') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      if (s === 'Approved') return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      if (s === 'Awaiting Downpayment') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      if (s === 'Downpayment Submitted') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      if (s === 'Completed') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      if (s === 'Declined') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      if (s === 'Cancelled') return 'bg-surface-700/80 text-gray-300 border-surface-600';
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    };

    const getPaymentBadgeClass = (ps) => {
      if (ps === 'Fully Paid' || ps === 'Downpayment Paid') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      if (ps === 'For Verification') return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      if (ps === 'Rejected') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      if (ps === 'Requested') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      return 'bg-surface-800 text-gray-400 border-surface-700';
    };

    const getBadgeColorClass = (color) => {
      const map = {
        amber: 'bg-amber-500 text-surface-950',
        rose: 'bg-rose-500 text-white',
        emerald: 'bg-emerald-500 text-surface-950',
        sky: 'bg-sky-500 text-surface-950',
        purple: 'bg-purple-500 text-white',
      };
      return map[color] || map.amber;
    };

    const formatPackagePrice = (pkg) => {
      const price = Number(pkg?.price || 0).toLocaleString();
      if (pkg?.pricing_type === 'per_guest') return `₱${price} / pax`;
      if (pkg?.pricing_type === 'flat') return `₱${price} flat`;
      return `₱${price} / ${pkg?.base_pax || 50} pax`;
    };

    const previewPriceTag = computed(() => formatPackagePrice(pkgForm));

    const autoOptionLabelPlaceholder = computed(() => {
      const name = (pkgForm.name || 'Package').trim();
      return `${name} (${previewPriceTag.value})`;
    });

    const syncOptionLabel = () => {
      pkgForm.option_label = autoOptionLabelPlaceholder.value;
    };

    const updateStatus = async (b, status) => {
      try {
        await GST_API.updateBookingStatus(b.id, status);
        store.notify(`Booking #${b.id} is now ${status}`);
        refresh();
      } catch (err) {
        store.notify(err.response?.data?.message || 'Error updating booking.', 'error');
      }
    };

    const openCreatePackageModal = () => {
      editingPackage.value = null;
      pkgForm.name = '';
      pkgForm.subtitle = '';
      pkgForm.badge = '';
      pkgForm.accent_color = 'amber';
      pkgForm.price = 3500;
      pkgForm.pricing_type = 'per_pack';
      pkgForm.base_pax = 50;
      pkgForm.option_label = '';
      pkgForm.description = '';
      pkgForm.inclusionsText = '';
      pkgForm.image_url = '';
      pkgForm.show_in_banner = true;
      pkgForm.is_active = true;
      pkgForm.sort_order = (store.bookingPackages?.length || 0) + 1;
      packageModalOpen.value = true;
    };

    const openEditPackageModal = (pkg) => {
      editingPackage.value = pkg;
      pkgForm.name = pkg.name || '';
      pkgForm.subtitle = pkg.subtitle || '';
      pkgForm.badge = pkg.badge || '';
      pkgForm.accent_color = pkg.accent_color || 'amber';
      pkgForm.price = Number(pkg.price ?? 3500);
      pkgForm.pricing_type = pkg.pricing_type || 'per_pack';
      pkgForm.base_pax = Number(pkg.base_pax ?? 50);
      pkgForm.option_label = pkg.option_label || '';
      pkgForm.description = pkg.description || '';
      pkgForm.inclusionsText = Array.isArray(pkg.inclusions) ? pkg.inclusions.join('\n') : '';
      pkgForm.image_url = pkg.image_url || '';
      pkgForm.show_in_banner = pkg.show_in_banner !== false;
      pkgForm.is_active = pkg.is_active !== false;
      pkgForm.sort_order = Number(pkg.sort_order ?? 1);
      packageModalOpen.value = true;
    };

    const compressImageFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the selected image file.'));
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result;
          if (!dataUrl || typeof dataUrl !== 'string') {
            reject(new Error('Invalid image data.'));
            return;
          }
          if (file.type === 'image/svg+xml') {
            resolve(dataUrl);
            return;
          }
          const img = new Image();
          img.onerror = () => reject(new Error('Could not decode image file.'));
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
            if (!ctx) {
              resolve(dataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const webp = canvas.toDataURL('image/webp', 0.85);
            resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    };

    const processPackageImage = async (file) => {
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        store.notify('Please select a valid image file (PNG, JPG, WebP).', 'error');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        store.notify('Image file is too large (max 15MB).', 'error');
        return;
      }
      isUploadingImg.value = true;
      try {
        pkgForm.image_url = await compressImageFile(file);
      } catch (err) {
        store.notify(err?.message || 'Failed to process image.', 'error');
      } finally {
        isUploadingImg.value = false;
        if (pkgImageInputRef.value) pkgImageInputRef.value.value = '';
      }
    };

    const handlePackageImageUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) processPackageImage(file);
    };

    const handlePackageImageDrop = (e) => {
      isDraggingImg.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) processPackageImage(file);
    };

    const savePackage = async () => {
      if (!pkgForm.name.trim()) {
        store.notify('Please enter a package name.', 'warning');
        return;
      }
      savingPackage.value = true;
      try {
        const inclusions = String(pkgForm.inclusionsText || '')
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean);

        let cleanOptionLabel = (pkgForm.option_label || '').trim();
        if (editingPackage.value && cleanOptionLabel === (editingPackage.value.option_label || '').trim()) {
          const oldPrice = Number(editingPackage.value.price || 0);
          const newPrice = Number(pkgForm.price || 0);
          if (oldPrice !== newPrice) {
            cleanOptionLabel = cleanOptionLabel
              .replace(`₱${oldPrice.toLocaleString()}`, `₱${newPrice.toLocaleString()}`)
              .replace(`₱${oldPrice}`, `₱${newPrice}`);
          }
        }

        const payload = {
          name: pkgForm.name.trim(),
          subtitle: pkgForm.subtitle.trim() || null,
          badge: pkgForm.badge.trim() || null,
          accent_color: pkgForm.accent_color,
          price: Number(pkgForm.price || 0),
          pricing_type: pkgForm.pricing_type,
          base_pax: pkgForm.pricing_type === 'per_pack' ? Math.max(1, Number(pkgForm.base_pax || 50)) : 1,
          option_label: cleanOptionLabel || null,
          description: pkgForm.description.trim() || null,
          inclusions,
          image_url: (pkgForm.image_url || '').trim() || null,
          show_in_banner: Boolean(pkgForm.show_in_banner),
          is_active: Boolean(pkgForm.is_active),
          sort_order: Number(pkgForm.sort_order || 1),
        };

        if (editingPackage.value?.id) {
          await store.updateBookingPackage(editingPackage.value.id, payload);
        } else {
          await store.createBookingPackage(payload);
        }
        packageModalOpen.value = false;
      } catch (err) {
        // Store notifies on error
      } finally {
        savingPackage.value = false;
      }
    };

    const togglePackageVisibility = async (pkg) => {
      try {
        await store.toggleBookingPackage(pkg.id);
      } catch (err) {
        // Store notifies on error
      }
    };

    const confirmDeletePackage = async (pkg) => {
      const ok = await store.confirmDialog({
        title: 'Delete Booking Package',
        message: `Are you sure you want to delete booking package "${pkg.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        icon: 'pi-trash',
      });
      if (!ok) return;
      try {
        await store.deleteBookingPackage(pkg.id);
      } catch (err) {
        // Store notifies on error
      }
    };

    const openEditBookingModal = (b) => {
      editingBooking.value = b;
      bookingForm.client_name = b.client_name || '';
      bookingForm.client_phone = b.client_phone || '';
      bookingForm.event_type = b.event_type || '';
      bookingForm.package_name = b.package_name || '';
      bookingForm.guest_count = Number(b.guest_count || 50);
      bookingForm.estimated_cost = effectiveCost(b);
      bookingForm.event_date = b.event_date ? String(b.event_date).slice(0, 10) : '';
      bookingForm.event_time = b.event_time || '';
      bookingForm.location = b.location || '';
      bookingForm.status = b.status || 'Pending';
      bookingForm.notes = b.notes || '';

      const lowerType = String(b.event_type || b.package_name || '').toLowerCase();
      const matched = (store.bookingPackages || []).find(p =>
        lowerType.includes(String(p.name || '').toLowerCase())
      );
      bookingForm.selected_pkg_id = matched ? matched.id : null;
      bookingEditModalOpen.value = true;
    };

    const computePackageCost = (pkg, guests) => {
      if (!pkg) return guests * 95;
      const price = Math.max(0, Number(pkg.price || 0));
      if (pkg.pricing_type === 'flat') return Math.round(price);
      if (pkg.pricing_type === 'per_guest') return Math.round(guests * price);
      const packSize = Math.max(1, Number(pkg.base_pax || 50));
      return Math.round(Math.max(1, Math.ceil(guests / packSize)) * price);
    };

    const onBookingEditPkgPresetChange = () => {
      const pkg = (store.bookingPackages || []).find(p => p.id === bookingForm.selected_pkg_id);
      if (!pkg) return;
      bookingForm.event_type = `${pkg.name} (${formatPackagePrice(pkg)})`;
      bookingForm.package_name = pkg.name;
      bookingForm.estimated_cost = computePackageCost(pkg, Math.max(10, Number(bookingForm.guest_count || 50)));
    };

    const recalculateBookingEditCost = () => {
      const pkg = (store.bookingPackages || []).find(p => p.id === bookingForm.selected_pkg_id);
      if (!pkg) return;
      bookingForm.estimated_cost = computePackageCost(pkg, Math.max(10, Number(bookingForm.guest_count || 50)));
    };

    const saveBookingEdit = async () => {
      if (!editingBooking.value?.id) return;
      savingBooking.value = true;
      try {
        await store.updateBooking(editingBooking.value.id, {
          client_name: bookingForm.client_name.trim(),
          client_phone: bookingForm.client_phone.trim(),
          event_type: bookingForm.event_type.trim(),
          package_name: bookingForm.package_name || bookingForm.event_type.trim(),
          guest_count: Number(bookingForm.guest_count),
          estimated_cost: Number(bookingForm.estimated_cost),
          final_cost: Number(bookingForm.estimated_cost),
          event_date: bookingForm.event_date,
          event_time: bookingForm.event_time.trim(),
          location: bookingForm.location.trim(),
          notes: bookingForm.notes.trim() || null,
        });
        bookingEditModalOpen.value = false;
        await refresh();
      } catch (err) {
        // Store notifies
      } finally {
        savingBooking.value = false;
      }
    };

    return {
      store,
      activeSubTab,
      loading,
      loadingPackages,
      bookings,
      requestStatusFilter,
      requestFilterTabs,
      filteredBookings,
      actionLoadingId,
      effectiveCost,
      remainingBalance,
      formatPeso,
      formatDateTime,
      getPaymentBadgeClass,
      requestDpModalOpen,
      dpTargetBooking,
      submittingDpRequest,
      dpForm,
      syncDpAmountFromPercent,
      syncDpPercentFromAmount,
      setDpPreset,
      openRequestDpModal,
      submitRequestDownpayment,
      proofViewerBooking,
      openProofViewer,
      verifyDownpayment,
      rejectDpModalOpen,
      rejectTargetBooking,
      rejectReason,
      submittingReject,
      openRejectDpModal,
      submitRejectDownpayment,
      completeModalOpen,
      completeTargetBooking,
      submittingComplete,
      completeForm,
      openCompleteModal,
      submitCompleteBooking,
      cancelByAdmin,
      refresh,
      refreshAll,
      formatDate,
      getStatusBadge,
      getBadgeColorClass,
      formatPackagePrice,
      updateStatus,
      packageModalOpen,
      editingPackage,
      savingPackage,
      isUploadingImg,
      isDraggingImg,
      pkgImageInputRef,
      accentColors,
      pkgForm,
      previewPriceTag,
      autoOptionLabelPlaceholder,
      syncOptionLabel,
      openCreatePackageModal,
      openEditPackageModal,
      handlePackageImageUpload,
      handlePackageImageDrop,
      savePackage,
      togglePackageVisibility,
      confirmDeletePackage,
      bookingEditModalOpen,
      editingBooking,
      savingBooking,
      bookingForm,
      openEditBookingModal,
      onBookingEditPkgPresetChange,
      recalculateBookingEditCost,
      saveBookingEdit,
    };
  },
};
</script>