// G Shot Teas — Contact Us Section (Matches Figure 6)
const ContactSection = {
  template: `
    <section id="contact" class="py-20 bg-surface-950 border-t border-surface-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl sm:text-5xl font-black text-white">
            CONTACT <span class="text-brand-500">US</span>
          </h2>
          <p class="text-sm sm:text-base text-gray-400 mt-3">
            Have questions, suggestions, or feedback? We'd love to hear from you. Reach out and our team will respond as soon as possible.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Get In Touch Card (Matches Figure 6) -->
          <div class="lg:col-span-5 p-8 rounded-3xl bg-surface-900 border border-surface-700/80 shadow-xl space-y-6">
            <h3 class="text-xl font-black text-white">Get In Touch</h3>

            <div class="space-y-4 text-xs">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-brand-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-map-marker"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Store Address</p>
                  <p class="text-gray-400 mt-0.5 leading-relaxed">
                    Block 9 Lot 3, Amira Townhomes, Brgy Sinalhan, Santa Rosa, Laguna
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-brand-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-phone"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Contact Number</p>
                  <p class="text-gray-400 mt-0.5">+63 912 345 6789</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-brand-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-envelope"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Email Address</p>
                  <p class="text-gray-400 mt-0.5">info@gshotcafe.com</p>
                </div>
              </div>

              <div class="flex items-start gap-3 pt-3 border-t border-surface-800">
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-amber-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-clock"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Business Hours</p>
                  <p class="text-gray-400 mt-0.5">Monday - Saturday: 9:00 AM - 10:00 PM</p>
                  <p class="text-emerald-400 font-semibold text-[11px] mt-0.5">Now Open for Online Delivery & Pickup</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Send a Message Form (Matches Figure 6) -->
          <div class="lg:col-span-7 p-8 rounded-3xl bg-surface-900 border border-surface-700/80 shadow-xl space-y-4 text-xs">
            <h3 class="text-xl font-black text-white">Send a Message</h3>

            <form @submit.prevent="sendMessage" class="space-y-4">
              <div>
                <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input 
                  v-model="name"
                  type="text" 
                  required
                  placeholder="Enter your name" 
                  class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Your Email
                </label>
                <input 
                  v-model="email"
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Your Message
                </label>
                <textarea 
                  v-model="message"
                  rows="4" 
                  required
                  placeholder="Tell us your feedback or question..." 
                  class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"></textarea>
              </div>

              <button 
                type="submit"
                class="w-full py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2">
                <i class="pi pi-send text-xs"></i>
                <span>Send Message</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  `,
  setup() {
    const store = useGShotStore();
    const name = Vue.ref('');
    const email = Vue.ref('');
    const message = Vue.ref('');

    const sendMessage = () => {
      store.notify(`Thank you, ${name.value}! Your message has been received.`);
      name.value = '';
      email.value = '';
      message.value = '';
    };

    return {
      name,
      email,
      message,
      sendMessage,
    };
  },
};
