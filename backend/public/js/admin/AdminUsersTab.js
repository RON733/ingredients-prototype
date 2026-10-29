// G Shot Teas — Personnel & Role Management Tab (Admin & Super Admin Exclusive)
const AdminUsersTab = {
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <i class="pi pi-shield text-[9px]"></i> Authorized Administration Console
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">User & Role Management</h2>
          <p class="text-xs text-gray-400 mt-1 max-w-2xl">
            Create new staff barista and administrative accounts, assign 4-digit POS PINs, and manage operational privileges.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <!-- Create New Personnel Button (Admin & Super Admin) -->
          <button 
            @click="openCreateModal"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95">
            <i class="pi pi-user-plus text-xs"></i>
            <span>Create Staff / Admin</span>
          </button>

          <button 
            @click="refresh"
            :disabled="loading"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors"
            title="Refresh Users">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- Quick Summary Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          @click="selectedRoleFilter = 'all'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'all' ? 'bg-surface-800/90 border-brand-500/60 ring-1 ring-brand-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Accounts</span>
            <i class="pi pi-users text-brand-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-white mt-1">{{ users.length }}</div>
          <span class="text-[9px] text-gray-400">All registered users</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'staff'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'staff' ? 'bg-sky-950/40 border-sky-500/70 ring-1 ring-sky-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-sky-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Staff Baristas</span>
            <i class="pi pi-id-card text-sky-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-sky-300 mt-1">{{ staffCount }}</div>
          <span class="text-[9px] text-sky-400/80">Active POS operators</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'admin'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'admin' ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Store Admins</span>
            <i class="pi pi-shield text-amber-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-amber-300 mt-1">{{ adminCount }}</div>
          <span class="text-[9px] text-amber-400/80">Owner & Managers</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'super_admin'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'super_admin' ? 'bg-purple-950/40 border-purple-500/70 ring-1 ring-purple-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-purple-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Super Admins</span>
            <i class="pi pi-crown text-purple-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-purple-300 mt-1">{{ superAdminCount }}</div>
          <span class="text-[9px] text-purple-400/80">System Administrators</span>
        </div>
      </div>

      <!-- Filter & Search Strip -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-850/80 p-3 rounded-2xl border border-surface-750">
        <!-- Role Filters -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button 
            @click="selectedRoleFilter = 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            :class="selectedRoleFilter === 'all' ? 'bg-surface-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'">
            All ({{ users.length }})
          </button>
          <button 
            @click="selectedRoleFilter = 'staff'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-sky-300"
            :class="selectedRoleFilter === 'staff' ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-sky-950/40'">
            Staff ({{ staffCount }})
          </button>
          <button 
            @click="selectedRoleFilter = 'admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-amber-300"
            :class="selectedRoleFilter === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'hover:bg-amber-950/40'">
            Admin ({{ adminCount }})
          </button>
          <button 
            @click="selectedRoleFilter = 'super_admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-purple-300"
            :class="selectedRoleFilter === 'super_admin' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-purple-950/40'">
            Super Admin ({{ superAdminCount }})
          </button>
          <button 
            @click="selectedRoleFilter = 'customer'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-emerald-300"
            :class="selectedRoleFilter === 'customer' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-emerald-950/40'">
            Customers ({{ customerCount }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name, email, phone..."
            class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors" />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">User Details</th>
                <th class="px-6 py-4">Current Role</th>
                <th class="px-6 py-4">4-Digit Staff PIN</th>
                <th class="px-6 py-4">Contact Phone</th>
                <th class="px-6 py-4">Account Status</th>
                <th class="px-6 py-4 text-right">Modify Role & Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              
              <!-- Empty state -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                  <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
                    <i class="pi pi-users text-lg"></i>
                  </div>
                  <p class="text-sm font-bold text-gray-200">No users match your filter</p>
                  <p class="text-xs text-gray-500 mt-1">Try clearing your search terms or filter selection.</p>
                </td>
              </tr>

              <!-- User rows -->
              <tr 
                v-else
                v-for="u in filteredUsers" 
                :key="u.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <!-- Details -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img v-if="u.avatar" :src="u.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-surface-600" />
                    <div v-else class="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white text-xs">
                      {{ u.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <p class="font-bold text-white text-sm leading-tight">{{ u.name }}</p>
                        <span v-if="u.google_id" title="Google OAuth Linked" class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                          Google
                        </span>
                      </div>
                      <p class="text-gray-400 text-[11px] font-mono mt-0.5">{{ u.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                    :class="getRoleBadge(u.role)">
                    {{ formatRoleName(u.role) }}
                  </span>
                </td>

                <!-- 4-Digit Staff PIN Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="['staff', 'admin', 'super_admin'].includes(u.role)" class="flex items-center gap-2">
                    <span class="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-surface-900 border border-surface-700 text-brand-400">
                      {{ revealedPins[u.id] ? (u.pin || 'None') : (u.pin ? '••••' : 'None') }}
                    </span>
                    <button 
                      v-if="u.pin"
                      @click="togglePinReveal(u.id)"
                      class="p-1 text-gray-400 hover:text-white text-xs"
                      :title="revealedPins[u.id] ? 'Hide PIN' : 'Reveal PIN'">
                      <i class="pi" :class="revealedPins[u.id] ? 'pi-eye-slash' : 'pi-eye'"></i>
                    </button>
                    <button 
                      @click="promptEditPin(u)"
                      class="p-1 text-sky-400 hover:text-sky-300 text-xs"
                      title="Change PIN">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </div>
                  <span v-else class="text-gray-600 text-[11px]">—</span>
                </td>

                <!-- Phone -->
                <td class="px-6 py-4 font-mono text-gray-400 text-xs whitespace-nowrap">
                  {{ u.phone || 'N/A' }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                    :class="u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'">
                    {{ u.status || 'active' }}
                  </span>
                </td>

                <!-- Role Selector & Actions -->
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-2">
                    <select 
                      :value="u.role" 
                      @change="changeRole(u, $event.target.value)"
                      class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-brand-500">
                      <option value="customer">Customer</option>
                      <option value="staff">Staff (Barista)</option>
                      <option value="admin">Admin (Owner)</option>
                      <option v-if="store.isSuperAdmin" value="super_admin">Super Admin</option>
                    </select>

                    <button 
                      @click="toggleStatus(u)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer"
                      :class="u.status === 'active' ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/20' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'">
                      {{ u.status === 'active' ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create New Personnel Modal -->
      <div 
        v-if="createModalOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        @click.self="createModalOpen = false">
        
        <div class="relative w-full max-w-lg bg-surface-900 border border-surface-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5 animate-scale-up">
          
          <!-- Close button -->
          <button 
            @click="createModalOpen = false" 
            class="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-surface-800 rounded-xl transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>

          <!-- Modal Header -->
          <div>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
              <i class="pi pi-user-plus"></i> Management Access Provisioning
            </span>
            <h3 class="text-xl font-black text-white mt-1">Create Personnel Account</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Provision credentials and a 4-digit POS PIN for authorized staff and administrators.
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitCreateUser" class="space-y-4 text-xs">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Full Name *</label>
                <input 
                  v-model="newUser.name" 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Mae Santos"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">Email Address *</label>
                <input 
                  v-model="newUser.email" 
                  type="email" 
                  required 
                  placeholder="e.g. sarah@gshotteas.com"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Role Selection -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Role & Privileges *</label>
                <select 
                  v-model="newUser.role" 
                  required
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500 cursor-pointer">
                  <option value="staff">Staff / Barista (Counter & Orders)</option>
                  <option value="driver">Delivery Driver (Rider & GPS)</option>
                  <option value="admin">Admin (Store Owner / Manager)</option>
                  <option v-if="store.isSuperAdmin" value="super_admin">Super Admin (System Administrator)</option>
                </select>
              </div>

              <!-- 4-Digit Staff PIN -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-300">4-Digit POS PIN *</label>
                  <button 
                    type="button" 
                    @click="generateRandomPin" 
                    class="text-[10px] text-brand-400 hover:text-brand-300 underline font-bold">
                    Generate
                  </button>
                </div>
                <input 
                  v-model="newUser.pin" 
                  type="text" 
                  maxlength="4" 
                  pattern="[0-9]{4}" 
                  required 
                  placeholder="e.g. 5678"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-brand-400 font-mono font-bold tracking-widest focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Initial Password -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Initial Password *</label>
                <input 
                  v-model="newUser.password" 
                  type="text" 
                  minlength="6" 
                  required 
                  placeholder="password123"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white font-mono focus:outline-none focus:border-brand-500" />
              </div>

              <!-- Contact Phone -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Contact Phone</label>
                <input 
                  v-model="newUser.phone" 
                  type="text" 
                  placeholder="e.g. 09171234567"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Assigned Station / Address</label>
              <input 
                v-model="newUser.address" 
                type="text" 
                placeholder="e.g. G Shot Teas Counter Station, Santa Rosa Branch"
                class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
            </div>

            <p class="text-[11px] text-gray-400 bg-surface-950/60 p-3 rounded-xl border border-surface-800 flex items-start gap-2">
              <i class="pi pi-info-circle text-brand-400 text-xs shrink-0 mt-0.5"></i>
              <span>Staff can use their <strong>4-digit PIN</strong> for fast 1-second authentication on the shared counter laptop without retyping passwords.</span>
            </p>

            <!-- Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-800">
              <button 
                type="button" 
                @click="createModalOpen = false" 
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-gray-300 font-bold transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="savingUser"
                class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
                <i class="pi pi-check" :class="{ 'pi-spin pi-spinner': savingUser }"></i>
                <span>{{ savingUser ? 'Provisioning...' : 'Create Account' }}</span>
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const users = Vue.ref([]);
    const selectedRoleFilter = Vue.ref('all');
    const searchQuery = Vue.ref('');
    const revealedPins = Vue.ref({});

    // Create Modal state
    const createModalOpen = Vue.ref(false);
    const savingUser = Vue.ref(false);
    const newUser = Vue.ref({
      name: '',
      email: '',
      password: 'password123',
      role: 'staff',
      pin: '1234',
      phone: '',
      address: '',
    });

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getUsers();
        users.value = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const staffCount = Vue.computed(() => users.value.filter(u => u.role === 'staff').length);
    const adminCount = Vue.computed(() => users.value.filter(u => u.role === 'admin').length);
    const superAdminCount = Vue.computed(() => users.value.filter(u => u.role === 'super_admin').length);
    const customerCount = Vue.computed(() => users.value.filter(u => u.role === 'customer').length);

    const filteredUsers = Vue.computed(() => {
      return users.value.filter(u => {
        if (selectedRoleFilter.value !== 'all' && u.role !== selectedRoleFilter.value) {
          return false;
        }
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim();
          const matchName = (u.name || '').toLowerCase().includes(q);
          const matchEmail = (u.email || '').toLowerCase().includes(q);
          const matchPhone = (u.phone || '').toLowerCase().includes(q);
          const matchRole = (u.role || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchRole) {
            return false;
          }
        }
        return true;
      });
    });

    const getRoleBadge = (role) => {
      if (role === 'super_admin') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      if (role === 'admin') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      if (role === 'staff') return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      if (role === 'driver') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    };

    const formatRoleName = (role) => {
      switch (role) {
        case 'super_admin': return 'Super Admin';
        case 'admin': return 'Admin (Owner)';
        case 'staff': return 'Staff (Barista)';
        case 'driver': return 'Delivery Driver';
        default: return 'Customer';
      }
    };

    const togglePinReveal = (userId) => {
      revealedPins.value[userId] = !revealedPins.value[userId];
    };

    const promptEditPin = async (user) => {
      const currentPin = user.pin || '1234';
      const newPin = window.prompt(`Enter new 4-digit PIN for ${user.name}:`, currentPin);
      if (newPin && newPin.trim().length >= 4) {
        try {
          await GST_API.updateUser(user.id, { pin: newPin.trim() });
          store.notify(`Updated PIN for ${user.name} to ${newPin.trim()}`);
          refresh();
        } catch (err) {
          store.notify('Failed to update PIN', 'error');
        }
      }
    };

    const changeRole = async (user, newRole) => {
      try {
        await GST_API.updateUser(user.id, { role: newRole });
        store.notify(`Updated ${user.name} role to ${newRole}`);
        refresh();
      } catch (err) {
        store.notify('Error updating user role', 'error');
      }
    };

    const toggleStatus = async (user) => {
      const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
      try {
        await GST_API.updateUser(user.id, { status: nextStatus });
        store.notify(`Account ${nextStatus}: ${user.name}`);
        refresh();
      } catch (err) {
        store.notify('Error toggling status', 'error');
      }
    };

    const openCreateModal = () => {
      generateRandomPin();
      newUser.value.name = '';
      newUser.value.email = '';
      newUser.value.password = 'password123';
      newUser.value.role = 'staff';
      newUser.value.phone = '';
      newUser.value.address = '';
      createModalOpen.value = true;
    };

    const generateRandomPin = () => {
      const random = Math.floor(1000 + Math.random() * 9000).toString();
      newUser.value.pin = random;
    };

    const submitCreateUser = async () => {
      savingUser.value = true;
      try {
        await GST_API.createUser(newUser.value);
        store.notify(`Account for ${newUser.value.name} created successfully!`, 'success');
        createModalOpen.value = false;
        refresh();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create personnel account.';
        store.notify(msg, 'error');
      } finally {
        savingUser.value = false;
      }
    };

    return {
      store,
      loading,
      users,
      selectedRoleFilter,
      searchQuery,
      revealedPins,
      staffCount,
      adminCount,
      superAdminCount,
      customerCount,
      filteredUsers,
      createModalOpen,
      savingUser,
      newUser,
      getRoleBadge,
      formatRoleName,
      togglePinReveal,
      promptEditPin,
      changeRole,
      toggleStatus,
      openCreateModal,
      generateRandomPin,
      submitCreateUser,
      refresh,
    };
  },
};
