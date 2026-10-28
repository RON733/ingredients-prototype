// G Shot Teas — Announcement Creation & Edit Modal (With Live Adaptive Layout Preview)
const AnnouncementModal = {
  template: `
    <div 
      v-if="store.announcementModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in"
      @click.self="store.closeAnnouncementModal()">
      
      <div class="relative w-full max-w-4xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Modal Header -->
        <div class="p-5 sm:p-6 bg-surface-850 border-b border-surface-700/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 flex items-center justify-center shrink-0">
              <div class="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center text-brand-400">
                <i class="pi pi-megaphone text-lg"></i>
              </div>
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-black text-white">
                {{ isEditing ? 'Edit Store Announcement' : 'Post New Store Announcement' }}
              </h2>
              <p class="text-xs text-gray-400">
                Staff & Admin Bulletin — Announce promotions, discounts, or new drinks to customers.
              </p>
            </div>
          </div>

          <button 
            @click="store.closeAnnouncementModal()"
            class="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <!-- Modal Body (Scrollable Split: Left Form, Right Live Preview) -->
        <div class="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT COLUMN: Input Form (7 cols on lg) -->
          <div class="lg:col-span-7 space-y-4">
            
            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">
                Announcement Title <span class="text-brand-500">*</span>
              </label>
              <input 
                v-model="form.title" 
                type="text" 
                placeholder="e.g. Weekend Fiesta: Buy 2 Milk Teas Get Free Fries!" 
                class="w-full px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-white text-xs sm:text-sm focus:outline-none transition-colors" />
            </div>

            <!-- Badge Type & Badge Color -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">Badge Tag</label>
                <input 
                  v-model="form.badge" 
                  type="text" 
                  placeholder="e.g. Promo, New Menu, Notice" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-white text-xs sm:text-sm focus:outline-none transition-colors" />
                <div class="flex flex-wrap gap-1 mt-1.5">
                  <button 
                    v-for="b in presetBadges" 
                    :key="b"
                    type="button"
                    @click="form.badge = b"
                    class="px-2 py-0.5 rounded-md text-[10px] bg-surface-800 hover:bg-surface-700 text-gray-300">
                    {{ b }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">Badge Accent Color</label>
                <div class="flex items-center gap-2 pt-1">
                  <button 
                    v-for="c in colorOptions" 
                    :key="c.name"
                    type="button"
                    @click="form.badge_color = c.name"
                    :title="c.label"
                    class="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                    :class="[c.bg, form.badge_color === c.name ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100']">
                    <i v-if="form.badge_color === c.name" class="pi pi-check text-[10px] text-white font-bold"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-gray-300 mb-1.5">
                Announcement Details / Promo Mechanics <span class="text-brand-500">*</span>
              </label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                placeholder="Explain the offer, discounted items, mechanics, or dates..."
                class="w-full px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-white text-xs sm:text-sm focus:outline-none transition-colors resize-none"></textarea>
            </div>

            <!-- PHOTO SECTION (OPTIONAL) -->
            <div class="p-4 rounded-2xl bg-surface-850/80 border border-surface-750 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-white flex items-center gap-2">
                  <i class="pi pi-image text-brand-400"></i>
                  <span>Announcement Photo (Optional)</span>
                </label>
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-surface-700 text-gray-300 font-semibold">
                  {{ form.image_url ? 'Photo Attached' : 'Text-Only Mode' }}
                </span>
              </div>
              <p class="text-[11px] text-gray-400">
                You can upload a banner photo, pick a preset, or leave it blank. The card automatically morphs its layout and optimizes responsiveness!
              </p>

              <!-- Photo Controls -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- File Input Trigger -->
                <label class="px-3 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-surface-600 transition-colors">
                  <i class="pi pi-upload text-xs"></i>
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                </label>

                <!-- Preset Options -->
                <button 
                  type="button" 
                  @click="form.image_url = './assets/menu-coffee.png'"
                  class="px-2.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 text-xs font-medium">
                  ☕ Drinks Banner
                </button>
                <button 
                  type="button" 
                  @click="form.image_url = './assets/hero-banner.png'"
                  class="px-2.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 text-xs font-medium">
                  🍔 Food Banner
                </button>
                <button 
                  type="button" 
                  @click="form.image_url = './assets/menu-pizza.png'"
                  class="px-2.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 text-xs font-medium">
                  🍕 Pizza Banner
                </button>

                <!-- Remove Photo Button -->
                <button 
                  v-if="form.image_url"
                  type="button" 
                  @click="form.image_url = null"
                  class="px-3 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto">
                  <i class="pi pi-trash text-xs"></i>
                  <span>Remove Photo</span>
                </button>
              </div>

              <!-- Image URL Input -->
              <div>
                <input 
                  v-model="form.image_url" 
                  type="text" 
                  placeholder="Or enter image URL (https://... or ./assets/...)" 
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-gray-300 text-xs focus:outline-none" />
              </div>
            </div>

            <!-- Call to Action Button Options -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">Action Button Label (Optional)</label>
                <input 
                  v-model="form.cta_text" 
                  type="text" 
                  placeholder="e.g. Order Now, Claim Promo" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-white text-xs sm:text-sm focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">Action Target</label>
                <select 
                  v-model="form.cta_action" 
                  class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-brand-500 text-white text-xs sm:text-sm focus:outline-none">
                  <option value="menu">Scroll to Menu Catalog</option>
                  <option value="booking">Open Event Booking Modal</option>
                  <option value="about">Scroll to About Section</option>
                  <option value="contact">Scroll to Contact Details</option>
                </select>
              </div>
            </div>

            <!-- Status & Priority -->
            <div class="flex items-center justify-between p-3.5 rounded-2xl bg-surface-950 border border-surface-800">
              <div>
                <span class="text-xs font-bold text-white block">Publish Status</span>
                <span class="text-[11px] text-gray-400">
                  {{ form.is_active ? 'Visible on customer site' : 'Draft / Hidden from customer site' }}
                </span>
              </div>
              <button 
                type="button"
                @click="form.is_active = !form.is_active"
                class="px-3 py-1.5 rounded-xl text-xs font-black transition-all border"
                :class="form.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-surface-800 text-gray-400 border-surface-700'">
                {{ form.is_active ? '🟢 Published' : '⚪ Draft' }}
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: LIVE RESPONSIVE CARD PREVIEW (5 cols on lg) -->
          <div class="lg:col-span-5 flex flex-col justify-start">
            <div class="sticky top-2 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <i class="pi pi-eye text-amber-400"></i>
                  <span>Live Card Preview</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold" :class="form.image_url ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'">
                  {{ form.image_url ? 'Split Media Layout' : 'Typographic Layout' }}
                </span>
              </div>

              <!-- Preview Card Wrapper -->
              <div class="p-3 bg-surface-950/80 rounded-2xl border border-surface-800">
                
                <!-- PREVIEW A: WITH PHOTO -->
                <div 
                  v-if="form.image_url"
                  class="rounded-2xl bg-surface-900 border border-surface-700/80 overflow-hidden shadow-lg flex flex-col">
                  <div class="w-full h-36 relative overflow-hidden bg-black">
                    <img :src="form.image_url" alt="Preview" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent"></div>
                    <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getBadgeClass(form.badge_color)">
                      {{ form.badge || 'Promo' }}
                    </span>
                  </div>
                  <div class="p-4 flex flex-col justify-between">
                    <div>
                      <h4 class="text-sm font-black text-white leading-snug line-clamp-2 mb-1.5">
                        {{ form.title || 'Announcement Title Preview' }}
                      </h4>
                      <p class="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                        {{ form.description || 'Details of your special promotion will appear here for all customers...' }}
                      </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-surface-800 flex items-center justify-between">
                      <span v-if="form.cta_text" class="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-[11px] flex items-center gap-1">
                        <span>{{ form.cta_text }}</span>
                        <i class="pi pi-arrow-right text-[9px]"></i>
                      </span>
                      <span v-else class="text-[10px] text-gray-400">In-Store & Online</span>
                      <span class="text-[9px] text-gray-500 font-mono">Optimized for media</span>
                    </div>
                  </div>
                </div>

                <!-- PREVIEW B: WITHOUT PHOTO -->
                <div 
                  v-else
                  class="rounded-2xl bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 border border-brand-500/30 p-4 relative overflow-hidden flex flex-col justify-between">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-500 to-amber-500"></div>
                  <div class="absolute -right-2 -bottom-3 text-6xl opacity-10 text-brand-400 pointer-events-none select-none font-black">📢</div>
                  <div class="relative z-10 pl-1.5">
                    <div class="flex items-center justify-between mb-2">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" :class="getBadgeClass(form.badge_color)">
                        {{ form.badge || 'Promo' }}
                      </span>
                      <span class="text-[9px] text-gray-400 font-mono">No-photo optimized</span>
                    </div>
                    <h4 class="text-sm font-black text-white leading-snug mb-1.5">
                      {{ form.title || 'Announcement Title Preview' }}
                    </h4>
                    <p class="text-xs text-gray-200 line-clamp-4 leading-relaxed">
                      {{ form.description || 'Details of your special promotion will appear here in a clean, high-contrast typographic card without awkward gaps or missing placeholders...' }}
                    </p>
                  </div>
                  <div class="relative z-10 mt-4 pt-3 border-t border-surface-800 flex items-center justify-between pl-1.5">
                    <span v-if="form.cta_text" class="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-[11px] flex items-center gap-1">
                      <span>{{ form.cta_text }}</span>
                      <i class="pi pi-arrow-right text-[9px]"></i>
                    </span>
                    <span v-else class="text-[10px] text-gray-400">Store Bulletin</span>
                    <span class="text-[9px] text-emerald-400 font-bold">100% Balanced</span>
                  </div>
                </div>

              </div>

              <div class="p-3 rounded-xl bg-surface-900/60 border border-surface-800/80 text-[11px] text-gray-400 leading-relaxed">
                <span class="font-bold text-gray-300">💡 Smart Responsiveness:</span> When you add a photo, the card uses a split media layout. When photo is left empty, it automatically renders as a rich typographic bulletin.
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer Actions -->
        <div class="p-4 sm:p-5 bg-surface-850 border-t border-surface-700/80 flex items-center justify-between gap-3 shrink-0">
          <button 
            type="button" 
            @click="store.closeAnnouncementModal()"
            class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-bold transition-colors">
            Cancel
          </button>

          <button 
            type="button" 
            @click="handleSubmit"
            :disabled="!form.title || !form.description || store.loading"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <i class="pi" :class="store.loading ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            <span>{{ isEditing ? 'Update Announcement' : 'Publish Announcement' }}</span>
          </button>
        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();

    const isEditing = Vue.computed(() => !!store.editingAnnouncement);

    const form = Vue.reactive({
      id: null,
      title: '',
      badge: 'Promo',
      badge_color: 'orange',
      description: '',
      image_url: null,
      cta_text: 'Order Now',
      cta_action: 'menu',
      is_active: true,
      priority: 0,
    });

    const presetBadges = ['Promo', 'New Menu', 'Limited Deal', 'Store Advisory', 'Holiday Hours', 'Event'];

    const colorOptions = [
      { name: 'orange', label: 'Brand Orange', bg: 'bg-brand-500' },
      { name: 'purple', label: 'Velvet Purple', bg: 'bg-purple-500' },
      { name: 'emerald', label: 'Fresh Green', bg: 'bg-emerald-500' },
      { name: 'amber', label: 'Golden Amber', bg: 'bg-amber-500' },
      { name: 'rose', label: 'Ruby Rose', bg: 'bg-rose-500' },
      { name: 'blue', label: 'Ocean Blue', bg: 'bg-blue-500' },
    ];

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

    // Watch for editing state changes to populate form
    Vue.watch(() => store.editingAnnouncement, (item) => {
      if (item) {
        form.id = item.id;
        form.title = item.title || '';
        form.badge = item.badge || 'Promo';
        form.badge_color = item.badge_color || 'orange';
        form.description = item.description || '';
        form.image_url = item.image_url || null;
        form.cta_text = item.cta_text || '';
        form.cta_action = item.cta_action || 'menu';
        form.is_active = item.is_active !== undefined ? item.is_active : true;
        form.priority = item.priority || 0;
      } else {
        form.id = null;
        form.title = '';
        form.badge = 'Promo';
        form.badge_color = 'orange';
        form.description = '';
        form.image_url = null;
        form.cta_text = 'Order Now';
        form.cta_action = 'menu';
        form.is_active = true;
        form.priority = 0;
      }
    }, { immediate: true });

    const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        form.image_url = event.target.result;
      };
      reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
      if (!form.title.trim() || !form.description.trim()) {
        store.notify('Please fill in title and description.', 'error');
        return;
      }
      await store.saveAnnouncement({ ...form });
    };

    return {
      store,
      isEditing,
      form,
      presetBadges,
      colorOptions,
      getBadgeClass,
      handleFileUpload,
      handleSubmit,
    };
  },
};

window.AnnouncementModal = AnnouncementModal;
