// G Shot Teas — Fast 4-Digit Staff PIN Switcher Modal for Shared POS Terminal
var StaffPinModal = window.StaffPinModal = {
  template: `
    <div 
      v-if="store.staffPinModalOpen" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="closeModal">
      
      <div class="relative w-full max-w-md bg-surface-900 border border-surface-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5 animate-scale-up">
        
        <!-- Close Button -->
        <button 
          @click="closeModal" 
          class="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-800 transition-colors">
          <i class="pi pi-times text-sm"></i>
        </button>

        <!-- Header -->
        <div class="text-center space-y-1.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
            Shared POS Terminal • Fast PIN Switch
          </span>
          <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">Switch Active Operator</h3>
          <p class="text-xs text-gray-400 max-w-xs mx-auto">
            Select your staff name and enter your 4-digit PIN to claim active duty on this counter laptop.
          </p>
        </div>

        <!-- Staff Member Selection Strip -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            1. Select On-Duty Personnel
          </label>
          <div class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar">
            <button 
              v-for="s in staffList" 
              :key="s.id"
              type="button"
              @click="selectStaff(s)"
              class="p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer"
              :class="selectedStaff?.id === s.id 
                ? 'bg-brand-600/20 border-brand-500 ring-1 ring-brand-500/50 shadow-md' 
                : 'bg-surface-800/80 border-surface-700 hover:bg-surface-750'">
              <div 
                class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                :class="getRoleColor(s.role)">
                {{ (s.name || 'S').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <p class="text-xs font-bold text-white truncate">{{ s.name || 'Staff' }}</p>
                  <span v-if="store.isStaffAccountLocked(s.id)" class="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5 shrink-0" title="Account locked. True owner password required.">
                    <i class="pi pi-lock text-[8px]"></i> LOCKED
                  </span>
                </div>
                <span class="text-[9px] uppercase font-bold text-brand-400 block tracking-wider">{{ s.role }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- LOCKED STAFF CHALLENGE: When selected staff is locked, require true owner password -->
        <div v-if="isCurrentSelectedLocked" class="space-y-4 pt-1 animate-fade-in">
          <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-left">
            <div class="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <i class="pi pi-lock text-xs"></i>
              <span>Account Locked on Shift Handoff</span>
            </div>
            <p class="text-[11px] text-gray-300 leading-relaxed">
              This staff account was locked when shift was handed over. For security, PIN entry is disabled. Only <strong>{{ selectedStaff?.name }}</strong>'s true account password can unlock and take active duty.
            </p>
          </div>

          <div class="space-y-2 text-left">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-300">
              Account Password for {{ selectedStaff?.name }}
            </label>
            <div class="relative">
              <input 
                :type="showStaffPassword ? 'text' : 'password'"
                v-model="staffPassword"
                placeholder="Enter account password"
                @keydown.enter="submitUnlockStaff"
                class="w-full pl-4 pr-11 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                autofocus />
              <button 
                type="button" 
                @click="showStaffPassword = !showStaffPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer">
                <i class="pi" :class="showStaffPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
            <p v-if="errorMessage" class="text-xs text-rose-400 font-bold flex items-center gap-1.5 pt-1 animate-fade-in">
              <i class="pi pi-exclamation-triangle text-xs"></i>
              {{ errorMessage }}
            </p>
          </div>

          <button 
            @click="submitUnlockStaff"
            :disabled="!staffPassword || submitting"
            type="button"
            class="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20">
            <i class="pi" :class="submitting ? 'pi-spin pi-spinner' : 'pi-unlock'"></i>
            <span>{{ submitting ? 'Verifying Password...' : 'Unlock Account & Take Duty' }}</span>
          </button>
        </div>

        <!-- NORMAL 4-DIGIT PIN ENTRY: Shown when selected staff is NOT locked -->
        <div v-else class="space-y-4 animate-fade-in">
          <!-- 4-Digit PIN Display -->
          <div class="text-center space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
              2. Enter 4-Digit Staff PIN
            </label>
            <div 
              class="flex items-center justify-center gap-3 py-2"
              :class="{ 'animate-shake': hasError }">
              <div 
                v-for="i in 4" 
                :key="i"
                class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-mono font-black transition-all"
                :class="pin.length >= i 
                  ? 'border-brand-500 bg-brand-500/20 text-brand-400 shadow-lg shadow-brand-500/20 scale-105' 
                  : 'border-surface-700 bg-surface-950/70 text-gray-600'">
                {{ pin.length >= i ? '●' : '○' }}
              </div>
            </div>
            <p v-if="errorMessage" class="text-xs text-rose-400 font-bold animate-fade-in flex items-center justify-center gap-1">
              <i class="pi pi-exclamation-triangle text-xs"></i>
              {{ errorMessage }}
            </p>
          </div>

          <!-- Touchscreen & Clickable Numpad -->
          <div class="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            <button 
              v-for="digit in [1, 2, 3, 4, 5, 6, 7, 8, 9]" 
              :key="digit"
              @click="appendDigit(digit)"
              type="button"
              class="h-12 rounded-2xl bg-surface-800 hover:bg-surface-700 active:bg-brand-600 text-lg font-bold text-white border border-surface-700/80 transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer">
              {{ digit }}
            </button>
            
            <!-- Clear Button -->
            <button 
              @click="clearPin"
              type="button"
              class="h-12 rounded-2xl bg-surface-850 hover:bg-surface-800 active:bg-rose-900/40 text-xs font-bold text-rose-400 border border-surface-700 transition-all flex items-center justify-center cursor-pointer">
              CLEAR
            </button>

            <!-- Zero -->
            <button 
              @click="appendDigit(0)"
              type="button"
              class="h-12 rounded-2xl bg-surface-800 hover:bg-surface-700 active:bg-brand-600 text-lg font-bold text-white border border-surface-700/80 transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer">
              0
            </button>

            <!-- Backspace -->
            <button 
              @click="backspacePin"
              type="button"
              class="h-12 rounded-2xl bg-surface-850 hover:bg-surface-800 active:bg-surface-700 text-sm font-bold text-gray-300 border border-surface-700 transition-all flex items-center justify-center cursor-pointer"
              title="Backspace">
              <i class="pi pi-arrow-left text-sm"></i>
            </button>
          </div>

          <!-- Submit Button -->
          <button 
            @click="submitPin"
            :disabled="pin.length !== 4 || submitting"
            class="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <i class="pi pi-check-circle" :class="{ 'pi-spin': submitting }"></i>
            <span>{{ submitting ? 'Verifying PIN...' : 'Verify PIN & Switch On Duty' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const pin = Vue.ref('');
    const submitting = Vue.ref(false);
    const hasError = Vue.ref(false);
    const errorMessage = Vue.ref('');
    const staffPassword = Vue.ref('');
    const showStaffPassword = Vue.ref(false);

    const isCurrentSelectedLocked = Vue.computed(() => {
      return selectedStaff.value ? store.isStaffAccountLocked(selectedStaff.value.id) : false;
    });

    const submitUnlockStaff = async () => {
      if (!staffPassword.value || submitting.value || !selectedStaff.value) return;
      submitting.value = true;
      errorMessage.value = '';
      hasError.value = false;
      try {
        await store.unlockStaffAccount(selectedStaff.value.id, staffPassword.value);
        staffPassword.value = '';
      } catch (err) {
        hasError.value = true;
        errorMessage.value = err.message || 'Incorrect password for this staff account.';
      } finally {
        submitting.value = false;
      }
    };
    // Switch active operator is strictly for on-duty counter and kitchen staff
    const staffList = Vue.ref([
      { id: 3, name: 'Mhar Anthony Lirio', email: 'staff@gshotteas.com', role: 'staff' },
      { id: 4, name: 'Sarah Mae Santos', email: 'barista2@gshotteas.com', role: 'staff' },
    ]);
    const selectedStaff = Vue.ref(staffList.value[0]);

    const fetchStaffList = async () => {
      try {
        const res = await GST_API.getStaffList();
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Strictly filter for staff members only
          const onlyStaff = res.data.filter(s => s.role === 'staff');
          staffList.value = onlyStaff.length > 0 ? onlyStaff : res.data;
          // Default selection to current user if staff, or first staff
          const match = staffList.value.find(s => s.id === store.user?.id);
          selectedStaff.value = match || staffList.value[0];
        }
      } catch (err) {
        console.warn('Using fallback staff list for PIN modal');
      }
    };

    Vue.onMounted(() => {
      fetchStaffList();
      window.addEventListener('keydown', handleKeydown);
    });

    Vue.onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    // Reset when modal opens
    Vue.watch(() => store.staffPinModalOpen, (isOpen) => {
      if (isOpen) {
        pin.value = '';
        staffPassword.value = '';
        errorMessage.value = '';
        hasError.value = false;
        fetchStaffList();
      }
    });

    const handleKeydown = (e) => {
      if (!store.staffPinModalOpen) return;
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        backspacePin();
      } else if (e.key === 'Enter' && pin.value.length === 4) {
        submitPin();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    const selectStaff = (staff) => {
      selectedStaff.value = staff;
      pin.value = '';
      staffPassword.value = '';
      errorMessage.value = '';
    };

    const appendDigit = (digit) => {
      if (pin.value.length < 4) {
        pin.value += String(digit);
        errorMessage.value = '';
        if (pin.value.length === 4) {
          // Auto-submit on 4th digit for ultra-fast POS experience!
          setTimeout(() => submitPin(), 150);
        }
      }
    };

    const backspacePin = () => {
      pin.value = pin.value.slice(0, -1);
      errorMessage.value = '';
    };

    const clearPin = () => {
      pin.value = '';
      errorMessage.value = '';
    };

    const submitPin = async () => {
      if (pin.value.length !== 4 || submitting.value) return;
      submitting.value = true;
      errorMessage.value = '';
      hasError.value = false;

      try {
        await store.switchStaffPin(pin.value, selectedStaff.value?.id);
      } catch (err) {
        hasError.value = true;
        errorMessage.value = 'Incorrect 4-digit PIN for ' + (selectedStaff.value?.name || 'this user') + '.';
        pin.value = '';
        setTimeout(() => {
          hasError.value = false;
        }, 600);
      } finally {
        submitting.value = false;
      }
    };

    

    const closeModal = () => {
      store.staffPinModalOpen = false;
      pin.value = '';
      errorMessage.value = '';
    };

    const getRoleColor = (role) => {
      switch (role) {
        case 'super_admin': return 'bg-purple-900/60 text-purple-300 border border-purple-500/40';
        case 'admin': return 'bg-amber-900/60 text-amber-300 border border-amber-500/40';
        case 'staff': return 'bg-sky-900/60 text-sky-300 border border-sky-500/40';
        default: return 'bg-surface-700 text-gray-300';
      }
    };

    return {
      store,
      pin,
      staffList,
      selectedStaff,
      submitting,
      hasError,
      errorMessage,
      selectStaff,
      appendDigit,
      backspacePin,
      clearPin,
      submitPin,
      staffPassword,
      showStaffPassword,
      isCurrentSelectedLocked,
      submitUnlockStaff,
      closeModal,
      getRoleColor,
    };
  },
};
window.StaffPinModal = StaffPinModal;

