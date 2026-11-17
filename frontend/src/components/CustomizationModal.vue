<template>
<div 
      v-if="store.customizeModalOpen && product" 
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click.self="close">
      
      <div class="relative w-full max-w-lg bg-surface-800 rounded-3xl border border-surface-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header with Product Thumbnail (Click to view full enlarged photo) -->
        <div 
          @click="store.openProductPreview(product)"
          class="relative h-44 bg-surface-900 overflow-hidden flex items-end p-5 cursor-pointer group/hdr select-none"
          title="Click to view whole enlarged picture">
          <img 
            :src="product.image || '/assets/hero-banner.png'" 
            :alt="product.name" 
            class="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] group-hover/hdr:brightness-[0.55] transition-all duration-300"
            onerror="this.src='/assets/hero-banner.png'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent pointer-events-none"></div>
          
          <!-- Enlarge Button Badge -->
          <button 
            type="button"
            @click.stop="store.openProductPreview(product)"
            class="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-surface-900/80 hover:bg-brand-600 text-gray-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 border border-surface-700 transition-all shadow-md backdrop-blur-md z-10"
            title="View whole enlarged picture">
            <i class="pi pi-search-plus text-brand-400"></i>
            <span>Enlarge Photo</span>
          </button>

          <button 
            @click.stop="close"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-900/80 hover:bg-surface-700 text-gray-300 hover:text-white flex items-center justify-center border border-surface-700 z-10"
            title="Close">
            <i class="pi pi-times text-xs"></i>
          </button>

          <div class="relative z-10 pointer-events-none">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-bold uppercase tracking-wider">
                {{ product.category }}
              </span>
              <span
                v-if="maxStock <= 0"
                class="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-950/90 text-rose-400 border border-rose-700/60 font-bold">
                Sold Out
              </span>
              <span
                v-else-if="maxStock <= 8"
                class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/60 font-bold">
                Almost Out ({{ maxStock }} left)
              </span>
              <span
                v-else-if="maxStock < 999"
                class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-700/60 font-bold">
                {{ maxStock }} in stock
              </span>
              <span
                v-if="inCartQty > 0"
                class="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-900/90 text-amber-300 border border-surface-700 font-bold">
                {{ inCartQty }} in cart
              </span>
            </div>
            <h3 class="text-2xl font-black text-white mt-1">{{ product.name }}</h3>
            <p class="text-xs text-gray-300 line-clamp-1 mt-0.5">{{ product.description }}</p>
          </div>
        </div>

        <!-- Customization Options Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-200">
          
          <!-- Size / Variant Selector -->
          <div v-if="showSizeSelector">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {{ product.customizations?.size_label || 'Select Size' }}
            </label>
            <div v-if="hasCustomSizes" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                v-for="sz in productSizes"
                :key="sz.name"
                type="button"
                @click="customization.size = sz.name"
                class="p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="customization.size === sz.name ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span class="text-xs">{{ sz.name }}</span>
                <span v-if="Number(sz.price) > 0" class="text-xs font-bold text-brand-400">+₱{{ Number(sz.price).toFixed(2) }}</span>
                <span v-else class="text-[11px] text-gray-400">Base</span>
              </button>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="customization.size = 'Regular'"
                class="p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="customization.size === 'Regular' ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span>Regular <span v-if="isDrink" class="text-xs text-gray-400 font-normal">(16 oz)</span></span>
                <span class="text-xs text-gray-400">Base</span>
              </button>
              <button 
                type="button"
                @click="customization.size = 'Large'"
                class="p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="customization.size === 'Large' ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span>Large <span v-if="isDrink" class="text-xs text-gray-400 font-normal">(22 oz)</span></span>
                <span class="text-xs font-bold text-brand-400">+₱20.00</span>
              </button>
            </div>
          </div>

          <!-- Flavour Selector (Configured per product) -->
          <div v-if="productFlavours.length > 0">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {{ product.customizations?.flavour_label || (productSecondFlavours.length > 0 ? 'Select 1st Flavour' : 'Select Flavour') }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="flav in productFlavours"
                :key="flav.name"
                type="button"
                @click="customization.flavour = flav.name"
                class="p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="customization.flavour === flav.name ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span class="text-xs">{{ flav.name }}</span>
                <span v-if="Number(flav.price) > 0" class="text-xs font-bold text-brand-400">+₱{{ Number(flav.price).toFixed(2) }}</span>
              </button>
            </div>
          </div>

          <!-- 2nd Flavour Selector (e.g. 6pcs Chicken Wings 2 Flavors) -->
          <div v-if="productSecondFlavours.length > 0">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select 2nd Flavour
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="flav2 in productSecondFlavours"
                :key="'f2-' + flav2.name"
                type="button"
                @click="customization.flavour2 = flav2.name"
                class="p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer"
                :class="customization.flavour2 === flav2.name ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span class="text-xs">{{ flav2.name }}</span>
                <span v-if="Number(flav2.price) > 0" class="text-xs font-bold text-brand-400">+₱{{ Number(flav2.price).toFixed(2) }}</span>
              </button>
            </div>
          </div>

          <!-- Custom Options / Add-ons (Configured per product) -->
          <div v-if="productOptions.length > 0">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {{ product.customizations?.options_label || 'Customizations & Add-ons' }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="opt in productOptions"
                :key="opt.name"
                class="p-2.5 rounded-xl border border-surface-700 bg-surface-900/50 flex items-center justify-between cursor-pointer hover:border-surface-600 transition-colors">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-300">{{ opt.name }}</span>
                  <span v-if="Number(opt.price) > 0" class="text-[10px] font-bold text-brand-400">+₱{{ Number(opt.price).toFixed(2) }}</span>
                </div>
                <input
                  type="checkbox"
                  :value="opt.name"
                  v-model="customization.options"
                  class="rounded bg-surface-800 border-surface-600 text-brand-500 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <!-- Sugar Level (For Drinks & Coffee) -->
          <div v-if="showSugarIce">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sugar Level
            </label>
            <div class="grid grid-cols-5 gap-1.5">
              <button 
                v-for="sugar in sugarLevels" 
                :key="sugar"
                type="button"
                @click="customization.sugar = sugar"
                class="py-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer"
                :class="customization.sugar === sugar ? 'border-brand-500 bg-brand-500 text-white shadow-md' : 'border-surface-700 bg-surface-900/50 text-gray-400 hover:text-white'">
                {{ sugar }}
              </button>
            </div>
          </div>

          <!-- Ice Level (For Iced Drinks & Coffee) -->
          <div v-if="showSugarIce && !isHotSelection">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ice Level
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="ice in iceLevels" 
                :key="ice"
                type="button"
                @click="customization.ice = ice"
                class="py-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer"
                :class="customization.ice === ice ? 'border-brand-500 bg-brand-500 text-white shadow-md' : 'border-surface-700 bg-surface-900/50 text-gray-400 hover:text-white'">
                {{ ice }}
              </button>
            </div>
          </div>

          <!-- Legacy Toppings / Add-ons (when product has no custom add-on list) -->
          <div v-if="showLegacyToppings">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Add-on Toppings (+₱15.00 each)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label 
                v-for="topping in availableToppings" 
                :key="topping"
                class="p-2.5 rounded-xl border border-surface-700 bg-surface-900/50 flex items-center justify-between cursor-pointer hover:border-surface-600 transition-colors">
                <span class="text-xs text-gray-300">{{ topping }}</span>
                <input 
                  type="checkbox" 
                  :value="topping" 
                  v-model="customization.toppings"
                  class="rounded bg-surface-800 border-surface-600 text-brand-500 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <!-- Special Request Notes -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Special Instructions
            </label>
            <input 
              v-model="customization.notes"
              type="text" 
              placeholder="e.g. Extra napkin, sauce on the side..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/70 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

        </div>

        <!-- Footer with Dynamic Calculated Price & Add Button -->
        <div class="p-5 bg-surface-900 border-t border-surface-700 flex flex-col gap-3">
          <div v-if="maxStock > 0 && inCartQty > 0" class="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-surface-800/80 border border-surface-700/80 text-xs text-gray-300">
            <span>In cart: <strong class="text-white">{{ inCartQty }}</strong> <span class="text-gray-500">({{ remainingStock }} left)</span></span>
            <button
              type="button"
              @click="reduceFromCart"
              class="px-2.5 py-1 rounded-lg bg-surface-700 hover:bg-rose-500/20 hover:text-rose-300 text-gray-200 border border-surface-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Reduce 1 from cart">
              <i class="pi pi-minus text-[9px]"></i>
              <span>Reduce 1</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-semibold">Total Price</p>
              <div class="flex items-baseline gap-2">
                <p class="text-2xl font-black text-brand-400">₱{{ (computedTotal * orderQty).toFixed(2) }}</p>
                <span v-if="product.original_price && Number(product.original_price) > Number(product.price)" class="text-xs line-through text-gray-400 font-semibold">
                  ₱{{ ((computedTotal + (Number(product.original_price) - Number(product.price))) * orderQty).toFixed(2) }}
                </span>
                <span v-if="product.discount_percent > 0" class="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {{ product.discount_percent }}% OFF
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <button 
                @click="close"
                class="px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                v-if="maxStock <= 0"
                disabled
                type="button"
                class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-surface-700 text-gray-500 cursor-not-allowed flex items-center gap-2">
                <i class="pi pi-ban"></i>
                <span>Sold Out</span>
              </button>
              <button 
                v-else-if="remainingStock <= 0"
                disabled
                type="button"
                class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-surface-800 text-amber-400/70 border border-amber-500/30 cursor-not-allowed flex items-center gap-2">
                <i class="pi pi-check"></i>
                <span>Max in Cart</span>
              </button>
              <template v-else>
                <div class="flex items-center bg-surface-800 border border-surface-700 rounded-xl p-1">
                  <button
                    type="button"
                    @click="decreaseQty"
                    :disabled="orderQty <= 1"
                    class="w-7 h-7 rounded-lg bg-surface-700/80 hover:bg-surface-600 text-white flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                    <i class="pi pi-minus text-[10px]"></i>
                  </button>
                  <span class="w-8 text-center text-xs font-black text-white select-none">{{ orderQty }}</span>
                  <button
                    type="button"
                    @click="increaseQty"
                    :disabled="orderQty >= remainingStock"
                    class="w-7 h-7 rounded-lg bg-surface-700/80 hover:bg-surface-600 text-white flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                    <i class="pi pi-plus text-[10px]"></i>
                  </button>
                </div>
                <button 
                  @click="confirmAdd"
                  type="button"
                  class="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center gap-2 cursor-pointer">
                  <i class="pi pi-shopping-cart"></i>
                  <span>Add{{ orderQty > 1 ? ' ' + orderQty : '' }} to Cart</span>
                </button>
              </template>
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

// G Shot Teas — Customization Modal Component (Page 44 Use Case: Customize Order & Dynamic Pricing)
export default {
  name: 'CustomizationModal',
  setup() {
    const store = useGShotStore();
    const product = Vue.computed(() => store.selectedProductForCustomize);

    const hasCustomSizes = Vue.computed(() => Array.isArray(product.value?.customizations?.sizes));

    const productSizes = Vue.computed(() => {
      const list = product.value?.customizations?.sizes;
      return Array.isArray(list) ? list.map(s => ({ name: s.name || s, price: Number(s.price || 0) })) : [];
    });

    const productFlavours = Vue.computed(() => {
      const list = product.value?.customizations?.flavours;
      return Array.isArray(list) ? list.map(f => ({ name: f.name || f, price: Number(f.price || 0) })) : [];
    });

    const productSecondFlavours = Vue.computed(() => {
      const list = product.value?.customizations?.second_flavours;
      return Array.isArray(list) ? list.map(f => ({ name: f.name || f, price: Number(f.price || 0) })) : [];
    });

    const productOptions = Vue.computed(() => {
      const list = product.value?.customizations?.options;
      return Array.isArray(list) ? list.map(o => ({ name: o.name || o, price: Number(o.price || 0) })) : [];
    });

    const isDrink = Vue.computed(() => {
      const cat = product.value?.category;
      return cat === 'Drinks' || cat === 'Coffee';
    });

    const showSizeSelector = Vue.computed(() => {
      if (hasCustomSizes.value) return productSizes.value.length > 0;
      if (product.value?.customizations?.hide_size) return false;
      return isDrink.value || product.value?.category === 'Burgers';
    });

    const showSugarIce = Vue.computed(() => {
      if (!isDrink.value) return false;
      return !product.value?.customizations?.hide_sugar_ice;
    });

    const isHotSelection = Vue.computed(() => (customization.size || '').toLowerCase() === 'hot');

    const showLegacyToppings = Vue.computed(() => {
      return product.value?.category === 'Drinks' && productOptions.value.length === 0 && !product.value?.customizations?.hide_default_toppings;
    });

    const maxStock = Vue.computed(() => {
      if (!product.value) return 0;
      return store.getProductMaxStock(product.value);
    });

    const inCartQty = Vue.computed(() => {
      if (!product.value) return 0;
      return store.getProductCartQty(product.value.id);
    });

    const remainingStock = Vue.computed(() => {
      return Math.max(0, maxStock.value - inCartQty.value);
    });

    const sugarLevels = ['0%', '25%', '50%', '75%', '100%'];
    const iceLevels = ['No Ice', 'Less Ice', 'Regular Ice'];
    const availableToppings = [
      'Tapioca Pearls',
      'Cream Cheese Puff',
      'Coffee Jelly',
      'Egg Pudding',
      'Nata de Coco',
      'Oreo Crumbs',
    ];

    const customization = Vue.reactive({
      size: 'Regular',
      sugar: '75%',
      ice: 'Regular Ice',
      toppings: [],
      flavour: '',
      flavour2: '',
      options: [],
      notes: '',
    });

    const orderQty = Vue.ref(1);

    Vue.watch(product, (newVal) => {
      if (newVal) {
        if (hasCustomSizes.value) {
          customization.size = productSizes.value.length ? productSizes.value[0].name : '';
        } else {
          customization.size = showSizeSelector.value ? 'Regular' : '';
        }
        customization.sugar = '75%';
        customization.ice = 'Regular Ice';
        customization.toppings = [];
        customization.flavour = productFlavours.value.length ? productFlavours.value[0].name : '';
        customization.flavour2 = productSecondFlavours.value.length > 1
          ? productSecondFlavours.value[1].name
          : (productSecondFlavours.value[0]?.name || '');
        customization.options = [];
        customization.notes = '';
        const initQty = Number(store.customizeInitialQty) || 1;
        orderQty.value = remainingStock.value > 0 ? Math.min(Math.max(1, initQty), remainingStock.value) : 1;
      }
    });

    Vue.watch(remainingStock, (rem) => {
      if (rem > 0 && orderQty.value > rem) {
        orderQty.value = rem;
      } else if (rem <= 0) {
        orderQty.value = 1;
      }
    });

    const decreaseQty = () => {
      if (orderQty.value > 1) orderQty.value -= 1;
    };

    const increaseQty = () => {
      if (orderQty.value < remainingStock.value) orderQty.value += 1;
    };

    const reduceFromCart = () => {
      if (!product.value) return;
      store.decrementProductCart(product.value.id);
    };

    const computedTotal = Vue.computed(() => {
      if (!product.value) return 0;
      let total = Number(product.value.price);
      if (hasCustomSizes.value) {
        const sz = productSizes.value.find(s => s.name === customization.size);
        if (sz && Number(sz.price) > 0) total += Number(sz.price);
      } else if (showSizeSelector.value && customization.size === 'Large') {
        total += 20;
      }
      if (customization.flavour) {
        const flav = productFlavours.value.find(f => f.name === customization.flavour);
        if (flav && Number(flav.price) > 0) total += Number(flav.price);
      }
      if (customization.flavour2) {
        const flav2 = productSecondFlavours.value.find(f => f.name === customization.flavour2);
        if (flav2 && Number(flav2.price) > 0) total += Number(flav2.price);
      }
      if (customization.options && customization.options.length) {
        for (const optName of customization.options) {
          const opt = productOptions.value.find(o => o.name === optName);
          if (opt && Number(opt.price) > 0) total += Number(opt.price);
        }
      }
      if (customization.toppings && customization.toppings.length) {
        total += customization.toppings.length * 15;
      }
      return total;
    });

    const close = () => {
      store.customizeModalOpen = false;
      store.selectedProductForCustomize = null;
    };

    const confirmAdd = () => {
      if (!product.value) return;
      const cleanCustomization = {};
      if (showSizeSelector.value && customization.size) {
        cleanCustomization.size = customization.size;
        if (hasCustomSizes.value) {
          const sz = productSizes.value.find(s => s.name === customization.size);
          cleanCustomization.size_price = sz ? Number(sz.price || 0) : 0;
        }
      }
      if (showSugarIce.value) {
        cleanCustomization.sugar = customization.sugar || '75%';
        if (!isHotSelection.value) {
          cleanCustomization.ice = customization.ice || 'Regular Ice';
        } else {
          cleanCustomization.ice = 'Hot';
        }
      }
      if (isDrink.value && customization.toppings && customization.toppings.length) {
        cleanCustomization.toppings = [...customization.toppings];
      }
      if (customization.flavour) {
        const flav = productFlavours.value.find(f => f.name === customization.flavour);
        cleanCustomization.flavour = customization.flavour;
        cleanCustomization.flavour_price = flav ? Number(flav.price || 0) : 0;
      }
      if (customization.flavour2) {
        const flav2 = productSecondFlavours.value.find(f => f.name === customization.flavour2);
        cleanCustomization.flavour2 = customization.flavour2;
        cleanCustomization.flavour2_price = flav2 ? Number(flav2.price || 0) : 0;
      }
      if (customization.options && customization.options.length) {
        cleanCustomization.options = customization.options.map(name => {
          const opt = productOptions.value.find(o => o.name === name);
          return { name, price: opt ? Number(opt.price || 0) : 0 };
        });
      }
      if (customization.notes && customization.notes.trim()) {
        cleanCustomization.notes = customization.notes.trim();
      }
      const qty = Math.min(Math.max(1, orderQty.value), Math.max(1, remainingStock.value));
      const added = store.addToCart(product.value, cleanCustomization, qty);
      if (added) {
        store.customizeInitialQty = 1;
        close();
      }
    };

    return {
      store,
      product,
      isDrink,
      hasCustomSizes,
      productSizes,
      showSizeSelector,
      showSugarIce,
      isHotSelection,
      showLegacyToppings,
      productFlavours,
      productSecondFlavours,
      productOptions,
      orderQty,
      maxStock,
      inCartQty,
      remainingStock,
      decreaseQty,
      increaseQty,
      reduceFromCart,
      sugarLevels,
      iceLevels,
      availableToppings,
      customization,
      computedTotal,
      close,
      confirmAdd,
    };
  },
};
</script>
