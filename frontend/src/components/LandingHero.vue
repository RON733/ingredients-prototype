<template>
<section id="home" class="relative overflow-hidden min-h-[68dvh] sm:min-h-[calc(100vh-5rem)] sm:min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12 lg:py-16">
      
      <!-- Background Image with Dark Vignette Gradient -->
      <div class="absolute inset-0 z-0">
        <img 
          src="/assets/hero-banner.png" 
          alt="G Shot Teas — Milk Tea, Coffee, Pizza, Burgers, and Rice Meals in Santa Rosa, Laguna" 
          class="w-full h-full object-cover object-center filter brightness-[0.28] contrast-125 transform scale-105 transition-transform duration-1000"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-surface-900/80"></div>
        <div class="absolute inset-0 bg-radial-vignette opacity-70"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-4xl mx-auto py-4 sm:py-10 animate-fade-in w-full px-1 sm:px-2">
        
        <!-- Top Badges / Info Stacks: Note Banner directly ABOVE the Category Pill Strip -->
        <div class="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-6">
          
          <!-- Order Availability Note Banner (Editable by Staff, Admin, Super Admin) -->
          <div 
            v-if="store.isOrderAreaNoteEnabled && store.orderAreaNote" 
            class="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-amber-500/10 animate-fade-in max-w-full leading-snug">
            <span class="flex h-2 w-2 sm:h-2.5 sm:w-2.5 relative shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-amber-500"></span>
            </span>
            <i class="pi pi-map-marker text-amber-400 text-[11px] sm:text-sm shrink-0"></i>
            <span class="tracking-wide">{{ store.orderAreaNote }}</span>
          </div>

          <!-- Category Pill Strip (Responsive wrap) -->
          <div class="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-surface-900/90 border border-surface-700 text-gray-300 text-[10px] sm:text-xs font-medium tracking-wider uppercase max-w-full">
            <span>MILKTEA</span>
            <span class="text-gray-600">•</span>
            <span>COFFEE</span>
            <span class="text-gray-600">•</span>
            <span>PIZZA</span>
            <span class="text-gray-600">•</span>
            <span>BURGERS</span>
            <span class="text-gray-600">•</span>
            <span>RICE MEALS</span>
          </div>

        </div>

        <!-- Main Headline (Satisfy Yourself) -->
        <h1 class="text-[2.25rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-3 sm:mb-6 drop-shadow-2xl leading-[1.08] sm:leading-tight">
          <span class="sr-only">G Shot Teas Santa Rosa Laguna — </span>Satisfy Yourself
        </h1>

        <!-- Subheadline -->
        <p class="text-xs sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-normal px-2">
          Refreshing milk teas, aromatic coffees, cheesy pizzas, juicy burgers, and hearty rice meals crafted fresh for every craving in Santa Rosa, Laguna.
        </p>

        <!-- CTA Buttons -->
        <div class="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <button 
            @click="scrollToMenu"
            class="w-full sm:w-auto px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base bg-surface-800 hover:bg-surface-700 text-white border border-surface-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
            <i class="pi pi-list"></i>
            <span>View Menu</span>
          </button>
          
          <button 
            @click="openCart"
            class="w-full sm:w-auto px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-lg shadow-yellow-400/15">
            <i class="pi pi-shopping-cart"></i>
            <span>View Cart</span>
            <span 
              v-if="store.cartCount > 0" 
              class="ml-0.5 px-2 py-0.5 text-[10px] sm:text-xs bg-black text-yellow-400 rounded-full font-black leading-none">
              {{ store.cartCount }}
            </span>
          </button>
        </div>

      </div>
    </section>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Landing Hero Component (Matches Figure 3)
export default {
  name: 'LandingHero',
  setup() {
    const store = useGShotStore();

    const scrollToMenu = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        store.currentView = 'menu';
        store.activeSection = 'menu';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // On desktop / wide displays: ensure customer view and smooth-scroll to #menu
      store.currentView = 'customer';
      store.activeSection = 'menu';
      const el = document.getElementById('menu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        Vue.nextTick(() => {
          const retryEl = document.getElementById('menu');
          if (retryEl) retryEl.scrollIntoView({ behavior: 'smooth' });
        });
      }
    };

    const openCart = () => {
      store.cartOpen = true;
    };

    return {
      store,
      scrollToMenu,
      openCart,
    };
  },
};
</script>
