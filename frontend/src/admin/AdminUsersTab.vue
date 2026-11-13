<template>
<div class="space-y-6 sm:space-y-8">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <i class="pi pi-shield text-[9px]"></i> Authorized Administration Console
            </span>
            <span v-if="store.isSuperAdmin" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <i class="pi pi-crown text-[9px]"></i> Super Admin Full Control Active
            </span>
          </div>
          <h2 class="text-lg sm:text-2xl font-bold text-white tracking-tight">User & Role Management</h2>
          <p class="text-xs text-gray-400 mt-1 max-w-2xl">
            Manage store personnel accounts: Baristas, Delivery Riders, and Administrators. Assign 4-digit POS PINs for staff and operational privileges.
            <span v-if="store.isSuperAdmin" class="text-amber-400 font-medium">As Super Admin, you have full rights to modify emails, change passwords, and permanently delete accounts.</span>
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <!-- Create New Personnel Button (Admin & Super Admin) -->
          <button 
            @click="openCreateModal"
            class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95">
            <i class="pi pi-user-plus text-xs"></i>
            <span>Create Personnel</span>
          </button>

          <button 
            @click="refresh"
            :disabled="loading"
            class="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 text-xs transition-colors cursor-pointer"
            title="Refresh Users">
            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
          </button>
        </div>
      </div>

      <!-- Quick Summary Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          @click="selectedRoleFilter = 'all'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'all' ? 'bg-surface-800/90 border-brand-500/60 ring-1 ring-brand-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Personnel</span>
            <i class="pi pi-users text-brand-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-white mt-1">{{ users.length }}</div>
          <span class="text-[9px] text-gray-400">All store workers</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'staff'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'staff' ? 'bg-sky-950/40 border-sky-500/70 ring-1 ring-sky-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-sky-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Staff Baristas</span>
            <i class="pi pi-id-card text-sky-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-sky-300 mt-1">{{ staffCount }}</div>
          <span class="text-[9px] text-sky-400/80">Active POS operators</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'driver'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'driver' ? 'bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Delivery Riders</span>
            <i class="pi pi-send text-emerald-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-emerald-300 mt-1">{{ driverCount }}</div>
          <span class="text-[9px] text-emerald-400/80">Delivery Fleet & GPS</span>
        </div>

        <div 
          @click="selectedRoleFilter = 'admin'"
          class="p-4 rounded-2xl border transition-all cursor-pointer"
          :class="selectedRoleFilter === 'admin' ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/30' : 'bg-surface-850/60 border-surface-700/60 hover:bg-surface-800/60'">
          <div class="flex items-center justify-between text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <span>Store Admins</span>
            <i class="pi pi-shield text-amber-400 text-xs"></i>
          </div>
          <div class="text-xl font-black text-amber-300 mt-1">{{ adminCount }}</div>
          <span class="text-[9px] text-amber-400/80">Owner & Managers</span>
        </div>
      </div>

      <!-- Filter & Search Strip -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-850/80 p-3 rounded-2xl border border-surface-750">
        <!-- Role Filters -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button 
            @click="selectedRoleFilter = 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            :class="selectedRoleFilter === 'all' ? 'bg-surface-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'">
            All ({{ users.length }})
          </button>
          <button 
            @click="selectedRoleFilter = 'staff'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-sky-300 cursor-pointer"
            :class="selectedRoleFilter === 'staff' ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-sky-950/40'">
            Staff ({{ staffCount }})
          </button>
          <button 
            @click="selectedRoleFilter = 'driver'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-emerald-300 cursor-pointer"
            :class="selectedRoleFilter === 'driver' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-emerald-950/40'">
            Delivery Rider ({{ driverCount }})
          </button>
          <button 
            @click="selectedRoleFilter = 'admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-amber-300 cursor-pointer"
            :class="selectedRoleFilter === 'admin' ? 'bg-amber-600 text-white shadow-sm' : 'hover:bg-amber-950/40'">
            Admin ({{ adminCount }})
          </button>
          <button 
            v-if="store.isSuperAdmin"
            @click="selectedRoleFilter = 'super_admin'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-purple-300 cursor-pointer"
            :class="selectedRoleFilter === 'super_admin' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-purple-950/40'">
            Super Admin ({{ superAdminCount }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name, email, phone..."
            class="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors" />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Users Table (Desktop) -->
      <div class="hidden md:block rounded-2xl bg-surface-800/90 border border-surface-700 overflow-hidden">
        <!-- Desktop Table (hidden on mobile) -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-surface-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-700">
              <tr>
                <th class="px-6 py-4">User Details</th>
                <th class="px-6 py-4">Current Role</th>
                <th class="px-6 py-4">4-Digit Staff PIN</th>
                <th class="px-6 py-4">Contact Phone</th>
                <th class="px-6 py-4">Account Status</th>
                <th class="px-6 py-4 text-right">Modify Role & Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700/50">
              
              <!-- Empty state -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                  <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
                    <i class="pi pi-users text-lg"></i>
                  </div>
                  <p class="text-sm font-bold text-gray-200">No users match your filter</p>
                  <p class="text-xs text-gray-500 mt-1">Try clearing your search terms or filter selection.</p>
                </td>
              </tr>

              <!-- User rows -->
              <tr 
                v-else
                v-for="u in filteredUsers" 
                :key="u.id"
                class="hover:bg-surface-700/30 transition-colors">
                
                <!-- Details -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img v-if="u.avatar" :src="u.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-surface-600" />
                    <div v-else class="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white text-xs">
                      {{ u.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <p class="font-bold text-white text-sm leading-tight">{{ u.name }}</p>
                        <span v-if="u.google_id" title="Google OAuth Linked" class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                          Google
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <p class="text-gray-400 text-[11px] font-mono">{{ u.email }}</p>
                        <!-- Super Admin Quick Email Edit Shortcut -->
                        <button 
                          v-if="store.isSuperAdmin"
                          @click="openEditModal(u, 'email')"
                          class="p-0.5 text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Super Admin: Change Email Address">
                          <i class="pi pi-pencil text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Role Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                    :class="getRoleBadge(u.role)">
                    {{ formatRoleName(u.role) }}
                  </span>
                </td>

                <!-- 4-Digit Staff PIN Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="u.role === 'staff'" class="flex items-center gap-2">
                    <span class="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-surface-900 border border-surface-700 text-brand-400">
                      {{ revealedPins[u.id] ? (u.pin || 'None') : (u.pin ? '••••' : 'None') }}
                    </span>
                    <button 
                      v-if="u.pin"
                      @click="togglePinReveal(u.id)"
                      class="p-1 text-gray-400 hover:text-white text-xs cursor-pointer"
                      :title="revealedPins[u.id] ? 'Hide PIN' : 'Reveal PIN'">
                      <i class="pi" :class="revealedPins[u.id] ? 'pi-eye-slash' : 'pi-eye'"></i>
                    </button>
                    <button 
                      @click="promptEditPin(u)"
                      class="p-1 text-sky-400 hover:text-sky-300 text-xs cursor-pointer"
                      title="Change PIN">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </div>
                  <span v-else class="text-gray-600 text-[11px]">—</span>
                </td>

                <!-- Phone -->
                <td class="px-6 py-4 font-mono text-gray-400 text-xs whitespace-nowrap">
                  {{ u.phone || 'N/A' }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs"
                    :class="u.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                    <span>{{ u.status || 'active' }}</span>
                  </span>
                </td>

                <!-- Role Selector & Actions -->
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    
                    <!-- Super Admin Edit Credentials Trigger (Password & Email) -->
                    <button 
                      v-if="store.isSuperAdmin"
                      @click="openEditModal(u)"
                      class="p-1.5 rounded-lg bg-surface-900 hover:bg-amber-500/20 text-gray-300 hover:text-amber-400 border border-surface-700 transition-colors cursor-pointer text-xs"
                      title="Super Admin: Edit Email / Change Password">
                      <i class="pi pi-user-edit"></i>
                    </button>

                    <select 
                      :value="u.role" 
                      @change="changeRole(u, $event.target.value)"
                      class="px-2.5 py-1 rounded-lg bg-surface-900 border border-surface-700 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-brand-500">
                      <option value="staff">Staff (Barista)</option>
                      <option value="driver">Delivery Rider</option>
                      <option value="admin">Admin (Owner)</option>
                      <option v-if="store.isSuperAdmin" value="super_admin">Super Admin</option>
                    </select>

                    <button 
                      @click="toggleStatus(u)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer"
                      :class="u.status === 'active' ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/20' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'">
                      {{ u.status === 'active' ? 'Deactivate' : 'Activate' }}
                    </button>

                    <!-- Super Admin Permanent Delete Account Action -->
                    <button 
                      v-if="store.isSuperAdmin"
                      @click="confirmDeleteUser(u)"
                      class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer text-xs ml-1"
                      title="Super Admin: Permanently Delete Account">
                      <i class="pi pi-trash"></i>
                    </button>

                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards (md:hidden) -->
      <div class="md:hidden space-y-3">
        <div v-if="filteredUsers.length === 0" class="rounded-2xl bg-surface-800/90 border border-surface-700 p-8 text-center text-gray-400">
          <div class="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
            <i class="pi pi-users text-lg"></i>
          </div>
          <p class="text-sm font-bold text-gray-200">No users match your filter</p>
          <p class="text-xs text-gray-500 mt-1">Try clearing your search terms or filter selection.</p>
        </div>

        <template v-else>
          <div 
            v-for="u in filteredUsers" 
            :key="'mobile-' + u.id" 
            class="rounded-2xl bg-surface-800/90 border border-surface-700 p-4 space-y-3">
            
            <!-- User Header: Avatar, Name, Email, Badges -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <img v-if="u.avatar" :src="u.avatar" class="w-9 h-9 rounded-full object-cover ring-1 ring-surface-600 shrink-0" />
                <div v-else class="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {{ u.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <p class="font-bold text-white text-sm truncate">{{ u.name }}</p>
                    <span v-if="u.google_id" title="Google OAuth Linked" class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                      Google
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <p class="text-gray-400 text-[11px] font-mono truncate">{{ u.email }}</p>
                    <button 
                      v-if="store.isSuperAdmin"
                      @click="openEditModal(u, 'email')"
                      class="text-gray-500 hover:text-amber-400 transition-colors cursor-pointer text-[10px]"
                      title="Super Admin: Edit Email">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <span 
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                :class="u.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'">
                <span class="w-1.5 h-1.5 rounded-full" :class="u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                <span>{{ u.status || 'active' }}</span>
              </span>
            </div>

            <!-- Role Badge & 4-Digit Staff PIN Grid -->
            <div class="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-surface-900/80 border border-surface-700/60 text-xs">
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Role</span>
                <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" :class="getRoleBadge(u.role)">
                  {{ formatRoleName(u.role) }}
                </span>
                <div v-if="u.phone" class="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                  <i class="pi pi-phone text-[9px] text-emerald-400"></i>
                  <a :href="'tel:' + u.phone" class="underline hover:text-white font-mono">{{ u.phone }}</a>
                </div>
              </div>

              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Staff PIN</span>
                <div v-if="u.role === 'staff'" class="mt-1 flex items-center gap-1.5">
                  <span class="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-surface-950 border border-surface-700 text-brand-400">
                    {{ revealedPins[u.id] ? (u.pin || 'None') : (u.pin ? '••••' : 'None') }}
                  </span>
                  <button 
                    v-if="u.pin"
                    @click="togglePinReveal(u.id)"
                    class="p-1 text-gray-400 hover:text-white text-xs cursor-pointer"
                    :title="revealedPins[u.id] ? 'Hide PIN' : 'Reveal PIN'">
                    <i class="pi" :class="revealedPins[u.id] ? 'pi-eye-slash' : 'pi-eye'"></i>
                  </button>
                  <button 
                    @click="promptEditPin(u)"
                    class="p-1 text-sky-400 hover:text-sky-300 text-xs cursor-pointer"
                    title="Change PIN">
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
                <span v-else class="text-gray-600 text-[11px] mt-1 block">—</span>
              </div>
            </div>

            <!-- Role Change Dropdown, Status Toggle & Super Admin Actions -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-surface-700/50">
              <div class="flex items-center gap-1.5 flex-1 min-w-[140px]">
                <span class="text-[10px] text-gray-400 uppercase font-bold shrink-0">Role:</span>
                <select 
                  :value="u.role" 
                  @change="changeRole(u, $event.target.value)"
                  class="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-surface-900 border border-surface-700 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-brand-500">
                  <option value="staff">Staff (Barista)</option>
                  <option value="driver">Delivery Rider</option>
                  <option value="admin">Admin (Owner)</option>
                  <option v-if="store.isSuperAdmin" value="super_admin">Super Admin</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button 
                  v-if="store.isSuperAdmin"
                  @click="openEditModal(u)"
                  class="p-1.5 rounded-xl bg-surface-900 border border-surface-700 text-amber-400 hover:bg-amber-500/20 text-xs cursor-pointer"
                  title="Super Admin: Edit Credentials">
                  <i class="pi pi-user-edit"></i>
                </button>

                <button 
                  @click="toggleStatus(u)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  :class="u.status === 'active' ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/20' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'">
                  {{ u.status === 'active' ? 'Deactivate' : 'Activate' }}
                </button>

                <button 
                  v-if="store.isSuperAdmin"
                  @click="confirmDeleteUser(u)"
                  class="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
                  title="Super Admin: Delete Account">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>

          </div>
        </template>
      </div>

      <!-- Create New Personnel Modal -->
      <div 
        v-if="createModalOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        @click.self="createModalOpen = false">
        
        <div class="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl p-5 sm:p-7 text-white space-y-5 animate-scale-up">
          
          <!-- Close button -->
          <button 
            @click="createModalOpen = false" 
            class="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-surface-800 rounded-xl transition-colors cursor-pointer">
            <i class="pi pi-times text-sm"></i>
          </button>

          <!-- Modal Header -->
          <div>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
              <i class="pi pi-user-plus"></i> Management Access Provisioning
            </span>
            <h3 class="text-xl font-black text-white mt-1">Create Personnel Account</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Provision credentials for authorized personnel, plus a 4-digit POS PIN for staff.
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitCreateUser" class="space-y-4 text-xs">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-300 mb-1">Full Name *</label>
                <input 
                  v-model="newUser.name" 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Mae Santos"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">Email Address *</label>
                <input 
                  v-model="newUser.email" 
                  type="email" 
                  required 
                  placeholder="e.g. sarah@gshotteas.com"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Role Selection -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Role & Privileges *</label>
                <select 
                  v-model="newUser.role" 
                  required
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500 cursor-pointer">
                  <option value="staff">Staff / Barista (Counter & Orders)</option>
                  <option value="driver">Delivery Rider (Fleet & GPS)</option>
                  <option value="admin">Admin (Store Owner / Manager)</option>
                  <option v-if="store.isSuperAdmin" value="super_admin">Super Admin (System Administrator)</option>
                </select>
              </div>

              <!-- 4-Digit Staff PIN (Staff Only) -->
              <div v-if="newUser.role === 'staff'">
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-gray-300">4-Digit POS PIN *</label>
                  <button 
                    type="button" 
                    @click="generateRandomPin" 
                    class="text-[10px] text-brand-400 hover:text-brand-300 underline font-bold cursor-pointer">
                    Generate
                  </button>
                </div>
                <input 
                  v-model="newUser.pin" 
                  type="text" 
                  maxlength="4" 
                  pattern="[0-9]{4}" 
                  required 
                  placeholder="e.g. 5678"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-brand-400 font-mono font-bold tracking-widest focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <!-- Super Admin Security Verification: Requires Creator's Own Password -->
            <div v-if="newUser.role === 'super_admin'" class="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2 animate-fade-in">
              <div class="flex items-center justify-between">
                <label class="font-bold text-purple-200 flex items-center gap-1.5">
                  <i class="pi pi-shield text-purple-400"></i>
                  <span>Your Super Admin Password *</span>
                </label>
                <span class="text-[10px] text-purple-300 font-mono">Security Check</span>
              </div>
              <p class="text-[11px] text-purple-300/80">
                To create a new Super Admin account, enter <strong>your own password</strong> (the one you used to log into this session) to authorize this high-privilege action.
              </p>
              <div class="relative">
                <input 
                  v-model="newUser.admin_password" 
                  :type="showCreatorPasswordInCreate ? 'text' : 'password'" 
                  required 
                  placeholder="Enter your own Super Admin password"
                  class="w-full pl-3 pr-10 py-2 rounded-xl bg-surface-950 border border-purple-500/50 text-white font-mono focus:outline-none focus:border-purple-400" />
                <button 
                  type="button" 
                  @click="showCreatorPasswordInCreate = !showCreatorPasswordInCreate"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer">
                  <i class="pi" :class="showCreatorPasswordInCreate ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Initial Password -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Initial Password *</label>
                <input 
                  v-model="newUser.password" 
                  type="text" 
                  minlength="6" 
                  required 
                  placeholder="password123"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white font-mono focus:outline-none focus:border-brand-500" />
              </div>

              <!-- Contact Phone -->
              <div>
                <label class="block font-bold text-gray-300 mb-1">Contact Phone</label>
                <input 
                  v-model="newUser.phone" 
                  type="text" 
                  placeholder="e.g. 09171234567"
                  class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Assigned Station / Address</label>
              <input 
                v-model="newUser.address" 
                type="text" 
                placeholder="e.g. G Shot Teas Counter Station, Santa Rosa Branch"
                class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
            </div>

            <p class="text-[11px] text-gray-400 bg-surface-950/60 p-3 rounded-xl border border-surface-800 flex items-start gap-2">
              <i class="pi pi-info-circle text-brand-400 text-xs shrink-0 mt-0.5"></i>
              <span>Staff can use their <strong>4-digit PIN</strong> for fast 1-second authentication on the shared counter laptop without retyping passwords.</span>
            </p>

            <!-- Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-800">
              <button 
                type="button" 
                @click="createModalOpen = false" 
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-gray-300 font-bold transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="savingUser"
                class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm shadow-amber-500/20 active:scale-95">
                <i class="pi pi-check" :class="{ 'pi-spin pi-spinner': savingUser }"></i>
                <span>{{ savingUser ? 'Provisioning...' : 'Create Account' }}</span>
              </button>
            </div>

          </form>

        </div>
      </div>

      <!-- Super Admin Edit Personnel Modal (Email, Password, Name, Phone) -->
      <div 
        v-if="editModalOpen && editingUser" 
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        @click.self="editModalOpen = false">
        
        <div class="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl p-5 sm:p-7 text-white space-y-5 animate-scale-up shadow-2xl">
          
          <!-- Close button -->
          <button 
            @click="editModalOpen = false" 
            class="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-surface-800 rounded-xl transition-colors cursor-pointer">
            <i class="pi pi-times text-sm"></i>
          </button>

          <!-- Modal Header -->
          <div>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              <i class="pi pi-crown"></i> Super Admin Privileged Action
            </span>
            <h3 class="text-xl font-black text-white mt-1">Modify Account Credentials</h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Change email address, set new password, or update details for <strong class="text-white">{{ editingUser.name }}</strong>.
            </p>
          </div>

          <!-- Edit Form -->
          <form @submit.prevent="submitEditUser" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-gray-300 mb-1">Full Name</label>
              <input 
                v-model="editForm.name" 
                type="text" 
                required 
                placeholder="Full Name"
                class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-gray-300">Email Address (Super Admin)</label>
                <span class="text-[10px] text-amber-400 font-mono">Requires Super Admin</span>
              </div>
              <input 
                v-model="editForm.email" 
                type="email" 
                required 
                placeholder="personnel@gshotteas.com"
                class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-amber-500/40 text-amber-200 focus:outline-none focus:border-amber-400 font-mono" />
              <p class="text-[10px] text-gray-400 mt-1">Changing email updates login credentials across all store sessions immediately.</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-gray-300">New Password (Super Admin)</label>
                <span class="text-[10px] text-gray-500 font-mono">Leave blank to keep unchanged</span>
              </div>
              <div class="relative">
                <input 
                  v-model="editForm.password" 
                  :type="showPasswordInEdit ? 'text' : 'password'" 
                  minlength="6"
                  placeholder="Enter new strong password (min 6 chars)"
                  class="w-full pl-3 pr-10 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white font-mono focus:outline-none focus:border-brand-500" />
                <button 
                  type="button" 
                  @click="showPasswordInEdit = !showPasswordInEdit"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer">
                  <i class="pi" :class="showPasswordInEdit ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">Contact Phone</label>
              <input 
                v-model="editForm.phone" 
                type="text" 
                placeholder="09171234567"
                class="w-full px-3 py-2 rounded-xl bg-surface-950 border border-surface-700 text-white focus:outline-none focus:border-brand-500 font-mono" />
            </div>

            <!-- Super Admin Security Verification: Confirm changes with active admin password -->
            <div v-if="store.isSuperAdmin" class="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-purple-200 flex items-center gap-1.5">
                  <i class="pi pi-lock text-purple-400"></i>
                  <span>Your Super Admin Password *</span>
                </label>
                <span class="text-[10px] text-purple-300 font-mono">Authorization</span>
              </div>
              <p class="text-[11px] text-purple-300/80">
                Enter <strong>your own Super Admin password</strong> to authorize saving modifications to this account.
              </p>
              <div class="relative">
                <input 
                  v-model="editForm.admin_password" 
                  :type="showCreatorPasswordInEdit ? 'text' : 'password'" 
                  required
                  placeholder="Enter your current Super Admin password"
                  class="w-full pl-3 pr-10 py-2 rounded-xl bg-surface-950 border border-purple-500/50 text-white font-mono focus:outline-none focus:border-purple-400" />
                <button 
                  type="button" 
                  @click="showCreatorPasswordInEdit = !showCreatorPasswordInEdit"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer">
                  <i class="pi" :class="showCreatorPasswordInEdit ? 'pi-eye-slash' : 'pi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <i class="pi pi-shield text-xs shrink-0 mt-0.5"></i>
              <span>All changes to credentials and roles are verified with your password and recorded in the immutable <strong>Audit Trail</strong>.</span>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-800">
              <button 
                type="button" 
                @click="editModalOpen = false" 
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-gray-300 font-bold transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="savingEdit"
                class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm shadow-amber-500/20 active:scale-95">
                <i class="pi pi-check" :class="{ 'pi-spin pi-spinner': savingEdit }"></i>
                <span>{{ savingEdit ? 'Saving Changes...' : 'Save Credentials' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Personnel & Role Management Tab (Admin & Super Admin Exclusive)
export default {
  name: 'AdminUsersTab',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const users = Vue.ref([]);
    const selectedRoleFilter = Vue.ref('all');
    const searchQuery = Vue.ref('');
    const revealedPins = Vue.ref({});

    // Create Modal state
    const createModalOpen = Vue.ref(false);
    const savingUser = Vue.ref(false);
    const showCreatorPasswordInCreate = Vue.ref(false);
    const showCreatorPasswordInEdit = Vue.ref(false);
    const newUser = Vue.ref({
      name: '',
      email: '',
      password: 'password123',
      role: 'staff',
      pin: '1234',
      phone: '',
      address: '',
      admin_password: '',
    });

    // Super Admin Edit Credentials Modal state
    const editModalOpen = Vue.ref(false);
    const savingEdit = Vue.ref(false);
    const editingUser = Vue.ref(null);
    const showPasswordInEdit = Vue.ref(false);
    const editForm = Vue.ref({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: '',
      admin_password: '',
    });

    Vue.onMounted(() => {
      if (!store.isAdminOrSuper) {
        store.notify('Access Denied: User & Role management is restricted to Administrators.', 'error');
        store.adminTab = 'orders';
        return;
      }
      refresh();
    });

    const refresh = async () => {
      loading.value = true;
      try {
        const res = await GST_API.getUsers();
        const rawList = Array.isArray(res.data) ? res.data : [];
        // Strictly filter workers only: exclude customers and super_admin
        // Show all management accounts (staff, driver, admin, super_admin); exclude customers
        users.value = rawList.filter(u => u.role !== 'customer');
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const staffCount = Vue.computed(() => users.value.filter(u => u.role === 'staff').length);
    const driverCount = Vue.computed(() => users.value.filter(u => u.role === 'driver').length);
    const adminCount = Vue.computed(() => users.value.filter(u => u.role === 'admin').length);
    const superAdminCount = Vue.computed(() => users.value.filter(u => u.role === 'super_admin').length);

    const filteredUsers = Vue.computed(() => {
      return users.value.filter(u => {
        if (selectedRoleFilter.value !== 'all' && u.role !== selectedRoleFilter.value) {
          return false;
        }
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim();
          const matchName = (u.name || '').toLowerCase().includes(q);
          const matchEmail = (u.email || '').toLowerCase().includes(q);
          const matchPhone = (u.phone || '').toLowerCase().includes(q);
          const matchRole = (u.role || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchRole) {
            return false;
          }
        }
        return true;
      });
    });

    const getRoleBadge = (role) => {
      if (role === 'super_admin') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      if (role === 'admin') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      if (role === 'staff') return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
      if (role === 'driver') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    };

    const formatRoleName = (role) => {
      switch (role) {
        case 'super_admin': return 'Super Admin';
        case 'admin': return 'Admin (Owner)';
        case 'staff': return 'Staff (Barista)';
        case 'driver': return 'Delivery Rider';
        default: return role;
      }
    };

    const togglePinReveal = (userId) => {
      revealedPins.value[userId] = !revealedPins.value[userId];
    };

    const promptEditPin = async (user) => {
      const currentPin = user.pin || '1234';
      const newPin = window.prompt(`Enter new 4-digit PIN for ${user.name}:`, currentPin);
      if (newPin && newPin.trim().length >= 4) {
        try {
          await GST_API.updateUser(user.id, { pin: newPin.trim() });
          store.notify(`Updated PIN for ${user.name} to ${newPin.trim()}`);
          refresh();
        } catch (err) {
          store.notify('Failed to update PIN', 'error');
        }
      }
    };

    const changeRole = async (user, newRole) => {
      let adminPassword = null;
      if (store.isSuperAdmin) {
        adminPassword = await store.promptDialog({
          title: 'Verify Super Admin Password',
          message: `Enter your own Super Admin password to confirm assigning the "${formatRoleName(newRole)}" role to ${user.name}:`,
          confirmText: 'Authorize Change',
          inputType: 'password',
          placeholder: 'Your Super Admin Password',
          icon: 'pi-shield',
        });
        if (!adminPassword) {
          refresh();
          return;
        }
      }
      try {
        const payload = { role: newRole };
        if (adminPassword) payload.admin_password = adminPassword;
        await GST_API.updateUser(user.id, payload);
        store.notify(`Updated ${user.name} role to ${formatRoleName(newRole)}`, 'success');
        refresh();
      } catch (err) {
        const msg = err.response?.data?.message || 'Error updating user role';
        store.notify(msg, 'error');
        refresh();
      }
    };

    const toggleStatus = async (user) => {
      const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
      try {
        await GST_API.updateUser(user.id, { status: nextStatus });
        store.notify(`Account ${nextStatus}: ${user.name}`);
        refresh();
      } catch (err) {
        store.notify('Error toggling status', 'error');
      }
    };

    const openCreateModal = () => {
      generateRandomPin();
      newUser.value.name = '';
      newUser.value.email = '';
      newUser.value.password = 'password123';
      newUser.value.role = store.isSuperAdmin ? 'super_admin' : 'staff';
      newUser.value.phone = '';
      newUser.value.address = '';
      newUser.value.admin_password = '';
      showCreatorPasswordInCreate.value = false;
      createModalOpen.value = true;
    };

    const generateRandomPin = () => {
      const random = Math.floor(1000 + Math.random() * 9000).toString();
      newUser.value.pin = random;
    };

    const submitCreateUser = async () => {
      if (newUser.value.role === 'super_admin' && !newUser.value.admin_password) {
        store.notify('Please enter your own Super Admin password to authorize creating a Super Admin account.', 'error');
        return;
      }
      savingUser.value = true;
      try {
        const payload = { ...newUser.value };
        if (payload.role !== 'staff') {
          delete payload.pin;
        }
        if (payload.role !== 'super_admin' && !payload.admin_password) {
          delete payload.admin_password;
        }
        await GST_API.createUser(payload);
        store.notify(`Account for ${newUser.value.name} created successfully!`, 'success');
        createModalOpen.value = false;
        newUser.value.admin_password = '';
        refresh();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create personnel account.';
        store.notify(msg, 'error');
      } finally {
        savingUser.value = false;
      }
    };

    // Super Admin: Open Edit Credentials Modal
    const openEditModal = (user) => {
      editingUser.value = user;
      editForm.value = {
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        role: user.role || 'staff',
        admin_password: '',
      };
      showPasswordInEdit.value = false;
      showCreatorPasswordInEdit.value = false;
      editModalOpen.value = true;
    };

    // Super Admin: Save Edited Credentials
    const submitEditUser = async () => {
      if (!editingUser.value) return;
      if (store.isSuperAdmin && !editForm.value.admin_password) {
        store.notify('Please enter your own Super Admin password to confirm modifications.', 'error');
        return;
      }
      savingEdit.value = true;
      try {
        const payload = {
          name: editForm.value.name,
          email: editForm.value.email,
          phone: editForm.value.phone,
          admin_password: editForm.value.admin_password,
        };
        if (editForm.value.password && editForm.value.password.trim().length > 0) {
          payload.password = editForm.value.password.trim();
        }

        await GST_API.updateUser(editingUser.value.id, payload);
        store.notify(`Successfully updated account credentials for ${editingUser.value.name}`, 'success');
        editModalOpen.value = false;
        editForm.value.admin_password = '';
        refresh();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update account credentials.';
        store.notify(msg, 'error');
      } finally {
        savingEdit.value = false;
      }
    };

    // Super Admin: Delete Personnel Account
    const confirmDeleteUser = async (user) => {
      if (!store.isSuperAdmin) {
        store.notify('Only Super Admins have permission to delete accounts.', 'error');
        return;
      }

      const confirmed = await store.confirmDialog({
        title: 'Delete Account Permanently',
        message: `Are you sure you want to permanently delete account "${user.name}" (${user.email})? This action cannot be undone.`,
        confirmText: 'Delete Permanently',
        cancelText: 'Cancel',
        variant: 'danger',
        icon: 'pi-trash',
      });

      if (!confirmed) return;

      try {
        await GST_API.deleteUser(user.id);
        store.notify(`Account for "${user.name}" deleted permanently.`, 'success');
        refresh();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete account.';
        store.notify(msg, 'error');
      }
    };

    return {
      store,
      loading,
      users,
      selectedRoleFilter,
      searchQuery,
      revealedPins,
      staffCount,
      driverCount,
      adminCount,
      filteredUsers,
      createModalOpen,
      savingUser,
      newUser,
      getRoleBadge,
      formatRoleName,
      togglePinReveal,
      promptEditPin,
      changeRole,
      toggleStatus,
      openCreateModal,
      generateRandomPin,
      submitCreateUser,
      refresh,
      editModalOpen,
      savingEdit,
      editingUser,
      showPasswordInEdit,
      editForm,
      openEditModal,
      submitEditUser,
      confirmDeleteUser,
      superAdminCount,
      showCreatorPasswordInCreate,
      showCreatorPasswordInEdit,
    };
  },
};
</script>
