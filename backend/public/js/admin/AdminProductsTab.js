// G Shot Teas — Product Management Tab (Matches Figure 17)
const AdminProductsTab = {
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Header & Add Product Button (Matches Figure 17) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
            <i class="pi pi-box"></i> MANAGEMENT
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Product Management</h2>
          <p class="text-xs text-gray-400">Create, update, or remove menu items to keep your catalog up to date and organized.</p>
        </div>

        <button 
          @click="openAddModal"
          class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 self-start sm:self-auto">
          <i class="pi pi-plus"></i>
          <span>Add Product</span>
        </button>
      </div>

      <!-- Controls: Category Pills, Search, and Sort (Matches Figure 17) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Category Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            :class="selectedCategory === cat 
              ? 'bg-brand-600 text-white shadow-md' 
              : 'bg-surface-800 text-gray-400 hover:text-white border border-surface-700/60'">
            {{ cat }}
          </button>
        </div>

        <!-- Search Bar and Sort -->
        <div class="flex items-center gap-3">
          <div class="relative w-64">
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
            <option value="price_asc">Sort by Price: Low</option>
            <option value="price_desc">Sort by Price: High</option>
          </select>
        </div>

      </div>

      <!-- Products Grid (Matches Figure 17) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="rounded-3xl bg-surface-800/90 border border-surface-700 overflow-hidden flex flex-col justify-between shadow-xl hover:border-surface-600 transition-all">
          
          <!-- Image Container -->
          <div class="relative h-44 bg-surface-900 overflow-hidden flex items-center justify-center">
            <img 
              :src="product.image || './assets/hero-banner.png'" 
              :alt="product.name"
              class="w-full h-full object-cover filter brightness-90"
              onerror="this.src='./assets/hero-banner.png'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-surface-800 via-transparent"></div>

            <span class="absolute top-3 left-3 text-2xl drop-shadow-md">
              {{ product.emoji || '🍽️' }}
            </span>

            <span class="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface-900/80 text-gray-300 border border-surface-700">
              {{ product.category }}
            </span>
          </div>

          <!-- Product Details -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-white text-base">{{ product.name }}</h3>
                <span class="font-black text-brand-400 text-base whitespace-nowrap">
                  ₱{{ Number(product.price).toFixed(2) }}
                </span>
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

            <!-- Action Buttons: Toggle Availability & Edit (Matches Figure 17 "Admin Mode") -->
            <div class="space-y-2 pt-2 border-t border-surface-700">
              <button 
                @click="toggleAvailability(product)"
                class="w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                :class="product.is_available ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30'">
                <i class="pi" :class="product.is_available ? 'pi-check' : 'pi-ban'"></i>
                <span>{{ product.is_available ? 'Status: Available' : 'Status: Out of Stock' }}</span>
              </button>

              <div class="flex items-center gap-2">
                <button 
                  @click="openEditModal(product)"
                  class="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-surface-700 hover:bg-surface-600 text-gray-200 transition-colors flex items-center justify-center gap-1">
                  <i class="pi pi-pencil text-[10px]"></i> Edit
                </button>
                <button 
                  @click="deleteProduct(product)"
                  class="p-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                  title="Delete product">
                  <i class="pi pi-trash text-[11px]"></i>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-3xl p-6 space-y-4">
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
                <label class="block text-gray-400 mb-1">Price (₱)</label>
                <input v-model.number="form.price" type="number" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white" />
              </div>
            </div>

            <div>
              <label class="block text-gray-400 mb-1">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full p-2.5 rounded-xl bg-surface-800 border border-surface-700 text-white"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-surface-700">
            <button @click="modalOpen = false" class="px-4 py-2 text-xs text-gray-400">Cancel</button>
            <button @click="saveProduct" class="px-5 py-2 text-xs font-black bg-brand-600 hover:bg-brand-500 text-white rounded-xl">
              {{ isEditing ? 'Save Changes' : 'Create Product' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup() {
    const store = useGShotStore();
    const categories = ['All', 'Drinks', 'Burgers', 'Pizzas', 'RiceMeals', 'Sides', 'Coffee'];
    const selectedCategory = Vue.ref('All');
    const searchQuery = Vue.ref('');
    const sortOrder = Vue.ref('default');

    const modalOpen = Vue.ref(false);
    const isEditing = Vue.ref(false);
    const editingId = Vue.ref(null);

    const form = Vue.reactive({
      name: '',
      category: 'Drinks',
      price: 99,
      description: '',
      emoji: '🧋',
    });

    const filteredProducts = Vue.computed(() => {
      let list = [...store.products];

      if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(p => p.name.toLowerCase().includes(q));
      }

      if (sortOrder.value === 'price_asc') {
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
      form.price = 79;
      form.description = '';
      form.emoji = '🧋';
      modalOpen.value = true;
    };

    const openEditModal = (product) => {
      isEditing.value = true;
      editingId.value = product.id;
      form.name = product.name;
      form.category = product.category;
      form.price = product.price;
      form.description = product.description;
      form.emoji = product.emoji || '🍽️';
      modalOpen.value = true;
    };

    const saveProduct = async () => {
      if (!form.name.trim()) return;

      try {
        if (isEditing.value) {
          await GST_API.updateProduct(editingId.value, { ...form });
          store.notify('Product updated successfully!');
        } else {
          const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await GST_API.createProduct({
            id: slug,
            ...form,
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
    };
  },
};
