// G Shot Teas — Landing Hero Component (Matches Figure 3)
const LandingHero = {
  template: `
    <section id="home" class="relative overflow-hidden min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center text-center px-4 py-12 lg:py-20">
      
      <!-- Background Image with Dark Vignette Gradient -->
      <div class="absolute inset-0 z-0">
        <img 
          src="./assets/hero-banner.png" 
          alt="G Shot Teas Banner" 
          class="w-full h-full object-cover object-center filter brightness-[0.28] contrast-125 transform scale-105 transition-transform duration-1000"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-surface-900/80"></div>
        <div class="absolute inset-0 bg-radial-vignette opacity-70"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-4xl mx-auto py-16 animate-fade-in">
        
        <!-- Category Pill Strip -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
          <span>MILKTEA</span>
          <span class="text-brand-600">•</span>
          <span>COFFEE</span>
          <span class="text-brand-600">•</span>
          <span>PIZZA</span>
          <span class="text-brand-600">•</span>
          <span>BURGERS</span>
          <span class="text-brand-600">•</span>
          <span>RICE MEALS</span>
        </div>

        <!-- Main Headline (Satisfy Yourself) -->
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">
          <span class="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-500 bg-clip-text text-transparent">
            Satisfy Yourself
          </span>
        </h1>

        <!-- Subheadline -->
        <p class="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Refreshing milk teas, aromatic coffees, cheesy pizzas, juicy burgers, and hearty rice meals crafted fresh for every craving in Santa Rosa, Laguna.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button 
            @click="scrollToMenu"
            class="px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-surface-800/90 hover:bg-surface-700 text-white border border-surface-600 transition-all hover:scale-105 shadow-lg shadow-black/40 flex items-center gap-2">
            <i class="pi pi-list"></i>
            <span>View Menu</span>
          </button>
          
          <button 
            @click="orderNow"
            class="px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white transition-all hover:scale-105 shadow-xl shadow-brand-600/30 flex items-center gap-2">
            <i class="pi pi-bolt"></i>
            <span>Order Now</span>
          </button>
        </div>

      </div>
    </section>
  `,
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
