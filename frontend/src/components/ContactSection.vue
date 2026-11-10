<template>
<section id="contact" class="scroll-mt-20 lg:scroll-mt-24 py-20 bg-surface-950 border-t border-surface-800">
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
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-amber-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-user"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Store Owner & Proprietor</p>
                  <p class="text-white font-semibold mt-0.5">Jefferson Alulod</p>
                  <p class="text-[10px] text-gray-400">Direct Inquiries: 0994 612 1933</p>
                </div>
              </div>

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
                  <p class="text-gray-400 mt-0.5">0994 612 1933 / +63 912 345 6789</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-surface-800 text-brand-400 flex items-center justify-center shrink-0">
                  <i class="pi pi-envelope"></i>
                </div>
                <div>
                  <p class="font-bold text-gray-300">Email Address</p>
                  <p class="text-gray-400 mt-0.5">gshotteas2@gmail.com</p>
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
                :disabled="isSubmitting"
                class="w-full py-3 rounded-xl text-sm font-bold bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-400/20 active:scale-[0.99]">
                <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-sm"></i>
                <i v-else class="pi pi-send text-xs"></i>
                <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
</template>

<script>
import * as Vue from 'vue';
import { ref } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';

// G Shot Teas — Contact Us Section (Matches Figure 6)
export default {
  name: 'ContactSection',
  setup() {
    const store = useGShotStore();
    const name = Vue.ref('');
    const email = Vue.ref('');
    const message = Vue.ref('');
    const isSubmitting = Vue.ref(false);

    const sendMessage = async () => {
      if (isSubmitting.value) return;

      const trimmedName = name.value.trim();
      const trimmedEmail = email.value.trim();
      const trimmedMsg = message.value.trim();

      if (!trimmedName || !trimmedEmail || !trimmedMsg) {
        store.notify('Please fill out all fields before sending.');
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: '2df37454-b585-4734-be8c-60165cdee7a5',
            from_name: 'G Shot Teas Contact Form',
            subject: 'New Message from ' + trimmedName + ' - G Shot Teas',
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMsg
          })
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
          store.notify('Thank you, ' + trimmedName + '! Your message has been sent successfully.');
          name.value = '';
          email.value = '';
          message.value = '';
        } else {
          store.notify(data.message || 'Something went wrong while sending your message. Please try again.');
        }
      } catch (err) {
        console.error('Web3Forms submission error:', err);
        store.notify('Failed to send message. Please check your network connection and try again.');
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      name,
      email,
      message,
      isSubmitting,
      sendMessage,
    };
  },
};
</script>
