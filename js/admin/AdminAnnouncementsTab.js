// G Shot Teas — Staff & Admin Announcements Management Tab
const AdminAnnouncementsTab = {
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Top Action Bar & Metrics -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-surface-900 border border-surface-800">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase mb-2">
            <i class="pi pi-megaphone"></i>
            <span>Bulletin & Marketing Controls</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white">Store Announcements & Promos</h2>
          <p class="text-xs text-gray-400 mt-1">
            Broadcast limited-time promos, new menu launches, and holiday advisories to customer screens.
          </p>
        </div>

        <button 
          @click="store.openCreateAnnouncementModal()"
          class="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0">
          <i class="pi pi-plus text-xs"></i>
          <span>Create New Announcement</span>
        </button>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Announcements</span>
          <span class="text-2xl font-black text-white mt-1 block">{{ store.announcements.length }}</span>
        </div>
        <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Active / Visible</span>
          <span class="text-2xl font-black text-emerald-400 mt-1 block">{{ activeCount }}</span>
        </div>
        <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Drafts / Hidden</span>
          <span class="text-2xl font-black text-gray-400 mt-1 block">{{ draftCount }}</span>
        </div>
        <div class="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">With Photos</span>
          <span class="text-2xl font-black text-amber-400 mt-1 block">{{ withPhotoCount }}</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 border-b border-surface-800 pb-3">
        <button 
          @click="filter = 'all'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
          :class="filter === 'all' ? 'bg-surface-800 text-white border border-surface-700' : 'text-gray-400 hover:text-white'">
          All ({{ store.announcements.length }})
        </button>
        <button 
          @click="filter = 'active'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
          :class="filter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-white'">
          Published ({{ activeCount }})
        </button>
        <button 
          @click="filter = 'draft'" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
          :class="filter === 'draft' ? 'bg-surface-800 text-gray-300 border border-surface-700' : 'text-gray-400 hover:text-white'">
          Drafts ({{ draftCount }})
        </button>
      </div>

      <!-- Announcements Cards List -->
      <div v-if="filteredAnnouncements.length === 0" class="p-12 rounded-3xl bg-surface-900/40 border border-surface-800 text-center">
        <div class="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center text-xl text-gray-400 mx-auto mb-3">📢</div>
        <h3 class="text-sm font-bold text-white">No announcements found in this filter</h3>
        <p class="text-xs text-gray-500 mt-1">Click "Create New Announcement" to announce a store discount or new menu item.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div 
          v-for="item in filteredAnnouncements" 
          :key="item.id"
          class="p-5 rounded-3xl bg-surface-900 border border-surface-800 flex flex-col justify-between hover:border-surface-700 transition-all shadow-md">
          
          <div>
            <!-- Header: Badge, Status Pill, Photo indicator -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getBadgeClass(item.badge_color)">
                  {{ item.badge || 'Promo' }}
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-md font-semibold" :class="item.image_url ? 'bg-blue-500/15 text-blue-300' : 'bg-surface-800 text-gray-400'">
                  <i class="pi" :class="item.image_url ? 'pi-image' : 'pi-align-left'"></i>
                  <span class="ml-1">{{ item.image_url ? 'With Photo' : 'Text-Only' }}</span>
                </span>
              </div>

              <!-- Status Toggle Switch -->
              <button 
                @click="store.toggleAnnouncementStatus(item.id)"
                class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1.5"
                :class="item.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-surface-800 text-gray-400 border-surface-700'">
                <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'"></span>
                <span>{{ item.is_active ? 'Published' : 'Draft' }}</span>
              </button>
            </div>

            <!-- Optional Thumbnail preview inside admin row -->
            <div v-if="item.image_url" class="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-black relative">
              <img :src="item.image_url" alt="" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <!-- Title & Description -->
            <h3 class="text-base font-black text-white leading-snug mb-1.5">
              {{ item.title }}
            </h3>
            <p class="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-3">
              {{ item.description }}
            </p>

            <div v-if="item.cta_text" class="text-[11px] text-brand-400 font-semibold flex items-center gap-1 mb-2">
              <i class="pi pi-link text-[10px]"></i>
              <span>Button: "{{ item.cta_text }}" ({{ item.cta_action || 'menu' }})</span>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="pt-3 border-t border-surface-800/80 flex items-center justify-between text-xs text-gray-400">
            <span class="text-[10px] text-gray-500">
              By {{ item.created_by || 'Staff' }}
            </span>

            <div class="flex items-center gap-1.5">
              <button 
                @click="store.openEditAnnouncementModal(item)"
                class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 text-xs font-bold border border-surface-700 flex items-center gap-1 transition-colors">
                <i class="pi pi-pencil text-[10px]"></i>
                <span>Edit</span>
              </button>

              <button 
                @click="confirmDelete(item)"
                class="px-2.5 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 text-xs font-bold border border-rose-500/20 transition-colors"
                title="Delete Announcement">
                <i class="pi pi-trash text-[10px]"></i>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const filter = Vue.ref('all');

    const activeCount = Vue.computed(() => store.announcements.filter(a => a.is_active).length);
    const draftCount = Vue.computed(() => store.announcements.filter(a => !a.is_active).length);
    const withPhotoCount = Vue.computed(() => store.announcements.filter(a => !!a.image_url).length);

    const filteredAnnouncements = Vue.computed(() => {
      if (filter.value === 'active') {
        return store.announcements.filter(a => a.is_active);
      }
      if (filter.value === 'draft') {
        return store.announcements.filter(a => !a.is_active);
      }
      return store.announcements;
    });

    const getBadgeClass = (color) => {
      switch (color) {
        case 'purple': return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
        case 'emerald': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        case 'blue': return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
        case 'rose': return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
        case 'amber': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
        case 'orange':
        default: return 'bg-brand-500/20 text-brand-400 border border-brand-500/40';
      }
    };

    const confirmDelete = (item) => {
      if (confirm(`Are you sure you want to delete announcement "${item.title}"?`)) {
        store.deleteAnnouncement(item.id);
      }
    };

    return {
      store,
      filter,
      activeCount,
      draftCount,
      withPhotoCount,
      filteredAnnouncements,
      getBadgeClass,
      confirmDelete,
    };
  },
};

window.AdminAnnouncementsTab = AdminAnnouncementsTab;
