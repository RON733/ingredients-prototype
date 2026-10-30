// G Shot Teas — Customization Modal Component (Page 44 Use Case: Customize Order & Dynamic Pricing)
const CustomizationModal = {
  template: `
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
            :src="product.image || './assets/hero-banner.png'" 
            :alt="product.name" 
            class="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] group-hover/hdr:brightness-[0.55] transition-all duration-300"
            onerror="this.src='./assets/hero-banner.png'"
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
            ✕
          </button>

          <div class="relative z-10 pointer-events-none">
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-bold uppercase tracking-wider">
              {{ product.category }}
            </span>
            <h3 class="text-2xl font-black text-white mt-1">{{ product.name }}</h3>
            <p class="text-xs text-gray-300 line-clamp-1 mt-0.5">{{ product.description }}</p>
          </div>
        </div>

        <!-- Customization Options Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-200">
          
          <!-- Size Selector (Drinks & Burgers) -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Size
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="customization.size = 'Regular'"
                class="p-3 rounded-xl border text-left flex items-center justify-between transition-all"
                :class="customization.size === 'Regular' ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span>Regular <span v-if="isDrink" class="text-xs text-gray-400 font-normal">(16 oz)</span></span>
                <span class="text-xs text-gray-400">Base</span>
              </button>
              <button 
                type="button"
                @click="customization.size = 'Large'"
                class="p-3 rounded-xl border text-left flex items-center justify-between transition-all"
                :class="customization.size === 'Large' ? 'border-brand-500 bg-brand-500/10 text-white font-bold' : 'border-surface-700 bg-surface-900/50 text-gray-300 hover:border-surface-600'">
                <span>Large <span v-if="isDrink" class="text-xs text-gray-400 font-normal">(22 oz)</span></span>
                <span class="text-xs font-bold text-brand-400">+₱20.00</span>
              </button>
            </div>
          </div>

          <!-- Sugar Level (For Drinks) -->
          <div v-if="product.category === 'Drinks' || product.category === 'Coffee'">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sugar Level
            </label>
            <div class="grid grid-cols-5 gap-1.5">
              <button 
                v-for="sugar in sugarLevels" 
                :key="sugar"
                type="button"
                @click="customization.sugar = sugar"
                class="py-2 rounded-lg text-xs font-semibold border text-center transition-all"
                :class="customization.sugar === sugar ? 'border-brand-500 bg-brand-500 text-white shadow-md' : 'border-surface-700 bg-surface-900/50 text-gray-400 hover:text-white'">
                {{ sugar }}
              </button>
            </div>
          </div>

          <!-- Ice Level (For Drinks) -->
          <div v-if="product.category === 'Drinks' || product.category === 'Coffee'">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ice Level
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="ice in iceLevels" 
                :key="ice"
                type="button"
                @click="customization.ice = ice"
                class="py-2.5 rounded-xl text-xs font-semibold border text-center transition-all"
                :class="customization.ice === ice ? 'border-brand-500 bg-brand-500 text-white shadow-md' : 'border-surface-700 bg-surface-900/50 text-gray-400 hover:text-white'">
                {{ ice }}
              </button>
            </div>
          </div>

          <!-- Toppings / Add-ons -->
          <div v-if="product.category === 'Drinks'">
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
        <div class="p-5 bg-surface-900 border-t border-surface-700 flex items-center justify-between">
          <div>
            <p class="text-[10px] text-gray-400 uppercase font-semibold">Total Price</p>
            <p class="text-2xl font-black text-brand-400">₱{{ computedTotal.toFixed(2) }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="close"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              @click="confirmAdd"
              class="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2">
              <i class="pi pi-shopping-cart"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const product = Vue.computed(() => store.selectedProductForCustomize);

    const isDrink = Vue.computed(() => {
      const cat = product.value?.category;
      return cat === 'Drinks' || cat === 'Coffee';
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
      notes: '',
    });

    Vue.watch(product, (newVal) => {
      if (newVal) {
        customization.size = 'Regular';
        customization.sugar = '75%';
        customization.ice = 'Regular Ice';
        customization.toppings = [];
        customization.notes = '';
      }
    });

    const computedTotal = Vue.computed(() => {
      if (!product.value) return 0;
      let total = Number(product.value.price);
      if (customization.size === 'Large') total += 20;
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
      const cleanCustomization = {
        size: customization.size || 'Regular',
      };
      if (isDrink.value) {
        cleanCustomization.sugar = customization.sugar || '75%';
        cleanCustomization.ice = customization.ice || 'Regular Ice';
        if (customization.toppings && customization.toppings.length) {
          cleanCustomization.toppings = [...customization.toppings];
        }
      }
      if (customization.notes && customization.notes.trim()) {
        cleanCustomization.notes = customization.notes.trim();
      }
      store.addToCart(product.value, cleanCustomization);
      close();
    };

    return {
      store,
      product,
      isDrink,
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
