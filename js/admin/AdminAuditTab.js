// G Shot Teas — System Audit Trail & Activity Log Tab (Page 10, 48, 53)
const AdminAuditTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-history"></i> AUDIT LOGS & ACCOUNTABILITY
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">System Audit Trail</h2>
          <p class="text-xs text-gray-400">Comprehensive record of all store activities, order placements, stock deductions, and administrative operations.</p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Logs Table -->
      <div class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4">User</th>
                <th class="px-6 py-4">Action</th>
                <th class="px-6 py-4">Activity Details</th>
                <th class="px-6 py-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              <tr 
                v-for="log in logs" 
                :key="log.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-400">
                  {{ formatDate(log.created_at) }}
                </td>

                <td class="px-6 py-4">
                  <span class="font-bold text-white">{{ log.user_name }}</span>
                  <span class="text-[10px] text-gray-400 ml-1">({{ log.user_role }})</span>
                </td>

                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-900 border border-surface-700 text-brand-400">
                    {{ log.action }}
                  </span>
                </td>

                <td class="px-6 py-4 text-gray-300 max-w-md leading-relaxed">
                  {{ log.details }}
                </td>

                <td class="px-6 py-4 font-mono text-gray-500 text-right">
                  {{ log.ip_address || '127.0.0.1' }}
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
    const logs = Vue.ref([]);

    Vue.onMounted(() => {
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getAuditLogs();
        logs.value = res.data.data || res.data;
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    return {
      store,
      loading,
      logs,
      formatDate,
      refresh,
    };
  },
};
