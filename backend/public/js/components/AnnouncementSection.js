// G Shot Teas — Store Announcements & Promos Showcase (Auto-Responsive Card Layout)
const AnnouncementSection = {
  template: `
    <section id="announcements" v-if="visibleAnnouncements.length > 0 || store.isStaffOrAdmin" class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      
      <!-- Section Header with Staff/Admin Quick Action -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase mb-2">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
            <span>Store Bulletin & Promos</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Special Announcements</span>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-surface-800 border border-surface-700 text-gray-400 font-medium">
              {{ visibleAnnouncements.length }} Active
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Catch our latest store discounts, new chef-crafted menu launches, weekend deals, and operational advisories.
          </p>
        </div>

        <!-- Staff / Admin Quick Announcement Button -->
        <div v-if="store.isStaffOrAdmin" class="flex items-center gap-2.5 shrink-0">
          <button 
            @click="store.openCreateAnnouncementModal()"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <i class="pi pi-megaphone text-sm"></i>
            <span>+ New Announcement</span>
          </button>
          
          <button 
            @click="goToAdminAnnouncements"
            class="px-3.5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <i class="pi pi-sliders-h text-xs"></i>
            <span class="hidden sm:inline">Manage All</span>
          </button>
        </div>
      </div>

      <!-- Empty State for customers if no announcements exist -->
      <div v-if="visibleAnnouncements.length === 0 && store.isStaffOrAdmin" class="p-8 rounded-3xl bg-surface-900/60 border border-surface-800 text-center">
        <div class="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center text-xl text-gray-400 mx-auto mb-3">📢</div>
        <h3 class="text-sm font-bold text-white">No active announcements visible to customers</h3>
        <p class="text-xs text-gray-500 mt-1">Click the button above to publish promos, new drink launches, or event advisories.</p>
      </div>

      <!-- Announcements Grid: Auto-Adaptive Card Architecture -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        <div 
          v-for="item in visibleAnnouncements" 
          :key="item.id"
          class="transition-all duration-300"
          :class="item.image_url ? 'lg:col-span-2 xl:col-span-1' : ''">

          <!-- OPTION A: WITH PHOTO (Optimized Side-by-Side Split on Desktop, Stacked on Mobile) -->
          <article 
            v-if="item.image_url"
            class="h-full rounded-3xl bg-surface-900 border border-surface-700/80 hover:border-brand-500/40 shadow-xl hover:shadow-2xl hover:shadow-brand-500/5 transition-all overflow-hidden flex flex-col md:flex-row group relative">
            
            <!-- Media Container with Dark Gradient Mask -->
            <div class="w-full md:w-5/12 h-52 sm:h-60 md:h-auto min-h-[220px] md:min-h-[260px] relative overflow-hidden shrink-0 bg-surface-950">
              <img 
                :src="item.image_url" 
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                loading="lazy" />
              <!-- Gradient Overlay for smooth edge blend -->
              <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-900 via-surface-900/30 to-transparent pointer-events-none"></div>
              
              <!-- Floating Badge over Photo on Mobile -->
              <div class="absolute top-3 left-3 z-10 md:hidden">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md" :class="getBadgeClass(item.badge_color)">
                  {{ item.badge || 'Promo' }}
                </span>
              </div>
            </div>

            <!-- Content Container -->
            <div class="w-full md:w-7/12 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <!-- Badge & Date Pill (Desktop) -->
                <div class="hidden md:flex items-center justify-between gap-2 mb-3">
                  <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" :class="getBadgeClass(item.badge_color)">
                    {{ item.badge || 'Promo' }}
                  </span>
                  <span class="text-[10px] text-gray-400 font-medium">
                    {{ formatDate(item.created_at) }}
                  </span>
                </div>

                <!-- Title -->
                <h3 class="text-lg sm:text-xl font-black text-white group-hover:text-brand-400 transition-colors leading-snug mb-2.5">
                  {{ item.title }}
                </h3>

                <!-- Description -->
                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-4">
                  {{ item.description }}
                </p>
              </div>

              <!-- Footer with Call to Action and Staff Controls -->
              <div class="mt-6 pt-4 border-t border-surface-800/80 flex flex-wrap items-center justify-between gap-3">
                <button 
                  v-if="item.cta_text"
                  @click="handleCta(item)"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-brand-500/20 transition-all hover:translate-x-0.5">
                  <span>{{ item.cta_text }}</span>
                  <i class="pi pi-arrow-right text-[10px]"></i>
                </button>
                <div v-else class="text-[11px] text-gray-400 font-medium">
                  Available in-store & online
                </div>

                <!-- Staff / Admin Card Actions -->
                <div v-if="store.isStaffOrAdmin" class="flex items-center gap-1.5 ml-auto">
                  <button 
                    @click="store.openEditAnnouncementModal(item)"
                    title="Edit Announcement"
                    class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    @click="store.toggleAnnouncementStatus(item.id)"
                    :title="item.is_active ? 'Hide from Customers' : 'Show to Customers'"
                    class="p-2 rounded-lg text-xs transition-colors border"
                    :class="item.is_active ? 'bg-surface-800 hover:bg-amber-500/20 text-gray-300 border-surface-700' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'">
                    <i class="pi" :class="item.is_active ? 'pi-eye' : 'pi-eye-slash'"></i>
                  </button>
                </div>
              </div>

            </div>
          </article>


          <!-- OPTION B: WITHOUT PHOTO (Optimized Typographic Glassmorphism Card with Glowing Accent) -->
          <article 
            v-else
            class="h-full rounded-3xl bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 border border-brand-500/30 hover:border-brand-500/50 shadow-xl hover:shadow-2xl hover:shadow-brand-500/5 transition-all p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
            
            <!-- Left Accent Strip -->
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-brand-500 via-amber-400 to-brand-600 rounded-l-3xl"></div>

            <!-- Background Decorative Watermark (Fills the space beautifully without an image) -->
            <div class="absolute -right-3 -bottom-4 text-7xl sm:text-8xl opacity-[0.06] group-hover:opacity-[0.10] text-brand-400 pointer-events-none select-none font-black transition-opacity duration-300">
              📢
            </div>

            <div class="relative z-10 pl-2">
              <!-- Top Row: Badge, Date & Tag -->
              <div class="flex items-center justify-between gap-2 mb-3.5">
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" :class="getBadgeClass(item.badge_color)">
                  {{ item.badge || 'Store Advisory' }}
                </span>
                <span class="text-[10px] text-gray-400 font-medium">
                  {{ formatDate(item.created_at) }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-xl sm:text-2xl font-black text-white group-hover:text-brand-300 transition-colors leading-snug mb-3">
                {{ item.title }}
              </h3>

              <!-- Description -->
              <p class="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                {{ item.description }}
              </p>
            </div>

            <!-- Footer: CTA & Controls -->
            <div class="relative z-10 mt-6 pt-4 border-t border-surface-800/80 flex flex-wrap items-center justify-between gap-3 pl-2">
              <button 
                v-if="item.cta_text"
                @click="handleCta(item)"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-brand-500/20 transition-all hover:translate-x-0.5">
                <span>{{ item.cta_text }}</span>
                <i class="pi pi-arrow-right text-[10px]"></i>
              </button>
              <div v-else class="text-[11px] text-gray-400 font-medium">
                G Shot Teas Official Store Update
              </div>

              <!-- Staff / Admin Card Actions -->
              <div v-if="store.isStaffOrAdmin" class="flex items-center gap-1.5 ml-auto">
                <button 
                  @click="store.openEditAnnouncementModal(item)"
                  title="Edit Announcement"
                  class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors">
                  <i class="pi pi-pencil"></i>
                </button>
                <button 
                  @click="store.toggleAnnouncementStatus(item.id)"
                  :title="item.is_active ? 'Hide from Customers' : 'Show to Customers'"
                  class="p-2 rounded-lg text-xs transition-colors border"
                  :class="item.is_active ? 'bg-surface-800 hover:bg-amber-500/20 text-gray-300 border-surface-700' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'">
                  <i class="pi" :class="item.is_active ? 'pi-eye' : 'pi-eye-slash'"></i>
                </button>
              </div>
            </div>

          </article>

        </div>

      </div>

    </section>
  `,
  setup() {
    const store = useGShotStore();

    const visibleAnnouncements = Vue.computed(() => {
      // If staff or admin, they can see all announcements (active & draft) so they can test and toggle them directly
      if (store.isStaffOrAdmin) {
        return store.announcements;
      }
      return store.activeAnnouncements;
    });

    const getBadgeClass = (color) => {
      switch (color) {
        case 'purple':
          return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
        case 'emerald':
          return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
        case 'blue':
          return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
        case 'rose':
          return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
        case 'amber':
          return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
        case 'orange':
        default:
          return 'bg-brand-500/20 text-brand-400 border border-brand-500/40';
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Latest';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        return 'Latest';
      }
    };

    const handleCta = (item) => {
      const action = item.cta_action || 'menu';
      if (action === 'menu') {
        const el = document.getElementById('menu');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          store.currentView = 'customer';
          setTimeout(() => {
            document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      } else if (action === 'booking') {
        store.bookingModalOpen = true;
      } else if (action.startsWith('http')) {
        window.open(action, '_blank');
      } else {
        const target = document.getElementById(action);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const goToAdminAnnouncements = () => {
      store.currentView = 'admin';
      store.adminTab = 'announcements';
    };

    return {
      store,
      visibleAnnouncements,
      getBadgeClass,
      formatDate,
      handleCta,
      goToAdminAnnouncements,
    };
  },
};

window.AnnouncementSection = AnnouncementSection;
