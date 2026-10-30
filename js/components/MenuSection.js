// G Shot Teas — Menu Section Component (Matches Figure 7 + Ingredient Prototype Integration)
const MenuSection = {
  template: `
    <section id="menu" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Title & Subtitle -->
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Our <span class="text-brand-500">Menu</span>
        </h2>
        <p class="text-sm sm:text-base text-gray-400 mt-3">
          Explore our finest selection of food and drinks. Click on any item to view details, ingredient stocks, and add it to your order.
        </p>
      </div>

      <!-- Controls: Categories, Search, and Sort -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-10">
        
        <!-- Category Filter Pills (Full bleed scroll on mobile) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0"
            :class="selectedCategory === cat 
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
              : 'bg-surface-800 text-gray-300 hover:bg-surface-700 hover:text-white border border-surface-700/50'">
            {{ cat }}
          </button>
        </div>

        <!-- Search Bar and Sort Dropdown (Responsive stack) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <!-- Live Search Bar -->
          <div class="relative flex-1 md:w-64">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search menu..." 
              class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs sm:text-sm border border-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
              ✕
            </button>
          </div>

          <!-- Sort by Price -->
          <div class="relative">
            <select 
              v-model="sortOrder"
              class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-surface-800 text-gray-300 text-xs sm:text-sm border border-surface-700 focus:outline-none focus:border-brand-500 cursor-pointer">
              <option value="default">Sort by Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="group rounded-2xl bg-surface-800/80 border border-surface-700/60 overflow-hidden flex flex-col justify-between hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 transform hover:-translate-y-1">
          
          <!-- Image Container with Click to Enlarge -->
          <div 
            @click="openImage(product)"
            class="relative h-48 bg-surface-900 overflow-hidden flex items-center justify-center cursor-pointer group/image select-none"
            title="Click to view whole enlarged picture">
            
            <img 
              :src="product.image || './assets/hero-banner.png'" 
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 group-hover/image:scale-110 transition-transform duration-500 filter brightness-95 group-hover/image:brightness-100"
              onerror="this.src='./assets/hero-banner.png'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent to-black/30 pointer-events-none"></div>

            <!-- Hover overlay indicator to enlarge -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span class="px-3 py-1.5 rounded-xl bg-surface-950/90 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-xl backdrop-blur-md transform scale-95 group-hover/image:scale-100 transition-transform">
                <i class="pi pi-search-plus text-brand-400"></i>
                <span>Enlarge Photo</span>
              </span>
            </div>

            <!-- Emoji Icon Accent -->
            <span class="absolute top-3 left-3 text-2xl drop-shadow-md pointer-events-none">
              {{ product.emoji || '🍽️' }}
            </span>

            <!-- Category Badge -->
            <span class="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-900/80 backdrop-blur-md text-gray-200 border border-surface-700 pointer-events-none">
              {{ product.category }}
            </span>

            <!-- Quick Enlarge Zoom Button (visible on mobile / touch or hover) -->
            <button 
              type="button"
              @click.stop="openImage(product)"
              aria-label="Enlarge food picture"
              class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-surface-900/85 hover:bg-brand-600 text-gray-200 hover:text-white flex items-center justify-center text-xs border border-surface-700 shadow-lg backdrop-blur-md transition-all hover:scale-110 z-10"
              title="View enlarged picture">
              <i class="pi pi-search-plus"></i>
            </button>

            <!-- Kitchen Stock Status Badge (Prototype Addition!) -->
            <div class="absolute bottom-3 left-3 pointer-events-none">
              <span 
                v-if="product.max_portions > 3"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                In Stock ({{ product.max_portions }} avail)
              </span>
              <span 
                v-else-if="product.max_portions > 0"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-700/50 backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Low Stock ({{ product.max_portions }} left)
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-400 border border-rose-700/50 backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Sold Out
              </span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-baseline justify-between gap-2 mb-1.5">
                <h3 class="font-bold text-white text-base sm:text-lg group-hover:text-brand-400 transition-colors">
                  {{ product.name }}
                </h3>
                <span class="text-base sm:text-lg font-black text-brand-400 whitespace-nowrap">
                  ₱{{ Number(product.price).toFixed(2) }}
                </span>
              </div>
              <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                {{ product.description }}
              </p>

              <!-- Recipe Ingredient Summary Pill (From Prototype) -->
              <div v-if="product.recipes && product.recipes.length > 0" class="mb-4 pt-2 border-t border-surface-700/40">
                <p class="text-[10px] text-gray-400 font-medium mb-1">Kitchen Ingredients:</p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="rec in product.recipes.slice(0, 3)" 
                    :key="rec.id" 
                    class="text-[9px] px-1.5 py-0.5 rounded bg-surface-700 text-gray-300">
                    {{ rec.ingredient ? rec.ingredient.name : rec.ingredient_id }} ({{ rec.qty }})
                  </span>
                  <span v-if="product.recipes.length > 3" class="text-[9px] px-1.5 py-0.5 rounded bg-surface-700 text-gray-400">
                    +{{ product.recipes.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-2">
              <button 
                v-if="product.max_portions > 0"
                @click="openCustomize(product)"
                class="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                <i class="pi pi-plus text-xs"></i>
                <span>{{ product.category === 'Drinks' ? 'Customize & Add' : 'Add to Cart' }}</span>
              </button>
              <button 
                v-else
                disabled
                class="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-surface-700 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2">
                <i class="pi pi-ban text-xs"></i>
                <span>Unavailable</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 bg-surface-800/40 rounded-3xl border border-surface-700/50">
        <i class="pi pi-search text-4xl text-gray-600 mb-3 block"></i>
        <p class="text-lg font-bold text-gray-300">No products match your search</p>
        <p class="text-xs text-gray-500 mt-1">Try switching category or clearing the search query.</p>
        <button 
          @click="selectedCategory = 'All'; searchQuery = ''"
          class="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-500 transition-all">
          Reset Filter
        </button>
      </div>

    </section>
  `,
  setup() {
    const store = useGShotStore();
    const categories = ['All', 'Drinks', 'Burgers', 'Pizzas', 'RiceMeals', 'Sides', 'Coffee'];
    const selectedCategory = Vue.ref('All');
    const searchQuery = Vue.ref('');
    const sortOrder = Vue.ref('default');

    const filteredProducts = Vue.computed(() => {
      let list = [...store.products];

      if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.description && p.description.toLowerCase().includes(q))
        );
      }

      if (sortOrder.value === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sortOrder.value === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      }

      return list;
    });

    const openCustomize = (product) => {
      store.selectedProductForCustomize = product;
      store.customizeModalOpen = true;
    };

    const openImage = (product) => {
      store.openProductPreview(product);
    };

    return {
      store,
      categories,
      selectedCategory,
      searchQuery,
      sortOrder,
      filteredProducts,
      openCustomize,
      openImage,
    };
  },
};
