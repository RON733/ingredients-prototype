// G Shot Teas — Recipes & Portion Breakdown Tab (THE INGREDIENT PROTOTYPE RECIPE ENGINE)
const AdminRecipesTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-book"></i> RECIPE & PORTION CALCULATION ENGINE
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Product Recipes & Portions</h2>
          <p class="text-xs text-gray-400">
            Each menu item is composed of specific raw ingredients. The system automatically computes maximum portions and blocks orders if any ingredient is depleted.
          </p>
        </div>

        <button 
          @click="refresh"
          class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors self-start sm:self-auto"
          title="Refresh">
          <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        </button>
      </div>

      <!-- Recipes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in store.products" 
          :key="product.id"
          class="p-6 rounded-3xl bg-surface-800/90 border border-surface-700 shadow-xl flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-all">
          
          <div>
            <!-- Header: Title, Category, and Available Portions -->
            <div class="flex items-start justify-between gap-3 border-b border-surface-700/60 pb-3">
              <div>
                <span class="text-xl">{{ product.emoji || '🍽️' }}</span>
                <h3 class="text-base font-black text-white mt-1">{{ product.name }}</h3>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ product.category }} • ₱{{ Number(product.price).toFixed(2) }}</span>
              </div>

              <!-- Computed Portions Pill -->
              <div class="text-right">
                <span 
                  class="px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5"
                  :class="product.max_portions > 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (product.max_portions > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')">
                  {{ product.max_portions }} portions
                </span>
                <p class="text-[9px] text-gray-500 mt-0.5">Kitchen capacity</p>
              </div>
            </div>

            <!-- Recipe Ingredient Breakdown -->
            <div class="mt-4 space-y-2.5">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Required Raw Ingredients</span>
                <span class="text-[10px] font-normal text-gray-500">Per Portion</span>
              </p>

              <div v-if="product.recipes && product.recipes.length > 0" class="space-y-2 text-xs">
                <div 
                  v-for="rec in product.recipes" 
                  :key="rec.id"
                  class="p-2.5 rounded-xl bg-surface-900/60 border border-surface-700/50 flex items-center justify-between">
                  
                  <div>
                    <p class="font-bold text-white">
                      {{ rec.ingredient ? rec.ingredient.name : rec.ingredient_id }}
                    </p>
                    <p class="text-[10px] text-gray-400">
                      Recipe needs: <span class="text-brand-400 font-bold">{{ rec.qty }} {{ rec.ingredient ? rec.ingredient.unit : 'pcs' }}</span>
                    </p>
                  </div>

                  <!-- Stock indicator for this specific ingredient -->
                  <div class="text-right">
                    <span 
                      class="text-xs font-mono font-bold"
                      :class="rec.ingredient && rec.ingredient.stock >= rec.qty ? 'text-gray-300' : 'text-rose-400 font-black'">
                      {{ rec.ingredient ? rec.ingredient.stock : 0 }} in stock
                    </span>
                    <p v-if="rec.ingredient && rec.ingredient.stock < rec.qty" class="text-[9px] text-rose-400">
                      ⚠️ Depleted bottleneck!
                    </p>
                  </div>

                </div>
              </div>

              <div v-else class="text-center py-6 text-gray-500 text-xs italic">
                No recipe ingredients linked yet.
              </div>
            </div>
          </div>

          <!-- Quick Action to Restock Ingredients of this Dish -->
          <div class="pt-3 border-t border-surface-700/50 flex items-center justify-between text-xs">
            <span class="text-[10px] text-gray-500">Auto-deducted on checkout</span>
            <button 
              @click="store.adminTab = 'inventory'"
              class="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors">
              <span>Manage Stocks</span>
              <i class="pi pi-arrow-right text-[9px]"></i>
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchProducts();
        await store.fetchIngredients();
      } finally {
        loading.value = false;
      }
    };

    return {
      store,
      loading,
      refresh,
    };
  },
};
