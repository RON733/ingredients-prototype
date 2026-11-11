<template>
<div 
      v-if="store.bookingModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click.self="store.bookingModalOpen = false">
           <div class="relative w-full max-w-xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <div class="p-4 sm:p-6 bg-surface-850 border-b border-surface-700 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
              🎉
            </div>
            <div>
              <h3 class="text-base sm:text-xl font-black text-white">Book Catering or Mobile Bar</h3>
              <p class="text-[11px] sm:text-xs text-gray-400">Make your birthday, corporate gathering, or wedding unforgettable</p>
            </div>
          </div>

          <button 
            @click="store.bookingModalOpen = false"
            class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center shrink-0">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitBooking" class="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <!-- Package Quick Select Banner -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 rounded-2xl bg-surface-950/70 border border-surface-800">
            <div 
              @click="selectPackage('Coffee Package')" 
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group hover:border-amber-500/50"
              :class="isCoffeePackage ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white'">
              <div class="flex items-center gap-2.5 min-w-0">
                <div 
                  @click.stop="openEnlargedImage('Coffee Package', '/assets/booking-coffee-package.jpg', '₱3,500 / 50 pax')"
                  class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-surface-900 border border-surface-700 group/thumb cursor-zoom-in shadow-inner"
                  title="Click to enlarge Coffee Package flyer">
                  <img src="/assets/booking-coffee-package.jpg" alt="Coffee Package" class="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-115" />
                  <div class="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-amber-300">
                    <i class="pi pi-search-plus text-xs"></i>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="font-black text-[11px] truncate" :class="isCoffeePackage ? 'text-amber-400' : 'text-gray-300'">Coffee Package</p>
                  <p class="text-[10px] text-gray-400">₱3,500 / 50 pax</p>
                </div>
              </div>

              <button
                type="button"
                @click.stop="openEnlargedImage('Coffee Package', '/assets/booking-coffee-package.jpg', '₱3,500 / 50 pax')"
                class="px-2 py-1 rounded-lg bg-surface-800/90 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-surface-700/80 text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                title="View full flyer">
                <i class="pi pi-search-plus text-[9px]"></i>
                <span class="hidden sm:inline">Enlarge</span>
              </button>
            </div>

            <div 
              @click="selectPackage('Fruity Float Package')" 
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group hover:border-rose-500/50"
              :class="isFruityPackage ? 'bg-rose-500/15 border-rose-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white'">
              <div class="flex items-center gap-2.5 min-w-0">
                <div 
                  @click.stop="openEnlargedImage('Fruity Float Package', '/assets/booking-fruity-float.jpg', '₱3,500 / 50 pax')"
                  class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-surface-900 border border-surface-700 group/thumb cursor-zoom-in shadow-inner"
                  title="Click to enlarge Fruity Float flyer">
                  <img src="/assets/booking-fruity-float.jpg" alt="Fruity Float" class="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-115" />
                  <div class="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-rose-300">
                    <i class="pi pi-search-plus text-xs"></i>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="font-black text-[11px] truncate" :class="isFruityPackage ? 'text-rose-400' : 'text-gray-300'">Fruity Float</p>
                  <p class="text-[10px] text-gray-400">₱3,500 / 50 pax</p>
                </div>
              </div>

              <button
                type="button"
                @click.stop="openEnlargedImage('Fruity Float Package', '/assets/booking-fruity-float.jpg', '₱3,500 / 50 pax')"
                class="px-2 py-1 rounded-lg bg-surface-800/90 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-surface-700/80 text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                title="View full flyer">
                <i class="pi pi-search-plus text-[9px]"></i>
                <span class="hidden sm:inline">Enlarge</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Client / Contact Name
              </label>
              <input 
                v-model="form.client_name"
                type="text" 
                maxlength="80"
                required
                placeholder="Your full name" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block font-bold text-gray-400 uppercase tracking-wider">
                  Contact Phone
                </label>
                <span class="text-[10px] font-mono" :class="form.client_phone.length === 11 ? 'text-emerald-400 font-bold' : 'text-gray-500'">
                  {{ form.client_phone.length }}/11
                </span>
              </div>
              <input 
                :value="form.client_phone"
                @input="onPhoneInput"
                type="tel" 
                inputmode="numeric"
                maxlength="11"
                pattern="09[0-9]{9}"
                required
                placeholder="09XXXXXXXXX" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Selected Event / Package
              </label>
              <select 
                v-model="form.event_type"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white focus:outline-none focus:border-brand-500 cursor-pointer">
                <option value="Coffee Package (₱3,500 / 50 pax)">Coffee Package (₱3,500 • 50 cups 12oz • 5 choices • 3 hrs)</option>
                <option value="Fruity Float Package (₱3,500 / 50 pax)">Fruity Float Package (₱3,500 • 50 cups 16oz • 7 choices • 3 hrs)</option>
                <option value="Mobile Bar & Milktea Booth">Custom Mobile Bar & Milktea Booth</option>
                <option value="Comfort Food Catering">Comfort Food Catering (Burgers & Pizza)</option>
                <option value="Bulk Order Delivery">Bulk Party Pack Delivery</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block font-bold text-gray-400 uppercase tracking-wider">
                  Estimated Guest Count
                </label>
                <span class="text-[10px] font-mono text-gray-500">
                  10–500 pax
                </span>
              </div>
              <input 
                :value="form.guest_count"
                @keydown="onGuestCountKeydown"
                @input="onGuestCountInput"
                @blur="onGuestCountBlur"
                type="number" 
                inputmode="numeric"
                min="10" 
                max="500" 
                step="1"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 tabular-nums"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input 
                v-model="form.event_date"
                type="date" 
                :min="minEventDate"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Time
              </label>
              <input 
                v-model="form.event_time"
                type="text" 
                maxlength="60"
                placeholder="e.g. 2:00 PM – 5:00 PM (3 Hours)" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Event Venue / Location
            </label>
            <input 
              v-model="form.location"
              type="text" 
              maxlength="200"
              required
              placeholder="e.g. Clubhouse / Residence, Santa Rosa, Laguna" 
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-gray-400 uppercase tracking-wider">
                Special Requests or Drink Preferences
              </label>
              <span class="text-[10px] font-mono text-gray-500">
                {{ (form.notes || '').length }}/500
              </span>
            </div>
            <textarea 
              v-model="form.notes"
              rows="2" 
              maxlength="500"
              placeholder="Tell us about preferred flavors, setup requirements, or venue electrical outlets..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <!-- Estimated Cost Calculation -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-surface-800/80 border border-surface-700 space-y-2 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div class="min-w-0">
                <p class="text-[10px] sm:text-[11px] text-gray-400 uppercase font-bold">Estimated Base Price</p>
                <p class="text-base sm:text-lg font-black text-amber-400 break-words tabular-nums">₱{{ estimatedCost.toLocaleString() }}.00</p>
              </div>
              <div class="sm:text-right">
                <span class="text-[10px] text-gray-400 block">Transportation fee varies by location</span>
                <span class="text-[10px] sm:text-[11px] font-bold text-white">Direct: Jefferson Alulod (0994 612 1933)</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-surface-700/60 pt-2">
              <p class="text-[10px] text-gray-400 leading-relaxed flex-1">
                {{ packageDetailsText }}
              </p>
              <button
                v-if="isCoffeePackage || isFruityPackage"
                type="button"
                @click="openEnlargedImage(isCoffeePackage ? 'Coffee Package' : 'Fruity Float Package', isCoffeePackage ? '/assets/booking-coffee-package.jpg' : '/assets/booking-fruity-float.jpg', '₱3,500 / 50 pax')"
                class="px-2.5 py-1 rounded-lg bg-surface-700/80 hover:bg-surface-700 text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-surface-600/60 shrink-0 self-start sm:self-auto">
                <i class="pi pi-search-plus text-[10px]"></i>
                <span>Enlarge Flyer</span>
              </button>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button 
              type="button"
              @click="store.bookingModalOpen = false"
              class="px-4 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white transition-colors text-center">
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-5 py-2.5 rounded-xl font-bold bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>Submit Booking Request</span>
            </button>
          </div>

        </form>

      </div>

      <!-- Enlarged Package Flyer Lightbox Modal -->
      <div 
        v-if="enlargedPreview"
        class="fixed inset-0 z-[60] overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
        @click.self="closeEnlargedImage"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="'Enlarged view of ' + enlargedPreview.title">
        
        <div class="relative w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          
          <!-- Top Bar -->
          <div class="px-4 sm:px-6 py-3.5 bg-surface-850 border-b border-surface-700 flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                🔍
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-black text-white truncate">{{ enlargedPreview.title }}</h3>
                <p class="text-[11px] text-amber-400 font-bold">{{ enlargedPreview.price }} • Package Flyer & Inclusions</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <!-- Zoom Out (-) -->
              <button 
                type="button"
                @click="zoomOut"
                :disabled="zoomScale <= 1"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Zoom Out">
                <i class="pi pi-minus text-amber-400 text-xs"></i>
              </button>

              <!-- Zoom Level Pill / Toggle -->
              <button 
                type="button"
                @click="toggleZoom"
                class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                :title="zoomScale > 1 ? 'Fit to Screen' : 'Zoom in to read details'">
                <i class="pi" :class="zoomScale > 1 ? 'pi-search-minus text-amber-400' : 'pi-search-plus text-amber-400'"></i>
                <span class="text-[11px] font-bold">{{ zoomScale > 1 ? `${Math.round(zoomScale * 100)}%` : 'Zoom In' }}</span>
              </button>

              <!-- Zoom In (+) -->
              <button 
                type="button"
                @click="zoomIn"
                :disabled="zoomScale >= 4"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Zoom In">
                <i class="pi pi-plus text-amber-400 text-xs"></i>
              </button>

              <!-- Reset button if zoomed -->
              <button 
                v-if="zoomScale > 1"
                type="button"
                @click="resetZoom"
                class="hidden sm:inline-flex px-2 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-400 text-[11px] font-bold transition-colors cursor-pointer"
                title="Reset View">
                Reset
              </button>

              <button 
                type="button"
                @click="closeEnlargedImage"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-800 hover:bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Close (Esc)">
                ✕
              </button>
            </div>
          </div>

          <!-- Interactive Drag & Pan Canvas -->
          <div 
            class="relative bg-surface-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none min-h-[300px] max-h-[70vh] touch-none"
            :class="zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
            @mousedown="onMouseDown"
            @wheel.prevent="onWheel"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @click="handleCanvasClick"
            :title="zoomScale > 1 ? 'Drag to move photo • Click to fit screen' : 'Click to zoom in'">
            <img 
              :src="enlargedPreview.url" 
              :alt="enlargedPreview.title" 
              draggable="false"
              class="pointer-events-none drop-shadow-2xl rounded-2xl will-change-transform max-h-[64vh] max-w-full w-auto object-contain ring-1 ring-white/10"
              :class="isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'"
              :style="{
                transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`,
                transformOrigin: 'center center'
              }"
            />

            <!-- Helper Pill: Click to zoom when 1x -->
            <div 
              v-if="zoomScale <= 1"
              class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-surface-900/85 backdrop-blur-md text-gray-300 text-[10px] sm:text-xs flex items-center gap-1.5 border border-surface-700 pointer-events-none shadow-md">
              <i class="pi pi-search-plus text-amber-400"></i>
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

          <!-- Footer Bar -->
          <div class="px-4 sm:px-6 py-3 bg-surface-850 border-t border-surface-700 flex items-center justify-between gap-3 shrink-0">
            <span class="text-[11px] text-gray-400 hidden sm:inline">Press Esc or click outside to close</span>
            <div class="flex items-center gap-2 ml-auto">
              <button 
                type="button"
                @click="closeEnlargedImage"
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer">
                Close
              </button>
              <button 
                type="button"
                @click="selectPackage(enlargedPreview.title); closeEnlargedImage()"
                class="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition-all shadow-md cursor-pointer">
                Select This Package
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

// G Shot Teas — Event Booking Modal (Catering & Mobile Bar Reservations)
export default {
  name: 'EventBookingModal',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const enlargedPreview = Vue.ref(null);

    // Pan & Zoom controls for flyer viewer
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

    const openEnlargedImage = (title, url, price) => {
      enlargedPreview.value = { title, url, price };
      resetZoom();
    };

    const closeEnlargedImage = () => {
      enlargedPreview.value = null;
      resetZoom();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (enlargedPreview.value) {
          closeEnlargedImage();
        } else if (store.bookingModalOpen) {
          store.bookingModalOpen = false;
        }
      }
    };

    Vue.onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
    });

    Vue.onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    });

    const MIN_GUESTS = 10;
    const MAX_GUESTS = 500;

    const sanitizePhone = (raw) => {
      let digits = String(raw || '').replace(/\D/g, '');
      if (digits.startsWith('63') && digits.length === 12) {
        digits = '0' + digits.slice(2);
      }
      return digits.slice(0, 11);
    };

    const minEventDate = Vue.computed(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    const form = Vue.reactive({
      client_name: (store.user?.name || '').slice(0, 80),
      client_phone: sanitizePhone(store.user?.phone),
      client_email: store.user?.email || '',
      event_type: 'Coffee Package (₱3,500 / 50 pax)',
      event_date: '',
      event_time: '2:00 PM – 5:00 PM (3 Hours)',
      guest_count: 50,
      location: '',
      notes: '',
    });

    const onPhoneInput = (e) => {
      const clean = sanitizePhone(e.target.value);
      form.client_phone = clean;
      e.target.value = clean;
    };

    const onGuestCountKeydown = (e) => {
      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
        e.preventDefault();
      }
    };

    const onGuestCountInput = (e) => {
      const digits = String(e.target.value || '').replace(/\D/g, '');
      if (!digits) {
        form.guest_count = '';
        e.target.value = '';
        return;
      }
      let count = parseInt(digits, 10);
      if (!Number.isFinite(count)) {
        count = MIN_GUESTS;
      } else if (count > MAX_GUESTS) {
        count = MAX_GUESTS;
      }
      form.guest_count = count;
      e.target.value = String(count);
    };

    const onGuestCountBlur = () => {
      const count = parseInt(form.guest_count, 10);
      if (!Number.isFinite(count) || count < MIN_GUESTS) {
        form.guest_count = MIN_GUESTS;
      } else if (count > MAX_GUESTS) {
        form.guest_count = MAX_GUESTS;
      } else {
        form.guest_count = count;
      }
    };

    const isCoffeePackage = Vue.computed(() => form.event_type.includes('Coffee'));
    const isFruityPackage = Vue.computed(() => form.event_type.includes('Fruity Float'));

    const selectPackage = (pkg) => {
      if (pkg === 'Coffee Package') {
        form.event_type = 'Coffee Package (₱3,500 / 50 pax)';
        form.guest_count = 50;
      } else if (pkg === 'Fruity Float Package') {
        form.event_type = 'Fruity Float Package (₱3,500 / 50 pax)';
        form.guest_count = 50;
      }
    };

    Vue.watch(() => store.bookingModalOpen, (isOpen) => {
      if (isOpen && store.selectedBookingPackage) {
        if (store.selectedBookingPackage.includes('Coffee')) {
          form.event_type = 'Coffee Package (₱3,500 / 50 pax)';
          form.guest_count = 50;
        } else if (store.selectedBookingPackage.includes('Fruity')) {
          form.event_type = 'Fruity Float Package (₱3,500 / 50 pax)';
          form.guest_count = 50;
        } else {
          form.event_type = 'Mobile Bar & Milktea Booth';
        }
      }
    });

    const clampedGuestCount = Vue.computed(() => {
      const parsed = Number(form.guest_count);
      if (!Number.isFinite(parsed)) return 50;
      return Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Math.trunc(parsed)));
    });

    const estimatedCost = Vue.computed(() => {
      const guests = clampedGuestCount.value;
      if (isCoffeePackage.value || isFruityPackage.value) {
        const units = Math.max(1, Math.ceil(guests / 50));
        return units * 3500;
      }
      return guests * 95;
    });

    const packageDetailsText = Vue.computed(() => {
      if (isCoffeePackage.value) {
        return 'Includes: 50 cups of 12oz, 3 hours of on-site service, 5 choices of drinks (Coldbrew & specialty blends), and trained barista staff.';
      }
      if (isFruityPackage.value) {
        return 'Includes: 50 cups of 16oz, 3 hours of on-site service, 7 choices of drinks (Sparkling sodas & ice cream fruity floats), and trained barista staff.';
      }
      return 'Includes custom milk tea & snack booth setup, drink cups, straws, pearls, and on-site staff. Transpo fee varies by location.';
    });

    const submitBooking = async () => {
      const cleanName = form.client_name.trim().slice(0, 80);
      if (!cleanName) {
        store.notify('Please enter your full name.', 'warning');
        return;
      }
      if (!/^09\d{9}$/.test(form.client_phone)) {
        store.notify('Please enter a valid 11-digit mobile number starting with 09.', 'warning');
        return;
      }
      const guests = parseInt(form.guest_count, 10);
      if (!Number.isFinite(guests) || guests < MIN_GUESTS || guests > MAX_GUESTS) {
        store.notify(`Estimated guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}.`, 'warning');
        onGuestCountBlur();
        return;
      }
      if (!form.event_date || form.event_date < minEventDate.value) {
        store.notify('Please select a valid target date (today or later).', 'warning');
        return;
      }
      const cleanLocation = form.location.trim().slice(0, 200);
      if (!cleanLocation) {
        store.notify('Please enter the event venue or location.', 'warning');
        return;
      }

      loading.value = true;
      try {
        await GST_API.createBooking({
          ...form,
          client_name: cleanName,
          guest_count: guests,
          event_time: (form.event_time || '').trim().slice(0, 60),
          location: cleanLocation,
          notes: (form.notes || '').trim().slice(0, 500),
          package_name: form.event_type,
          estimated_cost: estimatedCost.value,
        });

        store.notify('Booking submitted! Our team will contact you to coordinate dates.', 'success');
        store.bookingModalOpen = false;
        store.selectedBookingPackage = null;
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to submit event booking.', 'error');
      } finally {
        loading.value = false;
      }
    };

    return {
      store,
      form,
      loading,
      enlargedPreview,
      minEventDate,
      onPhoneInput,
      onGuestCountKeydown,
      onGuestCountInput,
      onGuestCountBlur,
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
      openEnlargedImage,
      closeEnlargedImage,
      isCoffeePackage,
      isFruityPackage,
      selectPackage,
      estimatedCost,
      packageDetailsText,
      submitBooking,
    };
  },
};
</script>
