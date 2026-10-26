// G Shot Teas — Featured Highlights, Craftsmanship, Catering & Reviews Section
const FeaturedSection = {
  template: `
    <section class="py-16 bg-surface-950/60 border-t border-surface-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        <!-- 1. Bestsellers Showcase -->
        <div>
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="text-xs font-bold px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-400 uppercase tracking-widest border border-brand-500/30">
              🔥 Customer Favorites
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Santa Rosa's <span class="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Top Cravings</span>
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

                <!-- Visual Media -->
                <div class="relative h-44 rounded-2xl overflow-hidden bg-surface-950 mb-4 flex items-center justify-center">
                  <img 
                    :src="item.image" 
                    :alt="item.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onerror="this.src='./assets/hero-banner.png'"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-transparent to-transparent"></div>
                  <span class="absolute bottom-3 left-3 text-3xl drop-shadow-lg">
                    {{ item.emoji }}
                  </span>
                </div>

                <!-- Details -->
                <h3 class="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                  {{ item.name }}
                </h3>
                <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {{ item.desc }}
                </p>
              </div>

              <!-- Price & CTA -->
              <div class="pt-5 mt-4 border-t border-surface-800 flex items-center justify-between gap-3">
                <div>
                  <span class="text-[10px] text-gray-500 block uppercase font-bold">Price</span>
                  <span class="text-lg font-black text-brand-400">₱{{ item.price.toFixed(2) }}</span>
                </div>

                <button 
                  @click="handleOrder(item)"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all">
                  <i class="pi pi-plus text-[10px]"></i>
                  <span>{{ item.category === 'Drinks' ? 'Customize' : 'Add' }}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- 2. The G Shot Quality Standard (Craftsmanship Story) -->
        <div class="relative rounded-3xl bg-gradient-to-br from-surface-900 to-surface-950 border border-surface-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div class="absolute -right-20 -top-20 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="max-w-2xl mb-12">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">
              ✨ Fresh Ingredients & Real Recipes
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
                🍃
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">Freshly Steeped Daily</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Brewed in small batches with authentic loose-leaf tea, ensuring smooth natural aroma and clean finish.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-lg mb-4">
                🧋
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">Warm Slow-Cooked Boba</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Signature caramelized brown sugar pearls simmered hourly for the dreamiest chewy texture.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center text-lg mb-4">
                🍕
              </div>
              <h3 class="font-bold text-white text-sm mb-1.5">100% Real Cheese & Beef</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                Stone-baked pizzas with real mozzarella and burgers made with grilled smash patties in brioche buns.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-800/60 border border-surface-700/60 hover:border-brand-500/40 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-lg mb-4">
                🛵
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
            <span class="text-xs font-bold px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-widest border border-amber-500/30">
              🎉 Official Booking Services & Mobile Bar
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
              Event Catering & <span class="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Mobile Bar Packages</span>
            </h2>
            <p class="text-sm sm:text-base text-gray-300 mt-3 max-w-2xl mx-auto">
              Elevate your celebration in Laguna with our live drink booth, trained barista staff, and freshly prepared premium beverages.
            </p>
          </div>

          <!-- The Two Official Booking Packages Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Package 1: Coffee Package -->
            <div class="rounded-3xl bg-surface-900 border border-surface-700 hover:border-amber-500/50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <!-- Top Flyer Display Area -->
                <div class="relative h-72 sm:h-80 overflow-hidden bg-surface-950 cursor-pointer" @click="viewFlyer('./assets/booking-coffee-package.jpg')">
                  <img 
                    src="./assets/booking-coffee-package.jpg" 
                    alt="G Shot Teas Coffee Package Flyer" 
                    class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent"></div>
                  
                  <!-- Badge Pill -->
                  <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-surface-950 uppercase tracking-wider shadow-lg">
                      ☕ COFFEE PACKAGE
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-surface-900/90 text-white border border-surface-700 backdrop-blur-md">
                      ₱3,500 / 50 PAX
                    </span>
                  </div>

                  <!-- Zoom hint -->
                  <div class="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-surface-950/80 border border-surface-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md group-hover:bg-amber-500 group-hover:text-surface-950 transition-colors">
                    <i class="pi pi-search-plus"></i>
                    <span>View Flyer</span>
                  </div>
                </div>

                <!-- Package Details -->
                <div class="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 class="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                      Coffee Package
                    </h3>
                    <p class="text-xs text-amber-400 font-bold mt-1">
                      Featuring Coldbrew & Signature Artisan Brews
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
                      <i class="pi pi-check-circle text-amber-400"></i> Package Inclusions:
                    </p>
                    <ul class="space-y-1.5 text-xs text-gray-300">
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <strong class="text-white">50 Cups of 12oz</strong> servings
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <strong class="text-white">3 Hours of Service</strong> with on-site barista staff
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <strong class="text-white">5 Choices of Drinks</strong> (Coldbrew & Specialty Coffee selections)
                      </li>
                    </ul>
                  </div>

                  <!-- Transpo note & Contact -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 pt-2 border-t border-surface-800">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-car text-amber-400"></i>
                      <span>Transpo fee: Varies by location</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-gray-300 font-bold">
                      <i class="pi pi-phone text-amber-400"></i>
                      <span>Jefferson Alulod — 0993.700.5426</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Action Button -->
              <div class="p-6 sm:p-8 pt-0">
                <button 
                  @click="bookPackage('Coffee Package')"
                  class="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-surface-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                  <i class="pi pi-calendar-plus text-xs"></i>
                  <span>Book Coffee Package (₱3,500)</span>
                </button>
              </div>
            </div>

            <!-- Package 2: Fruity Float Package -->
            <div class="rounded-3xl bg-surface-900 border border-surface-700 hover:border-amber-500/50 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <!-- Top Flyer Display Area -->
                <div class="relative h-72 sm:h-80 overflow-hidden bg-surface-950 cursor-pointer" @click="viewFlyer('./assets/booking-fruity-float.jpg')">
                  <img 
                    src="./assets/booking-fruity-float.jpg" 
                    alt="G Shot Teas Fruity Float Package Flyer" 
                    class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent"></div>
                  
                  <!-- Badge Pill -->
                  <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider shadow-lg">
                      🍹 FRUITY FLOAT PACKAGE
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-black bg-surface-900/90 text-white border border-surface-700 backdrop-blur-md">
                      ₱3,500 / 50 PAX
                    </span>
                  </div>

                  <!-- Zoom hint -->
                  <div class="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-surface-950/80 border border-surface-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <i class="pi pi-search-plus"></i>
                    <span>View Flyer</span>
                  </div>
                </div>

                <!-- Package Details -->
                <div class="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 class="text-2xl font-black text-white group-hover:text-rose-400 transition-colors">
                      Fruity float Package
                    </h3>
                    <p class="text-xs text-rose-400 font-bold mt-1">
                      Featuring Sparkling Sodas & Ice Cream Floats
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
                      <i class="pi pi-check-circle text-rose-400"></i> Package Inclusions:
                    </p>
                    <ul class="space-y-1.5 text-xs text-gray-300">
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <strong class="text-white">50 Cups of 16oz</strong> servings (larger size!)
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <strong class="text-white">3 Hours of Service</strong> with on-site barista staff
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <strong class="text-white">7 Choices of Drinks</strong> (Fruity float & sparkling refreshers)
                      </li>
                    </ul>
                  </div>

                  <!-- Transpo note & Contact -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 gap-2 pt-2 border-t border-surface-800">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-car text-rose-400"></i>
                      <span>Transpo fee: Varies by location</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-gray-300 font-bold">
                      <i class="pi pi-phone text-rose-400"></i>
                      <span>Jefferson Alulod — 0993.700.5426</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Action Button -->
              <div class="p-6 sm:p-8 pt-0">
                <button 
                  @click="bookPackage('Fruity Float Package')"
                  class="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                  <i class="pi pi-calendar-plus text-xs"></i>
                  <span>Book Fruity Float Package (₱3,500)</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Custom Setup Banner -->
          <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface-900 via-surface-850 to-surface-900 border border-surface-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
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
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
              ⭐ Verified Reviews
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
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
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
              <h3 class="font-bold text-white text-sm">Pay with GCash or COD</h3>
              <p class="text-xs text-gray-400 mt-1">Pay smoothly via GCash scan-to-pay upload or convenient Cash on Delivery upon arrival.</p>
            </div>

            <div class="p-6 rounded-2xl bg-surface-900 border border-surface-800">
              <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
                3
              </span>
              <h3 class="font-bold text-white text-sm">Track & Enjoy Fresh</h3>
              <p class="text-xs text-gray-400 mt-1">Watch your order update in real-time as our kitchen prepares and dispatches your order.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  `,
  setup() {
    const store = useGShotStore();

    const bestsellers = Vue.computed(() => [
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
    ]);

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
      const matched = store.products.find(p => p.id === item.id) || {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        emoji: item.emoji,
        image: item.image,
      };

      if (item.category === 'Drinks') {
        store.selectedProductForCustomize = matched;
        store.customizeModalOpen = true;
      } else {
        store.addToCart(matched);
      }
    };

    const bookPackage = (pkgName) => {
      store.openBookingWithPackage(pkgName);
    };

    const viewFlyer = (url) => {
      store.viewFlyer(url);
    };

    return {
      store,
      bestsellers,
      reviews,
      handleOrder,
      bookPackage,
      viewFlyer,
    };
  },
};
