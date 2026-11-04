<template>
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
            <span v-if="store.previewProduct.emoji && !store.previewProduct.emoji.includes('?')" class="text-xl sm:text-2xl drop-shadow select-none shrink-0">{{ store.previewProduct.emoji }}</span>
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

          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <!-- Zoom Out (-) -->
            <button 
              type="button"
              @click="zoomOut"
              :disabled="zoomScale <= 1"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-700/80 hover:bg-surface-600 text-gray-200 text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Zoom Out">
              <i class="pi pi-minus text-amber-400 text-xs"></i>
            </button>

            <!-- Zoom Level Pill / Toggle -->
            <button 
              type="button"
              @click="toggleZoom"
              class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-surface-700/80 hover:bg-surface-600 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              :title="zoomScale > 1 ? 'Fit to Screen' : 'View Full Resolution'">
              <i class="pi" :class="zoomScale > 1 ? 'pi-search-minus text-amber-400' : 'pi-search-plus text-brand-400'"></i>
              <span class="text-[11px] font-bold">{{ zoomScale > 1 ? `${Math.round(zoomScale * 100)}%` : 'Zoom In' }}</span>
            </button>

            <!-- Zoom In (+) -->
            <button 
              type="button"
              @click="zoomIn"
              :disabled="zoomScale >= 4"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-700/80 hover:bg-surface-600 text-gray-200 text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Zoom In">
              <i class="pi pi-plus text-amber-400 text-xs"></i>
            </button>

            <!-- Reset button if zoomed -->
            <button 
              v-if="zoomScale > 1"
              type="button"
              @click="resetZoom"
              class="hidden sm:inline-flex px-2 py-1.5 rounded-xl bg-surface-700/80 hover:bg-surface-600 text-amber-400 text-[11px] font-bold transition-colors cursor-pointer"
              title="Reset View">
              Reset
            </button>

            <!-- Close Button -->
            <button 
              type="button"
              @click="close"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-700/80 hover:bg-surface-600 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <!-- Image Viewing Canvas (Centered, Whole Picture Visible) -->
        <div 
          class="relative bg-surface-950 flex items-center justify-center overflow-hidden p-3 sm:p-5 transition-all duration-300 select-none min-h-[260px] sm:min-h-[340px] max-h-[60vh] touch-none"
          :class="zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
          @mousedown="onMouseDown"
          @wheel.prevent="onWheel"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @click="handleCanvasClick"
          :title="zoomScale > 1 ? 'Drag to move photo • Click to fit screen' : 'Click to zoom in'">
          
          <img 
            :src="store.previewProduct.image || '/assets/hero-banner.png'" 
            :alt="store.previewProduct.name"
            draggable="false"
            class="pointer-events-none drop-shadow-2xl rounded-2xl will-change-transform max-h-[52vh] max-w-full w-auto object-contain ring-1 ring-white/10"
            :class="isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'"
            :style="{
              transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`,
              transformOrigin: 'center center'
            }"
            onerror="this.src='/assets/hero-banner.png'"
          />

          <!-- Overlay Zoom Hint Pill -->
          <div 
            v-if="zoomScale <= 1"
            class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-surface-900/80 backdrop-blur-md text-gray-300 text-[10px] sm:text-xs flex items-center gap-1.5 border border-surface-700 pointer-events-none shadow-md">
            <i class="pi pi-search-plus text-brand-400"></i>
            <span>Click photo to zoom</span>
          </div>

          <!-- Helper Pill: Drag to move when zoomed -->
          <div 
            v-else
            class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface-900/90 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs flex items-center gap-1.5 border border-amber-500/30 pointer-events-none shadow-lg animate-fade-in whitespace-nowrap">
            <i class="pi pi-arrows-alt text-amber-400 text-xs"></i>
            <span>Drag to move • I-drag para igalaw</span>
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
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-2 transition-all cursor-pointer">
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
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Enlarged Menu Food & Drink Picture Lightbox Modal
export default {
  name: 'ProductImageModal',
  setup() {
    const store = useGShotStore();

    // Pan & Zoom controls for product photo viewer
    const zoomScale = Vue.ref(1);
    const panX = Vue.ref(0);
    const panY = Vue.ref(0);
    const isDragging = Vue.ref(false);
    const isZoomed = Vue.computed(() => zoomScale.value > 1.05);

    let dragStartX = 0;
    let dragStartY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let hasDragged = false;
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let lastTapTime = 0;

    const resetZoom = () => {
      zoomScale.value = 1;
      panX.value = 0;
      panY.value = 0;
      isDragging.value = false;
      hasDragged = false;
    };

    const zoomIn = () => {
      if (zoomScale.value < 1.1) {
        zoomScale.value = 2;
      } else {
        zoomScale.value = Number(Math.min(zoomScale.value + 0.5, 4).toFixed(2));
      }
    };

    const zoomOut = () => {
      const next = Math.max(zoomScale.value - 0.5, 1);
      zoomScale.value = Number(next.toFixed(2));
      if (zoomScale.value <= 1) {
        resetZoom();
      }
    };

    const toggleZoom = () => {
      if (zoomScale.value > 1.05) {
        resetZoom();
      } else {
        zoomScale.value = 2;
        panX.value = 0;
        panY.value = 0;
      }
    };

    const clampPan = (x, y) => {
      const maxPanX = Math.max(150, window.innerWidth * 0.8 * (zoomScale.value - 0.5));
      const maxPanY = Math.max(150, window.innerHeight * 0.8 * (zoomScale.value - 0.5));
      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y)),
      };
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return; // left click only
      isDragging.value = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX.value;
      panStartY = panY.value;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging.value) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }
      if (zoomScale.value > 1) {
        const clamped = clampPan(panStartX + dx, panStartY + dy);
        panX.value = clamped.x;
        panY.value = clamped.y;
      }
    };

    const onMouseUp = () => {
      isDragging.value = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onWheel = (e) => {
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      const newScale = Number(Math.min(Math.max(zoomScale.value + delta, 1), 4).toFixed(2));
      zoomScale.value = newScale;
      if (newScale <= 1) {
        panX.value = 0;
        panY.value = 0;
      } else {
        const clamped = clampPan(panX.value, panY.value);
        panX.value = clamped.x;
        panY.value = clamped.y;
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging.value = true;
        hasDragged = false;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        panStartX = panX.value;
        panStartY = panY.value;
      } else if (e.touches.length === 2) {
        isDragging.value = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
        pinchStartScale = zoomScale.value;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging.value) {
        const dx = e.touches[0].clientX - dragStartX;
        const dy = e.touches[0].clientY - dragStartY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasDragged = true;
        }
        if (zoomScale.value > 1) {
          if (e.cancelable) e.preventDefault();
          const clamped = clampPan(panStartX + dx, panStartY + dy);
          panX.value = clamped.x;
          panY.value = clamped.y;
        }
      } else if (e.touches.length === 2 && pinchStartDist > 0) {
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchStartDist;
        zoomScale.value = Number(Math.min(Math.max(pinchStartScale * ratio, 1), 4).toFixed(2));
        hasDragged = true;
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length === 0) {
        isDragging.value = false;
        pinchStartDist = 0;
        if (zoomScale.value <= 1) {
          panX.value = 0;
          panY.value = 0;
        }
        const now = Date.now();
        if (!hasDragged && now - lastTapTime < 300) {
          toggleZoom();
          lastTapTime = 0;
        } else {
          lastTapTime = now;
        }
      } else if (e.touches.length === 1) {
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        panStartX = panX.value;
        panStartY = panY.value;
        isDragging.value = true;
        pinchStartDist = 0;
      }
    };

    const handleCanvasClick = () => {
      if (hasDragged) {
        hasDragged = false;
        return;
      }
      toggleZoom();
    };

    const isCustomizable = Vue.computed(() => {
      if (!store.previewProduct) return false;
      const cat = store.previewProduct.category;
      return cat === 'Drinks' || cat === 'Coffee';
    });

    const close = () => {
      resetZoom();
      store.closeProductPreview();
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    });

    Vue.watch(() => store.previewProduct, () => {
      resetZoom();
    });

    return {
      store,
      isZoomed,
      zoomScale,
      panX,
      panY,
      isDragging,
      zoomIn,
      zoomOut,
      resetZoom,
      toggleZoom,
      onMouseDown,
      onWheel,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      handleCanvasClick,
      isCustomizable,
      close,
      handleAction,
    };
  },
};
</script>
