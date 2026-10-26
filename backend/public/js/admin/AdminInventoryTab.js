// G Shot Teas — Kitchen Inventory Management Tab (THE INGREDIENT PROTOTYPE CORE)
const AdminInventoryTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header & Add Ingredient Button -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-box"></i> KITCHEN INGREDIENTS PROTOTYPE
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Raw Ingredient Inventory</h2>
          <p class="text-xs text-gray-400">
            Real-time tracking of raw ingredients. Stock dynamically deducts upon each order and dictates menu portion availability.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="openAddModal"
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-surface-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
            <i class="pi pi-plus"></i>
            <span>Add Raw Ingredient</span>
          </button>
          
          <button 
            @click="refresh"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors"
            title="Refresh Stock">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- Ingredient KPI Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tracked Items</p>
          <p class="text-3xl font-black text-white mt-1.5">{{ store.ingredients.length }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Healthy Stocks</p>
          <p class="text-3xl font-black text-emerald-400 mt-1.5">{{ healthyCount }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Low Stock Warnings</p>
          <p class="text-3xl font-black text-amber-400 mt-1.5">{{ lowCount }}</p>
        </div>
        <div class="p-5 rounded-2xl bg-surface-800/80 border border-surface-700/60">
          <p class="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Depleted / Out of Stock</p>
          <p class="text-3xl font-black text-rose-400 mt-1.5">{{ depletedCount }}</p>
        </div>
      </div>

      <!-- Category Filter Pills & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            v-for="cat in ['All', 'Bakery', 'Meat', 'Dairy', 'Produce']" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            :class="selectedCategory === cat ? 'bg-amber-500 text-surface-950 font-black shadow-md' : 'bg-surface-800 text-gray-400 hover:text-white border border-surface-700/60'">
            {{ cat }}
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search ingredient..." 
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-800 text-white placeholder-gray-500 text-xs border border-surface-700 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <!-- Raw Ingredients Table -->
      <div class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">Ingredient Name</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Current Stock</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Low Threshold</th>
                <th class="px-6 py-4 text-center">Quick Restock</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              <tr 
                v-for="ing in filteredIngredients" 
                :key="ing.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <!-- Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" :class="getStatusDot(ing)"></span>
                    <div>
                      <p class="font-bold text-white text-sm">{{ ing.name }}</p>
                      <p class="text-[10px] text-gray-500 font-mono">{{ ing.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    :class="getCategoryBadge(ing.category)">
                    {{ ing.category }}
                  </span>
                </td>

                <!-- Stock Level -->
                <td class="px-6 py-4">
                  <span class="text-base font-black text-white">
                    {{ ing.stock }}
                  </span>
                  <span class="text-gray-400 ml-1 font-medium">{{ ing.unit }}</span>
                </td>

                <!-- Status Badge -->
                <td class="px-6 py-4">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="getStatusBadge(ing)">
                    {{ getStatusText(ing) }}
                  </span>
                </td>

                <!-- Threshold -->
                <td class="px-6 py-4 text-gray-400">
                  Min: <span class="text-white font-bold">{{ ing.low_threshold }}</span> {{ ing.unit }}
                </td>

                <!-- Quick Restock Actions -->
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex items-center gap-1.5 bg-surface-900 px-2 py-1 rounded-xl border border-surface-700">
                    <button 
                      @click="quickAdjust(ing, 10)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +10
                    </button>
                    <button 
                      @click="quickAdjust(ing, 25)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +25
                    </button>
                    <button 
                      @click="quickAdjust(ing, 50)"
                      class="px-2 py-1 rounded-lg bg-surface-800 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[10px] font-bold transition-all">
                      +50
                    </button>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="openEditModal(ing)"
                      class="p-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-gray-200 transition-colors"
                      title="Edit stock or threshold">
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                    <button 
                      @click="deleteIngredient(ing)"
                      class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                      title="Delete ingredient">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Ingredient Modal -->
      <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-surface-900 border border-surface-700 rounded-3xl p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-surface-700 pb-3">
            <h3 class="text-lg font-black text-white">
              {{ isEditing ? 'Edit Ingredient' : 'Add Raw Ingredient' }}
            </h3>
            <button @click="modalOpen = false" class="text-gray-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-gray-400 mb-1">Ingredient Name</label>
              <input v-model="form.name" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="e.g. Grass Jelly" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Category</label>
                <select v-model="form.category" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white">
                  <option value="Bakery">Bakery</option>
                  <option value="Meat">Meat</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Produce">Produce</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Unit of Measure</label>
                <input v-model="form.unit" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" placeholder="pcs / cups / scoops" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-gray-400 mb-1">Current Stock</label>
                <input v-model.number="form.stock" type="number" min="0" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Low Threshold</label>
                <input v-model.number="form.low_threshold" type="number" min="0" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-surface-700">
            <button @click="modalOpen = false" class="px-4 py-2 text-xs text-gray-400">Cancel</button>
            <button @click="saveIngredient" class="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-surface-950 rounded-xl">
              {{ isEditing ? 'Save Stock' : 'Add Ingredient' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const selectedCategory = Vue.ref('All');
    const searchQuery = Vue.ref('');

    const modalOpen = Vue.ref(false);
    const isEditing = Vue.ref(false);
    const editingId = Vue.ref(null);

    const form = Vue.reactive({
      name: '',
      category: 'Produce',
      unit: 'cups',
      stock: 20,
      low_threshold: 5,
    });

    const refresh = async () => {
      loading.value = true;
      try {
        await store.fetchIngredients();
        await store.fetchProducts(); // refresh calculated portions
      } finally {
        loading.value = false;
      }
    };

    const healthyCount = Vue.computed(() => {
      return store.ingredients.filter(i => i.stock > i.low_threshold).length;
    });

    const lowCount = Vue.computed(() => {
      return store.ingredients.filter(i => i.stock > 0 && i.stock <= i.low_threshold).length;
    });

    const depletedCount = Vue.computed(() => {
      return store.ingredients.filter(i => i.stock <= 0).length;
    });

    const filteredIngredients = Vue.computed(() => {
      let list = [...store.ingredients];
      if (selectedCategory.value !== 'All') {
        list = list.filter(i => i.category === selectedCategory.value);
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
      }
      return list;
    });

    const getStatusText = (ing) => {
      if (ing.stock <= 0) return 'Depleted';
      if (ing.stock <= ing.low_threshold) return 'Low Stock';
      return 'In Stock';
    };

    const getStatusBadge = (ing) => {
      if (ing.stock <= 0) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      if (ing.stock <= ing.low_threshold) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    };

    const getStatusDot = (ing) => {
      if (ing.stock <= 0) return 'bg-rose-500';
      if (ing.stock <= ing.low_threshold) return 'bg-amber-400 animate-pulse';
      return 'bg-emerald-400';
    };

    const getCategoryBadge = (cat) => {
      if (cat === 'Meat') return 'bg-red-950/60 text-red-400 border border-red-800/50';
      if (cat === 'Dairy') return 'bg-blue-950/60 text-blue-400 border border-blue-800/50';
      if (cat === 'Produce') return 'bg-green-950/60 text-green-400 border border-green-800/50';
      return 'bg-amber-950/60 text-amber-400 border border-amber-800/50';
    };

    const quickAdjust = async (ing, amt) => {
      try {
        await GST_API.adjustStock(ing.id, amt);
        store.notify(`Added +${amt} ${ing.unit} to ${ing.name}`);
        refresh();
      } catch (err) {
        store.notify('Error updating stock', 'error');
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      form.name = '';
      form.category = 'Produce';
      form.unit = 'cups';
      form.stock = 25;
      form.low_threshold = 8;
      modalOpen.value = true;
    };

    const openEditModal = (ing) => {
      isEditing.value = true;
      editingId.value = ing.id;
      form.name = ing.name;
      form.category = ing.category;
      form.unit = ing.unit;
      form.stock = ing.stock;
      form.low_threshold = ing.low_threshold;
      modalOpen.value = true;
    };

    const saveIngredient = async () => {
      if (!form.name.trim()) return;

      try {
        if (isEditing.value) {
          await GST_API.updateIngredient(editingId.value, { ...form });
          store.notify('Ingredient stock updated!');
        } else {
          const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await GST_API.createIngredient({
            id: slug,
            ...form,
          });
          store.notify('New raw ingredient added to inventory!');
        }
        modalOpen.value = false;
        refresh();
      } catch (err) {
        store.notify('Failed to save ingredient', 'error');
      }
    };

    const deleteIngredient = async (ing) => {
      if (!confirm(`Delete ${ing.name}? This will remove it from all linked recipes.`)) return;
      try {
        await GST_API.deleteIngredient(ing.id);
        store.notify(`${ing.name} removed from inventory`);
        refresh();
      } catch (err) {
        store.notify('Failed to delete ingredient', 'error');
      }
    };

    return {
      store,
      loading,
      selectedCategory,
      searchQuery,
      modalOpen,
      isEditing,
      form,
      healthyCount,
      lowCount,
      depletedCount,
      filteredIngredients,
      getStatusText,
      getStatusBadge,
      getStatusDot,
      getCategoryBadge,
      quickAdjust,
      openAddModal,
      openEditModal,
      saveIngredient,
      deleteIngredient,
      refresh,
    };
  },
};
