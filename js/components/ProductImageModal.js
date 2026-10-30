// G Shot Teas — Enlarged Menu Food & Drink Picture Lightbox Modal
const ProductImageModal = {
  template: `
    <div 
      v-if="store.previewProduct" 
      class="fixed inset-0 z-[120] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 animate-fade-in"
      @click.self="close"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-label="'Enlarged view of ' + (store.previewProduct?.name || 'Menu Item')">
      
      <div 
        class="relative w-full max-w-3xl bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Modal Top Bar -->
        <div class="px-4 sm:px-6 py-3.5 bg-surface-800/95 border-b border-surface-700/70 flex items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-xl sm:text-2xl drop-shadow select-none shrink-0">{{ store.previewProduct.emoji || '🍽️' }}</span>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-black text-white truncate">{{ store.previewProduct.name }}</h3>
                <span 
                  v-if="store.previewProduct.category"
                  class="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase tracking-wider shrink-0">
                  {{ store.previewProduct.category }}
                </span>
                <span 
                  v-if="store.previewProduct.badge"
                  class="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                  {{ store.previewProduct.badge }}
                </span>
              </div>
              <p class="text-[11px] text-gray-400 truncate hidden sm:block">Full Enlarged Photo Inspection</p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Zoom Toggle Button -->
            <button 
              type="button"
              @click="toggleZoom"
              class="px-2.5 py-1.5 rounded-xl bg-surface-700/80 hover:bg-surface-600 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              :title="isZoomed ? 'Fit to Screen' : 'View Full Resolution'">
              <i class="pi" :class="isZoomed ? 'pi-search-minus text-amber-400' : 'pi-search-plus text-brand-400'"></i>
              <span class="hidden sm:inline">{{ isZoomed ? 'Fit to Screen' : 'Zoom In' }}</span>
            </button>

            <!-- Close Button -->
            <button 
              type="button"
              @click="close"
              class="w-8 h-8 rounded-full bg-surface-700/80 hover:bg-surface-600 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <!-- Image Viewing Canvas (Centered, Whole Picture Visible) -->
        <div 
          class="relative bg-surface-950 flex items-center justify-center overflow-auto p-4 sm:p-6 transition-all duration-300 select-none min-h-[260px] sm:min-h-[340px]"
          :class="isZoomed ? 'max-h-[70vh] cursor-zoom-out' : 'max-h-[55vh] cursor-zoom-in'"
          @click="toggleZoom"
          :title="isZoomed ? 'Click to fit image to window' : 'Click to zoom in'">
          
          <img 
            :src="store.previewProduct.image || './assets/hero-banner.png'" 
            :alt="store.previewProduct.name"
            class="transition-all duration-300 drop-shadow-2xl"
            :class="isZoomed ? 'w-auto max-w-none scale-125 my-8 rounded-2xl shadow-2xl' : 'max-h-[48vh] max-w-full w-auto object-contain rounded-2xl ring-1 ring-white/10'"
            onerror="this.src='./assets/hero-banner.png'"
          />

          <!-- Overlay Zoom Hint Pill -->
          <div 
            v-if="!isZoomed"
            class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-surface-900/80 backdrop-blur-md text-gray-300 text-[10px] sm:text-xs flex items-center gap-1.5 border border-surface-700 pointer-events-none shadow-md">
            <i class="pi pi-search-plus text-brand-400"></i>
            <span>Click photo to zoom</span>
          </div>
        </div>

        <!-- Product Details & Actions Footer -->
        <div class="p-4 sm:p-6 bg-surface-900 border-t border-surface-800 flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
          
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h4 class="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  {{ store.previewProduct.name }}
                  <span v-if="store.previewProduct.rating" class="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <i class="pi pi-star-fill text-[10px]"></i> {{ store.previewProduct.rating }}
                  </span>
                </h4>
              </div>

              <div v-if="store.previewProduct.price !== null" class="flex items-center gap-2">
                <span class="text-xs text-gray-400">Price:</span>
                <span class="text-xl sm:text-2xl font-black text-brand-400">₱{{ Number(store.previewProduct.price).toFixed(2) }}</span>
              </div>
            </div>

            <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {{ store.previewProduct.description || 'Crafted fresh to order with premium ingredients.' }}
            </p>

            <!-- Stock Status & Recipe Ingredients Tags -->
            <div class="mt-3 pt-3 border-t border-surface-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <!-- Availability Badge -->
              <div class="flex items-center gap-2">
                <span 
                  v-if="store.previewProduct.max_portions > 3"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  In Stock ({{ store.previewProduct.max_portions }} portions available)
                </span>
                <span 
                  v-else-if="store.previewProduct.max_portions > 0"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-700/60">
                  <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Low Stock ({{ store.previewProduct.max_portions }} remaining)
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-700/60">
                  <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                  Sold Out / Unavailable
                </span>
              </div>

              <!-- Recipe Ingredients summary if present -->
              <div v-if="store.previewProduct.recipes && store.previewProduct.recipes.length > 0" class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] text-gray-500 font-semibold uppercase">Kitchen Ingredients:</span>
                <span 
                  v-for="rec in store.previewProduct.recipes.slice(0, 4)" 
                  :key="rec.id" 
                  class="text-[10px] px-2 py-0.5 rounded-md bg-surface-800 text-gray-300 border border-surface-700">
                  {{ rec.ingredient ? rec.ingredient.name : rec.ingredient_id }} ({{ rec.qty }})
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons Row -->
          <div class="pt-3 border-t border-surface-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button 
              type="button"
              @click="close"
              class="order-2 sm:order-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 transition-all text-center cursor-pointer">
              Back to Menu
            </button>

            <div class="order-1 sm:order-2 flex items-center gap-2">
              <button 
                v-if="store.previewProduct.max_portions > 0"
                type="button"
                @click="handleAction"
                class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer">
                <i class="pi" :class="isCustomizable ? 'pi-sliders-h' : 'pi-plus'"></i>
                <span>{{ isCustomizable ? 'Customize & Add to Cart' : 'Add to Cart (' + (store.previewProduct.price ? '₱' + Number(store.previewProduct.price).toFixed(2) : '') + ')' }}</span>
              </button>
              <button 
                v-else
                disabled
                type="button"
                class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-surface-800 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2">
                <i class="pi pi-ban"></i>
                <span>Currently Unavailable</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const isZoomed = Vue.ref(false);

    const isCustomizable = Vue.computed(() => {
      if (!store.previewProduct) return false;
      const cat = store.previewProduct.category;
      return cat === 'Drinks' || cat === 'Coffee';
    });

    const close = () => {
      isZoomed.value = false;
      store.closeProductPreview();
    };

    const toggleZoom = () => {
      isZoomed.value = !isZoomed.value;
    };

    const handleAction = () => {
      const p = store.previewProduct;
      if (!p) return;
      if (isCustomizable.value) {
        close();
        const matched = store.products.find(item => item.id === p.id) || p;
        store.selectedProductForCustomize = matched;
        store.customizeModalOpen = true;
      } else {
        const matched = store.products.find(item => item.id === p.id) || p;
        store.addToCart(matched);
        store.addToast(`Added ${p.name} to cart!`, 'success');
        close();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && store.previewProduct) {
        close();
      }
    };

    Vue.onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
    });

    Vue.onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });

    Vue.watch(() => store.previewProduct, () => {
      isZoomed.value = false;
    });

    return {
      store,
      isZoomed,
      isCustomizable,
      close,
      toggleZoom,
      handleAction,
    };
  },
};
