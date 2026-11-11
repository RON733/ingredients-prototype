<template>
<div class="min-h-screen bg-surface-950 text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      
      <!-- 1. Authenticated Delivery Rider: Render Dedicated Driver View for actual drivers -->
      <div v-if="isLoggedIn && store.user && store.user.role === 'driver'" class="flex-1 flex flex-col">
        <DriverView />
      </div>

      <!-- 2. Authenticated Staff, Admin, or Super Admin: Render Dedicated Delivery Rider Fleet View -->
      <div v-else-if="isLoggedIn && store.user && store.isStaffOrAdmin && (store.currentView === 'driver' || store.currentView === 'fleet')" class="flex-1 flex flex-col">
        <DeliveryFleetView />
      </div>

      <!-- 3. Authenticated Staff, Admin, or Super Admin: Render Full Management Dashboard -->
      <div v-else-if="isLoggedIn && store.user && (store.isStaffOrAdmin || store.currentView === 'admin')" class="flex-1 flex flex-col">
        <AdminDashboard />
      </div>

      <!-- 3. LOGIN PAGE: Always Shown First When Accessing /admin, /staff, /driver, or /superadmin -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        
        <!-- Background Ambient Glows -->
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full max-w-md relative z-10 space-y-5 animate-fade-in">
          
          <!-- Portal Branding Header -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-900 border border-surface-700 shadow-xl text-yellow-400 font-black text-2xl mb-1">
              G'
            </div>
            <div class="flex items-center justify-center gap-2">
              <h1 class="text-2xl font-black tracking-tight text-white">G SHOT TEAS</h1>
              <span 
                class="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border uppercase tracking-wider transition-colors"
                :class="portalBadgeClass">
                {{ portalBadgeText }}
              </span>
            </div>
            <p class="text-xs text-gray-400 font-medium">{{ portalSubtext }}</p>
          </div>

          <!-- Connected Role Navigation Tabs (/staff, /driver, /admin, /superadmin) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 p-1 rounded-2xl bg-surface-900 border border-surface-800 text-xs font-semibold gap-1 shadow-md">
            <button 
              type="button"
              @click="setPortalRole('staff')"
              class="py-2.5 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center border"
              :class="activeRole === 'staff' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
              <i class="pi pi-id-card text-xs"></i>
              <span>Staff</span>
            </button>
            <button 
              type="button"
              @click="setPortalRole('driver')"
              class="py-2.5 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center border"
              :class="activeRole === 'driver' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
              <i class="pi pi-compass text-xs"></i>
              <span>Rider</span>
            </button>
            <button 
              type="button"
              @click="setPortalRole('admin')"
              class="py-2.5 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center border"
              :class="activeRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
              <i class="pi pi-shield text-xs"></i>
              <span>Admin</span>
            </button>
            <button 
              type="button"
              @click="setPortalRole('super_admin')"
              class="py-2.5 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center border"
              :class="activeRole === 'super_admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
              <i class="pi pi-lock text-xs"></i>
              <span>Super Admin</span>
            </button>
          </div>

          <!-- Auth Box Container -->
          <div class="bg-surface-900/95 backdrop-blur-xl border border-surface-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            
            <!-- Login Method Switcher Tabs (PIN vs Password — Staff Only) -->
            <div v-if="activeRole === 'staff'" class="grid grid-cols-2 p-1 rounded-xl bg-surface-950 border border-surface-800 text-xs font-semibold">
              <button 
                type="button"
                @click="authTab = 'pin'"
                class="py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border"
                :class="authTab === 'pin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
                <i class="pi pi-id-card text-xs"></i>
                <span>4-Digit PIN</span>
              </button>
              <button 
                type="button"
                @click="authTab = 'credentials'"
                class="py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border"
                :class="authTab === 'credentials' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-sm' : 'text-neutral-400 hover:text-white border-transparent'">
                <i class="pi pi-key text-xs"></i>
                <span>Password</span>
              </button>
            </div>

            <!-- Error Banner -->
            <div v-if="authError" class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-shake">
              <i class="pi pi-exclamation-triangle text-rose-400 mt-0.5 shrink-0 text-xs"></i>
              <span class="flex-1 leading-snug">{{ authError }}</span>
            </div>

            <!-- TAB 1: 4-DIGIT PIN ENTRY (STAFF ONLY) -->
            <div v-if="activeRole === 'staff' && authTab === 'pin'" class="space-y-4">
              <!-- Staff selector -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Select On-Duty Staff Operator:
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="s in staffList" 
                    :key="s.id"
                    type="button"
                    @click="selectedStaff = s; pinDigits = ''"
                    class="p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col"
                    :class="selectedStaff?.id === s.id ? 'bg-amber-500/15 border-amber-500/50 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-300 hover:border-surface-600'">
                    <span class="text-xs font-bold truncate">{{ s.name }}</span>
                    <span class="text-[9px] font-mono uppercase tracking-wider" :class="selectedStaff?.id === s.id ? 'text-amber-400 font-bold' : 'text-gray-500'">
                      Staff Operator
                    </span>
                  </button>
                </div>
              </div>

              <!-- PIN Input Display -->
              <div class="space-y-1.5 text-center">
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Enter 4-Digit Security PIN
                </label>
                <div class="flex justify-center gap-3 py-1">
                  <div 
                    v-for="i in 4" 
                    :key="i"
                    class="w-11 h-12 rounded-xl border flex items-center justify-center text-xl font-black transition-all"
                    :class="pinDigits.length >= i 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20' 
                      : 'bg-surface-950 border-surface-700 text-gray-600'">
                    {{ pinDigits.length >= i ? '•' : '' }}
                  </div>
                </div>
                <p class="text-[10px] text-gray-400">
                  <span>Mhar = <strong>1234</strong> • Sarah = <strong>5678</strong></span>
                </p>
              </div>

              <!-- Interactive Keypad -->
              <div class="grid grid-cols-3 gap-2">
                <button 
                  v-for="n in [1,2,3,4,5,6,7,8,9]" 
                  :key="n"
                  type="button"
                  @click="pressPinDigit(n)"
                  class="h-11 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-black text-base transition-all active:scale-95 shadow-sm border border-surface-700/60 flex items-center justify-center cursor-pointer">
                  {{ n }}
                </button>
                <button 
                  type="button"
                  @click="clearPin"
                  class="h-11 rounded-xl bg-surface-800/40 hover:bg-surface-800 text-gray-400 font-bold text-xs transition-all active:scale-95 border border-surface-700/60 flex items-center justify-center cursor-pointer">
                  CLEAR
                </button>
                <button 
                  type="button"
                  @click="pressPinDigit(0)"
                  class="h-11 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-black text-base transition-all active:scale-95 shadow-sm border border-surface-700/60 flex items-center justify-center cursor-pointer">
                  0
                </button>
                <button 
                  type="button"
                  @click="backspacePin"
                  class="h-11 rounded-xl bg-surface-800/40 hover:bg-surface-800 text-gray-400 font-bold text-sm transition-all active:scale-95 border border-surface-700/60 flex items-center justify-center cursor-pointer">
                  ⌫
                </button>
              </div>

              <!-- Submit Button -->
              <button 
                type="button"
                @click="submitPinLogin"
                :disabled="pinLoading || pinDigits.length < 4"
                class="w-full py-3 rounded-xl disabled:opacity-40 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20">
                <i v-if="pinLoading" class="pi pi-spin pi-spinner"></i>
                <span v-else>Authorize Entry</span>
              </button>
            </div>

            <!-- TAB 2: EMAIL & PASSWORD CREDENTIALS LOGIN -->
            <form v-else @submit.prevent="submitCredentialsLogin" class="space-y-3.5">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">
                  {{ activeRole === 'super_admin' ? 'Super Admin Email' : (activeRole === 'admin' ? 'Administrator Email' : (activeRole === 'driver' ? 'Delivery Rider Email' : 'Staff Email')) }}
                </label>
                <div class="relative">
                  <i class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    v-model="email" 
                    type="email" 
                    required 
                    placeholder="name@gshotteas.com"
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-yellow-400 text-white text-xs outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Security Password</label>
                <div class="relative">
                  <i class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    required 
                    placeholder="••••••••"
                    class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-yellow-400 text-white text-xs outline-none transition-colors" />
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                    <i class="pi" :class="showPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                :disabled="credentialsLoading"
                class="w-full py-3 rounded-xl disabled:opacity-50 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                :class="activeRole === 'super_admin' ? 'bg-purple-600 hover:bg-purple-500 text-white' : (activeRole === 'driver' ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20')">
                <i v-if="credentialsLoading" class="pi pi-spin pi-spinner"></i>
                <span v-else>Access Console</span>
              </button>
            </form>

            <!-- 1-CLICK INSTANT DEMO LOGIN BUTTON (GUARANTEES ACCESS) -->
            <div class="pt-2 border-t border-surface-800 space-y-2">
              <button 
                type="button"
                @click="oneClickDirectLogin"
                :disabled="credentialsLoading"
                class="w-full py-2.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-750 text-yellow-400 font-bold text-xs flex items-center justify-center gap-2 border border-surface-700 transition-all cursor-pointer">
                <span>⚡ Instant 1-Click Sign In as {{ activeRole === 'super_admin' ? 'Super Admin' : (activeRole === 'admin' ? 'Admin' : (activeRole === 'driver' ? 'Delivery Rider' : 'Staff')) }}</span>
              </button>
            </div>

          </div>

          <!-- Bottom Security Advisory -->
          <div class="text-center text-[11px] text-gray-500 space-y-1">
            <p>Protected System — All staff logins & inventory adjustments are audited.</p>
            <div class="flex items-center justify-center gap-2 text-[10px]">
              <span class="text-neutral-400 font-semibold">G Shot Teas Operations Terminal</span>
              <span>&bull;</span>
              <span>STI College Santa Rosa Capstone</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Modals for Management Use -->
      <StaffPinModal />
      <AnnouncementModal />
      <ProductImageModal />

      <!-- Global Notification Toasts -->
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
        <div 
          v-for="toast in store.toasts" 
          :key="toast.id"
          @click="store.removeToast(toast.id)"
          class="w-full px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white flex items-center justify-between gap-3 backdrop-blur-md pointer-events-auto border animate-toast-in cursor-pointer transition-all duration-200 hover:scale-[1.01]"
          :class="getToastClass(toast.type)">
          <div class="flex items-start gap-2.5 min-w-0 flex-1">
            <i class="pi flex-shrink-0 mt-0.5 text-sm" :class="getToastIcon(toast.type)"></i>
            <span class="break-words leading-relaxed">{{ toast.msg }}</span>
          </div>
          <button type="button" @click.stop="store.removeToast(toast.id)" class="text-white/70 hover:text-white">
            <i class="pi pi-times text-xs"></i>
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

// G Shot Teas — Staff, Admin & Super Admin Dedicated Portal App Root


export default {
  name: 'AdminApp',
  setup() {
    const store = useGShotStore();

    const isOpsUser = (u) => Boolean(u && ['staff', 'admin', 'super_admin', 'driver'].includes(u.role));

    // Persist login state immediately from stored session to prevent login-page flash/reset on refresh
    const initialUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('gst_user') || 'null');
      } catch (e) {
        return null;
      }
    })();
    const initialToken = localStorage.getItem('gst_auth_token') || '';
    const initialUnlocked = sessionStorage.getItem('gst_admin_unlocked') === 'true';

    // User is logged in if they have an active operational account in localStorage or active session unlock
    const isLoggedIn = ref(Boolean(initialUser && isOpsUser(initialUser) && (initialToken || initialUnlocked)));

    // Active Role selection: 'staff' | 'admin' | 'super_admin'
    const activeRole = ref('staff');
    const authTab = ref('pin'); // 'pin' | 'credentials'
    const authError = ref('');
    const email = ref('staff@gshotteas.com');
    const password = ref('password123');
    const showPassword = ref(false);
    const credentialsLoading = ref(false);

    // PIN State
    const pinDigits = ref('');
    const pinLoading = ref(false);
    const staffList = ref([
      { id: 3, name: 'Mhar Anthony Lirio', role: 'staff' },
      { id: 4, name: 'Sarah Mae Santos', role: 'staff' }
    ]);
    const selectedStaff = ref(staffList.value[0]);

    // Inspect URL pathname to intelligently highlight the matching login tab
    const detectRoleFromPath = () => {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.includes('superadmin') || path.includes('super-admin')) {
        setPortalRole('super_admin');
      } else if (path.includes('driver') || path.includes('rider')) {
        setPortalRole('driver');
      } else if (path.includes('admin') || path.includes('operation') || path.includes('ops') || path.includes('portal') || path.includes('terminal') || path.includes('dashboard')) {
        setPortalRole('admin');
      } else {
        setPortalRole('staff');
      }
    };

    const setPortalRole = (role) => {
      activeRole.value = role;
      authError.value = '';
      pinDigits.value = '';
      let targetPath = '/admin';
      if (role === 'super_admin') targetPath = '/superadmin';
      else if (role === 'staff') targetPath = '/staff';
      else if (role === 'driver') targetPath = '/driver';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      if (role === 'staff') {
        authTab.value = 'pin';
        email.value = 'staff@gshotteas.com';
        password.value = 'password123';
      } else if (role === 'driver') {
        authTab.value = 'credentials';
        email.value = 'driver@gshotteas.com';
        password.value = 'password123';
      } else if (role === 'super_admin') {
        authTab.value = 'credentials';
        email.value = 'superadmin@gshotteas.com';
        password.value = 'password123';
      } else {
        authTab.value = 'credentials';
        email.value = 'admin@gshotteas.com';
        password.value = 'password123';
      }
    };

    onMounted(async () => {
      await store.init();

      // Check session: keep unlocked if user is authenticated with an operational role
      const currentUser = store.user;
      if (currentUser && isOpsUser(currentUser)) {
        isLoggedIn.value = true;
        sessionStorage.setItem('gst_admin_unlocked', 'true');
        if (currentUser.role === 'driver') {
          store.currentView = 'driver';
        } else {
          store.currentView = store.user?.role === 'driver' ? 'driver' : 'admin';
        }
      } else {
        isLoggedIn.value = false;
        sessionStorage.removeItem('gst_admin_unlocked');
      }

      detectRoleFromPath();

      // Fetch dynamic staff list if available
      try {
        const res = await GST_API.getStaffList();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const onlyStaff = res.data.filter(s => s.role === 'staff');
          if (onlyStaff.length > 0) {
            staffList.value = onlyStaff;
            selectedStaff.value = onlyStaff[0];
          }
        }
      } catch (e) {
        // fallback
      }
    });

    watch(() => store.user, (u) => {
      if (!u || !isOpsUser(u)) {
        isLoggedIn.value = false;
        sessionStorage.removeItem('gst_admin_unlocked');
      } else {
        isLoggedIn.value = true;
        sessionStorage.setItem('gst_admin_unlocked', 'true');
      }
    });

    const portalBadgeClass = computed(() => {
      if (activeRole.value === 'super_admin') return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      if (activeRole.value === 'driver') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      if (activeRole.value === 'staff') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    });

    const portalBadgeText = computed(() => {
      if (activeRole.value === 'super_admin') return 'Super Admin Root Console';
      if (activeRole.value === 'driver') return 'Delivery Fleet Portal';
      if (activeRole.value === 'staff') return 'Staff Operations Terminal';
      return 'Admin Management Console';
    });

    const portalSubtext = computed(() => {
      if (activeRole.value === 'super_admin') return 'System Configuration, Role Management & Audit Intelligence';
      if (activeRole.value === 'driver') return 'Live Delivery Dispatch, Turn-by-Turn Navigation & GPS Tracking';
      if (activeRole.value === 'staff') return 'POS Orders, Counter Duty & Kitchen Inventory Portions';
      return 'Sales Analytics, Product Recipes, Orders & Store Controls';
    });

    const pressPinDigit = (digit) => {
      if (pinDigits.value.length < 4) {
        pinDigits.value += String(digit);
        authError.value = '';
        if (pinDigits.value.length === 4) {
          submitPinLogin();
        }
      }
    };

    const clearPin = () => {
      pinDigits.value = '';
      authError.value = '';
    };

    const backspacePin = () => {
      pinDigits.value = pinDigits.value.slice(0, -1);
      authError.value = '';
    };

    const submitPinLogin = async () => {
      if (activeRole.value !== 'staff' || pinDigits.value.length !== 4) return;
      pinLoading.value = true;
      authError.value = '';
      try {
        await store.switchStaffPin(pinDigits.value, selectedStaff.value?.id);
        pinDigits.value = '';
        sessionStorage.setItem('gst_admin_unlocked', 'true');
        isLoggedIn.value = true;
        store.currentView = 'admin';
      } catch (err) {
        authError.value = err.response?.data?.message || 'Invalid 4-digit PIN code. Please verify.';
        pinDigits.value = '';
      } finally {
        pinLoading.value = false;
      }
    };

    const submitCredentialsLogin = async () => {
      credentialsLoading.value = true;
      authError.value = '';
      try {
        await store.login(email.value, password.value, 'operations');
        const allowedRoles = ['staff', 'admin', 'super_admin', 'driver'];
        if (!store.user || !allowedRoles.includes(store.user.role)) {
          authError.value = 'Access denied. The Operations Portal is strictly reserved for Staff, Admin, Super Admin, and Delivery Riders.';
          store.logout();
          sessionStorage.removeItem('gst_admin_unlocked');
          isLoggedIn.value = false;
        } else {
          sessionStorage.setItem('gst_admin_unlocked', 'true');
          isLoggedIn.value = true;
          if (store.user.role === 'driver') {
            store.currentView = 'driver';
          } else {
            store.currentView = 'admin';
          }
        }
      } catch (err) {
        authError.value = err.response?.data?.message || err.message || 'Invalid email or password.';
      } finally {
        credentialsLoading.value = false;
      }
    };

    const oneClickDirectLogin = async () => {
      credentialsLoading.value = true;
      authError.value = '';
      let targetEmail = 'staff@gshotteas.com';
      if (activeRole.value === 'driver') targetEmail = 'driver@gshotteas.com';
      else if (activeRole.value === 'admin') targetEmail = 'admin@gshotteas.com';
      else if (activeRole.value === 'super_admin') targetEmail = 'superadmin@gshotteas.com';

      try {
        await store.login(targetEmail, 'password123', 'operations');
        sessionStorage.setItem('gst_admin_unlocked', 'true');
        isLoggedIn.value = true;
        if (store.user?.role === 'driver') {
          store.currentView = 'driver';
        } else {
          store.currentView = 'admin';
        }
      } catch (err) {
        authError.value = err.response?.data?.message || err.message || 'Login failed.';
      } finally {
        credentialsLoading.value = false;
      }
    };

    const getToastClass = (type) => {
      if (type === 'error') return 'bg-rose-950/95 border-rose-600 text-rose-100 shadow-rose-950/50';
      if (type === 'warning') return 'bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-950/50';
      if (type === 'info') return 'bg-sky-950/95 border-sky-600 text-sky-100 shadow-sky-950/50';
      return 'bg-emerald-950/95 border-emerald-600 text-emerald-100 shadow-emerald-950/50';
    };

    const getToastIcon = (type) => {
      if (type === 'error') return 'pi-times-circle text-rose-400';
      if (type === 'warning') return 'pi-exclamation-triangle text-amber-400';
      if (type === 'info') return 'pi-info-circle text-sky-400';
      return 'pi-check-circle text-emerald-400';
    };

    return {
      store,
      isLoggedIn,
      activeRole,
      authTab,
      authError,
      email,
      password,
      showPassword,
      credentialsLoading,
      pinDigits,
      pinLoading,
      staffList,
      selectedStaff,
      portalBadgeClass,
      portalBadgeText,
      portalSubtext,
      setPortalRole,
      pressPinDigit,
      clearPin,
      backspacePin,
      submitPinLogin,
      submitCredentialsLogin,
      oneClickDirectLogin,
      getToastClass,
      getToastIcon
    };
  }
};

// Mount Admin Vue 3 Application
</script>
