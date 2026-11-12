<template>
<div 
      v-if="store.bookingModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in"
      @click.self="store.bookingModalOpen = false">
           <div class="relative w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh] transition-all duration-300">
        
        <!-- Header -->
        <div class="p-4 sm:p-6 bg-surface-850 border-b border-surface-700 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
              <i class="pi pi-calendar-plus"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-xl font-black text-white">Book Catering or Mobile Bar</h3>
              <p class="text-[11px] sm:text-xs text-gray-400">Make your birthday, corporate gathering, or wedding unforgettable</p>
            </div>
          </div>

          <button 
            @click="store.bookingModalOpen = false"
            class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center shrink-0">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>

        <!-- Modal Mode Switcher: Book Event vs My Bookings History -->
        <div class="px-4 sm:px-6 pt-3 pb-2 bg-surface-900 border-b border-surface-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="store.bookingModalTab = 'form'"
            class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="store.bookingModalTab === 'form'
              ? 'bg-yellow-400 text-black font-black shadow-md shadow-yellow-400/20'
              : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <i class="pi pi-calendar-plus text-xs"></i>
            <span>Book Event</span>
          </button>

          <button
            type="button"
            @click="switchToHistoryTab"
            class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="store.bookingModalTab === 'history'
              ? 'bg-yellow-400 text-black font-black shadow-md shadow-yellow-400/20'
              : 'bg-surface-800/80 text-gray-300 hover:text-white border border-surface-700/60'">
            <i class="pi pi-history text-xs"></i>
            <span>My Bookings</span>
            <span
              v-if="store.bookingsList.length > 0"
              class="text-[10px] px-1.5 py-0.2 rounded-full font-black"
              :class="store.bookingModalTab === 'history' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'">
              {{ store.bookingsList.length }}
            </span>
            <span
              v-if="hasApprovedBooking"
              class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              title="You have an approved booking">
            </span>
          </button>
        </div>

        <!-- Form Body -->
        <form v-if="store.bookingModalTab === 'form'" @submit.prevent="submitBooking" class="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <!-- Package Quick Select Carousel -->
          <div
            v-if="bannerPackages.length > 0"
            class="p-3 sm:p-3.5 rounded-2xl bg-surface-950/75 border border-surface-800 space-y-2.5">
            <!-- Carousel Header & Controls -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Available Packages
                </span>
                <span class="px-1.5 py-0.5 rounded-md bg-surface-800 border border-surface-700 text-[10px] font-bold text-amber-400 tabular-nums">
                  {{ bannerPackages.length }}
                </span>
              </div>

              <div v-if="showBannerControls" class="flex items-center gap-1.5 shrink-0">
                <span class="text-[10px] font-mono text-gray-500 mr-1 tabular-nums">
                  {{ bannerCarouselIndex + 1 }}/{{ bannerTotalStops }}
                </span>
                <button
                  type="button"
                  @click="prevBannerSlide"
                  aria-label="Previous package"
                  class="w-7 h-7 rounded-full bg-surface-800 hover:bg-yellow-400 text-gray-300 hover:text-black border border-surface-700 hover:border-yellow-400 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer">
                  <i class="pi pi-chevron-left text-[10px]"></i>
                </button>
                <button
                  type="button"
                  @click="nextBannerSlide"
                  aria-label="Next package"
                  class="w-7 h-7 rounded-full bg-surface-800 hover:bg-yellow-400 text-gray-300 hover:text-black border border-surface-700 hover:border-yellow-400 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer">
                  <i class="pi pi-chevron-right text-[10px]"></i>
                </button>
              </div>
            </div>

            <!-- Sliding Track -->
            <div
              class="overflow-hidden"
              @touchstart.passive="onBannerTouchStart"
              @touchend.passive="onBannerTouchEnd">
              <div
                class="flex transition-transform duration-300 ease-out"
                :class="bannerPackages.length >= 2 ? 'sm:-mx-1.5' : ''"
                :style="bannerTrackStyle">
                <div
                  v-for="pkg in bannerPackages"
                  :key="pkg.id"
                  class="shrink-0"
                  :class="bannerPackages.length >= 2 ? 'w-full sm:w-1/2 sm:px-1.5' : 'w-full'">
                  <div
                    @click="selectPackage(pkg)"
                    class="h-full p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 group hover:-translate-y-0.5 active:scale-[0.98]"
                    :class="[
                      getAccentCardClass(pkg.accent_color, selectedPackageId === pkg.id),
                      selectedPackageId === pkg.id ? 'shadow-lg shadow-amber-500/10' : ''
                    ]">
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        v-if="pkg.image_url"
                        @click.stop="openEnlargedImage(pkg.name, pkg.image_url, formatPriceTag(pkg), pkg)"
                        class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-900 border border-surface-700 group/thumb cursor-zoom-in shadow-inner"
                        :title="`Click to enlarge ${pkg.name} flyer`">
                        <img :src="pkg.image_url" :alt="pkg.name" class="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
                        <div class="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-200 text-amber-300">
                          <i class="pi pi-search-plus text-xs"></i>
                        </div>
                      </div>
                      <div
                        v-else
                        class="w-12 h-12 rounded-xl shrink-0 bg-surface-900 border border-surface-700 text-amber-400 flex items-center justify-center text-base">
                        <i class="pi pi-calendar"></i>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-black text-xs leading-snug line-clamp-2" :class="selectedPackageId === pkg.id ? getAccentTitleClass(pkg.accent_color) : 'text-gray-200'">
                          {{ pkg.name }}
                        </p>
                        <p class="text-[11px] text-gray-400 truncate mt-0.5">{{ formatPriceTag(pkg) }}</p>
                      </div>
                    </div>

                    <button
                      v-if="pkg.image_url"
                      type="button"
                      @click.stop="openEnlargedImage(pkg.name, pkg.image_url, formatPriceTag(pkg), pkg)"
                      class="px-2.5 py-1.5 rounded-lg bg-surface-800/90 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-surface-700/80 text-[10px] font-bold flex items-center gap-1 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                      title="View full flyer">
                      <i class="pi pi-search-plus text-[10px]"></i>
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination Dots -->
            <div v-if="bannerTotalStops > 1" class="flex items-center justify-center gap-1.5 pt-0.5">
              <button
                v-for="stopIdx in bannerTotalStops"
                :key="stopIdx"
                type="button"
                @click="bannerCarouselIndex = stopIdx - 1"
                :aria-label="`Go to package slide ${stopIdx}`"
                class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                :class="bannerCarouselIndex === stopIdx - 1 ? 'w-5 bg-yellow-400' : 'w-1.5 bg-surface-700 hover:bg-surface-500'">
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
                v-model="selectedPackageId"
                @change="onPackageDropdownChange"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white focus:outline-none focus:border-brand-500 cursor-pointer">
                <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id">
                  {{ formatOptionLabel(pkg) }}
                </option>
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
                v-if="selectedPackage?.image_url"
                type="button"
                @click="openEnlargedImage(selectedPackage.name, selectedPackage.image_url, formatPriceTag(selectedPackage), selectedPackage)"
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

        <!-- Booking History & Approval Status Body -->
        <div v-else class="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <!-- Post-Submit Confirmation Callout -->
          <div
            v-if="justSubmitted"
            class="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 flex items-start gap-3 animate-fade-in">
            <i class="pi pi-check-circle text-emerald-400 text-base mt-0.5 shrink-0"></i>
            <div class="space-y-1">
              <p class="font-black text-xs sm:text-sm text-white">Event Booking Request Submitted!</p>
              <p class="text-[11px] text-emerald-200/90 leading-relaxed">
                Your booking is now listed in your history below. Once an Admin or Staff member reviews and approves it, the status will update to <strong class="text-emerald-300">Approved</strong>.
              </p>
            </div>
          </div>

          <BookingHistoryList
            :compact="true"
            :highlightId="store.lastSubmittedBookingId"
            @book-new="startNewBooking" />

          <!-- Modal History Footer Actions -->
          <div class="pt-3 border-t border-surface-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              @click="openFullHistoryPage"
              class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <i class="pi pi-external-link text-[11px] text-amber-400"></i>
              <span>Open Full Bookings Page</span>
            </button>

            <div class="flex items-center gap-2 justify-end">
              <button
                type="button"
                @click="startNewBooking"
                class="px-3.5 py-2 rounded-xl bg-yellow-400/15 hover:bg-yellow-400 text-yellow-300 hover:text-black border border-yellow-400/40 text-xs font-bold transition-all cursor-pointer">
                + Book Another
              </button>
              <button
                type="button"
                @click="store.bookingModalOpen = false"
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white text-xs font-bold transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>

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
                <i class="pi pi-search-plus"></i>
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
                <i class="pi pi-times text-xs"></i>
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
                @click="selectPackage(enlargedPreview.pkg || enlargedPreview.title); closeEnlargedImage()"
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

    const openEnlargedImage = (title, url, price, pkg = null) => {
      enlargedPreview.value = { title, url, price, pkg };
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

    const isDesktopBanner = Vue.ref(typeof window !== 'undefined' ? window.innerWidth >= 640 : true);
    const updateBannerViewport = () => {
      isDesktopBanner.value = window.innerWidth >= 640;
    };

    Vue.onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updateBannerViewport);
    });

    Vue.onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateBannerViewport);
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

    const availablePackages = Vue.computed(() => {
      const list = store.activeBookingPackages || [];
      return list.length > 0 ? list : (store.bookingPackages || []);
    });

    const bannerPackages = Vue.computed(() => {
      const list = availablePackages.value;
      const featured = list.filter(p => p.show_in_banner || Boolean(p.image_url));
      return featured.length > 0 ? featured : list;
    });

    const bannerCarouselIndex = Vue.ref(0);
    const bannerTouchStartX = Vue.ref(0);
    const bannerCardsPerView = Vue.computed(() =>
      isDesktopBanner.value && bannerPackages.value.length >= 2 ? 2 : 1
    );
    const maxBannerIndex = Vue.computed(() =>
      Math.max(0, bannerPackages.value.length - bannerCardsPerView.value)
    );
    const showBannerControls = Vue.computed(() => maxBannerIndex.value > 0);
    const bannerTotalStops = Vue.computed(() => maxBannerIndex.value + 1);
    const bannerTrackStyle = Vue.computed(() => ({
      transform: `translateX(-${bannerCarouselIndex.value * (100 / bannerCardsPerView.value)}%)`,
    }));

    Vue.watch([bannerPackages, maxBannerIndex], () => {
      if (bannerCarouselIndex.value > maxBannerIndex.value) {
        bannerCarouselIndex.value = maxBannerIndex.value;
      }
    });

    const prevBannerSlide = () => {
      if (maxBannerIndex.value <= 0) return;
      bannerCarouselIndex.value = bannerCarouselIndex.value <= 0
        ? maxBannerIndex.value
        : bannerCarouselIndex.value - 1;
    };

    const nextBannerSlide = () => {
      if (maxBannerIndex.value <= 0) return;
      bannerCarouselIndex.value = bannerCarouselIndex.value >= maxBannerIndex.value
        ? 0
        : bannerCarouselIndex.value + 1;
    };

    const onBannerTouchStart = (e) => {
      bannerTouchStartX.value = e.touches?.[0]?.clientX ?? 0;
    };

    const onBannerTouchEnd = (e) => {
      const endX = e.changedTouches?.[0]?.clientX ?? 0;
      const diff = bannerTouchStartX.value - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextBannerSlide();
        else prevBannerSlide();
      }
    };

    const ensurePackageVisible = (pkgId) => {
      const idx = bannerPackages.value.findIndex(p => p.id === pkgId);
      if (idx === -1) return;
      if (idx < bannerCarouselIndex.value) {
        bannerCarouselIndex.value = idx;
      } else if (idx >= bannerCarouselIndex.value + bannerCardsPerView.value) {
        bannerCarouselIndex.value = Math.min(
          maxBannerIndex.value,
          idx - bannerCardsPerView.value + 1
        );
      }
    };

    const selectedPackageId = Vue.ref(availablePackages.value[0]?.id ?? null);

    const selectedPackage = Vue.computed(() => {
      const list = availablePackages.value;
      return list.find(p => p.id === selectedPackageId.value) || list[0] || null;
    });

    const formatPriceTag = (pkg) => {
      if (!pkg) return '₱0';
      const price = Number(pkg.price || 0).toLocaleString();
      if (pkg.pricing_type === 'per_guest') return `₱${price} / pax`;
      if (pkg.pricing_type === 'flat') return `₱${price} flat`;
      return `₱${price} / ${pkg.base_pax || 50} pax`;
    };

    const formatOptionLabel = (pkg) => {
      if (!pkg) return '';
      if (pkg.option_label && String(pkg.option_label).trim() !== '') {
        return pkg.option_label;
      }
      return `${pkg.name} (${formatPriceTag(pkg)})`;
    };

    const formatEventType = (pkg) => {
      if (!pkg) return 'Event Package';
      if (pkg.pricing_type === 'per_guest') {
        return `${pkg.name} (₱${Number(pkg.price || 0).toLocaleString()} / pax)`;
      }
      return `${pkg.name} (${formatPriceTag(pkg)})`;
    };

    const getAccentCardClass = (color, isSelected) => {
      const map = {
        amber: isSelected ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white hover:border-amber-500/50',
        rose: isSelected ? 'bg-rose-500/15 border-rose-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white hover:border-rose-500/50',
        emerald: isSelected ? 'bg-emerald-500/15 border-emerald-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white hover:border-emerald-500/50',
        sky: isSelected ? 'bg-sky-500/15 border-sky-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white hover:border-sky-500/50',
        purple: isSelected ? 'bg-purple-500/15 border-purple-500 text-white' : 'bg-surface-800/60 border-surface-700/60 text-gray-400 hover:text-white hover:border-purple-500/50',
      };
      return map[color] || map.amber;
    };

    const getAccentTitleClass = (color) => {
      const map = {
        amber: 'text-amber-400',
        rose: 'text-rose-400',
        emerald: 'text-emerald-400',
        sky: 'text-sky-400',
        purple: 'text-purple-400',
      };
      return map[color] || 'text-amber-400';
    };

    const form = Vue.reactive({
      client_name: (store.user?.name || '').slice(0, 80),
      client_phone: sanitizePhone(store.user?.phone),
      client_email: store.user?.email || '',
      event_type: formatEventType(selectedPackage.value),
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

    const resolvePackage = (pkgOrName) => {
      const list = availablePackages.value;
      if (!pkgOrName) return list[0] || null;
      if (typeof pkgOrName === 'object') {
        return list.find(p => p.id === pkgOrName.id || p.slug === pkgOrName.slug) || pkgOrName;
      }
      const query = String(pkgOrName).toLowerCase();
      return (
        list.find(p => String(p.name || '').toLowerCase() === query) ||
        list.find(p => String(p.slug || '').toLowerCase() === query) ||
        list.find(p => query.includes(String(p.name || '').toLowerCase())) ||
        list.find(p => String(p.name || '').toLowerCase().includes(query)) ||
        list[0] ||
        null
      );
    };

    const selectPackage = (pkgOrName, adjustGuests = true) => {
      const resolved = resolvePackage(pkgOrName);
      if (!resolved) return;
      selectedPackageId.value = resolved.id;
      ensurePackageVisible(resolved.id);
      form.event_type = formatEventType(resolved);
      if (adjustGuests && resolved.pricing_type === 'per_pack' && resolved.base_pax) {
        form.guest_count = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Number(resolved.base_pax)));
      }
    };

    const onPackageDropdownChange = () => {
      if (selectedPackage.value) {
        form.event_type = formatEventType(selectedPackage.value);
        ensurePackageVisible(selectedPackage.value.id);
      }
    };

    Vue.watch(availablePackages, (list) => {
      if (!list || list.length === 0) return;
      if (!list.some(p => p.id === selectedPackageId.value)) {
        selectPackage(list[0], false);
      } else if (selectedPackage.value) {
        form.event_type = formatEventType(selectedPackage.value);
      }
    });

    const justSubmitted = Vue.ref(false);
    const hasApprovedBooking = Vue.computed(() =>
      (store.bookingsList || []).some(b => b.status === 'Approved')
    );

    const switchToHistoryTab = () => {
      store.bookingModalTab = 'history';
      store.fetchMyBookings();
    };

    const startNewBooking = () => {
      justSubmitted.value = false;
      store.bookingModalTab = 'form';
    };

    const openFullHistoryPage = () => {
      store.bookingModalOpen = false;
      store.currentView = 'bookings';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    Vue.watch(() => store.bookingModalOpen, async (isOpen) => {
      if (isOpen) {
        justSubmitted.value = false;
        if (!form.client_name && store.user?.name) {
          form.client_name = String(store.user.name).slice(0, 80);
        }
        if (!form.client_phone && store.user?.phone) {
          form.client_phone = sanitizePhone(store.user.phone);
        }
        if (!form.client_email && store.user?.email) {
          form.client_email = store.user.email;
        }
        store.fetchMyBookings();
        await store.fetchBookingPackages(false);
        if (store.selectedBookingPackage) {
          store.bookingModalTab = 'form';
          selectPackage(store.selectedBookingPackage, true);
        } else if (selectedPackage.value) {
          form.event_type = formatEventType(selectedPackage.value);
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
      const pkg = selectedPackage.value;
      if (!pkg) return guests * 95;
      const price = Math.max(0, Number(pkg.price || 0));
      if (pkg.pricing_type === 'flat') {
        return Math.round(price);
      }
      if (pkg.pricing_type === 'per_guest') {
        return Math.round(guests * price);
      }
      const packSize = Math.max(1, Number(pkg.base_pax || 50));
      const units = Math.max(1, Math.ceil(guests / packSize));
      return Math.round(units * price);
    });

    const packageDetailsText = Vue.computed(() => {
      const pkg = selectedPackage.value;
      if (pkg?.description && String(pkg.description).trim() !== '') {
        return pkg.description;
      }
      return 'Includes custom mobile bar & catering setup, cups, straws, and on-site staff. Transpo fee varies by location.';
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
        const pkg = selectedPackage.value;
        const res = await GST_API.createBooking({
          ...form,
          event_type: pkg ? formatEventType(pkg) : form.event_type,
          booking_package_id: pkg?.id || undefined,
          user_id: store.user?.id || undefined,
          client_name: cleanName,
          guest_count: guests,
          event_time: (form.event_time || '').trim().slice(0, 60),
          location: cleanLocation,
          notes: (form.notes || '').trim().slice(0, 500),
          package_name: pkg?.name || form.event_type,
          estimated_cost: estimatedCost.value,
        });

        const createdBooking = res.data?.booking;
        if (createdBooking?.id) {
          store.saveLocalBookingId(createdBooking.id);
          store.lastSubmittedBookingId = createdBooking.id;
          const existingIdx = store.bookingsList.findIndex(b => b.id === createdBooking.id);
          if (existingIdx === -1) {
            store.bookingsList.unshift(createdBooking);
          }
        }
        await store.fetchMyBookings();

        store.notify('Booking submitted! Track approval status under My Bookings.', 'success');
        store.selectedBookingPackage = null;
        form.event_date = '';
        form.location = '';
        form.notes = '';
        justSubmitted.value = true;
        store.bookingModalTab = 'history';
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
      availablePackages,
      bannerPackages,
      bannerCarouselIndex,
      showBannerControls,
      bannerTotalStops,
      bannerTrackStyle,
      prevBannerSlide,
      nextBannerSlide,
      onBannerTouchStart,
      onBannerTouchEnd,
      selectedPackageId,
      selectedPackage,
      formatPriceTag,
      formatOptionLabel,
      getAccentCardClass,
      getAccentTitleClass,
      onPackageDropdownChange,
      selectPackage,
      justSubmitted,
      hasApprovedBooking,
      switchToHistoryTab,
      startNewBooking,
      openFullHistoryPage,
      estimatedCost,
      packageDetailsText,
      submitBooking,
    };
  },
};
</script>
