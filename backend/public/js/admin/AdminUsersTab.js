// G Shot Teas — Super Admin User Management Tab (Page 10, 48, 53)
const AdminUsersTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-users"></i> SUPER ADMIN ACCESS ONLY
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">User & Role Management</h2>
          <p class="text-xs text-gray-400">Configure access levels and manage privileges for Super Admin, Admin (Owner), Staff, and Customers.</p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Users Table -->
      <div class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">User Details</th>
                <th class="px-6 py-4">Contact Phone</th>
                <th class="px-6 py-4">Current Role</th>
                <th class="px-6 py-4">Account Status</th>
                <th class="px-6 py-4 text-right">Modify Role & Permissions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              <tr 
                v-for="u in users" 
                :key="u.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img v-if="u.avatar" :src="u.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-surface-600" />
                    <div v-else class="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white text-xs">
                      {{ u.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <p class="font-bold text-white text-sm">{{ u.name }}</p>
                        <span v-if="u.google_id" title="Google OAuth Linked" class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                          <svg class="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                          Google
                        </span>
                      </div>
                      <p class="text-gray-400 text-[11px]">{{ u.email }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 font-mono text-gray-400">
                  {{ u.phone || 'N/A' }}
                </td>

                <td class="px-6 py-4">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="getRoleBadge(u.role)">
                    {{ u.role }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                    :class="u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
                    {{ u.status || 'active' }}
                  </span>
                </td>

                <!-- Role Selector -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <select 
                      :value="u.role" 
                      @change="changeRole(u, $event.target.value)"
                      class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-brand-500">
                      <option value="customer">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <button 
                      @click="toggleStatus(u)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors"
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

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const users = Vue.ref([]);

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getUsers();
        users.value = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const getRoleBadge = (role) => {
      if (role === 'super_admin') return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      if (role === 'admin') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      if (role === 'staff') return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
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

    return {
      store,
      loading,
      users,
      getRoleBadge,
      changeRole,
      toggleStatus,
      refresh,
    };
  },
};
