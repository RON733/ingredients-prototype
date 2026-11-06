<template>
<div class="min-h-screen bg-surface-950 flex flex-col lg:flex-row">
      
      <!-- Mobile & Tablet Admin Top Bar (< 1024px) -->
      <header class="lg:hidden bg-surface-900 border-b border-surface-800 p-4 sticky top-0 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-2.5 cursor-pointer" @click="selectTab(store.isAdminOrSuper ? 'analytics' : 'orders')">
          <div class="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700/80 flex items-center justify-center font-bold text-sm text-amber-400">G'</div>
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

          <!-- Mobile Rider Notices Button -->
          <button 
            @click="showRiderNoticesModal = true"
            type="button"
            class="relative p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-gray-200 border border-surface-700 text-xs flex items-center justify-center cursor-pointer transition-colors"
            title="Rider Notices">
            <span class="text-xs">🛵</span>
            <span 
              v-if="store.unreadRiderNoticesCount > 0" 
              class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black bg-rose-500 text-white flex items-center justify-center animate-pulse">
              {{ store.unreadRiderNoticesCount }}
            </span>
          </button>

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
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'analytics' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-chart-line text-[11px]"></i>
          <span>Analytics</span>
        </button>

        <button 
          @click="selectTab('orders')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'orders' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-list text-[11px]"></i>
          <span>Orders</span>
          <span v-if="activeOrdersCount > 0" class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/25 text-amber-300">
            {{ activeOrdersCount }}
          </span>
        </button>

        <button 
          @click="selectTab('completed')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'completed' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-check-circle text-[11px]"></i>
          <span>Completed</span>
        </button>

        <button 
          @click="selectTab('inventory')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'inventory' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-server text-[11px]"></i>
          <span>Inventory</span>
        </button>

        <button 
          @click="selectTab('products')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'products' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-box text-[11px]"></i>
          <span>Products</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('recipes')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'recipes' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-book text-[11px]"></i>
          <span>Recipes</span>
        </button>

        <button 
          @click="selectTab('bookings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'bookings' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-calendar text-[11px]"></i>
          <span>Bookings</span>
        </button>

        <button 
          @click="selectTab('announcements')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'announcements' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-megaphone text-[11px]"></i>
          <span>Announcements</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/25 text-amber-300">
            {{ store.announcements.length }}
          </span>
        </button>

        <!-- System Users (Admin & Super Admin Exclusive) -->
        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('users')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'users' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-users text-[11px]"></i>
          <span>Users</span>
        </button>

        <!-- Audit Trail (Exclusively Super Admin Only) -->
        <button 
          v-if="store.isSuperAdmin"
          @click="selectTab('audit')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'audit' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-history text-[11px]"></i>
          <span>Audit</span>
        </button>

        <button 
          v-if="store.isAdminOrSuper"
          @click="selectTab('settings')" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer"
          :class="store.adminTab === 'settings' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-surface-850/80 text-neutral-400 border-transparent hover:text-white'">
          <i class="pi pi-qrcode text-[11px]"></i>
          <span>Settings</span>
        </button>

        <!-- Delivery Fleet Quick Switch (Mobile) -->
        <button 
          v-if="store.isAdminOrSuper"
          @click="store.currentView = 'driver'" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer">
          <i class="pi pi-compass text-[11px] text-emerald-400"></i>
          <span>Fleet</span>
        </button>
      </div>

      <!-- Left Sidebar (Desktop Static & Mobile Drawer Overlay) -->
      <aside 
        class="fixed inset-y-0 left-0 w-72 bg-surface-900 border-r border-surface-800 p-5 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto"
        :class="mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'">
        
        <div class="space-y-5">
          <!-- Brand Logo & Header -->
          <div class="flex items-center justify-between cursor-pointer" @click="selectTab(store.isAdminOrSuper ? 'analytics' : 'orders')">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700/80 flex items-center justify-center font-black text-base text-amber-400 shadow-sm">G'</div>
              <div>
                <h1 class="text-base font-extrabold text-white tracking-tight leading-none">G SHOT TEAS</h1>
                <p class="text-[10px] text-amber-400/80 font-semibold tracking-wider uppercase mt-1">Management Console</p>
              </div>
            </div>

            <!-- Mobile Drawer Close Button -->
            <button @click.stop="mobileNavOpen = false" class="lg:hidden p-1.5 text-neutral-400 hover:text-white">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Current User Profile Pill & PIN Switcher -->
          <div class="p-3 rounded-2xl bg-surface-850/80 border border-surface-750/70">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-sm flex items-center justify-center shrink-0">
                {{ (store.user?.name || 'A').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate">{{ store.user?.name || 'Authorized Staff' }}</p>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
                  {{ store.user?.role || 'staff' }}
                </span>
              </div>
            </div>

            <!-- Fast Staff PIN Switcher Trigger (Staff Only) -->
            <button 
              v-if="store.isStaffOnly"
              @click="store.openStaffPinModal()"
              class="w-full mt-2 py-1.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-750 text-neutral-300 hover:text-white border border-surface-700 text-[11px] font-semibold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
              title="Fast 4-digit PIN operator switch">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-id-card text-xs text-sky-400"></i>
                <span>Switch Operator</span>
              </div>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-surface-750 text-neutral-300 font-mono font-bold">PIN</span>
            </button>
          </div>

          <!-- Navigation Items (Categorized with Section Headers) -->
          <nav class="space-y-4 text-xs font-medium">
            
            <!-- OPERATIONS -->
            <div class="space-y-1">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400/80 mb-1.5">Operations</p>
              
              <!-- Active Orders -->
              <button 
                @click="selectTab('orders')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all border cursor-pointer"
                :class="store.adminTab === 'orders' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-list text-sm"></i>
                  <span>Active Orders</span>
                </div>
                <span v-if="activeOrdersCount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ activeOrdersCount }}
                </span>
              </button>

              <!-- Completed Orders -->
              <button 
                @click="selectTab('completed')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'completed' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <i class="pi pi-check-circle text-sm"></i>
                <span>Completed Orders</span>
              </button>

              <!-- Kitchen Inventory -->
              <button 
                @click="selectTab('inventory')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all border cursor-pointer"
                :class="store.adminTab === 'inventory' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-server text-sm"></i>
                  <span>Kitchen Inventory</span>
                </div>
                <span v-if="store.lowStockAlerts.length > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {{ store.lowStockAlerts.length }}
                </span>
              </button>

              <!-- Delivery Fleet (Live Driver View) -->
              <button 
                v-if="store.isAdminOrSuper"
                @click="store.currentView = 'driver'"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all border text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent cursor-pointer"
                title="Open Delivery Fleet Dispatch & Rider Navigation">
                <div class="flex items-center gap-3">
                  <i class="pi pi-compass text-sm text-emerald-400"></i>
                  <span>Delivery Fleet (Rider)</span>
                </div>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">FLEET</span>
              </button>
            </div>

            <!-- MANAGEMENT -->
            <div class="space-y-1">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400/80 mb-1.5">Management</p>

              <!-- Sales Analytics (Admin / Super Admin Exclusive) -->
              <button 
                v-if="store.isAdminOrSuper"
                @click="selectTab('analytics')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'analytics' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-chart-line text-sm"></i>
                  <span>Sales Analytics</span>
                </div>
              </button>

              <!-- Product Menu Management -->
              <button 
                @click="selectTab('products')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'products' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-box text-sm"></i>
                  <span>Product Menu</span>
                </div>
              </button>

              <!-- Recipe Engine (Admin / Super Admin Exclusive) -->
              <button 
                v-if="store.isAdminOrSuper"
                @click="selectTab('recipes')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'recipes' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-book text-sm"></i>
                  <span>Recipes & Portions</span>
                </div>
              </button>

              <!-- Event Bookings -->
              <button 
                @click="selectTab('bookings')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'bookings' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-calendar text-sm"></i>
                  <span>Event Bookings</span>
                </div>
              </button>
            </div>

            <!-- SYSTEM & SETTINGS -->
            <div class="space-y-1">
              <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400/80 mb-1.5">System</p>

              <!-- Announcements & Promos -->
              <button 
                @click="selectTab('announcements')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all border cursor-pointer"
                :class="store.adminTab === 'announcements' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-megaphone text-sm"></i>
                  <span>Announcements</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ store.announcements.length }}
                </span>
              </button>

              <!-- System Users (Admin & Super Admin Exclusive) -->
              <button 
                v-if="store.isAdminOrSuper"
                @click="selectTab('users')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'users' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-users text-sm"></i>
                  <span>User & Roles</span>
                </div>
              </button>

              <!-- Audit Trail (Exclusively Super Admin Only) -->
              <button 
                v-if="store.isSuperAdmin"
                @click="selectTab('audit')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'audit' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-history text-sm"></i>
                  <span>Audit Trail</span>
                </div>
              </button>

              <!-- Store & GCash Payment Settings (Admin & Super Admin Exclusive) -->
              <button 
                v-if="store.isAdminOrSuper"
                @click="selectTab('settings')"
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all border cursor-pointer"
                :class="store.adminTab === 'settings' 
                  ? 'bg-amber-500/15 text-amber-300 font-bold border-amber-500/30 shadow-sm' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-surface-800/60 border-transparent'">
                <div class="flex items-center gap-3">
                  <i class="pi pi-qrcode text-sm"></i>
                  <span>GCash & Settings</span>
                </div>
              </button>
            </div>

          </nav>
        </div>

        <!-- Bottom Actions -->
        <div class="pt-4 border-t border-surface-800 space-y-2 text-xs">
          <button 
            @click="handleLockTerminal"
            class="w-full py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-neutral-300 hover:text-amber-300 font-semibold flex items-center justify-center gap-2 transition-colors border border-surface-750 cursor-pointer">
            <i class="pi pi-lock text-xs"></i>
            <span>Lock Terminal</span>
          </button>

          <button 
            @click="handleLogout"
            class="w-full py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-neutral-300 hover:text-rose-400 font-semibold flex items-center justify-center gap-2 transition-colors border border-surface-750 cursor-pointer">
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
        <div class="p-4 sm:p-5 rounded-2xl border border-surface-750/80 bg-surface-900/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <!-- Status Info & Description -->
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Pulsing Status Icon Beacon (Subtle, refined glow) -->
            <div class="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300"
              :class="store.isStoreOpen 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm'">
              <span v-if="store.isStoreOpen" class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <span v-else class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </div>

            <!-- Store Status Labels -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap">Store Status:</span>
                <span class="text-sm sm:text-base font-extrabold tracking-tight whitespace-nowrap"
                  :class="store.isStoreOpen ? 'text-emerald-400' : 'text-rose-400'">
                  {{ store.isStoreOpen ? 'Open for Orders' : 'Store Closed' }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                  :class="store.isStoreOpen ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'">
                  {{ store.isStoreOpen ? 'Live' : 'Paused' }}
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5 leading-snug">
                {{ store.isStoreOpen 
                  ? 'Accepting real-time customer delivery and pickup orders.' 
                  : 'Kitchen ordering paused. Customers notified of operating hours.' }}
              </p>
            </div>
          </div>

          <!-- Store Status Flag Toggle & Quick Action Controls -->
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            <!-- Active Staff Operator PIN Chip on Shared Counter Laptop (Staff Only) -->
            <button 
              v-if="store.isStaffOnly"
              @click="store.openStaffPinModal()"
              class="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-xs text-neutral-200 border border-surface-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Shared laptop terminal: Click to switch active staff operator via 4-digit PIN">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-neutral-400 text-[11px] hidden sm:inline">On Duty:</span>
              <span class="font-bold text-white text-xs truncate max-w-[110px]">{{ store.user?.name || 'Staff' }}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">SWITCH PIN</span>
            </button>

            <!-- Rider Fleet Notices Indicator Button -->
            <button 
              @click="showRiderNoticesModal = true"
              type="button"
              class="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800/80 hover:bg-surface-700 border border-surface-700/60 text-xs font-bold text-neutral-300 hover:text-white transition-all shadow-sm cursor-pointer"
              title="View Notices & Availability Updates from Delivery Riders">
              <span class="text-sm">🛵</span>
              <span class="hidden sm:inline">Rider Notices</span>
              <span 
                v-if="store.unreadRiderNoticesCount > 0" 
                class="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {{ store.unreadRiderNoticesCount }}
              </span>
            </button>



            <!-- Live Clock in Admin Console -->
            <div class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800/80 border border-surface-700/60 text-xs font-mono text-neutral-300 shadow-sm" title="Live Store Clock">
              <i class="pi pi-clock text-amber-400 text-xs"></i>
              <span>{{ currentTime }}</span>
            </div>

            <!-- Store Open/Close Toggle Button -->
            <button 
              @click="store.toggleStoreStatus()"
              class="px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              :class="store.isStoreOpen 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'">
              <i class="text-xs" :class="store.isStoreOpen ? 'pi pi-power-off text-rose-400' : 'pi pi-check-circle text-emerald-400'"></i>
              <span>{{ store.isStoreOpen ? 'Flag as Closed' : 'Flag as Open' }}</span>
            </button>

            <!-- Super Admin Exclusive: Website Emergency Shutdown Toggle Button -->
            <button 
              v-if="store.isSuperAdmin"
              @click="openShutdownModal"
              type="button"
              class="px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              :class="store.isMaintenanceMode 
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 ring-2 ring-purple-400/50' 
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30'"
              title="Super Admin: Shut down website / Activate Maintenance Mode">
              <i class="text-xs" :class="store.isMaintenanceMode ? 'pi pi-wrench' : 'pi pi-shield'"></i>
              <span>{{ store.isMaintenanceMode ? 'Maintenance Active' : 'Shutdown Website' }}</span>
            </button>

            <!-- Quick Utility Buttons: Lock & Logout -->
            <div class="flex items-center gap-1 pl-1 border-l border-surface-750">
              <button 
                @click="handleLockTerminal"
                type="button"
                class="p-2 rounded-xl bg-surface-800/80 hover:bg-surface-750 text-neutral-400 hover:text-amber-300 border border-surface-700/60 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                title="Lock Terminal">
                <i class="pi pi-lock text-xs"></i>
              </button>

              <button 
                @click="handleLogout"
                type="button"
                class="p-2 rounded-xl bg-surface-800/80 hover:bg-surface-750 text-neutral-400 hover:text-rose-400 border border-surface-700/60 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                title="Logout">
                <i class="pi pi-sign-out text-xs"></i>
              </button>
            </div>
          </div>

        </div>

        <!-- Super Admin Maintenance Mode Active Alert Banner -->
        <div 
          v-if="store.isMaintenanceMode"
          class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-rose-950/80 to-surface-900 border border-purple-500/50 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-xl shrink-0">
              <i class="pi pi-exclamation-triangle animate-bounce"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  EMERGENCY WEBSITE SHUTDOWN IS ACTIVE
                </span>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Customers Blocked
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-purple-200 mt-1">
                The public storefront is offline. All visitors see the <strong>"Website Under Maintenance"</strong> page. Online order creation via API is blocked.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button 
              type="button"
              @click="openShutdownModal"
              class="w-full sm:w-auto px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-purple-200 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="pi pi-pencil text-xs"></i>
              <span>Edit Notice</span>
            </button>
            <button 
              v-if="store.isSuperAdmin"
              type="button"
              @click="handleRestoreWebsite"
              :disabled="isTogglingShutdown"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              <i class="pi" :class="isTogglingShutdown ? 'pi-spin pi-spinner' : 'pi-check-circle'"></i>
              <span>Restore Website Online</span>
            </button>
          </div>
        </div>

        <!-- Tab Content with KeepAlive to prevent blinking & preserve state on switch -->
        <KeepAlive :max="10">
          <component :is="activeTabComponent"></component>
        </KeepAlive>
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
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-center shrink-0">
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

      <!-- ================= SUPER ADMIN WEBSITE SHUTDOWN & MAINTENANCE MODAL ================= -->
      <div 
        v-if="showShutdownModal" 
        class="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="showShutdownModal = false">
        
        <div class="w-full max-w-lg bg-surface-900 border border-surface-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          <!-- Ambient Glow -->
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Modal Header -->
          <div class="flex items-start justify-between gap-4 border-b border-surface-800 pb-4 relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">
                <i class="pi pi-power-off"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-white">Website Shutdown Control</h3>
                  <span class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">Super Admin</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">Control customer storefront availability & maintenance notice.</p>
              </div>
            </div>

            <button 
              @click="showShutdownModal = false" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">
              âœ•
            </button>
          </div>

          <!-- Modal Form -->
          <div class="space-y-4 relative z-10 text-left text-xs">
            
            <!-- Current Status Toggle -->
            <div class="p-4 rounded-2xl bg-surface-950/80 border border-surface-800 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block font-bold text-white text-xs">Public Website Status</label>
                  <p class="text-[11px] text-gray-400">
                    {{ shutdownForm.maintenance_mode ? 'Website is currently SHUT DOWN. Customers see maintenance page.' : 'Website is ONLINE and actively receiving customer orders.' }}
                  </p>
                </div>
                
                <!-- Big Switch -->
                <button 
                  type="button"
                  @click="shutdownForm.maintenance_mode = !shutdownForm.maintenance_mode"
                  class="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="shutdownForm.maintenance_mode ? 'bg-rose-600' : 'bg-emerald-600'">
                  <span 
                    class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    :class="shutdownForm.maintenance_mode ? 'translate-x-7' : 'translate-x-0'"></span>
                </button>
              </div>

              <div class="pt-2 border-t border-surface-800/80 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="shutdownForm.maintenance_mode ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'"></span>
                <span class="font-extrabold uppercase tracking-wider text-[11px]" :class="shutdownForm.maintenance_mode ? 'text-rose-400' : 'text-emerald-400'">
                  {{ shutdownForm.maintenance_mode ? 'Mode: UNDER MAINTENANCE (SHUTDOWN)' : 'Mode: LIVE & OPERATIONAL' }}
                </span>
              </div>
            </div>

            <!-- Maintenance Headline / Title -->
            <div class="space-y-1.5">
              <label class="block font-bold uppercase tracking-wider text-gray-300 text-[11px]">
                Maintenance Headline / Title
              </label>
              <input 
                v-model="shutdownForm.maintenance_title" 
                type="text" 
                placeholder="e.g. Website Under Scheduled Maintenance"
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400 transition-colors font-medium" />
            </div>

            <!-- Custom Notice Message -->
            <div class="space-y-1.5">
              <label class="block font-bold uppercase tracking-wider text-gray-300 text-[11px]">
                Detailed Customer Notice Message
              </label>
              <textarea 
                v-model="shutdownForm.maintenance_message" 
                rows="3"
                placeholder="Explain why the site is undergoing maintenance..."
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400 transition-colors leading-relaxed font-medium resize-none"></textarea>
            </div>

            <!-- Estimated Back Online Time -->
            <div class="space-y-1.5">
              <label class="block font-bold uppercase tracking-wider text-gray-300 text-[11px]">
                Estimated Back Online Schedule (Optional)
              </label>
              <input 
                v-model="shutdownForm.maintenance_until" 
                type="text" 
                placeholder="e.g. Today at 4:00 PM or Within 1 hour"
                class="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400 transition-colors font-medium" />
            </div>

            <!-- Security Audit Note -->
            <p class="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
              <i class="pi pi-shield text-purple-400 text-xs"></i>
              <span>All shutdown actions and restorations are permanently audited with your Super Admin identity.</span>
            </p>

          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-4 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-end gap-3 relative z-10">
            <button 
              type="button" 
              @click="showShutdownModal = false"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-bold transition-all cursor-pointer">
              Cancel
            </button>
            <button 
              type="button" 
              @click="handleSaveShutdown" 
              :disabled="isTogglingShutdown"
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              :class="shutdownForm.maintenance_mode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'">
              <i class="pi" :class="isTogglingShutdown ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              <span>{{ shutdownForm.maintenance_mode ? 'Confirm & Shut Down Website' : 'Apply & Keep Website Online' }}</span>
            </button>
          </div>

        </div>

      </div>

      <!-- ================= RIDER FLEET NOTICES MODAL ================= -->
      <div 
        v-if="showRiderNoticesModal" 
        class="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="showRiderNoticesModal = false">
        
        <div class="w-full max-w-2xl bg-surface-900 border border-surface-750 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Ambient Glow -->
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header -->
          <div class="flex items-start justify-between gap-4 border-b border-surface-800 pb-4 relative z-10 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-white">Rider Fleet Notices</h3>
                  <span 
                    v-if="store.unreadRiderNoticesCount > 0" 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                    {{ store.unreadRiderNoticesCount }} New
                  </span>
                </div>
                <p class="text-xs text-neutral-400 mt-0.5">Availability updates, break notifications, and photo proofs from delivery riders.</p>
              </div>
            </div>

            <button 
              @click="showRiderNoticesModal = false" 
              class="w-8 h-8 rounded-full bg-surface-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Filter Tabs -->
          <div class="flex items-center gap-2 relative z-10 shrink-0">
            <button 
              type="button" 
              @click="noticesFilter = 'all'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
              :class="noticesFilter === 'all' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-surface-800/80 text-neutral-400 border-surface-700/60 hover:text-white'">
              All ({{ store.riderNotices.length }})
            </button>
            <button 
              type="button" 
              @click="noticesFilter = 'unread'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
              :class="noticesFilter === 'unread' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-surface-800/80 text-neutral-400 border-surface-700/60 hover:text-white'">
              Unread ({{ store.unreadRiderNoticesCount }})
            </button>
            <button 
              type="button" 
              @click="noticesFilter = 'unavailable'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
              :class="noticesFilter === 'unavailable' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-surface-800/80 text-neutral-400 border-surface-700/60 hover:text-white'">
              On Break / Offline
            </button>
            <button 
              type="button" 
              @click="noticesFilter = 'available'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
              :class="noticesFilter === 'available' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-surface-800/80 text-neutral-400 border-surface-700/60 hover:text-white'">
              Available
            </button>
          </div>

          <!-- Notice List -->
          <div class="space-y-3 overflow-y-auto pr-1 flex-1 relative z-10">
            <div 
              v-if="filteredRiderNotices.length === 0" 
              class="py-12 text-center text-neutral-500 text-xs font-medium">
              No rider notices found in this filter.
            </div>

            <div 
              v-for="notice in filteredRiderNotices" 
              :key="notice.id"
              class="p-4 rounded-2xl border transition-all space-y-3"
              :class="notice.is_acknowledged 
                ? 'bg-surface-950/60 border-surface-800 text-neutral-300' 
                : 'bg-surface-850 border-amber-500/40 text-white shadow-md'">
              
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <div 
                    class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                    :class="notice.status === 'available' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'">
                    <i class="pi" :class="notice.status === 'available' ? 'pi-check-circle' : 'pi-clock'"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-xs text-white">{{ notice.driver_name || 'Rider' }}</span>
                      <span 
                        class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                        :class="notice.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'">
                        {{ notice.status === 'available' ? 'Available' : 'On Break / Unavailable' }}
                      </span>
                    </div>
                    <p class="text-[10px] text-neutral-400">{{ formatNoticeTime(notice.created_at) }}</p>
                  </div>
                </div>

                <!-- Acknowledge Button -->
                <button 
                  v-if="!notice.is_acknowledged" 
                  type="button"
                  @click="store.acknowledgeRiderNotice(notice.id)"
                  class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black transition-all cursor-pointer shadow-sm">
                  Mark Reviewed
                </button>
                <span 
                  v-else 
                  class="text-[10px] font-semibold text-neutral-500 flex items-center gap-1">
                  <i class="pi pi-check text-[9px] text-emerald-400"></i>
                  <span>Reviewed</span>
                </span>
              </div>

              <!-- Reason Body -->
              <div class="p-3 rounded-xl bg-surface-900 border border-surface-800 text-xs text-neutral-200 leading-relaxed">
                {{ notice.reason }}
              </div>

              <!-- Proof Photo Thumbnail if attached -->
              <div v-if="notice.proof_image" class="pt-1">
                <button 
                  type="button" 
                  @click="openDashboardProof(notice.proof_image)"
                  class="group inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-750 transition-all cursor-pointer">
                  <img :src="notice.proof_image" class="w-10 h-10 object-cover rounded-lg border border-surface-700" alt="Proof" />
                  <div class="text-left">
                    <span class="text-[11px] font-bold text-amber-300 group-hover:underline flex items-center gap-1">
                      <i class="pi pi-image text-[10px]"></i> View Proof Photo
                    </span>
                    <span class="text-[9px] text-neutral-400 block">Click to enlarge</span>
                  </div>
                </button>
              </div>

            </div>
          </div>

          <!-- Lightbox inside Modal -->
          <div 
            v-if="dashboardLightboxImage" 
            class="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4"
            @click="dashboardLightboxImage = null">
            <div class="relative max-w-2xl max-h-[85vh] p-2" @click.stop>
              <img :src="dashboardLightboxImage" class="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-surface-700" alt="Proof Enlarge" />
              <button 
                type="button" 
                @click="dashboardLightboxImage = null"
                class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-800 text-white font-bold flex items-center justify-center shadow-lg border border-surface-600 hover:bg-surface-700 cursor-pointer">
                ✕
              </button>
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

import AdminAnalyticsTab from './AdminAnalyticsTab.vue';
import AdminOrdersTab from './AdminOrdersTab.vue';
import AdminCompletedTab from './AdminCompletedTab.vue';
import AdminProductsTab from './AdminProductsTab.vue';
import AdminInventoryTab from './AdminInventoryTab.vue';
import AdminRecipesTab from './AdminRecipesTab.vue';
import AdminBookingsTab from './AdminBookingsTab.vue';
import AdminAnnouncementsTab from './AdminAnnouncementsTab.vue';
import AdminUsersTab from './AdminUsersTab.vue';
import AdminAuditTab from './AdminAuditTab.vue';
import AdminSettingsTab from './AdminSettingsTab.vue';
import StaffPinModal from '@/components/StaffPinModal.vue';

// G Shot Teas â€” Admin & Staff Dashboard Shell (Matches Figures 14â€“17 + Prototype Tabs)
export default {
  name: 'AdminDashboard',
  components: {
    AdminAnalyticsTab,
    AdminOrdersTab,
    AdminCompletedTab,
    AdminProductsTab,
    AdminInventoryTab,
    AdminRecipesTab,
    AdminBookingsTab,
    AdminAnnouncementsTab,
    AdminUsersTab,
    AdminAuditTab,
    AdminSettingsTab,
    StaffPinModal,
  },
  setup() {
    const store = useGShotStore();

    const mobileNavOpen = ref(false);
    const selectTab = (tab) => {
      if ((tab === 'users' || tab === 'settings' || tab === 'recipes' || tab === 'analytics') && !store.isAdminOrSuper) {
        return;
      }
      if (tab === 'audit' && !store.isSuperAdmin) {
        return;
      }
      store.adminTab = tab;
      mobileNavOpen.value = false;
    };

    const currentTime = ref('');
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    let timer = null;
    let noticePoller = null;
    onMounted(() => {
      updateTime();
      timer = setInterval(updateTime, 1000);
      store.fetchRiderNotices(true);
      noticePoller = setInterval(() => store.fetchRiderNotices(true), 8000);
    });
    onUnmounted(() => {
      if (timer) clearInterval(timer);
      if (noticePoller) clearInterval(noticePoller);
    });

    const activeOrdersCount = computed(() => {
      return store.orders.filter(o => ['Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)).length;
    });

    // Rider Fleet Notices State & Actions
    const showRiderNoticesModal = ref(false);
    const noticesFilter = ref('all');
    const dashboardLightboxImage = ref(null);

    const filteredRiderNotices = computed(() => {
      const list = store.riderNotices || [];
      if (noticesFilter.value === 'unread') {
        return list.filter(n => !n.is_acknowledged);
      }
      if (noticesFilter.value === 'unavailable') {
        return list.filter(n => n.status !== 'available');
      }
      if (noticesFilter.value === 'available') {
        return list.filter(n => n.status === 'available');
      }
      return list;
    });

    const formatNoticeTime = (dt) => {
      if (!dt) return '';
      const d = new Date(dt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const openDashboardProof = (img) => {
      dashboardLightboxImage.value = img;
    };

    const activeTabComponent = computed(() => {
      switch (store.adminTab) {
        case 'analytics': return store.isAdminOrSuper ? 'AdminAnalyticsTab' : 'AdminOrdersTab';
        case 'orders': return 'AdminOrdersTab';
        case 'completed': return 'AdminCompletedTab';
        case 'products': return 'AdminProductsTab';
        case 'inventory': return 'AdminInventoryTab';
        case 'recipes': return store.isAdminOrSuper ? 'AdminRecipesTab' : 'AdminOrdersTab';
        case 'bookings': return 'AdminBookingsTab';
        case 'announcements': return 'AdminAnnouncementsTab';
        case 'users': return store.isAdminOrSuper ? 'AdminUsersTab' : 'AdminOrdersTab';
        case 'audit': return store.isSuperAdmin ? 'AdminAuditTab' : 'AdminOrdersTab';
        case 'settings': return store.isAdminOrSuper ? 'AdminSettingsTab' : 'AdminOrdersTab';
        default: return 'AdminOrdersTab';
      }
    });

    // Guard: Prevent staff operators from staying in restricted admin tabs
    watch(
      () => [store.user?.role, store.adminTab],
      ([role, tab]) => {
        if (role === 'staff' && ['users', 'audit', 'settings', 'recipes', 'analytics'].includes(tab)) {
          store.adminTab = 'orders';
        }
      },
      { immediate: true }
    );

    

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

    // Super Admin: Website Shutdown & Maintenance Modal State
    const showShutdownModal = Vue.ref(false);
    const isTogglingShutdown = Vue.ref(false);
    const shutdownForm = Vue.reactive({
      maintenance_mode: false,
      maintenance_title: '',
      maintenance_message: '',
      maintenance_until: '',
    });

    const openShutdownModal = () => {
      shutdownForm.maintenance_mode = store.isMaintenanceMode;
      shutdownForm.maintenance_title = store.maintenanceTitle;
      shutdownForm.maintenance_message = store.maintenanceMessage;
      shutdownForm.maintenance_until = store.maintenanceUntil;
      showShutdownModal.value = true;
    };

    const handleSaveShutdown = async () => {
      isTogglingShutdown.value = true;
      try {
        const success = await store.setMaintenanceMode(shutdownForm.maintenance_mode, {
          title: shutdownForm.maintenance_title,
          message: shutdownForm.maintenance_message,
          until: shutdownForm.maintenance_until,
        });
        if (success) {
          showShutdownModal.value = false;
        }
      } finally {
        isTogglingShutdown.value = false;
      }
    };

    const handleRestoreWebsite = async () => {
      if (confirm('Restore Website Online? Customers will be able to access the storefront and place orders immediately.')) {
        isTogglingShutdown.value = true;
        try {
          await store.setMaintenanceMode(false);
        } finally {
          isTogglingShutdown.value = false;
        }
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
      showShutdownModal,
      isTogglingShutdown,
      shutdownForm,
      openShutdownModal,
      handleSaveShutdown,
      handleRestoreWebsite,
      showRiderNoticesModal,
      noticesFilter,
      dashboardLightboxImage,
      filteredRiderNotices,
      formatNoticeTime,
      openDashboardProof,
    };
  },
};
</script>
