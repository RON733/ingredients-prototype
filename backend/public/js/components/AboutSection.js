// G Shot Teas — About Us Section (Matches Figure 5)
const AboutSection = {
  template: `
    <section id="about" class="py-20 bg-surface-900 border-t border-surface-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/15 text-brand-400 uppercase tracking-widest">
            About G Shot Teas
          </span>
          <h2 class="text-4xl sm:text-5xl font-black text-white mt-3">
            OUR <span class="text-brand-500">STORY</span>
          </h2>
          <p class="text-base sm:text-lg text-gray-300 mt-4 leading-relaxed font-normal">
            G Shot Café was created with one goal in mind — to serve high-quality milk teas, aromatic coffees, savory pizzas, burgers, and hearty rice meals that satisfy every craving.
          </p>
          <p class="text-xs sm:text-sm text-gray-400 mt-2">
            We believe that food is more than just a meal — it's an experience. Every order is prepared with care, using fresh ingredients and efficient service.
          </p>
        </div>

        <!-- Mission & Vision Cards (Matches Figure 5 "OUR PURPOSE") -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <!-- Mission -->
          <div class="p-8 rounded-3xl bg-surface-800/80 border border-surface-700/80 hover:border-brand-500/50 transition-all shadow-xl group">
            <div class="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              M
            </div>
            <h3 class="text-xl font-black text-white mb-2">Our Mission</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              To deliver premium handcrafted beverages and comforting snacks with unmatched speed, consistency, and hospitality, utilizing modern web ordering to simplify every customer interaction.
            </p>
          </div>

          <!-- Vision -->
          <div class="p-8 rounded-3xl bg-surface-800/80 border border-surface-700/80 hover:border-amber-500/50 transition-all shadow-xl group">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              V
            </div>
            <h3 class="text-xl font-black text-white mb-2">Our Vision</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              To become Santa Rosa Laguna's most loved tea and casual snack destination, recognized for quality recipes, transparent kitchen inventory, and digital-first customer satisfaction.
            </p>
          </div>

        </div>

      </div>
    </section>
  `,
};
