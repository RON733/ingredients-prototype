<template>
<section id="home" class="relative overflow-hidden min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center text-center px-4 py-12 lg:py-20">
      
      <!-- Background Image with Dark Vignette Gradient -->
      <div class="absolute inset-0 z-0">
        <img 
          src="/assets/hero-banner.png" 
          alt="G Shot Teas Banner" 
          class="w-full h-full object-cover object-center filter brightness-[0.28] contrast-125 transform scale-105 transition-transform duration-1000"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-surface-900/80"></div>
        <div class="absolute inset-0 bg-radial-vignette opacity-70"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-4xl mx-auto py-10 sm:py-16 animate-fade-in w-full px-2">
        
        <!-- Category Pill Strip (Responsive wrap) -->
        <div class="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-surface-900 border border-surface-700 text-gray-300 text-[10px] sm:text-xs font-medium tracking-wider uppercase mb-4 sm:mb-6 max-w-full">
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

        <!-- Main Headline (Satisfy Yourself) -->
        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
          Satisfy Yourself
        </h1>

        <!-- Subheadline -->
        <p class="text-xs sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2">
          Refreshing milk teas, aromatic coffees, cheesy pizzas, juicy burgers, and hearty rice meals crafted fresh for every craving in Santa Rosa, Laguna.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
          <button 
            @click="scrollToMenu"
            class="w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base bg-surface-800 hover:bg-surface-700 text-white border border-surface-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <i class="pi pi-list"></i>
            <span>View Menu</span>
          </button>
          
          <button 
            @click="orderNow"
            class="w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
            <i class="pi pi-bolt"></i>
            <span>Order Now</span>
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
      store.activeSection = 'menu';
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const orderNow = () => {
      scrollToMenu();
    };

    return {
      store,
      scrollToMenu,
      orderNow,
    };
  },
};
</script>
