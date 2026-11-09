<template>
<!-- Unauthorized Fallback if non-Super Admin somehow navigates here -->
    <div v-if="!store.isSuperAdmin" class="p-8 sm:p-12 rounded-3xl bg-surface-900 border border-rose-500/40 text-center space-y-4 shadow-2xl animate-fade-in">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl">
        <i class="pi pi-lock"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-xl font-black text-white">Super Admin Exclusive Console</h3>
        <p class="text-xs text-gray-400 max-w-md mx-auto">
          The System Audit Trail contains sensitive personnel and security activity logs. Access is strictly restricted to the Super Admin.
        </p>
      </div>
      <div>
        <button 
          @click="store.adminTab = 'orders'"
          class="px-5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors cursor-pointer">
          Return to Orders
        </button>
      </div>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Top Header & Role Stat Cards -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <i class="pi pi-shield text-[10px]"></i>
              Super Admin Exclusive Security Console
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">System Audit Trail</h2>
          <p class="text-xs text-gray-400 mt-1 max-w-2xl">
            Tamper-evident logs of administrative actions, stock modifications, orders, and system preferences. Strictly restricted to Super Admin.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button 
            @click="refresh"
            :disabled="loading"
            class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 hover:text-white border border-surface-700 text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh Audit Logs">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Personnel Stat Summary Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <!-- All Personnel -->
        <div 
          @click="selectedRole = 'all'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRole === 'all' 
            ? 'bg-surface-800/90 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30' 
            : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Personnel</span>
            <i class="pi pi-history text-brand-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-white mt-1">{{ totalPersonnelCount }}</div>
          <span class="text-[9px] text-gray-400">Staff, Admins & Drivers</span>
        </div>

        <!-- Super Admin Card -->
        <div 
          @click="selectedRole = 'super_admin'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRole === 'super_admin' 
            ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/40' 
            : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-purple-300">Super Admin</span>
            <i class="pi pi-crown text-purple-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-purple-300 mt-1">{{ superAdminCount }}</div>
          <span class="text-[9px] text-purple-400/80">System & Master Control</span>
        </div>

        <!-- Admin Card -->
        <div 
          @click="selectedRole = 'admin'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRole === 'admin' 
            ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/40' 
            : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300">Admin (Owner)</span>
            <i class="pi pi-shield text-amber-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-amber-300 mt-1">{{ adminCount }}</div>
          <span class="text-[9px] text-amber-400/80">Menu & Store Management</span>
        </div>

        <!-- Staff Card -->
        <div 
          @click="selectedRole = 'staff'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRole === 'staff' 
            ? 'bg-sky-950/40 border-sky-500/70 shadow-lg shadow-sky-500/20 ring-1 ring-sky-500/40' 
            : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-300">Staff (Barista)</span>
            <i class="pi pi-user text-sky-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-sky-300 mt-1">{{ staffCount }}</div>
          <span class="text-[9px] text-sky-400/80">POS & Inventory Operations</span>
        </div>

        <!-- Driver Card -->
        <div 
          @click="selectedRole = 'driver'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRole === 'driver' 
            ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/40' 
            : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Drivers (Fleet)</span>
            <i class="pi pi-compass text-emerald-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-emerald-300 mt-1">{{ driverCount }}</div>
          <span class="text-[9px] text-emerald-400/80">Delivery Dispatches & Fulfillment</span>
        </div>
      </div>

      <!-- Filter Controls Strip -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-850/80 p-3 rounded-2xl border border-surface-750">
        <!-- Role Badges Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
          <button 
            @click="selectedRole = 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            :class="selectedRole === 'all' ? 'bg-surface-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-surface-800'">
            <span>All Personnel</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-surface-900 text-gray-300 font-mono">{{ totalPersonnelCount }}</span>
          </button>

          <button 
            @click="selectedRole = 'super_admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            :class="selectedRole === 'super_admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-300/70 hover:text-purple-200 hover:bg-purple-950/40'">
            <i class="pi pi-crown text-[10px]"></i>
            <span>Super Admin</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-950 text-purple-200 font-mono">{{ superAdminCount }}</span>
          </button>

          <button 
            @click="selectedRole = 'admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            :class="selectedRole === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-300/70 hover:text-amber-200 hover:bg-amber-950/40'">
            <i class="pi pi-shield text-[10px]"></i>
            <span>Admin</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-200 font-mono">{{ adminCount }}</span>
          </button>

          <button 
            @click="selectedRole = 'staff'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            :class="selectedRole === 'staff' ? 'bg-sky-600 text-white shadow-sm' : 'text-sky-300/70 hover:text-sky-200 hover:bg-sky-950/40'">
            <i class="pi pi-user text-[10px]"></i>
            <span>Staff</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-950 text-sky-200 font-mono">{{ staffCount }}</span>
          </button>

          <button 
            @click="selectedRole = 'driver'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            :class="selectedRole === 'driver' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-950/40'">
            <i class="pi pi-compass text-[10px]"></i>
            <span>Drivers</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-200 font-mono">{{ driverCount }}</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-72">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search action, name, details..."
            class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors" />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Logs Table & Mobile Cards -->
      <div class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden shadow-2xl">
        <!-- Desktop Table (hidden on mobile) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">Authorized Personnel</th>
                <th class="px-6 py-4">Action</th>
                <th class="px-6 py-4">Activity Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              
              <!-- Loading Skeleton -->
              <tr v-if="loading && filteredLogs.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-400">
                  <i class="pi pi-spin pi-spinner text-2xl text-brand-400 mb-2"></i>
                  <p class="text-xs">Loading personnel audit trail...</p>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredLogs.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-400">
                  <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
                    <i class="pi pi-history text-lg"></i>
                  </div>
                  <p class="text-sm font-bold text-gray-200">No matching audit logs found</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ searchQuery ? 'Try adjusting your search terms.' : 'Audit trail is strictly showing Staff, Admin, and Super Admin personnel activities.' }}
                  </p>
                </td>
              </tr>

              <!-- Log Rows (10 per page) -->
              <tr 
                v-else
                v-for="log in paginatedLogs" 
                :key="log.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <!-- Timestamp -->
                <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-400 text-[11px]">
                  {{ formatDate(log.created_at) }}
                </td>

                <!-- Personnel & Role -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0"
                      :class="getRoleAvatarClass(log.user_role)">
                      {{ (log.user_name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-bold text-white text-xs leading-none">{{ log.user_name || 'Authorized User' }}</div>
                      <div class="mt-1">
                        <!-- Super Admin Badge -->
                        <span 
                          v-if="log.user_role === 'super_admin'" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <i class="pi pi-crown text-[8px]"></i> Super Admin
                        </span>
                        <!-- Admin Badge -->
                        <span 
                          v-else-if="log.user_role === 'admin'" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <i class="pi pi-shield text-[8px]"></i> Admin (Owner)
                        </span>
                        <!-- Staff Badge -->
                        <span 
                          v-else-if="log.user_role === 'staff'" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          <i class="pi pi-user text-[8px]"></i> Staff (Barista)
                        </span>
                        <!-- Driver Badge -->
                        <span 
                          v-else-if="log.user_role === 'driver'" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <i class="pi pi-compass text-[8px]"></i> Driver (Rider)
                        </span>
                        <!-- Fallback (if any) -->
                        <span 
                          v-else 
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-surface-700 text-gray-300">
                          {{ log.user_role }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Action Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                    :class="getActionBadgeClass(log.action, log.user_role)">
                    {{ log.action }}
                  </span>
                </td>

                <!-- Details -->
                <td class="px-6 py-4 text-gray-300 max-w-md leading-relaxed text-xs">
                  {{ log.details }}
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards (md:hidden) -->
        <div class="md:hidden divide-y divide-surface-700/60 p-3.5 space-y-3.5">
          <!-- Loading Skeleton -->
          <div v-if="loading && filteredLogs.length === 0" class="py-10 text-center text-gray-400">
            <i class="pi pi-spin pi-spinner text-2xl text-brand-400 mb-2"></i>
            <p class="text-xs">Loading personnel audit trail...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredLogs.length === 0" class="py-10 text-center text-gray-400">
            <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
              <i class="pi pi-history text-lg"></i>
            </div>
            <p class="text-sm font-bold text-gray-200">No matching audit logs found</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ searchQuery ? 'Try adjusting your search terms.' : 'Audit trail is strictly showing Staff, Admin, and Super Admin personnel activities.' }}
            </p>
          </div>

          <!-- Log Card -->
          <div 
            v-else
            v-for="log in paginatedLogs" 
            :key="'mobile-' + log.id" 
            class="pt-3.5 first:pt-0 space-y-2.5">
            
            <!-- Top: Timestamp & Action Badge -->
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-gray-400 text-[11px] flex items-center gap-1.5">
                <i class="pi pi-clock text-[10px] text-gray-500"></i>
                {{ formatDate(log.created_at) }}
              </span>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                :class="getActionBadgeClass(log.action, log.user_role)">
                {{ log.action }}
              </span>
            </div>

            <!-- Personnel info -->
            <div class="flex items-center gap-2 p-2 rounded-xl bg-surface-900/80 border border-surface-700/60">
              <div 
                class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0"
                :class="getRoleAvatarClass(log.user_role)">
                {{ (log.user_name || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-white text-xs truncate">{{ log.user_name || 'Authorized User' }}</div>
                <div class="mt-0.5">
                  <span 
                    v-if="log.user_role === 'super_admin'" 
                    class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <i class="pi pi-crown text-[8px]"></i> Super Admin
                  </span>
                  <span 
                    v-else-if="log.user_role === 'admin'" 
                    class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <i class="pi pi-shield text-[8px]"></i> Admin (Owner)
                  </span>
                  <span 
                    v-else-if="log.user_role === 'staff'" 
                    class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    <i class="pi pi-user text-[8px]"></i> Staff (Barista)
                  </span>
                  <span 
                    v-else-if="log.user_role === 'driver'" 
                    class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <i class="pi pi-compass text-[8px]"></i> Driver (Rider)
                  </span>
                  <span 
                    v-else 
                    class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-surface-700 text-gray-300">
                    {{ log.user_role }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Activity Details -->
            <p class="text-xs text-gray-300 leading-relaxed pl-1">
              {{ log.details }}
            </p>
          </div>
        </div>

        <!-- Pagination & Footer Strip -->
        <div class="px-6 py-4 bg-surface-900/90 border-t border-surface-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div class="flex items-center gap-2 text-gray-400">
            <i class="pi pi-shield text-xs text-brand-400"></i>
            <span v-if="filteredLogs.length > 0">
              Showing <strong class="text-white">{{ (currentPage - 1) * pageSize + 1 }}</strong> to <strong class="text-white">{{ Math.min(currentPage * pageSize, filteredLogs.length) }}</strong> of <strong class="text-white">{{ filteredLogs.length }}</strong> personnel activities
            </span>
            <span v-else>No activity logs to display</span>
          </div>

          <!-- Pagination Controls (10 items per page) -->
          <div v-if="totalPages > 1" class="flex items-center gap-1.5 select-none">
            <button 
              type="button"
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer">
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
              class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer">
              <span>Next</span>
              <i class="pi pi-chevron-right text-[10px]"></i>
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

// G Shot Teas — System Audit Trail & Activity Log Tab (Exclusively Staff, Admin, and Super Admin)
export default {
  name: 'AdminAuditTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const logs = Vue.ref([]);
    const selectedRole = Vue.ref('all');
    const searchQuery = Vue.ref('');
    const currentPage = Vue.ref(1);
    const pageSize = 10;

    Vue.onMounted(() => {
      if (!store.isSuperAdmin) {
        store.notify('Access Denied: The Audit Trail is strictly reserved for Super Admin.', 'error');
        store.adminTab = 'orders';
        return;
      }
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getAuditLogs({ per_page: 200 });
        const raw = res.data.data || res.data || [];
        // Strictly ensure only staff, admin, super_admin, and driver are retained
        logs.value = Array.isArray(raw)
          ? raw.filter(item => ['staff', 'admin', 'super_admin', 'driver'].includes((item.user_role || '').toLowerCase()))
          : [];
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        loading.value = false;
      }
    };

    // Counts computed across personnel logs
    const totalPersonnelCount = Vue.computed(() => logs.value.length);
    const superAdminCount = Vue.computed(() => logs.value.filter(l => l.user_role === 'super_admin').length);
    const adminCount = Vue.computed(() => logs.value.filter(l => l.user_role === 'admin').length);
    const staffCount = Vue.computed(() => logs.value.filter(l => l.user_role === 'staff').length);
    const driverCount = Vue.computed(() => logs.value.filter(l => l.user_role === 'driver').length);

    // Filtered by selected tab and search term
    const filteredLogs = Vue.computed(() => {
      return logs.value.filter(log => {
        const role = (log.user_role || '').toLowerCase();
        if (!['staff', 'admin', 'super_admin', 'driver'].includes(role)) return false;

        // Role tab filter
        if (selectedRole.value !== 'all' && role !== selectedRole.value) {
          return false;
        }

        // Search query filter (IP match removed)
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim();
          const matchesName = (log.user_name || '').toLowerCase().includes(q);
          const matchesAction = (log.action || '').toLowerCase().includes(q);
          const matchesDetails = (log.details || '').toLowerCase().includes(q);
          const matchesRole = role.includes(q);
          if (!matchesName && !matchesAction && !matchesDetails && !matchesRole) {
            return false;
          }
        }

        return true;
      });
    });

    // Reset pagination to page 1 on filter or search change
    Vue.watch([selectedRole, searchQuery], () => {
      currentPage.value = 1;
    });

    // Pagination calculations (10 items per page)
    const totalPages = Vue.computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / pageSize)));

    const paginatedLogs = Vue.computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredLogs.value.slice(start, start + pageSize);
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

    const getRoleAvatarClass = (role) => {
      switch (role) {
        case 'super_admin': return 'bg-purple-900/60 text-purple-300 border border-purple-500/50';
        case 'admin': return 'bg-amber-900/60 text-amber-300 border border-amber-500/50';
        case 'staff': return 'bg-sky-900/60 text-sky-300 border border-sky-500/50';
        case 'driver': return 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50';
        default: return 'bg-surface-700 text-gray-300';
      }
    };

    const getActionBadgeClass = (action, role) => {
      const act = (action || '').toLowerCase();
      if (act.includes('shutdown') || act.includes('maintenance')) {
        return 'bg-rose-950/80 border-rose-600/80 text-rose-300 font-extrabold';
      }
      if (act.includes('restored') || act.includes('online')) {
        return 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 font-extrabold';
      }
      if (act.includes('setting') || act.includes('initial')) {
        return 'bg-purple-950/60 border-purple-700/60 text-purple-300';
      }
      if (act.includes('menu') || act.includes('product') || act.includes('recipe')) {
        return 'bg-amber-950/60 border-amber-700/60 text-amber-300';
      }
      if (act.includes('stock') || act.includes('ingredient') || act.includes('inventory')) {
        return 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300';
      }
      if (act.includes('driver') || act.includes('deliver') || act.includes('dispatch')) {
        return 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300';
      }
      if (act.includes('payment') || act.includes('order')) {
        return 'bg-sky-950/60 border-sky-700/60 text-sky-300';
      }
      return 'bg-surface-900 border-surface-700 text-brand-400';
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
        second: '2-digit',
      });
    };

    return {
      store,
      loading,
      logs,
      selectedRole,
      searchQuery,
      currentPage,
      pageSize,
      totalPages,
      visiblePages,
      paginatedLogs,
      prevPage,
      nextPage,
      goToPage,
      totalPersonnelCount,
      superAdminCount,
      adminCount,
      staffCount,
      driverCount,
      filteredLogs,
      getRoleAvatarClass,
      getActionBadgeClass,
      formatDate,
      refresh,
    };
  },
};
</script>
