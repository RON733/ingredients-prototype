<template>
<div class="space-y-6">
      
      <!-- Top Header & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-box"></i> MENU & PRICING MANAGEMENT
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Product Menu</h2>
          <p class="text-xs text-gray-400">Manage menu items, toggle stock availability, and configure promotional discounts.</p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Manage Discounts Button (Staff, Admin, Super Admin) -->
          <button 
            @click="openDiscountModal('category', 'Burgers')"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95">
            <i class="pi pi-percentage"></i>
            <span>Discounts & Promos</span>
            <span v-if="store.discountedProductsCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/40 text-amber-300 ml-1 border border-white/20">
              {{ store.discountedProductsCount }} ON SALE
            </span>
          </button>

          <!-- Add Product Button (Admin / Super Admin) -->
          <button 
            v-if="store.isAdminOrSuper"
            @click="openAddModal"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95">
            <i class="pi pi-plus"></i>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <!-- Active Discounts Quick Banner -->
      <div 
        v-if="store.discountedProductsCount > 0" 
        class="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-amber-950/50 to-surface-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
            <i class="pi pi-tag text-base animate-pulse"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-rose-300 uppercase tracking-wide">Promotional Discounts Active</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {{ store.discountedProductsCount }} items discounted
              </span>
            </div>
            <p class="text-[11px] text-gray-300 mt-0.5">
              Customers currently see promo prices across the storefront and will be billed at discounted rates.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="openDiscountModal('all')"
            class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <i class="pi pi-sliders-h text-[11px] text-amber-400"></i>
            <span>Configure</span>
          </button>
          <button 
            @click="quickResetAllDiscounts"
            :disabled="isProcessingDiscount"
            class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50">
            <i class="pi" :class="isProcessingDiscount ? 'pi-spin pi-spinner' : 'pi-times-circle'"></i>
            <span>Clear All Discounts</span>
          </button>
        </div>
      </div>

      <!-- Controls: Category Pills, Search, and Sort -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5"
            :class="selectedCategory === cat 
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold shadow-sm' 
              : 'bg-surface-850/80 text-neutral-400 hover:text-white border-surface-750/60'">
            <span>{{ cat }}</span>
            <span v-if="categoryDiscountCount(cat) > 0" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Discount active in this section"></span>
          </button>
        </div>

        <!-- Search Bar and Sort -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="relative w-56 sm:w-64">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search menu..." 
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs border border-surface-700 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select 
            v-model="sortOrder"
            class="px-3.5 py-2 rounded-xl bg-surface-800 text-gray-300 text-xs border border-surface-700 focus:outline-none focus:border-brand-500 cursor-pointer">
            <option value="default">Sort by Default</option>
            <option value="discounted_first">Discounted / On Sale First</option>
            <option value="price_asc">Sort by Price: Low</option>
            <option value="price_desc">Sort by Price: High</option>
          </select>
        </div>

      </div>
      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="rounded-3xl bg-surface-800/90 border overflow-hidden flex flex-col justify-between shadow-xl transition-all"
          :class="isProductDiscounted(product) ? 'border-rose-500/40 hover:border-rose-400 shadow-rose-950/20 ring-1 ring-rose-500/20' : 'border-surface-700 hover:border-surface-600'">
          
          <!-- Image Container -->
          <div class="relative h-44 bg-surface-900 overflow-hidden flex items-center justify-center">
            <img 
              :src="product.image || '/assets/hero-banner.png'" 
              :alt="product.name"
              class="w-full h-full object-cover filter brightness-90"
              onerror="this.src='/assets/hero-banner.png'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent"></div>

            <span v-if="product.emoji && !product.emoji.includes('?')" class="absolute top-3 left-3 text-2xl drop-shadow-md">
              {{ product.emoji }}
            </span>

            <!-- Discount Ribbon / Badge -->
            <div v-if="isProductDiscounted(product)" class="absolute top-3 left-12 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md border border-rose-400/30 animate-pulse">
              <i class="pi pi-bolt text-[9px]"></i>
              <span>{{ product.discount_percent }}% OFF</span>
            </div>

            <span class="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-900/80 text-gray-300 border border-surface-700">
              {{ product.category }}
            </span>
          </div>

          <!-- Product Details -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-white text-base leading-snug">{{ product.name }}</h3>
                <div class="text-right shrink-0">
                  <div v-if="isProductDiscounted(product)" class="flex flex-col items-end">
                    <span class="text-[11px] line-through text-gray-400 font-semibold leading-none">
                      ₱{{ Number(product.original_price).toFixed(2) }}
                    </span>
                    <span class="font-black text-rose-400 text-base whitespace-nowrap mt-0.5">
                      ₱{{ Number(product.price).toFixed(2) }}
                    </span>
                  </div>
                  <span v-else class="font-black text-brand-400 text-base whitespace-nowrap">
                    ₱{{ Number(product.price).toFixed(2) }}
                  </span>
                </div>
              </div>

              <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {{ product.description }}
              </p>

              <!-- Stock & Max Portions Badge -->
              <div class="mt-3 flex items-center justify-between text-[11px] bg-surface-900/60 p-2 rounded-xl border border-surface-700/60">
                <span class="text-gray-400">Available Portions:</span>
                <span class="font-bold" :class="product.max_portions > 3 ? 'text-emerald-400' : (product.max_portions > 0 ? 'text-amber-400' : 'text-rose-400')">
                  {{ product.max_portions }} portions
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2 pt-2 border-t border-surface-700">
              <!-- Availability Toggle -->
              <button 
                @click="toggleAvailability(product)"
                class="w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                :class="product.is_available ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30'">
                <i class="pi" :class="product.is_available ? 'pi-check' : 'pi-ban'"></i>
                <span>{{ product.is_available ? 'Status: Available' : 'Status: Out of Stock' }}</span>
              </button>

              <div class="flex items-center gap-2">
                <!-- Single Product Discount Trigger -->
                <button 
                  @click="openDiscountModal('single', product)"
                  class="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border"
                  :class="isProductDiscounted(product) 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40' 
                    : 'bg-surface-700 hover:bg-surface-650 text-gray-300 border-surface-650'">
                  <i class="pi pi-percentage text-[10px]"></i>
                  <span>{{ isProductDiscounted(product) ? 'Edit Promo' : 'Discount' }}</span>
                </button>

                <!-- Quick Remove Discount if active -->
                <button 
                  v-if="isProductDiscounted(product)"
                  @click="quickRemoveDiscount(product)"
                  class="p-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                  title="Remove discount & restore original price">
                  <i class="pi pi-times text-[10px]"></i>
                </button>

                <!-- Edit Product Details -->
                <button 
                  @click="openEditModal(product)"
                  class="p-2 rounded-xl text-xs font-semibold bg-surface-700 hover:bg-surface-600 text-gray-200 transition-colors cursor-pointer"
                  title="Edit product details">
                  <i class="pi pi-pencil text-[11px]"></i>
                </button>

                <!-- Delete Product (Admin / Super Admin) -->
                <button 
                  v-if="store.isAdminOrSuper"
                  @click="deleteProduct(product)"
                  class="p-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                  title="Delete product">
                  <i class="pi pi-trash text-[11px]"></i>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
      <!-- ================= DISCOUNT MANAGER MODAL ================= -->
      <div v-if="discountModalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="w-full max-w-xl bg-surface-900 border border-surface-700 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-start border-b border-surface-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <i class="pi pi-percentage text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-black text-white">Menu Discount Manager</h3>
                <p class="text-xs text-gray-400">Discount a specific product, a category (like all burgers), or the entire menu.</p>
              </div>
            </div>
            <button @click="discountModalOpen = false" class="text-gray-400 hover:text-white p-1 cursor-pointer">✕</button>
          </div>

          <!-- Scope Selection Tabs -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300">
              1. Select Discount Target Scope
            </label>
            <div class="grid grid-cols-3 gap-2 p-1 bg-surface-800 rounded-2xl border border-surface-700">
              <button 
                type="button"
                @click="setDiscountScope('single')"
                class="py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                :class="discountForm.scope === 'single' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-gray-400 hover:text-white'">
                <i class="pi pi-box text-xs"></i>
                <span>Certain Product</span>
              </button>

              <button 
                type="button"
                @click="setDiscountScope('category')"
                class="py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                :class="discountForm.scope === 'category' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-gray-400 hover:text-white'">
                <i class="pi pi-th-large text-xs"></i>
                <span>Product Section</span>
              </button>

              <button 
                type="button"
                @click="setDiscountScope('all')"
                class="py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                :class="discountForm.scope === 'all' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-gray-400 hover:text-white'">
                <i class="pi pi-globe text-xs"></i>
                <span>All Products</span>
              </button>
            </div>
          </div>

          <!-- Scope Target Options: Product Dropdown or Category Pills -->
          <div class="space-y-2">
            <!-- If Scope == single: Product Dropdown -->
            <div v-if="discountForm.scope === 'single'" class="space-y-1.5 animate-fade-in">
              <label class="block text-xs text-gray-400 font-semibold">Choose Product to Discount</label>
              <select 
                v-model="discountForm.product_id"
                class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer">
                <option v-for="p in store.products" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.category }}) — Base: ₱{{ Number(sampleBasePrice(p)).toFixed(2) }} {{ isProductDiscounted(p) ? ' [ON SALE]' : '' }}
                </option>
              </select>
            </div>

            <!-- If Scope == category: Section Pills & Dropdown -->
            <div v-if="discountForm.scope === 'category'" class="space-y-2 animate-fade-in">
              <label class="block text-xs text-gray-400 font-semibold">Choose Section to Discount (e.g. All Burgers)</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  v-for="cat in productCategories" 
                  :key="cat"
                  type="button"
                  @click="discountForm.category = cat"
                  class="p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer"
                  :class="discountForm.category === cat ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' : 'bg-surface-800 text-gray-400 hover:text-white border-surface-700'">
                  <span>All {{ cat }}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-700 text-gray-300">
                    {{ countInCategory(cat) }} items
                  </span>
                </button>
              </div>
            </div>

            <!-- If Scope == all: Informational Note -->
            <div v-if="discountForm.scope === 'all'" class="p-3 rounded-xl bg-surface-800/80 border border-surface-700 text-xs text-gray-300 flex items-center gap-2 animate-fade-in">
              <i class="pi pi-info-circle text-amber-400 text-base shrink-0"></i>
              <span>This discount will be applied storewide to <strong>all {{ store.products.length }} products</strong> across all categories.</span>
            </div>
          </div>

          <!-- Discount Method & Value -->
          <div class="space-y-2 border-t border-surface-800 pt-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300">
              2. Discount Rate & Type
            </label>
            
            <div class="flex items-center gap-2">
              <div class="flex bg-surface-800 p-1 rounded-xl border border-surface-700">
                <button 
                  type="button"
                  @click="discountForm.discount_type = 'percentage'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="discountForm.discount_type === 'percentage' ? 'bg-amber-500 text-neutral-950' : 'text-gray-400 hover:text-white'">
                  % Percentage
                </button>
                <button 
                  type="button"
                  @click="discountForm.discount_type = 'fixed'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  :class="discountForm.discount_type === 'fixed' ? 'bg-amber-500 text-neutral-950' : 'text-gray-400 hover:text-white'">
                  ₱ Fixed Amount
                </button>
              </div>

              <!-- Input for custom value -->
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  {{ discountForm.discount_type === 'percentage' ? '%' : '₱' }}
                </span>
                <input 
                  v-model.number="discountForm.discount_value" 
                  type="number" 
                  min="1" 
                  :max="discountForm.discount_type === 'percentage' ? 99 : 1000"
                  class="w-full pl-7 pr-3 py-2 rounded-xl bg-surface-800 border border-surface-700 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Discount value"
                />
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-1.5 flex-wrap pt-1">
              <span class="text-[10px] text-gray-400 uppercase font-semibold">Quick Presets:</span>
              <template v-if="discountForm.discount_type === 'percentage'">
                <button 
                  v-for="pct in [10, 15, 20, 25, 30, 50]" 
                  :key="pct"
                  type="button"
                  @click="discountForm.discount_value = pct"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer"
                  :class="discountForm.discount_value === pct ? 'bg-rose-500 text-white border-rose-400' : 'bg-surface-800 text-gray-300 border-surface-700 hover:border-gray-500'">
                  {{ pct }}% OFF
                </button>
              </template>
              <template v-else>
                <button 
                  v-for="amt in [10, 20, 30, 50]" 
                  :key="amt"
                  type="button"
                  @click="discountForm.discount_value = amt"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer"
                  :class="discountForm.discount_value === amt ? 'bg-rose-500 text-white border-rose-400' : 'bg-surface-800 text-gray-300 border-surface-700 hover:border-gray-500'">
                  ₱{{ amt }} OFF
                </button>
              </template>
            </div>
          </div>

          <!-- Live Impact Preview Box -->
          <div class="p-3.5 rounded-2xl bg-surface-850 border border-surface-750 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-gray-300">Target Preview:</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {{ targetProductsList.length }} product(s) affected
              </span>
            </div>

            <!-- Preview sample items -->
            <div class="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar pt-1">
              <div 
                v-for="sample in targetProductsList.slice(0, 4)" 
                :key="sample.id"
                class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface-900/60 border border-surface-800">
                <span class="text-white truncate max-w-[200px]">{{ sample.name }}</span>
                <div class="flex items-center gap-2 font-mono">
                  <span class="line-through text-gray-500 text-[11px]">₱{{ Number(sampleBasePrice(sample)).toFixed(2) }}</span>
                  <span class="pi pi-arrow-right text-[9px] text-gray-500"></span>
                  <span class="text-amber-400 font-bold">₱{{ calculatePreviewPrice(sampleBasePrice(sample)).toFixed(2) }}</span>
                </div>
              </div>
              <p v-if="targetProductsList.length > 4" class="text-[10px] text-gray-400 text-center italic">
                + {{ targetProductsList.length - 4 }} more products will be updated
              </p>
            </div>
          </div>

          <!-- Currently Discounted Items List & Quick Remove (in modal) -->
          <div v-if="currentlyDiscountedProducts.length > 0" class="border-t border-surface-800 pt-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Currently Active Promos ({{ currentlyDiscountedProducts.length }})
              </span>
              <button 
                type="button" 
                @click="showActivePromosList = !showActivePromosList" 
                class="text-[11px] text-amber-400 hover:underline">
                {{ showActivePromosList ? 'Hide List' : 'View List' }}
              </button>
            </div>

            <div v-if="showActivePromosList" class="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              <div 
                v-for="item in currentlyDiscountedProducts" 
                :key="'disc-' + item.id"
                class="flex items-center justify-between p-2 rounded-xl bg-surface-800/60 border border-surface-700/60 text-xs">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span class="text-white font-medium truncate">{{ item.name }}</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                    {{ item.discount_percent }}% OFF
                  </span>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="font-mono text-amber-400 font-bold">₱{{ Number(item.price).toFixed(2) }}</span>
                  <button 
                    type="button" 
                    @click="quickRemoveDiscount(item)"
                    class="text-rose-400 hover:text-white p-1 text-[11px]"
                    title="Remove discount for this product">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-between gap-3 pt-3 border-t border-surface-800 flex-wrap">
            <button 
              type="button"
              @click="removeScopeDiscount"
              :disabled="isProcessingDiscount"
              class="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50">
              Remove Discount for {{ discountForm.scope === 'all' ? 'All Menu' : (discountForm.scope === 'category' ? discountForm.category : 'Selected Item') }}
            </button>

            <div class="flex items-center gap-2">
              <button 
                type="button"
                @click="discountModalOpen = false" 
                class="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white">
                Cancel
              </button>
              <button 
                type="button"
                @click="applyDiscountSubmit"
                :disabled="isProcessingDiscount || !discountForm.discount_value"
                class="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 active:scale-95">
                <i class="pi" :class="isProcessingDiscount ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                <span>Apply Discount</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      <!-- ================= ADD / EDIT PRODUCT MODAL ================= -->
      <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center border-b border-surface-700 pb-3">
            <h3 class="text-lg font-black text-white">
              {{ isEditing ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <button @click="modalOpen = false" class="text-gray-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-gray-400 mb-1">Product Name</label>
              <input v-model="form.name" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="e.g. Avocado Boba Milk" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Category</label>
                <select v-model="form.category" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white">
                  <option value="Drinks">Drinks</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="RiceMeals">RiceMeals</option>
                  <option value="Sides">Sides</option>
                  <option value="Coffee">Coffee</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Regular Base Price (₱)</label>
                <input v-model.number="form.base_price" type="number" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>

            <!-- Discount field in Edit Modal -->
            <div class="p-3 rounded-xl bg-surface-800/80 border border-surface-700 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-gray-300">Discount & Promo (% Off)</span>
                <span v-if="form.discount_percent > 0" class="text-rose-400 font-bold">
                  Selling Price: ₱{{ (form.base_price * (1 - form.discount_percent / 100)).toFixed(2) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-gray-400 mb-0.5 text-[11px]">Discount Percent (%)</label>
                  <input 
                    v-model.number="form.discount_percent" 
                    type="number" 
                    min="0" 
                    max="99" 
                    class="w-full p-2 rounded-xl bg-surface-900 border border-surface-700 text-white"
                    placeholder="0 = No discount" 
                  />
                </div>
                <div>
                  <label class="block text-gray-400 mb-0.5 text-[11px]">Preview Selling Price</label>
                  <div class="w-full p-2 rounded-xl bg-surface-900 border border-surface-700 text-amber-400 font-bold">
                    ₱{{ form.discount_percent > 0 ? (form.base_price * (1 - form.discount_percent / 100)).toFixed(2) : Number(form.base_price || 0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-gray-400 mb-1">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-surface-700">
            <button @click="modalOpen = false" class="px-4 py-2 text-xs text-gray-400">Cancel</button>
            <button @click="saveProduct" class="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95">
              {{ isEditing ? 'Save Changes' : 'Create Product' }}
            </button>
          </div>
        </div>
      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

export default {
  name: 'AdminProductsTab',
  setup() {
    const store = useGShotStore();
    const categories = ['All', 'Drinks', 'Burgers', 'Pizzas', 'RiceMeals', 'Sides', 'Coffee'];
    const productCategories = ['Burgers', 'Drinks', 'Pizzas', 'RiceMeals', 'Sides', 'Coffee'];
    const selectedCategory = ref('All');
    const searchQuery = ref('');
    const sortOrder = ref('default');

    const modalOpen = ref(false);
    const isEditing = ref(false);
    const editingId = ref(null);

    const form = reactive({
      name: '',
      category: 'Drinks',
      base_price: 99,
      discount_percent: 0,
      description: '',
      emoji: '🧋',
    });

    // Discount Manager State
    const discountModalOpen = ref(false);
    const isProcessingDiscount = ref(false);
    const showActivePromosList = ref(false);

    const discountForm = reactive({
      scope: 'category', // 'single' | 'category' | 'all'
      category: 'Burgers',
      product_id: '',
      discount_type: 'percentage', // 'percentage' | 'fixed'
      discount_value: 20,
    });

    const isProductDiscounted = (product) => {
      if (!product) return false;
      const orig = Number(product.original_price || 0);
      const curr = Number(product.price || 0);
      const pct = Number(product.discount_percent || 0);
      return (orig > curr && pct > 0) || Boolean(product.is_discounted);
    };

    const categoryDiscountCount = (cat) => {
      if (!store.products || !Array.isArray(store.products)) return 0;
      if (cat === 'All') return store.discountedProductsCount;
      return store.products.filter(p => p.category === cat && isProductDiscounted(p)).length;
    };

    const countInCategory = (cat) => {
      if (!store.products || !Array.isArray(store.products)) return 0;
      return store.products.filter(p => p.category === cat).length;
    };

    const currentlyDiscountedProducts = computed(() => {
      if (!store.products || !Array.isArray(store.products)) return [];
      return store.products.filter(p => isProductDiscounted(p));
    });

    const targetProductsList = computed(() => {
      if (!store.products || !Array.isArray(store.products)) return [];
      if (discountForm.scope === 'single') {
        const found = store.products.find(p => p.id === discountForm.product_id);
        return found ? [found] : [];
      }
      if (discountForm.scope === 'category') {
        return store.products.filter(p => p.category === discountForm.category);
      }
      return store.products;
    });

    const sampleBasePrice = (product) => {
      if (!product) return 0;
      return (product.original_price && Number(product.original_price) > 0)
        ? Number(product.original_price)
        : Number(product.price);
    };

    const calculatePreviewPrice = (base) => {
      const val = Number(discountForm.discount_value || 0);
      if (discountForm.discount_type === 'percentage') {
        const pct = Math.min(99, Math.max(1, val));
        return Math.round(base * (1 - pct / 100) * 100) / 100;
      } else {
        return Math.max(0, Math.round((base - val) * 100) / 100);
      }
    };

    const setDiscountScope = (scope) => {
      discountForm.scope = scope;
      if (scope === 'single' && !discountForm.product_id && store.products.length > 0) {
        discountForm.product_id = store.products[0].id;
      }
    };

    const openDiscountModal = (scope = 'all', target = null) => {
      discountForm.scope = scope;
      discountForm.discount_type = 'percentage';
      discountForm.discount_value = 20;

      if (scope === 'single' && target) {
        discountForm.product_id = target.id;
        discountForm.category = target.category;
        if (target.discount_percent > 0) {
          discountForm.discount_value = target.discount_percent;
        }
      } else if (scope === 'category' && typeof target === 'string') {
        discountForm.category = target;
      } else if (scope === 'category' && !target) {
        discountForm.category = 'Burgers';
      } else if (!discountForm.product_id && store.products.length > 0) {
        discountForm.product_id = store.products[0].id;
      }

      discountModalOpen.value = true;
    };

    const applyDiscountSubmit = async () => {
      if (!discountForm.discount_value || discountForm.discount_value <= 0) {
        store.notify('Please provide a valid discount value.', 'error');
        return;
      }

      isProcessingDiscount.value = true;
      try {
        await store.applyDiscount({ ...discountForm });
        discountModalOpen.value = false;
      } catch (err) {
        // notification already fired in store
      } finally {
        isProcessingDiscount.value = false;
      }
    };

    const removeScopeDiscount = async () => {
      isProcessingDiscount.value = true;
      try {
        await store.removeDiscount({
          scope: discountForm.scope,
          product_id: discountForm.product_id,
          category: discountForm.category,
        });
        discountModalOpen.value = false;
      } catch (err) {
        // handled in store
      } finally {
        isProcessingDiscount.value = false;
      }
    };

    const quickRemoveDiscount = async (product) => {
      try {
        await store.removeDiscount({
          scope: 'single',
          product_id: product.id,
        });
      } catch (err) {
        // handled in store
      }
    };

    const quickResetAllDiscounts = async () => {
      if (!confirm('Are you sure you want to clear all discounts and restore normal prices across the entire menu?')) return;
      isProcessingDiscount.value = true;
      try {
        await store.removeDiscount({ scope: 'all' });
      } catch (err) {
        // handled in store
      } finally {
        isProcessingDiscount.value = false;
      }
    };

    const filteredProducts = computed(() => {
      let list = [...store.products];

      if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(p => p.name.toLowerCase().includes(q));
      }

      if (sortOrder.value === 'discounted_first') {
        list.sort((a, b) => (isProductDiscounted(b) ? 1 : 0) - (isProductDiscounted(a) ? 1 : 0));
      } else if (sortOrder.value === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sortOrder.value === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      }

      return list;
    });

    const toggleAvailability = async (product) => {
      try {
        await GST_API.toggleProductAvailability(product.id);
        store.notify(`Toggled availability for ${product.name}`);
        store.fetchProducts();
      } catch (err) {
        store.notify('Error toggling availability', 'error');
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      form.name = '';
      form.category = 'Drinks';
      form.base_price = 79;
      form.discount_percent = 0;
      form.description = '';
      form.emoji = '🧋';
      modalOpen.value = true;
    };

    const openEditModal = (product) => {
      isEditing.value = true;
      editingId.value = product.id;
      form.name = product.name;
      form.category = product.category;
      form.base_price = (product.original_price && Number(product.original_price) > 0)
        ? Number(product.original_price)
        : Number(product.price);
      form.discount_percent = Number(product.discount_percent || 0);
      form.description = product.description;
      form.emoji = product.emoji || '🍽️';
      modalOpen.value = true;
    };

    const saveProduct = async () => {
      if (!form.name.trim()) return;

      try {
        const basePrice = Number(form.base_price);
        const discountPct = Number(form.discount_percent || 0);
        let finalPrice = basePrice;
        let originalPrice = null;

        if (discountPct > 0) {
          finalPrice = Math.round(basePrice * (1 - discountPct / 100) * 100) / 100;
          originalPrice = basePrice;
        }

        const payload = {
          name: form.name,
          category: form.category,
          price: finalPrice,
          original_price: originalPrice,
          discount_percent: discountPct,
          discount_type: discountPct > 0 ? 'percentage' : null,
          discount_value: discountPct > 0 ? discountPct : 0,
          description: form.description,
          emoji: form.emoji,
        };

        if (isEditing.value) {
          await GST_API.updateProduct(editingId.value, payload);
          store.notify('Product updated successfully!');
        } else {
          const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await GST_API.createProduct({
            id: slug,
            ...payload,
          });
          store.notify('New product created!');
        }
        modalOpen.value = false;
        store.fetchProducts();
      } catch (err) {
        store.notify('Failed to save product.', 'error');
      }
    };

    const deleteProduct = async (product) => {
      if (!confirm(`Delete ${product.name}?`)) return;
      try {
        await GST_API.deleteProduct(product.id);
        store.notify(`${product.name} removed from menu`);
        store.fetchProducts();
      } catch (err) {
        store.notify('Failed to delete product', 'error');
      }
    };

    return {
      store,
      categories,
      productCategories,
      selectedCategory,
      searchQuery,
      sortOrder,
      filteredProducts,
      modalOpen,
      isEditing,
      form,
      toggleAvailability,
      openAddModal,
      openEditModal,
      saveProduct,
      deleteProduct,

      // Discounts
      discountModalOpen,
      isProcessingDiscount,
      showActivePromosList,
      discountForm,
      isProductDiscounted,
      categoryDiscountCount,
      countInCategory,
      currentlyDiscountedProducts,
      targetProductsList,
      sampleBasePrice,
      calculatePreviewPrice,
      setDiscountScope,
      openDiscountModal,
      applyDiscountSubmit,
      removeScopeDiscount,
      quickRemoveDiscount,
      quickResetAllDiscounts,
    };
  },
};
</script>
