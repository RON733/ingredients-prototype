<template>
<section class="py-16 bg-surface-950/60 border-t border-surface-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        <!-- 1. Bestsellers Showcase -->
        <div>
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full bg-surface-800 text-gray-300 uppercase tracking-wider border border-surface-700">
              <i class="pi pi-bolt text-amber-400 text-[10px]"></i> Customer Favorites
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Santa Rosa's <span class="text-yellow-400">Top Cravings</span>
            </h2>
            <p class="text-sm sm:text-base text-gray-400 mt-3 max-w-xl mx-auto">
              Our most-loved milk teas, comfort burgers, and stone-baked pizzas freshly prepared to order.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="item in bestsellers" 
              :key="item.id"
              class="group relative rounded-3xl bg-surface-900 border border-surface-700/80 hover:border-brand-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10">
              
              <div>
                <!-- Top Badges -->
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    {{ item.badge }}
                  </span>
                  <span class="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <i class="pi pi-star-fill text-[10px]"></i> {{ item.rating }}
                  </span>
                </div>

                <!-- Visual Media (Click to Enlarge Food / Drink Picture) -->
                <div 
                  @click="openImage(item)"
                  class="relative h-44 rounded-2xl overflow-hidden bg-surface-950 mb-4 flex items-center justify-center cursor-pointer group/image select-none"
                  title="Click to view whole enlarged picture">
                  <img 
                    :src="item.image" 
                    :alt="item.name"
                    class="w-full h-full object-cover group-hover:scale-105 group-hover/image:scale-110 transition-transform duration-500"
                    onerror="this.src='/assets/hero-banner.png'"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-transparent to-transparent pointer-events-none"></div>

                  <!-- Hover overlay indicator to enlarge -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                    <span class="px-3 py-1.5 rounded-xl bg-surface-950/90 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-xl backdrop-blur-md transform scale-95 group-hover/image:scale-100 transition-transform">
                      <i class="pi pi-search-plus text-brand-400"></i>
                      <span>Enlarge Photo</span>
                    </span>
                  </div>



                  <!-- Live Stock Status Badge -->
                  <div class="absolute bottom-3 right-3 pointer-events-none">
                    <span 
                      v-if="!item.is_available || item.max_portions <= 0"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-950/90 text-rose-400 border border-rose-700/60 backdrop-blur-md shadow">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      Sold Out
                    </span>
                    <span 
                      v-else-if="item.max_portions <= 8"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/60 backdrop-blur-md shadow">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Almost Out ({{ item.max_portions }} left)
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-700/60 backdrop-blur-md shadow">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      In Stock ({{ item.max_portions }} avail)
                    </span>
                  </div>

                  <!-- Quick Zoom Button -->
                  <button 
                    type="button"
                    @click.stop="openImage(item)"
                    aria-label="Enlarge food picture"
                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-surface-900/85 hover:bg-brand-600 text-gray-200 hover:text-white flex items-center justify-center text-[11px] border border-surface-700 shadow-md backdrop-blur-md transition-all hover:scale-110 z-10"
                    title="View enlarged picture">
                    <i class="pi pi-search-plus"></i>
                  </button>
                </div>

                <!-- Details -->
                <h3 class="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                  {{ item.name }}
                </h3>
                <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {{ item.desc }}
                </p>

                <!-- Low Stock / Cart Limit Notice -->
                <p 
                  v-if="item.is_available && item.max_portions > 0 && item.remainingStock <= 0"
                  class="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  <i class="pi pi-shopping-bag text-[10px]"></i>
                  <span>Max stock in cart ({{ item.max_portions }}/{{ item.max_portions }})</span>
                </p>
                <p 
                  v-else-if="item.is_available && item.max_portions > 0 && item.max_portions <= 8"
                  class="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Almost out of stock — only {{ item.max_portions }} left!</span>
                </p>
              </div>

              <!-- Price & CTA -->
              <div class="pt-5 mt-4 border-t border-surface-800 flex items-center justify-between gap-3">
                <div>
                  <span class="text-[10px] text-gray-500 block uppercase font-bold">Price</span>
                  <span class="text-lg font-black text-brand-400">₱{{ item.price.toFixed(2) }}</span>
                </div>

                <button 
                  v-if="!item.is_available || item.max_portions <= 0"
                  disabled
                  type="button"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-surface-800 text-gray-500 border border-surface-700 cursor-not-allowed flex items-center gap-1.5">
                  <i class="pi pi-ban text-[10px]"></i>
                  <span>Sold Out</span>
                </button>
                <button 
                  v-else-if="item.remainingStock <= 0"
                  disabled
                  type="button"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-surface-800 text-amber-400/70 border border-amber-500/30 cursor-not-allowed flex items-center gap-1.5">
                  <i class="pi pi-check text-[10px]"></i>
                  <span>Max in Cart</span>
                </button>
                <button 
                  v-else
                  @click="handleOrder(item)"
                  type="button"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95">
                  <i class="pi pi-plus text-[10px]"></i>
                  <span>{{ item.category === 'Drinks' ? 'Customize' : 'Add' }}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- 2. The G Shot Quality Standard (Craftsmanship Story) -->
        <div class="relative rounded-3xl bg-surface-900 border border-surface-800 p-8 sm:p-12 overflow-hidden">
          

          <div class="max-w-2xl mb-12">
<span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <i class="pi pi-sparkles text-[10px]"></i> Fresh Ingredients & Real Recipes
            </span>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-2">
              Why Santa Rosa Chooses G Shot Teas
            </h2>
            <p class="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
              We never cut corners. From real imported black tea leaves to slow-simmered brown sugar tapioca and melted mozzarella on stone-baked dough, every item is crafted to give you unmatched satisfaction.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-lg mb-4">
                <i class="pi pi-verified"></i>
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">Freshly Steeped Daily</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Brewed in small batches with authentic loose-leaf tea, ensuring smooth natural aroma and clean finish.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-lg mb-4">
                <i class="pi pi-sparkles"></i>
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">Warm Slow-Cooked Boba</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Signature caramelized brown sugar pearls simmered hourly for the dreamiest chewy texture.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center text-lg mb-4">
                <i class="pi pi-heart"></i>
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">100% Real Cheese & Beef</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Stone-baked pizzas with real mozzarella and burgers made with grilled smash patties in brioche buns.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-lg mb-4">
                <i class="pi pi-car"></i>
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">Fast Santa Rosa Delivery</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Quick local dispatch covering Santa Rosa, Cabuyao, and Biñan with real-time status tracking.
              </p>
            </div>

          </div>
        </div>

        <!-- 3. Official Catering & Mobile Bar Booking Packages Showcase -->
        <div id="booking-services" class="space-y-8">
          
          <div class="text-center max-w-3xl mx-auto">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full bg-surface-800 text-gray-300 uppercase tracking-wider border border-surface-700">
              <i class="pi pi-calendar-plus text-amber-400 text-[10px]"></i> Official Booking Services & Mobile Bar
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Event Catering & <span class="text-yellow-400">Mobile Bar Packages</span>
            </h2>
            <p class="text-sm sm:text-base text-gray-300 mt-3 max-w-2xl mx-auto">
              Elevate your celebration in Laguna with our live drink booth, trained barista staff, and freshly prepared premium beverages.
            </p>
          </div>

          <!-- Dynamic Official Booking Packages Grid -->
          <div class="grid grid-cols-1 gap-8" :class="showcasePackages.length >= 2 ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'">
            
            <div 
              v-for="pkg in showcasePackages"
              :key="pkg.id"
              class="rounded-3xl bg-surface-900 border border-surface-700 hover:border-amber-500/50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <!-- Top Flyer Display Area -->
                <div 
                  class="relative h-72 sm:h-80 overflow-hidden bg-surface-950"
                  :class="pkg.image_url ? 'cursor-pointer' : ''"
                  @click="pkg.image_url && viewFlyer(pkg.image_url, pkg)">
                  <img 
                    v-if="pkg.image_url"
                    :src="pkg.image_url" 
                    :alt="pkg.name + ' Flyer'" 
                    class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-900 to-surface-950 text-gray-500 gap-2">
                    <div class="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 text-amber-400 flex items-center justify-center text-2xl"><i class="pi pi-calendar"></i></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">{{ pkg.name }}</span>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent"></div>
                  
                  <!-- Badge Pill -->
                  <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg" :class="getPackageBadgeClass(pkg.accent_color)">
                      {{ pkg.badge || pkg.name }}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-surface-900/90 text-white border border-surface-700 backdrop-blur-md">
                      {{ formatPackagePriceBadge(pkg) }}
                    </span>
                  </div>

                  <!-- Zoom hint -->
                  <div 
                    v-if="pkg.image_url"
                    class="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-surface-950/80 border border-surface-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md group-hover:bg-amber-500 group-hover:text-surface-950 transition-colors">
                    <i class="pi pi-search-plus"></i>
                    <span>View Flyer</span>
                  </div>
                </div>

                <!-- Package Details -->
                <div class="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 class="text-2xl font-black text-white transition-colors" :class="getPackageTitleHoverClass(pkg.accent_color)">
                      {{ pkg.name }}
                    </h3>
                    <p v-if="pkg.subtitle" class="text-xs font-bold mt-1" :class="getPackageAccentTextClass(pkg.accent_color)">
                      {{ pkg.subtitle }}
                    </p>
                  </div>

                  <!-- Events We Service -->
                  <div>
                    <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">We Service:</p>
                    <div class="flex flex-wrap gap-1.5 text-xs">
                      <span class="px-2.5 py-1 rounded-lg bg-surface-800 text-gray-300 border border-surface-700 font-medium">Birthday</span>
                      <span class="px-2.5 py-1 rounded-lg bg-surface-800 text-gray-300 border border-surface-700 font-medium">Wedding</span>
                      <span class="px-2.5 py-1 rounded-lg bg-surface-800 text-gray-300 border border-surface-700 font-medium">Anniversary</span>
                      <span class="px-2.5 py-1 rounded-lg bg-surface-800 text-gray-300 border border-surface-700 font-medium">Corporate Events</span>
                      <span class="px-2.5 py-1 rounded-lg bg-surface-800 text-gray-300 border border-surface-700 font-medium">Any Social Gathering</span>
                    </div>
                  </div>

                  <!-- Package Inclusions List -->
                  <div class="p-4 rounded-2xl bg-surface-800/70 border border-surface-700/80 space-y-2.5">
                    <p class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <i class="pi pi-check-circle" :class="getPackageAccentTextClass(pkg.accent_color)"></i> Package Inclusions:
                    </p>
                    <ul v-if="Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0" class="space-y-1.5 text-xs text-gray-300">
                      <li v-for="(inc, idx) in pkg.inclusions" :key="idx" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getPackageDotClass(pkg.accent_color)"></span>
                        <span>{{ inc }}</span>
                      </li>
                    </ul>
                    <p v-else-if="pkg.description" class="text-xs text-gray-300 leading-relaxed">
                      {{ pkg.description }}
                    </p>
                  </div>

                  <!-- Transpo note & Contact -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 pt-2 border-t border-surface-800">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-car" :class="getPackageAccentTextClass(pkg.accent_color)"></i>
                      <span>Transpo fee: Varies by location</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-gray-300 font-bold">
                      <i class="pi pi-phone" :class="getPackageAccentTextClass(pkg.accent_color)"></i>
                      <span>Jefferson Alulod — 0994 612 1933</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Action Button -->
              <div class="p-6 sm:p-8 pt-0">
                <button 
                  @click="bookPackage(pkg)"
                  class="w-full py-3 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-2 cursor-pointer">
                  <i class="pi pi-calendar-plus text-xs"></i>
                  <span>Book {{ pkg.name }} (₱{{ Number(pkg.price || 0).toLocaleString() }})</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Custom Setup Banner -->
          <div class="p-6 sm:p-8 rounded-3xl bg-surface-900 border border-surface-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-1 text-center md:text-left">
              <h4 class="text-lg font-black text-white">Need a Custom Event Package or Milktea Booth?</h4>
              <p class="text-xs text-gray-400">We also cater 100 to 500+ cups, custom milk tea bars, and party food packs across Laguna.</p>
            </div>
            <button 
              @click="bookPackage('Custom Event & Mobile Bar Booth')"
              class="px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer">
              <i class="pi pi-send text-xs"></i>
              <span>Inquire Custom Setup</span>
            </button>
          </div>

        </div>

        <!-- 4. Real Customer Reviews & Social Proof -->
        <div>
          <div class="text-center max-w-3xl mx-auto mb-12">
<span class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
              <i class="pi pi-star-fill text-[10px]"></i> Verified Reviews
            </span>
            <h2 class="text-3xl sm:text-4xl font-black text-white mt-3">
              Loved by Milk Tea Lovers Across Laguna
            </h2>
            <p class="text-xs sm:text-sm text-gray-400 mt-2">
              Over 2,500+ happy students, families, and foodies in Santa Rosa.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="rev in reviews" 
              :key="rev.name"
              class="p-6 rounded-3xl bg-surface-900 border border-surface-700/80 shadow-xl flex flex-col justify-between">
              
              <div class="space-y-3">
                <div class="flex items-center gap-1 text-amber-400 text-xs">
                  <i v-for="i in 5" :key="i" class="pi pi-star-fill"></i>
                </div>
                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed italic">
                  "{{ rev.comment }}"
                </p>
              </div>

              <div class="flex items-center gap-3 pt-4 mt-4 border-t border-surface-800">
                <div class="w-9 h-9 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-yellow-400 font-bold text-xs">
                  {{ rev.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-white text-xs">{{ rev.name }}</p>
                  <p class="text-[10px] text-gray-500">{{ rev.location }}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 5. How It Works (3 Steps) -->
        <div class="text-center pt-6 border-t border-surface-800">
          <p class="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Simple & Convenient</p>
          <h2 class="text-2xl sm:text-3xl font-black text-white mb-8">How to Order from G Shot Teas</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div class="p-6 rounded-2xl bg-surface-900 border border-surface-800">
              <span class="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center mb-3">
                1
              </span>
              <h3 class="font-bold text-white text-sm">Choose & Customize</h3>
              <p class="text-xs text-gray-400 mt-1">Browse our menu and adjust drink size, sugar level, ice, and pearls to your liking.</p>
            </div>
            
            <div class="p-6 rounded-2xl bg-surface-900 border border-surface-800">
              <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mb-3">
                2
              </span>
              <h3 class="font-bold text-white text-sm">Pay Online via PayMongo or COD</h3>
              <p class="text-xs text-gray-400 mt-1">Pay smoothly via PayMongo QR Ph instant checkout or convenient Cash on Delivery upon arrival.</p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-900 border border-surface-800">
              <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
                3
              </span>
              <h3 class="font-bold text-white text-sm">Track & Enjoy Fresh</h3>
              <p class="text-xs text-gray-400 mt-1">Watch your order update as our kitchen prepares and dispatches your order.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Featured Highlights, Craftsmanship, Catering & Reviews Section
export default {
  name: 'FeaturedSection',
  setup() {
    const store = useGShotStore();

    const bestsellers = Vue.computed(() => {
      const templates = [
        {
          id: 'brown-sugar-milktea',
          name: 'Brown Sugar Boba Milk',
          category: 'Drinks',
          price: 69.00,
          desc: 'Tiger-striped brown sugar caramel, cold fresh milk, and warm chewy boba pearls.',
          emoji: '🧋',
          badge: 'TOP SELLER',
          rating: '4.9 (1.4k+)',
          image: './assets/menu-coffee.png',
        },
        {
          id: 'pepperoni-pizza',
          name: 'Pepperoni Feast Pizza',
          category: 'Pizzas',
          price: 169.00,
          desc: 'Crispy thin crust topped with savory pepperoni cuts and melted mozzarella cheese.',
          emoji: '🍕',
          badge: 'FAN FAVORITE',
          rating: '4.8 (980+)',
          image: './assets/menu-pizza.png',
        },
        {
          id: 'classic-cheeseburger',
          name: 'Cheese Burger',
          category: 'Burgers',
          price: 89.00,
          desc: 'Juicy grilled beef patty in buttery toasted brioche with melted golden cheddar.',
          emoji: '🍔',
          badge: 'POPULAR',
          rating: '4.9 (820+)',
          image: './assets/hero-banner.png',
        },
        {
          id: 'classic-milktea',
          name: 'Milktea Classic',
          category: 'Drinks',
          price: 49.00,
          desc: 'Timeless brewed black tea infused with creamy milk and chewy tapioca pearls.',
          emoji: '🧋',
          badge: 'VALUE CRAVE',
          rating: '4.9 (2.1k+)',
          image: './assets/menu-coffee.png',
        },
      ];

      return templates.map(tpl => {
        const matched = store.products.find(p => p.id === tpl.id)
          || store.products.find(p => (p.name || '').toLowerCase() === tpl.name.toLowerCase());
        const source = matched || tpl;
        const maxPortions = matched ? store.getProductMaxStock(matched) : 0;
        const remainingStock = matched ? store.getRemainingStock(matched) : 0;
        return {
          ...tpl,
          price: matched && matched.price !== undefined ? Number(matched.price) : tpl.price,
          category: source.category || tpl.category,
          image: (matched && matched.image) || tpl.image,
          is_available: matched ? matched.is_available !== false : false,
          max_portions: maxPortions,
          remainingStock,
          productRef: matched || null,
        };
      });
    });

    const reviews = [
      {
        name: 'Alyssa Marie Santos',
        location: 'STI College Santa Rosa',
        comment: 'The brown sugar boba is absolute perfection! The pearls are always warm and chewy, never hard like other shops. Best milk tea spot in Santa Rosa!',
      },
      {
        name: 'Kenrick Villanueva',
        location: 'Cabuyao, Laguna',
        comment: 'Their pepperoni pizza and loaded fries are our favorite weekend comfort food. Super fast delivery and the rider was very polite.',
      },
      {
        name: 'Sarah Mae Tan',
        location: 'Amira Townhomes, Santa Rosa',
        comment: 'We booked G Shot Teas for our 18th debut party mobile bar. Our guests could not stop praising the matcha and classic milk tea!',
      },
    ];

    const handleOrder = (item) => {
      // Find matching product in store if available
      const matched = item.productRef || store.products.find(p => p.id === item.id) || {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        emoji: item.emoji,
        image: item.image,
        max_portions: item.max_portions ?? 0,
        is_available: item.is_available !== false,
      };

      const maxStock = store.getProductMaxStock(matched);
      if (maxStock <= 0) {
        store.notify(`${matched.name} is currently sold out.`, 'error');
        return;
      }
      if (store.getRemainingStock(matched) <= 0) {
        store.notify(`Cannot add more ${matched.name}. Only ${maxStock} stock${maxStock === 1 ? '' : 's'} available and you already have them in your cart.`, 'warning');
        return;
      }

      if (matched.category === 'Drinks' || matched.category === 'Coffee') {
        store.selectedProductForCustomize = matched;
        store.customizeModalOpen = true;
      } else {
        store.addToCart(matched);
      }
    };

    const showcasePackages = Vue.computed(() => {
      const active = store.activeBookingPackages || [];
      const banners = active.filter(p => p.show_in_banner);
      return banners.length > 0 ? banners : active.slice(0, 2);
    });

    const formatPackagePriceBadge = (pkg) => {
      const price = Number(pkg?.price || 0).toLocaleString();
      if (pkg?.pricing_type === 'per_guest') return `₱${price} / PAX`;
      if (pkg?.pricing_type === 'flat') return `₱${price} FLAT`;
      return `₱${price} / ${pkg?.base_pax || 50} PAX`;
    };

    const getPackageBadgeClass = (color) => {
      const map = {
        amber: 'bg-amber-500 text-surface-950',
        rose: 'bg-rose-500 text-white',
        emerald: 'bg-emerald-500 text-surface-950',
        sky: 'bg-sky-500 text-surface-950',
        purple: 'bg-purple-500 text-white',
      };
      return map[color] || map.amber;
    };

    const getPackageAccentTextClass = (color) => {
      const map = {
        amber: 'text-amber-400',
        rose: 'text-rose-400',
        emerald: 'text-emerald-400',
        sky: 'text-sky-400',
        purple: 'text-purple-400',
      };
      return map[color] || map.amber;
    };

    const getPackageTitleHoverClass = (color) => {
      const map = {
        amber: 'group-hover:text-amber-400',
        rose: 'group-hover:text-rose-400',
        emerald: 'group-hover:text-emerald-400',
        sky: 'group-hover:text-sky-400',
        purple: 'group-hover:text-purple-400',
      };
      return map[color] || map.amber;
    };

    const getPackageDotClass = (color) => {
      const map = {
        amber: 'bg-amber-400',
        rose: 'bg-rose-400',
        emerald: 'bg-emerald-400',
        sky: 'bg-sky-400',
        purple: 'bg-purple-400',
      };
      return map[color] || map.amber;
    };

    const bookPackage = (pkgName) => {
      store.openBookingWithPackage(pkgName);
    };

    const viewFlyer = (url, pkg = null) => {
      store.viewFlyer(url, pkg);
    };

    const openImage = (item) => {
      store.openProductPreview(item);
    };

    return {
      store,
      bestsellers,
      showcasePackages,
      formatPackagePriceBadge,
      getPackageBadgeClass,
      getPackageAccentTextClass,
      getPackageTitleHoverClass,
      getPackageDotClass,
      reviews,
      handleOrder,
      bookPackage,
      viewFlyer,
      openImage,
    };
  },
};
</script>
