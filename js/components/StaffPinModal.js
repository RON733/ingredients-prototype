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
                <p class="text-xs font-bold text-white truncate">{{ s.name || 'Staff' }}</p>
                <span class="text-[9px] uppercase font-bold text-brand-400 block tracking-wider">{{ s.role }}</span>
              </div>
            </button>
          </div>
        </div>

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
          class="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <i class="pi pi-check-circle" :class="{ 'pi-spin': submitting }"></i>
          <span>{{ submitting ? 'Verifying PIN...' : 'Verify PIN & Switch On Duty' }}</span>
        </button>

        </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const pin = Vue.ref('');
    const submitting = Vue.ref(false);
    const hasError = Vue.ref(false);
    const errorMessage = Vue.ref('');
    const staffList = Vue.ref([
      { id: 3, name: 'Mhar Anthony Lirio', email: 'staff@gshotteas.com', role: 'staff' },
      { id: 9, name: 'Sarah Mae Santos', email: 'barista2@gshotteas.com', role: 'staff' },
      { id: 2, name: 'Jefferson Anore Alulod', email: 'admin@gshotteas.com', role: 'admin' },
      { id: 1, name: 'Tyron Erick Rico', email: 'superadmin@gshotteas.com', role: 'super_admin' },
    ]);
    const selectedStaff = Vue.ref(staffList.value[0]);

    const fetchStaffList = async () => {
      try {
        const res = await GST_API.getStaffList();
        if (Array.isArray(res.data) && res.data.length > 0) {
          staffList.value = res.data;
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
      
      closeModal,
      getRoleColor,
    };
  },
};
window.StaffPinModal = StaffPinModal;

