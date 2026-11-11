<template>
<section id="menu" :class="isStandalonePage ? 'py-4 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 sm:pb-20' : 'scroll-mt-20 lg:scroll-mt-24 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'">
      
  <!-- 1. Dedicated Standalone Menu Page Header (Cellphones Only) -->
  <div v-if="isStandalonePage" class="mb-4 border-b border-surface-800 pb-3">
    <div class="flex items-center justify-between gap-3">
      <button 
        @click="goBackHome"
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-gray-200 border border-surface-700/80 transition-all active:scale-95 cursor-pointer shadow-md">
        <i class="pi pi-arrow-left text-xs text-yellow-400"></i>
        <span>Home</span>
      </button>

      <div class="text-center">
        <h1 class="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
          <span>Our</span>
          <span class="text-yellow-400">Menu</span>
        </h1>
        <p class="text-[10px] sm:text-xs text-gray-400">Handcrafted drinks, burgers, pizzas & rice meals</p>
      </div>

      <button 
        @click="store.cartOpen = true"
        type="button"
        class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md">
        <i class="pi pi-shopping-bag text-sm"></i>
        <span v-if="store.cartCount > 0" class="text-[11px] font-black leading-none">
          ({{ store.cartCount }})
        </span>
      </button>
    </div>
  </div>

  <!-- 2. Home Page Section Header (when embedded on customer landing page) -->
  <div v-else class="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
    <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
      Our <span class="text-yellow-400">Menu</span>
    </h2>
    <p class="text-xs sm:text-base text-gray-400 mt-2.5">
      Explore our finest selection of food and drinks. Click on any item to view details, ingredient stocks, and add to your order.
    </p>
  </div>

  <!-- Order Availability Note Banner (Editable by Staff, Admin, Super Admin) -->
  <div 
    v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
    class="p-3.5 sm:p-4 rounded-2xl bg-surface-900/90 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg mb-6 animate-fade-in backdrop-blur-md">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
        <i class="pi pi-map-marker"></i>
      </div>
      <div class="min-w-0">
        <p class="font-extrabold text-amber-300 text-[11px] sm:text-xs uppercase tracking-wider">Service Coverage Notice</p>
        <p class="text-xs sm:text-sm text-gray-200 font-medium truncate sm:whitespace-normal">{{ store.orderAreaNote }}</p>
      </div>
    </div>
    <span class="hidden md:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
      Coverage Notice
    </span>
  </div>

  <!-- 3. COMPREHENSIVE FILTER SYSTEM (Search, Categories, Stock & Price Filters) -->
  <div class="space-y-3 mb-6">
    
    <!-- Row 1: Live Search and Sorting Dropdown -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      <!-- Search Input -->
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search burger, milktea, pizza, ingredients..." 
          class="w-full pl-9 sm:pl-10 pr-8 py-2.5 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs sm:text-sm border border-surface-700/80 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all shadow-inner"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-1 cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Sort Options -->
      <div class="flex items-center gap-2">
        <label class="hidden sm:inline text-xs text-gray-400 font-semibold whitespace-nowrap">Sort:</label>
        <select 
          v-model="sortOrder"
          class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-surface-800 text-gray-300 text-xs sm:text-sm border border-surface-700/80 focus:outline-none focus:border-yellow-400 cursor-pointer">
          <option value="default">Default Order</option>
          <option value="price_asc">Price: Low to High (₱ ⬆)</option>
          <option value="price_desc">Price: High to Low (₱ ⬇)</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>

    <!-- Row 2: Category Filter Pills (Horizontal scrolling strip with icons and live counts) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
      <button 
        v-for="cat in categoryOptions" 
        :key="cat.name"
        @click="selectCat(cat.name)"
        type="button"
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 border"
        :class="selectedCategory === cat.name 
          ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-lg shadow-yellow-400/25 scale-[1.02]' 
          : 'bg-surface-800 text-gray-300 hover:bg-surface-700 hover:text-white border-surface-700/60'">
        <span>{{ cat.icon }}</span>
        <span>{{ cat.name }}</span>
        <span 
          class="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5"
          :class="selectedCategory === cat.name ? 'bg-black text-yellow-400' : 'bg-surface-700 text-gray-400'">
          {{ categoryCounts[cat.name] || 0 }}
        </span>
      </button>
    </div>

    <!-- Row 3: Secondary Filters: Stock Availability & Price Range Filter Chips -->
    <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-surface-800/80 text-xs">
      
      <!-- Filter Chips: Availability & Price -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] text-gray-400 font-bold uppercase tracking-wider mr-1">Filter:</span>
        
        <!-- Availability Toggle -->
        <button 
          @click="toggleAvailability"
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border"
          :class="availabilityFilter === 'in_stock' 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold' 
            : 'bg-surface-800 text-gray-400 hover:text-gray-200 border-surface-700/60'">
          <span class="w-1.5 h-1.5 rounded-full" :class="availabilityFilter === 'in_stock' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'"></span>
          <span>In Stock Only</span>
        </button>

        <!-- Price Range Chips -->
        <button 
          v-for="pFilter in priceOptions"
          :key="pFilter.id"
          @click="priceRangeFilter = pFilter.id"
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
          :class="priceRangeFilter === pFilter.id 
            ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50 font-bold' 
            : 'bg-surface-800 text-gray-400 hover:text-gray-200 border-surface-700/60'">
          <span>{{ pFilter.label }}</span>
        </button>
      </div>

      <!-- Active Filters Tag & Reset Button -->
      <div v-if="hasActiveFilters" class="flex items-center gap-2">
        <span class="text-[11px] text-gray-400">
          Showing <span class="text-yellow-400 font-bold">{{ filteredProducts.length }}</span> items
        </span>
        <button 
          @click="resetFilters"
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1">
          <i class="pi pi-filter-slash text-[10px]"></i>
          <span>Reset Filters</span>
        </button>
      </div>
    </div>

  </div>

  <!-- 4. MOBILE VIEW (PHONE ONLY: Not 1 Row, Multi-Column / Multi-Row Horizontal Layout) -->
  <div v-if="filteredProducts.length > 0" class="block md:hidden">
    
    <!-- Phone View Mode Switcher Header: 2-Column Grid vs 2-Row Slide -->
    <div class="flex items-center justify-between px-1 mb-3">
      <div class="flex items-center gap-1.5 text-xs text-gray-300 font-bold">
        <span>Items:</span>
        <span class="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-black text-xs border border-yellow-400/40">
          {{ filteredProducts.length }}
        </span>
        <span class="text-gray-500">•</span>
        <span class="text-gray-400 font-normal text-[11px]">{{ selectedCategory }}</span>
      </div>

      <!-- Layout Toggle: 2-Column Grid vs 2-Row Horizontal Slide -->
      <div class="flex items-center bg-surface-800/90 p-0.5 rounded-xl border border-surface-700">
        <button 
          @click="mobileViewMode = 'grid'"
          type="button"
          class="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          :class="mobileViewMode === 'grid' 
            ? 'bg-yellow-400 text-black shadow-md' 
            : 'text-gray-400 hover:text-gray-200'">
          <i class="pi pi-th-large text-[10px]"></i>
          <span>2-Col Grid</span>
        </button>
        <button 
          @click="mobileViewMode = 'slide'"
          type="button"
          class="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          :class="mobileViewMode === 'slide' 
            ? 'bg-yellow-400 text-black shadow-md' 
            : 'text-gray-400 hover:text-gray-200'">
          <i class="pi pi-arrows-h text-[10px]"></i>
          <span>2-Row Slide</span>
        </button>
      </div>
    </div>

    <!-- MODE A: 2-COLUMN GRID (Default: 2 items per row side-by-side, multiple rows visible) -->
    <div v-if="mobileViewMode === 'grid'" class="grid grid-cols-2 gap-2.5 sm:gap-3.5">
      <div 
        v-for="product in filteredProducts" 
        :key="'grid-' + product.id"
        class="rounded-2xl bg-surface-800/90 border border-surface-700/70 overflow-hidden flex flex-col justify-between shadow-lg hover:border-yellow-400/50 transition-all">
        
        <!-- Food Image with Quick Zoom & Stock Badge -->
        <div 
          @click="openImage(product)"
          class="relative h-28 sm:h-36 bg-surface-900 overflow-hidden flex items-center justify-center cursor-pointer select-none">
          <img 
            :src="product.image || '/assets/hero-banner.png'" 
            :alt="product.name"
            class="w-full h-full object-cover filter brightness-95"
            onerror="this.src='/assets/hero-banner.png'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

          <!-- Category Badge -->
          <span class="absolute top-1.5 left-1.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-surface-950/85 backdrop-blur-md text-gray-200 border border-surface-700 pointer-events-none">
            {{ product.category }}
          </span>
          <span v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white shadow animate-pulse pointer-events-none">
            {{ product.discount_percent }}% OFF
          </span>

          <!-- Enlarge Button -->
          <button 
            type="button"
            @click.stop="openImage(product)"
            class="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-surface-900/90 hover:bg-yellow-400 hover:text-black text-gray-200 flex items-center justify-center text-[9px] border border-surface-700 shadow backdrop-blur-md transition-all active:scale-95 z-10"
            title="Enlarge photo">
            <i class="pi pi-search-plus"></i>
          </button>

          <!-- Stock Pill -->
          <span 
            v-if="Number(product.max_portions) > 8"
            class="absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-700/50 backdrop-blur-sm pointer-events-none">
            {{ product.max_portions }} avail
          </span>
          <span 
            v-else-if="Number(product.max_portions) > 0"
            class="absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-600/60 backdrop-blur-sm animate-pulse pointer-events-none">
            Almost Out ({{ product.max_portions }} left)
          </span>
          <span 
            v-else
            class="absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-400 border border-rose-700/50 backdrop-blur-sm pointer-events-none">
            Sold Out
          </span>
        </div>

        <!-- Product Information & Action Button -->
        <div class="p-2.5 sm:p-3 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 class="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-snug" :title="product.name">
              {{ product.name }}
            </h3>

            <!-- Price -->
            <div class="mt-1 flex items-baseline gap-1.5 flex-wrap">
              <span v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="text-[10px] line-through text-gray-400 font-semibold">
                ₱{{ Number(product.original_price).toFixed(2) }}
              </span>
              <span class="text-xs sm:text-sm font-black" :class="product.original_price && Number(product.original_price) > Number(product.price) ? 'text-rose-400' : 'text-yellow-400'">
                ₱{{ Number(product.price).toFixed(2) }}
              </span>
              <span v-if="product.discount_percent > 0" class="text-[8px] font-black px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                -{{ product.discount_percent }}%
              </span>
            </div>

            <!-- Description -->
            <p class="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <!-- Add / Customize Action Button -->
          <div class="mt-2.5 pt-1.5 border-t border-surface-700/50">
            <button 
              v-if="Number(product.max_portions) <= 0 || product.is_available === false"
              disabled
              type="button"
              class="w-full py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs bg-surface-700 text-gray-500 cursor-not-allowed flex items-center justify-center gap-1">
              <i class="pi pi-ban text-[9px]"></i>
              <span>Unavailable</span>
            </button>
            <button 
              v-else-if="store.getRemainingStock(product) <= 0"
              disabled
              type="button"
              class="w-full py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs bg-surface-800 text-amber-400/70 border border-amber-500/30 cursor-not-allowed flex items-center justify-center gap-1">
              <i class="pi pi-check text-[9px]"></i>
              <span>Max in Cart</span>
            </button>
            <button 
              v-else
              @click="openCustomize(product)"
              type="button"
              class="w-full py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md active:scale-95">
              <i class="pi pi-plus text-[9px]"></i>
              <span>{{ product.category === 'Drinks' ? 'Customize' : 'Add' }}</span>
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- MODE B: 2-ROW HORIZONTAL SLIDE (Not 1 row! 2 rows sliding horizontally side-by-side) -->
    <div v-else class="space-y-2">
      <div class="flex items-center justify-between px-1 text-[11px] text-gray-400">
        <span class="flex items-center gap-1">
          <i class="pi pi-arrows-h text-yellow-400"></i>
          <span>Swipe horizontally (2 rows visible)</span>
        </span>
        <div class="flex items-center gap-1.5">
          <button 
            @click="scrollSlide('left')"
            type="button"
            class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 flex items-center justify-center text-[10px] active:scale-95 cursor-pointer">
            <i class="pi pi-chevron-left"></i>
          </button>
          <button 
            @click="scrollSlide('right')"
            type="button"
            class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 flex items-center justify-center text-[10px] active:scale-95 cursor-pointer">
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>

      <div 
        ref="slideTrackRef"
        class="grid grid-rows-2 grid-flow-col auto-cols-[165px] gap-2.5 overflow-x-auto pb-3 pt-1 px-0.5 no-scrollbar scroll-smooth">
        
        <div 
          v-for="product in filteredProducts" 
          :key="'slide-' + product.id"
          class="rounded-2xl bg-surface-800/90 border border-surface-700/70 overflow-hidden flex flex-col justify-between shadow-lg hover:border-yellow-400/50 transition-all">
          
          <!-- Image -->
          <div 
            @click="openImage(product)"
            class="relative h-24 bg-surface-900 overflow-hidden flex items-center justify-center cursor-pointer select-none">
            <img 
              :src="product.image || '/assets/hero-banner.png'" 
              :alt="product.name"
              class="w-full h-full object-cover filter brightness-95"
              onerror="this.src='/assets/hero-banner.png'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

            <span class="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.2 rounded bg-surface-950/85 text-gray-200 border border-surface-700">
              {{ product.category }}
            </span>

            <span 
              v-if="Number(product.max_portions) > 8"
              class="absolute bottom-1 left-1 text-[7px] font-bold px-1 py-0.2 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-700/50">
              {{ product.max_portions }} avail
            </span>
            <span 
              v-else-if="Number(product.max_portions) > 0"
              class="absolute bottom-1 left-1 text-[7px] font-bold px-1 py-0.2 rounded bg-amber-950/90 text-amber-300 border border-amber-600/60 animate-pulse">
              Low: {{ product.max_portions }} left
            </span>
            <span 
              v-else
              class="absolute bottom-1 left-1 text-[7px] font-bold px-1 py-0.2 rounded bg-rose-950/90 text-rose-400 border border-rose-700/50">
              Out
            </span>
          </div>

          <!-- Info -->
          <div class="p-2 flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 class="font-bold text-white text-[11px] line-clamp-1" :title="product.name">
                {{ product.name }}
              </h3>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="text-[9px] line-through text-gray-500">
                  ₱{{ Number(product.original_price).toFixed(2) }}
                </span>
                <p class="text-[11px] font-black" :class="product.original_price && Number(product.original_price) > Number(product.price) ? 'text-rose-400' : 'text-yellow-400'">
                  ₱{{ Number(product.price).toFixed(2) }}
                </p>
              </div>
            </div>

            <button 
              v-if="Number(product.max_portions) <= 0 || product.is_available === false"
              disabled
              type="button"
              class="mt-1.5 w-full py-1 rounded-lg font-bold text-[10px] bg-surface-700 text-gray-500 cursor-not-allowed flex items-center justify-center gap-1">
              <span>Sold Out</span>
            </button>
            <button 
              v-else-if="store.getRemainingStock(product) <= 0"
              disabled
              type="button"
              class="mt-1.5 w-full py-1 rounded-lg font-bold text-[10px] bg-surface-800 text-amber-400/70 border border-amber-500/30 cursor-not-allowed flex items-center justify-center gap-1">
              <span>Max in Cart</span>
            </button>
            <button 
              v-else
              @click="openCustomize(product)"
              type="button"
              class="mt-1.5 w-full py-1 rounded-lg font-bold text-[10px] bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow">
              <i class="pi pi-plus text-[8px]"></i>
              <span>Add</span>
            </button>
          </div>

        </div>

      </div>
    </div>

  </div>

  <!-- 5. DESKTOP / TABLET GRID VIEW (Hidden on Mobile Phone, Visible on Desktop/Tablet) -->
  <div v-if="filteredProducts.length > 0" class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div 
      v-for="product in filteredProducts" 
      :key="'desk-' + product.id"
      class="group rounded-2xl bg-surface-800/80 border border-surface-700/60 overflow-hidden flex flex-col justify-between hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300 transform hover:-translate-y-1">
      
      <!-- Food Image with Hover Overlay & Stock Pill -->
      <div 
        @click="openImage(product)"
        class="relative h-48 bg-surface-900 overflow-hidden flex items-center justify-center cursor-pointer group/image select-none"
        title="Click to view whole enlarged picture">
        <img 
          :src="product.image || '/assets/hero-banner.png'" 
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 group-hover/image:scale-110 transition-transform duration-500 filter brightness-95 group-hover/image:brightness-100"
          onerror="this.src='/assets/hero-banner.png'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent to-black/30 pointer-events-none"></div>

        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span class="px-3 py-1.5 rounded-xl bg-surface-950/90 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-xl backdrop-blur-md transform scale-95 group-hover/image:scale-100 transition-transform">
            <i class="pi pi-search-plus text-yellow-400"></i>
            <span>Enlarge Photo</span>
          </span>
        </div>

        <div v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg border border-rose-400/40 z-10 animate-pulse pointer-events-none">
          <i class="pi pi-bolt text-[10px]"></i>
          <span>{{ product.discount_percent }}% OFF</span>
        </div>
        <span class="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-900/80 backdrop-blur-md text-gray-200 border border-surface-700 pointer-events-none">
          {{ product.category }}
        </span>

        <button 
          type="button"
          @click.stop="openImage(product)"
          class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-surface-900/85 hover:bg-yellow-400 hover:text-black text-gray-200 flex items-center justify-center text-xs border border-surface-700 shadow-lg backdrop-blur-md transition-all hover:scale-110 z-10"
          title="View enlarged picture">
          <i class="pi pi-search-plus"></i>
        </button>

        <div class="absolute bottom-3 left-3 pointer-events-none">
          <span 
            v-if="Number(product.max_portions) > 8"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 backdrop-blur-md">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            In Stock ({{ product.max_portions }} avail)
          </span>
          <span 
            v-else-if="Number(product.max_portions) > 0"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/85 text-amber-300 border border-amber-600/60 backdrop-blur-md">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Almost Out ({{ product.max_portions }} left)
          </span>
          <span 
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/80 text-rose-400 border border-rose-700/50 backdrop-blur-md">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Sold Out
          </span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 class="font-bold text-white text-base sm:text-lg group-hover:text-yellow-400 transition-colors">
              {{ product.name }}
            </h3>
            <div class="text-right shrink-0">
              <span v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="block text-xs line-through text-gray-500 font-semibold leading-none">
                ₱{{ Number(product.original_price).toFixed(2) }}
              </span>
              <span class="text-base sm:text-lg font-black whitespace-nowrap" :class="product.original_price && Number(product.original_price) > Number(product.price) ? 'text-rose-400' : 'text-yellow-400'">
                ₱{{ Number(product.price).toFixed(2) }}
              </span>
            </div>
          </div>
          <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {{ product.description }}
          </p>

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

        <div class="pt-2">
          <button 
            v-if="Number(product.max_portions) <= 0 || product.is_available === false"
            disabled
            type="button"
            class="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-surface-700 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2">
            <i class="pi pi-ban text-xs"></i>
            <span>Unavailable</span>
          </button>
          <button 
            v-else-if="store.getRemainingStock(product) <= 0"
            disabled
            type="button"
            class="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-surface-800 text-amber-400/70 border border-amber-500/30 cursor-not-allowed flex items-center justify-center gap-2">
            <i class="pi pi-check text-xs"></i>
            <span>Max Stock in Cart ({{ product.max_portions }}/{{ product.max_portions }})</span>
          </button>
          <button 
            v-else
            @click="openCustomize(product)"
            type="button"
            class="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98">
            <i class="pi pi-plus text-xs"></i>
            <span>{{ product.category === 'Drinks' ? 'Customize & Add' : 'Add to Cart' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- 6. EMPTY STATE -->
  <div v-if="filteredProducts.length === 0" class="text-center py-16 bg-surface-800/40 rounded-3xl border border-surface-700/50 p-6">
    <i class="pi pi-search text-4xl text-gray-600 mb-3 block"></i>
    <p class="text-base sm:text-lg font-bold text-gray-300">No products match your filters</p>
    <p class="text-xs text-gray-500 mt-1">Try switching category, adjusting the price filter, or clearing the search query.</p>
    <button 
      @click="resetFilters"
      type="button"
      class="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all cursor-pointer">
      Reset All Filters
    </button>
  </div>

  <!-- 7. FLOATING QUICK CART PILL (Bottom Mobile) -->
  <div 
    v-if="isStandalonePage && store.cartCount > 0" 
    class="fixed bottom-20 left-4 right-4 z-30 max-w-md mx-auto block lg:hidden">
    <button 
      @click="store.cartOpen = true"
      type="button"
      class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-black text-xs sm:text-sm flex items-center justify-between shadow-2xl hover:brightness-105 active:scale-98 transition-all cursor-pointer">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-black text-yellow-400 flex items-center justify-center text-xs font-black">
          {{ store.cartCount }}
        </span>
        <span>View Shopping Cart</span>
      </div>
      <div class="flex items-center gap-2 font-black">
        <span>₱{{ store.cartTotal.toFixed(2) }}</span>
        <i class="pi pi-arrow-right text-xs"></i>
      </div>
    </button>
  </div>

</section>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';

// G Shot Teas — Menu Section & Standalone Page Component (Supports Mobile Multi-Row/Column View)
export default {
  name: 'MenuSection',
  props: {
    isStandalonePage: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useGShotStore();
    
    const categoryOptions = [
      { name: 'All', icon: '🍽️' },
      { name: 'Drinks', icon: '🧋' },
      { name: 'Burgers', icon: '🍔' },
      { name: 'Pizzas', icon: '🍕' },
      { name: 'RiceMeals', icon: '🍗' },
      { name: 'Sides', icon: '🍟' },
      { name: 'Coffee', icon: '☕' },
    ];

    const priceOptions = [
      { id: 'all', label: 'All ₱' },
      { id: 'under100', label: '< ₱100' },
      { id: '100to150', label: '₱100 - ₱150' },
      { id: 'over150', label: '₱150+' },
    ];
    
    const selectedCategory = ref('All');
    const searchQuery = ref('');
    const sortOrder = ref('default');
    const availabilityFilter = ref('all'); // 'all' | 'in_stock'
    const priceRangeFilter = ref('all'); // 'all' | 'under100' | '100to150' | 'over150'
    const mobileViewMode = ref('grid'); // 'grid' (2-column grid) | 'slide' (2-row horizontal slide)
    const slideTrackRef = ref(null);

    const categoryCounts = computed(() => {
      const counts = { All: 0 };
      if (!store.products || !Array.isArray(store.products)) return counts;
      counts.All = store.products.length;
      for (const p of store.products) {
        if (p.category) {
          counts[p.category] = (counts[p.category] || 0) + 1;
        }
      }
      return counts;
    });

    const filteredProducts = computed(() => {
      if (!store.products || !Array.isArray(store.products)) {
        return [];
      }
      let list = [...store.products];

      // 1. Category Filter
      if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
      }

      // 2. Search Query
      if (searchQuery.value && searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.recipes && p.recipes.some(r => (r.ingredient?.name || r.ingredient_id || '').toLowerCase().includes(q)))
        );
      }

      // 3. Stock Availability Filter
      if (availabilityFilter.value === 'in_stock') {
        list = list.filter(p => (Number(p.max_portions) > 0 || p.is_available));
      }

      // 4. Price Range Filter
      if (priceRangeFilter.value === 'under100') {
        list = list.filter(p => Number(p.price) < 100);
      } else if (priceRangeFilter.value === '100to150') {
        list = list.filter(p => Number(p.price) >= 100 && Number(p.price) <= 150);
      } else if (priceRangeFilter.value === 'over150') {
        list = list.filter(p => Number(p.price) > 150);
      }

      // 5. Sorting
      if (sortOrder.value === 'price_asc') {
        list.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortOrder.value === 'price_desc') {
        list.sort((a, b) => Number(b.price) - Number(a.price));
      } else if (sortOrder.value === 'name_asc') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }

      return list;
    });

    const hasActiveFilters = computed(() => {
      return selectedCategory.value !== 'All' ||
        searchQuery.value.trim() !== '' ||
        availabilityFilter.value !== 'all' ||
        priceRangeFilter.value !== 'all' ||
        sortOrder.value !== 'default';
    });

    const selectCat = (catName) => {
      selectedCategory.value = catName;
      if (slideTrackRef.value) {
        slideTrackRef.value.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    const toggleAvailability = () => {
      availabilityFilter.value = availabilityFilter.value === 'in_stock' ? 'all' : 'in_stock';
    };

    const resetFilters = () => {
      selectedCategory.value = 'All';
      searchQuery.value = '';
      availabilityFilter.value = 'all';
      priceRangeFilter.value = 'all';
      sortOrder.value = 'default';
      if (slideTrackRef.value) {
        slideTrackRef.value.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    const scrollSlide = (direction) => {
      if (!slideTrackRef.value) return;
      const delta = direction === 'left' ? -320 : 320;
      slideTrackRef.value.scrollBy({ left: delta, behavior: 'smooth' });
    };

    watch([selectedCategory, searchQuery, availabilityFilter, priceRangeFilter, sortOrder], () => {
      if (slideTrackRef.value) {
        slideTrackRef.value.scrollTo({ left: 0, behavior: 'smooth' });
      }
    });

    const goBackHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openCustomize = (product) => {
      const maxStock = store.getProductMaxStock(product);
      if (maxStock <= 0) {
        store.notify(`${product.name} is currently sold out.`, 'error');
        return;
      }
      if (store.getRemainingStock(product) <= 0) {
        store.notify(`Cannot add more ${product.name}. Only ${maxStock} stock${maxStock === 1 ? '' : 's'} available and you already have them in your cart.`, 'warning');
        return;
      }
      store.selectedProductForCustomize = product;
      store.customizeModalOpen = true;
    };

    const openImage = (product) => {
      store.openProductPreview(product);
    };

    return {
      store,
      categoryOptions,
      priceOptions,
      selectedCategory,
      searchQuery,
      sortOrder,
      availabilityFilter,
      priceRangeFilter,
      mobileViewMode,
      slideTrackRef,
      categoryCounts,
      filteredProducts,
      hasActiveFilters,
      selectCat,
      toggleAvailability,
      resetFilters,
      scrollSlide,
      goBackHome,
      openCustomize,
      openImage,
    };
  },
};
</script>
