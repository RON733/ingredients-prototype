// G Shot Teas — Admin & Staff Dashboard Shell (Matches Figures 14–17 + Prototype Tabs)
const AdminDashboard = {
  template: `
    <div class="min-h-screen bg-surface-950 flex flex-col lg:flex-row">
      
      <!-- Mobile & Tablet Admin Top Bar (< 1024px) -->
      <header class="lg:hidden bg-surface-900 border-b border-surface-800 p-4 sticky top-0 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-2.5 cursor-pointer" @click="selectTab(store.isAdminOrSuper ? 'analytics' : 'orders')">
          <div class="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center font-bold text-sm text-yellow-400">G'</div>
          <div>
            <h1 class="text-sm font-black text-white leading-none">G SHOT TEAS</h1>
            <p class="text-[9px] text-brand-400 font-bold uppercase mt-0.5">{{ (store.user?.role || "operations").toUpperCase() }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Live Store Status Badge -->
          <div class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5"
            :class="store.isStoreOpen ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'">
            <span class="w-1.5 h-1.5 rounded-full" :class="store.isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            <span>{{ store.isStoreOpen ? 'OPEN' : 'CLOSED' }}</span>
          </div>

          <!-- Mobile Quick Lock Button -->
          <button 
            @click="handleLockTerminal"
            class="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs flex items-center justify-center cursor-pointer transition-colors"
            title="Lock Terminal">
            <i class="pi pi-lock text-xs"></i>
          </button>

          <!-- Mobile Quick Logout Button -->
          <button 
            @click="handleLogout"
            class="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs flex items-center justify-center cursor-pointer transition-colors"
            title="Logout">
            <i class="pi pi-sign-out text-xs"></i>
          </button>

          <!-- Mobile Sidebar Drawer Toggle -->
          <button 
            @click="mobileNavOpen = !mobileNavOpen"
            class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs flex items-center gap-1.5 cursor-pointer"
            aria-label="Toggle Admin Menu">
            <i class="pi" :class="mobileNavOpen ? 'pi-times' : 'pi-bars'"></i>
            <span class="text-xs font-bold hidden sm:inline">Tabs</span>
          </button>
        </div>
      </header>

      <!-- Quick Tab Scroll Strip on Mobile & Tablet (< 1024px) -->
      <div class="lg:hidden bg-surface-950/90 border-b border-surface-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar sticky top-[61px] z-30 backdrop-blur-md">
        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('analytics')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'analytics' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-chart-line text-[11px]"></i>
          <span>Analytics</span>
        </button>

        <button 
          @click="selectTab('orders')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'orders' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-list text-[11px]"></i>
          <span>Orders</span>
          <span v-if="activeOrdersCount > 0" class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-brand-400 text-surface-950">
            {{ activeOrdersCount }}
          </span>
        </button>

        <button 
          @click="selectTab('completed')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'completed' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-check-circle text-[11px]"></i>
          <span>Completed</span>
        </button>

        <button 
          @click="selectTab('inventory')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'inventory' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-server text-[11px]"></i>
          <span>Inventory</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('products')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'products' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-box text-[11px]"></i>
          <span>Products</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('recipes')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'recipes' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-book text-[11px]"></i>
          <span>Recipes</span>
        </button>

        <button 
          @click="selectTab('bookings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'bookings' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-calendar text-[11px]"></i>
          <span>Bookings</span>
        </button>

        <button 
          @click="selectTab('announcements')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'announcements' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-megaphone text-[11px]"></i>
          <span>Announcements</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-brand-400 text-surface-950">
            {{ store.announcements.length }}
          </span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('users')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'users' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-users text-[11px]"></i>
          <span>Users</span>
        </button>

        <!-- Audit Trail (Exclusively Super Admin Only) -->
        <button 
          v-if="store.isSuperAdmin"
          @click="selectTab('audit')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'audit' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-history text-[11px]"></i>
          <span>Audit</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('settings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="store.adminTab === 'settings' ? 'bg-yellow-400 text-black font-bold' : 'bg-surface-850 text-gray-400 hover:text-white'">
          <i class="pi pi-qrcode text-[11px]"></i>
          <span>GCash & Settings</span>
        </button>
      </div>

      <!-- Left Sidebar (Desktop Static & Mobile Drawer Overlay) -->
      <aside 
        class="fixed inset-y-0 left-0 w-72 bg-surface-900 border-r border-surface-800 p-6 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto"
        :class="mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'">
        
        <div>
          <!-- Brand Logo & Header -->
          <div class="flex items-center justify-between mb-8 cursor-pointer" @click="selectTab(store.isAdminOrSuper ? 'analytics' : 'orders')">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center font-black text-base text-yellow-400">G'</div>
              <div>
                <h1 class="text-base font-extrabold text-white tracking-tight leading-none">G SHOT TEAS</h1>
                <p class="text-[10px] text-brand-400 font-semibold tracking-wider uppercase mt-1">Management Console</p>
              </div>
            </div>

            <!-- Mobile Drawer Close Button -->
            <button @click.stop="mobileNavOpen = false" class="lg:hidden p-1.5 text-gray-400 hover:text-white">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Current User Profile Pill & PIN Switcher -->
          <div class="p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700/60 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-surface-700 text-yellow-400 font-bold text-sm flex items-center justify-center shrink-0">
                {{ (store.user?.name || 'A').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">{{ store.user?.name || 'Authorized Staff' }}</p>
                <span class="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  {{ store.user?.role || 'staff' }}
                </span>
              </div>
            </div>

            <!-- Fast Staff PIN Switcher Trigger (Staff Only) -->
            <button 
              v-if="store.isStaffOnly"
              @click="store.openStaffPinModal()"
              class="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-surface-700/60 hover:bg-surface-700 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
              title="Fast 4-digit PIN operator switch">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-id-card text-xs"></i>
                <span>Switch Operator</span>
              </div>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">PIN</span>
            </button>
          </div>

          <!-- Navigation Items (Sidebar Links from Figures 14–17) -->
          <nav class="space-y-1.5 text-xs font-semibold">
            
            <!-- Sales Analytics (Admin / Super Admin Exclusive) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('analytics')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'analytics' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-chart-line text-sm"></i>
              <span>Sales Analytics</span>
            </button>

            <!-- Active Orders (Staff & Admin) -->
            <button 
              @click="selectTab('orders')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'orders' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-list text-sm"></i>
                <span>Active Orders</span>
              </div>
              <span v-if="activeOrdersCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-400 text-surface-950">
                {{ activeOrdersCount }}
              </span>
            </button>

            <!-- Completed Orders -->
            <button 
              @click="selectTab('completed')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'completed' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-check-circle text-sm"></i>
              <span>Completed Orders</span>
            </button>

            <!-- Product Menu Management (Figure 17) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('products')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'products' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-box text-sm"></i>
              <span>Product Menu</span>
            </button>

            <!-- Kitchen Inventory (The Ingredient Prototype!) -->
            <button 
              @click="selectTab('inventory')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'inventory' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-server text-sm"></i>
                <span>Kitchen Inventory</span>
              </div>
              <span v-if="store.lowStockAlerts.length > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60">
                {{ store.lowStockAlerts.length }}
              </span>
            </button>

            <!-- Recipe Engine (The Ingredient Prototype!) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('recipes')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'recipes' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-book text-sm"></i>
              <span>Recipes & Portions</span>
            </button>

            <!-- Event Bookings -->
            <button 
              @click="selectTab('bookings')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'bookings' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-calendar text-sm"></i>
              <span>Event Bookings</span>
            </button>

            <!-- Announcements & Promos (Staff & Admin) -->
            <button 
              @click="selectTab('announcements')"
              class="w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all"
              :class="store.adminTab === 'announcements' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <div class="flex items-center gap-3">
                <i class="pi pi-megaphone text-sm"></i>
                <span>Announcements</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-400 text-surface-950">
                {{ store.announcements.length }}
              </span>
            </button>

            <!-- System Users (Admin & Super Admin) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('users')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'users' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-users text-sm"></i>
              <span>User & Roles</span>
            </button>

            <!-- Audit Trail (Exclusively Super Admin Only) -->
            <button 
              v-if="store.isSuperAdmin"
              @click="selectTab('audit')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'audit' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-history text-sm"></i>
              <span>Audit Trail</span>
            </button>

            <!-- Store & GCash Payment Settings (Admin & Super Admin) -->
            <button 
              v-if="store.isAdminOrSuper"
              @click="selectTab('settings')"
              class="w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all"
              :class="store.adminTab === 'settings' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:bg-surface-800 hover:text-white'">
              <i class="pi pi-qrcode text-sm"></i>
              <span>GCash & Settings</span>
            </button>

          </nav>
        </div>

        <!-- Bottom Actions (Matches Figure 14: Logout button) -->
        <div class="pt-6 border-t border-surface-800 space-y-2 text-xs">
          

          <button 
            @click="handleLockTerminal"
            class="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center gap-2 transition-colors border border-amber-500/20 cursor-pointer">
            <i class="pi pi-lock text-xs"></i>
            <span>Lock Terminal</span>
          </button>

          <button 
            @click="handleLogout"
            class="w-full py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center gap-2 transition-colors border border-rose-600/20 cursor-pointer">
            <i class="pi pi-sign-out text-xs"></i>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      <!-- Drawer Backdrop for Mobile (< 1024px) -->
      <div 
        v-if="mobileNavOpen"
        @click="mobileNavOpen = false"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"></div>

      <!-- Main Admin Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto space-y-6">
        
        <!-- Store Operations & Status Control Header (Staff, Admin, Super Admin) -->
        <div class="p-4 sm:p-5 rounded-2xl border border-surface-700 bg-surface-900 transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <!-- Status Info & Description -->
          <div class="flex items-center gap-3.5 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-lg"
              :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'">
              <span v-if="store.isStoreOpen">🟢</span>
              <span v-else>🔴</span>
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h2 class="text-xs sm:text-base font-black text-white uppercase tracking-wider">
                  Store Status: <span :class="store.isStoreOpen ? 'text-emerald-400' : 'text-rose-400'">{{ store.isStoreOpen ? 'OPEN FOR ORDERS' : 'CLOSED' }}</span>
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                  :class="store.isStoreOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'">
                  {{ store.isStoreOpen ? 'Live' : 'Paused' }}
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-gray-400 mt-1">
                {{ store.isStoreOpen 
                  ? 'Accepting real-time customer delivery and pickup orders.' 
                  : 'Kitchen ordering paused. Customers notified of operating hours.' }}
              </p>
            </div>
          </div>

          <!-- Store Status Flag Toggle & Operator Pin Switch -->
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 self-stretch sm:self-auto flex-wrap">
            <!-- Active Staff Operator PIN Chip on Shared Counter Laptop (Staff Only) -->
            <button 
              v-if="store.isStaffOnly"
              @click="store.openStaffPinModal()"
              class="px-3 py-2 rounded-xl bg-surface-950/70 hover:bg-surface-800 text-xs text-gray-200 border border-surface-700/80 transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              title="Shared laptop terminal: Click to switch active staff operator via 4-digit PIN">
              <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span class="text-gray-400 text-[11px] hidden sm:inline">On Duty:</span>
              <span class="font-bold text-white text-xs truncate max-w-[120px]">{{ store.user?.name || 'Staff' }}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">SWITCH PIN</span>
            </button>
            <div 
              v-else
              class="px-3 py-2 rounded-xl bg-surface-950/70 border border-surface-700/60 text-xs text-gray-300 flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-amber-400"></div>
              <span class="text-gray-400 text-[11px] hidden sm:inline">Session:</span>
              <span class="font-bold text-white text-xs truncate max-w-[140px]">{{ store.user?.name }}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold uppercase">{{ store.user?.role }}</span>
            </div>

            <!-- Live Clock in Admin Console -->
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-950/70 border border-surface-800 text-xs font-mono text-gray-300" title="Live Store Clock">
              <i class="pi pi-clock text-brand-400 text-xs"></i>
              <span>{{ currentTime }}</span>
            </div>

            <!-- The Toggle Button -->
            <button 
              @click="store.toggleStoreStatus()"
              class="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              :class="store.isStoreOpen 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'">
              <i :class="store.isStoreOpen ? 'pi pi-power-off' : 'pi pi-check-circle'"></i>
              <span>{{ store.isStoreOpen ? 'Flag as CLOSED' : 'Flag as OPEN' }}</span>
            </button>

            <!-- Terminal Lock Button (Staff, Admin, Super Admin) -->
            <button 
              @click="handleLockTerminal"
              type="button"
              class="w-full sm:w-auto px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-300 border border-amber-500/30 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="Lock Terminal: Prevents unauthorized use until true account password is entered">
              <i class="pi pi-lock text-xs"></i>
              <span>Lock Terminal</span>
            </button>

            <!-- Explicit Logout Button (Staff, Admin, Super Admin) -->
            <button 
              @click="handleLogout"
              type="button"
              class="w-full sm:w-auto px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600/15 hover:bg-rose-600/25 active:bg-rose-600/35 text-rose-300 border border-rose-600/30 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="Sign out of system">
              <i class="pi pi-sign-out text-xs"></i>
              <span>Logout</span>
            </button>
          </div>

        </div>

        <!-- Tab Content -->
        <component :is="activeTabComponent"></component>
      </main>


      <!-- ================= FULLSCREEN TERMINAL LOCK SCREEN OVERLAY ================= -->
      <div 
        v-if="store.isTerminalLocked" 
        class="fixed inset-0 z-[9999] bg-surface-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in select-none">
        
        <div class="w-full max-w-md bg-surface-900 border border-surface-700/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          <!-- Ambient Glow behind Lock Icon -->
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Lock Icon with pulsating badge -->
          <div class="relative mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <i class="pi pi-lock text-3xl text-amber-400 animate-pulse"></i>
          </div>

          <!-- Title & Operator Details -->
          <div class="space-y-1.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Terminal Security Locked
            </span>
            <h2 class="text-2xl font-black text-white tracking-tight">Dashboard Is Locked</h2>
            <p class="text-xs text-gray-400 max-w-xs mx-auto">
              This terminal is locked to protect orders, inventory, and operations. Password required to resume.
            </p>
          </div>

          <!-- Locked Operator Card -->
          <div class="p-3.5 rounded-2xl bg-surface-800/80 border border-surface-700/80 flex items-center gap-3 text-left">
            <div class="w-10 h-10 rounded-xl bg-surface-700 text-yellow-400 font-bold flex items-center justify-center shrink-0">
              {{ (store.lockedUser?.name || store.user?.name || 'U').charAt(0) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-white truncate">{{ store.lockedUser?.name || store.user?.name || 'Authorized Operator' }}</p>
              <p class="text-[10px] text-gray-400 truncate">{{ store.lockedUser?.email || store.user?.email }}</p>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {{ (store.lockedUser?.role || store.user?.role || 'staff').toUpperCase() }}
            </span>
          </div>

          <!-- Password Unlock Form -->
          <form @submit.prevent="handleUnlockTerminal" class="space-y-4">
            <div class="text-left space-y-1.5">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-300">
                Enter Account Password to Unlock
              </label>
              <div class="relative">
                <input 
                  :type="showUnlockPassword ? 'text' : 'password'" 
                  v-model="unlockPassword" 
                  placeholder="Enter password"
                  autofocus
                  class="w-full pl-4 pr-11 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  required />
                <button 
                  type="button" 
                  @click="showUnlockPassword = !showUnlockPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
                  <i class="pi" :class="showUnlockPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
              <p v-if="unlockError" class="text-xs text-rose-400 font-bold flex items-center gap-1.5 pt-1 animate-fade-in">
                <i class="pi pi-exclamation-circle text-xs"></i>
                {{ unlockError }}
              </p>
            </div>

            <button 
              type="submit" 
              :disabled="unlocking || !unlockPassword"
              class="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-400/20">
              <i class="pi" :class="unlocking ? 'pi-spin pi-spinner' : 'pi-lock-open'"></i>
              <span>{{ unlocking ? 'Verifying Password...' : 'Unlock Terminal' }}</span>
            </button>
          </form>

          <!-- Fallback / Switch Account -->
          <div class="pt-2 border-t border-surface-800 flex items-center justify-between text-xs">
            <span class="text-gray-400 text-[11px]">Not your shift?</span>
            <button 
              @click="confirmLogoutFromLock"
              type="button" 
              class="text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer flex items-center gap-1">
              <i class="pi pi-sign-out text-xs"></i>
              <span>Switch Account / Logout</span>
            </button>
          </div>

        </div>
      </div>
      <!-- Fast 4-Digit Staff PIN Switcher for POS Terminal -->
      <StaffPinModal />

    </div>
  `,
  setup() {
    const store = useGShotStore();

    const mobileNavOpen = Vue.ref(false);
    const selectTab = (tab) => {
      store.adminTab = tab;
      mobileNavOpen.value = false;
    };

    const currentTime = Vue.ref('');
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    Vue.onMounted(() => {
      updateTime();
      setInterval(updateTime, 1000);
    });

    const activeOrdersCount = Vue.computed(() => {
      return store.orders.filter(o => ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)).length;
    });

    const activeTabComponent = Vue.computed(() => {
      switch (store.adminTab) {
        case 'analytics': return AdminAnalyticsTab;
        case 'orders': return AdminOrdersTab;
        case 'completed': return AdminCompletedTab;
        case 'products': return AdminProductsTab;
        case 'inventory': return AdminInventoryTab;
        case 'recipes': return AdminRecipesTab;
        case 'bookings': return AdminBookingsTab;
        case 'announcements': return AdminAnnouncementsTab;
        case 'users': return AdminUsersTab;
        case 'audit': return store.isSuperAdmin ? AdminAuditTab : AdminOrdersTab;
        case 'settings': return AdminSettingsTab;
        default: return AdminOrdersTab;
      }
    });

    

    // Terminal Lock State & Actions
    const showUnlockPassword = Vue.ref(false);
    const unlockPassword = Vue.ref('');
    const unlocking = Vue.ref(false);
    const unlockError = Vue.ref('');

    const handleLockTerminal = () => {
      store.lockTerminal();
      unlockPassword.value = '';
      unlockError.value = '';
    };

    const handleUnlockTerminal = async () => {
      if (!unlockPassword.value || unlocking.value) return;
      unlocking.value = true;
      unlockError.value = '';
      try {
        await store.unlockTerminal(unlockPassword.value);
        unlockPassword.value = '';
      } catch (err) {
        unlockError.value = err.message || 'Incorrect password. Only the true account owner can unlock this terminal.';
      } finally {
        unlocking.value = false;
      }
    };

    const confirmLogoutFromLock = () => {
      if (confirm('Are you sure you want to log out and switch to another account?')) {
        store.logout();
      }
    };

    const handleLogout = () => {
      if (confirm('Are you sure you want to log out?')) {
        store.logout();
      }
    };

    return {
      store,
      mobileNavOpen,
      selectTab,
      currentTime,
      activeOrdersCount,
      activeTabComponent,
      handleLogout,
      showUnlockPassword,
      unlockPassword,
      unlocking,
      unlockError,
      handleLockTerminal,
      handleUnlockTerminal,
      confirmLogoutFromLock,
    };
  },
};


