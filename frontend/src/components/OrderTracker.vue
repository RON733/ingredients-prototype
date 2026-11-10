<template>
<div class="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      <!-- Back to Home -->
      <button 
        @click="backToHome"
        class="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors">
        <i class="pi pi-arrow-left"></i>
        <span>Back to Store</span>
      </button>

      <div v-if="order && order.order_number" class="bg-surface-800/90 rounded-3xl border border-surface-700 p-6 sm:p-10 space-y-8 shadow-2xl">
        
        <!-- Order ID & Live Status Header -->
        <div class="border-b border-surface-700/60 pb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
              <h2 class="text-3xl font-black text-white mt-1">{{ order.order_number }}</h2>
            </div>
            <div class="text-right">
              <span 
                class="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                :class="statusBadgeClass">
                <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
                {{ order.status }}
              </span>
              <p class="text-[11px] text-gray-400 mt-1 font-mono">
                Placed {{ formatTime(order.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 4-Step Progress Bar (Matches Figure 11 in Capstone) -->
        <div>
          <div class="grid grid-cols-4 gap-2 text-center text-xs font-bold mb-3">
            <span :class="currentStepIndex >= 0 ? 'text-amber-400' : 'text-gray-500'">Pending</span>
            <span :class="currentStepIndex >= 1 ? 'text-brand-400' : 'text-gray-500'">Preparing</span>
            <span :class="currentStepIndex >= 2 ? 'text-sky-400' : 'text-gray-500'">
              {{ order.order_type === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup' }}
            </span>
            <span :class="currentStepIndex >= 3 ? 'text-emerald-400' : 'text-gray-500'">Completed</span>
          </div>

          <!-- Progress Bar Track -->
          <div class="h-2.5 bg-surface-900 rounded-full overflow-hidden p-0.5 border border-surface-700 flex">
            <div 
              class="h-full rounded-full transition-all duration-700 ease-out bg-yellow-400"
              :style="{ width: progressPercentage + '%' }">
            </div>
          </div>
          <p class="text-[11px] text-gray-400 text-center mt-2.5">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Estimated Delivery Time & Fulfillment Card (No Map on Customer Side) -->
        <div v-if="order.order_type === 'Delivery'" class="rounded-3xl border border-surface-700/80 bg-surface-900/90 p-5 sm:p-7 space-y-6 shadow-xl">
          
          <!-- Header: Estimated Delivery Time -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-800">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🛵
              </div>
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Doorstep Delivery
                </span>
                <h3 class="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">Estimated Delivery Time</h3>
              </div>
            </div>

            <!-- Big ETA Badge -->
            <div class="text-left sm:text-right">
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-800 border border-surface-700 shadow-md">
                <i class="pi pi-clock text-amber-400 text-sm"></i>
                <span class="text-base sm:text-lg font-black text-white font-mono">{{ estimatedDeliveryRange }}</span>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">
                {{ etaStatusSubtitle }}
              </p>
            </div>
          </div>

          <!-- Real-Time Delivery State Banner -->
          <div class="p-4 rounded-2xl border transition-all"
            :class="order.status === 'Out for Delivery' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
              : order.status === 'Preparing' 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : order.status === 'Completed'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-surface-800/80 border-surface-700 text-gray-300'">
            <div class="flex items-center gap-3">
              <span class="text-2xl shrink-0">
                {{ order.status === 'Out for Delivery' ? '🚀' : order.status === 'Preparing' ? '🧋' : order.status === 'Completed' ? '🎉' : '⏳' }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-sm text-white">{{ currentDeliveryStateTitle }}</p>
                <p class="text-xs text-gray-300 mt-0.5">{{ currentDeliveryStateDesc }}</p>
              </div>
            </div>
          </div>

          <!-- Rider En Route High-Priority Alert Banner -->
          <div v-if="order.on_the_way_notified_at && order.status === 'Out for Delivery'"
            class="p-4 rounded-2xl bg-amber-400/15 border-2 border-amber-400/40 text-amber-200 shadow-lg shadow-amber-400/5 animate-fade-in space-y-2 mb-6">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-400/25 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl shrink-0 shadow-inner animate-pulse">
                  🛵
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-black text-white text-sm">Rider Is Heading To Your Doorstep!</h4>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black">
                      En Route
                    </span>
                  </div>
                  <p class="text-xs text-amber-200/90 mt-0.5">
                    <strong>{{ order.driver_name || 'Your rider' }}</strong> departed for your address at 
                    <span class="font-bold underline">{{ formatTime(order.on_the_way_notified_at) }}</span>.
                  </p>
                </div>
              </div>
            </div>
            <div class="pt-2 border-t border-amber-400/20 text-[11px] text-gray-300 flex items-center gap-2">
              <i class="pi pi-bell text-amber-400 text-xs"></i>
              <span>Please keep your phone active and have your cash / payment ready for quick delivery handover.</span>
            </div>
          </div>

          <!-- Delivery Destination & Dispatch Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Destination Address -->
            <div class="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/70 space-y-1.5">
              <div class="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <i class="pi pi-map-marker text-xs"></i>
                <span>Delivery Address</span>
              </div>
              <p class="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {{ order.delivery_address || 'Santa Rosa, Laguna' }}
              </p>
              <p v-if="order.notes" class="text-[11px] text-gray-400 italic">
                Note: "{{ order.notes }}"
              </p>
            </div>

            <!-- Rider / Dispatch Hub -->
            <div class="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/70 space-y-1.5">
              <div class="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <i class="pi pi-user text-xs"></i>
                <span>{{ order.driver_name ? 'Assigned Courier' : 'Dispatch Hub' }}</span>
              </div>
              <p class="text-xs sm:text-sm font-bold text-white">
                {{ order.driver_name || 'G Shot Delivery Partner' }}
              </p>
              <p class="text-[11px] text-gray-400">
                Dispatched from: <span class="text-gray-300 font-medium">Santa Rosa Hub, Laguna</span>
              </p>
              <div v-if="order.driver_phone" class="pt-1">
                <a :href="'tel:' + order.driver_phone" class="inline-flex items-center gap-1.5 text-xs text-brand-400 font-bold hover:underline">
                  <i class="pi pi-phone text-[10px]"></i> {{ order.driver_phone }}
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Customer & Delivery Info Card -->
        <div class="p-5 rounded-2xl bg-surface-900/60 border border-surface-700/60 text-xs space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-400">Customer</span>
            <span class="font-bold text-white">{{ order.customer_name || "Customer" }} ({{ order.customer_phone || "" }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Fulfillment</span>
            <span class="font-bold text-brand-400">{{ order.order_type }}</span>
          </div>
          <div v-if="order.delivery_address" class="flex justify-between">
            <span class="text-gray-400">Address</span>
            <span class="font-medium text-gray-300 text-right max-w-xs">{{ order.delivery_address }}</span>
          </div>
          <div v-if="order.notes" class="flex justify-between">
            <span class="text-gray-400">Notes</span>
            <span class="text-gray-300 italic text-right">{{ order.notes }}</span>
          </div>
        </div>

        <!-- Ordered Items Summary (Matches Figure 11) -->
        <div>
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</h4>
          <div class="space-y-3">
            <div 
              v-for="item in order.items" 
              :key="item.id"
              class="flex items-center justify-between py-2 border-b border-surface-700/50 text-xs sm:text-sm">
              <div>
                <p class="font-bold text-white">
                  {{ item.product_name }} 
                  <span class="text-gray-400 font-normal">x{{ item.quantity }}</span>
                </p>
                <p v-if="item.customization" class="text-[11px] text-gray-400">
                  <span v-if="item.customization.size">{{ item.customization.size }}</span>
                  <span v-if="item.customization.sugar"> • {{ item.customization.sugar }}</span>
                  <span v-if="item.customization.ice"> • {{ item.customization.ice }}</span>
                </p>
              </div>
              <span class="font-black text-white">
                ₱{{ Number(item.subtotal).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

                <!-- PayMongo Dynamic QR Ph Code Card (Instant In-Page Payment) -->
        <div 
          v-if="order && order.payment_method === 'PayMongo' && (order.payment_status === 'Pending' || !order.payment_status) && order.status !== 'Cancelled'"
          class="p-5 sm:p-6 rounded-3xl bg-surface-900 border-2 border-emerald-500/50 shadow-2xl space-y-4 text-center relative overflow-hidden animate-fade-in my-4">
          
          <div class="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <div class="flex items-center gap-2 text-left">
              <span class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                <i class="pi pi-qrcode"></i>
              </span>
              <div>
                <h4 class="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>PayMongo QR Ph</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Scan na All
                  </span>
                </h4>
                <p class="text-[11px] text-gray-400">Scan with GCash, Maya, or any Bank App</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Amount Due</span>
              <span class="text-sm sm:text-base font-black text-emerald-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
            </div>
          </div>

          <!-- QR Code Display Box -->
          <div class="p-4 rounded-2xl bg-surface-950/90 border border-surface-800 space-y-3 inline-block w-full max-w-sm mx-auto">
            <div v-if="order.paymongo_qr_image" class="relative group inline-block mx-auto">
              <div class="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-2xl bg-white p-3 border-2 border-emerald-400/60 shadow-xl flex items-center justify-center overflow-hidden">
                <img 
                  :src="order.paymongo_qr_image" 
                  alt="PayMongo QR Ph Code" 
                  class="w-full h-full object-contain cursor-pointer"
                  @click="isPaymongoQrPreviewOpen = true"
                  title="Click to view full size"
                />
              </div>
            </div>
            
            <div v-else class="py-8 text-center space-y-2">
              <i class="pi pi-spin pi-spinner text-2xl text-emerald-400"></i>
              <p class="text-xs text-gray-400">Generating live QR Ph code...</p>
            </div>

            <!-- Supported Apps Banner -->
            <div class="flex items-center justify-center gap-1.5 text-[10px] text-gray-300 font-bold flex-wrap pt-1">
              <span class="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">GCash</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Maya</span>
              <span class="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-400/30">BDO / BPI</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">QR Ph Banks</span>
            </div>
          </div>

          <!-- Instructions -->
          <p class="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
            Open your <strong>GCash</strong> or <strong>Maya</strong> app, tap <strong>Scan QR</strong>, and point your camera at the QR code. Once paid, this page updates automatically!
          </p>

          <!-- Status & Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 max-w-sm mx-auto">
            <button 
              type="button"
              @click="verifyPayMongoStatus(order)"
              :disabled="isVerifyingPaymongo"
              class="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50">
              <i class="pi" :class="isVerifyingPaymongo ? 'pi-spin pi-spinner' : 'pi-refresh'"></i>
              <span>{{ isVerifyingPaymongo ? 'Checking Status...' : 'Check Payment Status' }}</span>
            </button>

            <a 
              v-if="order.paymongo_qr_image"
              :href="order.paymongo_qr_image"
              :download="`PayMongo-QR-Order-${order.order_number || order.id}.png`"
              class="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-gray-300 hover:text-white border border-surface-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="pi pi-download"></i>
              <span>Save QR</span>
            </a>
          </div>

          <!-- Fallback link for Card / Hosted Portal -->
          <div v-if="order.paymongo_checkout_url" class="pt-2 border-t border-surface-800">
            <a 
              :href="order.paymongo_checkout_url" 
              target="_blank" 
              class="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold inline-flex items-center gap-1">
              <span>Or pay using Credit/Debit Card portal</span>
              <i class="pi pi-external-link text-[10px]"></i>
            </a>
          </div>

        </div>

        <!-- Financial Totals -->
        <div class="pt-4 border-t border-surface-700 space-y-2 text-xs">
          <div class="flex justify-between text-gray-400">
            <span>Payment Method</span>
            <span class="font-bold text-white">
              {{ order.payment_method }} 
              <span :class="order.payment_status === 'Verified' || order.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'">
                ({{ order.payment_status }})
              </span>
            </span>
          </div>
          <div v-if="order.gcash_ref" class="flex justify-between text-xs">
            <span class="text-gray-400">GCash Ref No.</span>
            <span class="font-mono font-bold text-sky-400">{{ order.gcash_ref }}</span>
          </div>
          <div v-if="order.proof_image" class="flex justify-between text-xs items-center">
            <span class="text-gray-400">GCash Receipt</span>
            <button 
              type="button" 
              @click="previewReceipt = order.proof_image"
              class="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] underline cursor-pointer">
              <i class="pi pi-check-circle text-[10px]"></i> View Attached Receipt
            </button>
          </div>
          <div v-if="order.delivery_fee > 0" class="flex justify-between text-gray-400">
            <span>Delivery Fee</span>
            <span class="font-medium text-white">₱{{ Number(order.delivery_fee).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xl font-black text-white pt-2">
            <span>Total</span>
            <span class="text-brand-400">₱{{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Action / Cancellation (Page 44 System Constraint) -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-[11px] text-gray-500">
            Auto-refreshing every 5 seconds.
          </p>
          
          <button 
            v-if="order.status === 'Pending'"
            @click="cancelOrder"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors">
            Cancel Order
          </button>
          <span 
            v-else-if="order.status !== 'Completed' && order.status !== 'Cancelled'"
            class="text-xs text-gray-400 italic">
            Kitchen preparation underway (cancellation locked)
          </span>
        </div>

      </div>

      <!-- No Active Order State -->
      <div v-else class="text-center py-20 bg-surface-800/50 rounded-3xl border border-surface-700 p-8">
        <div class="text-4xl mb-4">📦</div>
        <h3 class="text-lg font-bold text-white">No Active Order Selected</h3>
        <p class="text-xs text-gray-400 mt-1">Place an order or check your order history to track progress.</p>
        <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button 
            @click="backToHome"
            class="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer">
            Explore Menu
          </button>
          <button 
            @click="store.currentView = 'history'; window.scrollTo({ top: 0, behavior: 'smooth' })"
            class="px-5 py-2.5 rounded-xl bg-surface-700 hover:bg-surface-600 text-white text-xs font-bold border border-surface-600 transition-all flex items-center gap-1.5 cursor-pointer">
            <i class="pi pi-history text-brand-400"></i>
            <span>View Order History</span>
          </button>
        </div>
      </div>

      <!-- Receipt Lightbox Modal -->
      <div 
        v-if="previewReceipt" 
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        @click.self="previewReceipt = null">
        <div class="relative max-w-lg w-full bg-surface-900 border border-surface-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
          <div class="flex items-center justify-between pb-3 border-b border-surface-800">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-receipt text-sky-400"></i> Your Uploaded GCash Receipt
            </h4>
            <button 
              @click="previewReceipt = null" 
              class="w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer">
              ✕
            </button>
          </div>
          <div class="max-h-[65vh] overflow-auto rounded-2xl bg-black border border-surface-800 p-2 flex items-center justify-center">
            <img :src="previewReceipt" alt="Payment Receipt" class="max-h-[60vh] w-auto object-contain rounded-lg" />
          </div>
          <div class="text-right">
            <button 
              @click="previewReceipt = null" 
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold transition-colors cursor-pointer">
              Close Preview
            </button>
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

// G Shot Teas — Order Tracker Component with Free Leaflet GPS Tracking
export default {
  name: 'OrderTracker',
  setup() {
    const store = useGShotStore();
    const order = Vue.computed(() => store.activeOrder);

    const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];

    const currentStepIndex = Vue.computed(() => {
      if (!order.value) return 0;
      const s = order.value.status;
      if (s === 'Pending') return 0;
      if (s === 'Preparing') return 1;
      if (s === 'Ready for Pickup' || s === 'Out for Delivery') return 2;
      if (s === 'Completed') return 3;
      return 0;
    });

    const progressPercentage = Vue.computed(() => {
      const idx = currentStepIndex.value;
      if (idx === 0) return 25;
      if (idx === 1) return 50;
      if (idx === 2) return 75;
      if (idx === 3) return 100;
      return 25;
    });

    const statusBadgeClass = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Completed') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      if (s === 'Preparing') return 'bg-brand-500/20 text-brand-400 border border-brand-500/40';
      if (s === 'Cancelled') return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    });

    const statusDotClass = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Completed') return 'bg-emerald-400';
      if (s === 'Preparing') return 'bg-brand-400 animate-pulse';
      if (s === 'Cancelled') return 'bg-rose-400';
      return 'bg-amber-400 animate-pulse';
    });

    const statusMessage = Vue.computed(() => {
      const s = order.value?.status;
      if (s === 'Pending') return 'We have received your order! Awaiting barista confirmation.';
      if (s === 'Preparing') return 'Barista is preparing your tea & kitchen comfort food fresh!';
      if (s === 'Ready for Pickup') return 'Your order is packed and ready for pickup at the store counter!';
      if (s === 'Out for Delivery') return 'Your order has been handed to our rider and is on the way!';
      if (s === 'Completed') return 'Order completed! Thank you for enjoying G Shot Teas!';
      if (s === 'Cancelled') return 'This order was cancelled. Ingredients returned to kitchen stock.';
      return '';
    });

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const backToHome = () => {
      store.currentView = 'customer';
      store.activeSection = 'home';
    };

    const cancelOrder = async () => {
      if (!confirm('Are you sure you want to cancel this order?')) return;
      try {
        await GST_API.updateOrderStatus(order.value.id, 'Cancelled');
        store.notify('Order cancelled. Ingredients returned to inventory.', 'info');
        store.refreshActiveOrder(order.value.id);
        store.fetchIngredients();
      } catch (err) {
        store.notify('Could not cancel order.', 'error');
      }
    };

    const previewReceipt = Vue.ref(null);

    // --- Geometry & Navigation Calculations ---
    const calcBearing = (lat1, lon1, lat2, lon2) => {
      const toRad = deg => (deg * Math.PI) / 180;
      const toDeg = rad => (rad * 180) / Math.PI;
      const p1 = toRad(lat1), p2 = toRad(lat2);
      const dLon = toRad(lon2 - lon1);
      const y = Math.sin(dLon) * Math.cos(p2);
      const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLon);
      return Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);
    };

    const getCompassHeading = (deg) => {
      const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
      const idx = Math.round(deg / 45) % 8;
      return directions[idx];
    };

    const calcDirectDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // meters
      const p1 = (lat1 * Math.PI) / 180;
      const p2 = (lat2 * Math.PI) / 180;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1) * Math.cos(p2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const formatDistance = (meters) => {
      if (!meters || meters <= 0) return '0 m';
      if (meters >= 1000) {
        return (meters / 1000).toFixed(1) + ' km away';
      }
      return Math.round(meters) + ' m away';
    };

    const estimatedDeliveryRange = Vue.computed(() => {
      if (!order.value) return '30–45 mins';
      switch (order.value.status) {
        case 'Pending':
          return '35–45 mins';
        case 'Preparing':
          return '25–35 mins';
        case 'Out for Delivery':
          return riderEtaText.value ? `${riderEtaText.value}` : '10–15 mins';
        case 'Completed':
          return 'Delivered';
        case 'Cancelled':
          return 'Cancelled';
        default:
          return '30–45 mins';
      }
    });

    const etaStatusSubtitle = Vue.computed(() => {
      if (!order.value) return 'Estimated delivery window';
      switch (order.value.status) {
        case 'Pending':
          return 'Waiting for store confirmation';
        case 'Preparing':
          return 'Freshly brewing in kitchen';
        case 'Out for Delivery':
          return 'Rider heading to your address';
        case 'Completed':
          return 'Order delivered successfully';
        default:
          return 'Estimated delivery window';
      }
    });

    const currentDeliveryStateTitle = Vue.computed(() => {
      if (!order.value) return 'Delivery in progress';
      switch (order.value.status) {
        case 'Pending':
          return 'Order Placed & Awaiting Confirmation';
        case 'Preparing':
          return 'Kitchen Brewing & Packing Drinks';
        case 'Out for Delivery':
          return order.value.on_the_way_notified_at ? 'Rider Is Heading To Your Doorstep' : 'Out for Delivery (Dispatched from Hub)';
        case 'Completed':
          return 'Order Delivered';
        default:
          return 'Processing Order';
      }
    });

    const currentDeliveryStateDesc = Vue.computed(() => {
      if (!order.value) return '';
      switch (order.value.status) {
        case 'Pending':
          return 'Your order has been transmitted to G Shot Teas kitchen. We will start preparing shortly.';
        case 'Preparing':
          return 'Our baristas are preparing your tea drinks with exact sweetness and ice levels.';
        case 'Out for Delivery':
          return order.value.on_the_way_notified_at ? ('Rider ' + (order.value.driver_name || 'courier') + ' is on the way to your doorstep (' + formatTime(order.value.on_the_way_notified_at) + '). Please keep your phone reachable.') : 'Your drinks have been safely packed and handed to our rider. Rider is prepping to depart.';
        case 'Completed':
          return 'Delivered to your address! Thank you for ordering at G Shot Teas!';
        default:
          return '';
      }
    });

    const formatEta = (seconds) => {
      if (!seconds || seconds <= 60) return '~1 min ETA';
      const mins = Math.max(1, Math.round(seconds / 60));
      return `~${mins} mins ETA`;
    };

    // --- State for Direction, Distance & Pin Adjustment ---
    const mapTheme = Vue.ref('street'); // 'street' (matches Grab screenshot) or 'dark'
    const riderDistanceText = Vue.ref('Calculating route...');
    const riderEtaText = Vue.ref('~5 mins');
    const riderDirectionText = Vue.ref('Heading North-East');
    const riderBearingDeg = Vue.ref(55);
    const tripProgressPercent = Vue.ref(65);
    const riderProximityStatus = Vue.ref('');

    // Real-Time GPS Freshness & Proximity Geofencing
    const lastGpsTimestamp = Vue.ref(Date.now());
    const currentTimeSec = Vue.ref(Math.floor(Date.now() / 1000));
    const isRiderArrivedNear = Vue.ref(false);
    let hasChimedArrival = false;

    const gpsFreshnessText = Vue.computed(() => {
      if (!lastGpsTimestamp.value) return 'LIVE';
      const sec = Math.max(0, currentTimeSec.value - Math.floor(lastGpsTimestamp.value / 1000));
      if (sec < 4) return 'LIVE • Just now';
      if (sec < 60) return `LIVE • ${sec}s ago`;
      const min = Math.floor(sec / 60);
      return `Updated ${min}m ago`;
    });

    const isPaymongoQrPreviewOpen = Vue.ref(false);
    const isVerifyingPaymongo = Vue.ref(false);

    const openPayMongoCheckout = async (targetOrder) => {
      const o = targetOrder || order.value;
      if (o.paymongo_checkout_url) {
        window.location.href = o.paymongo_checkout_url;
        return;
      }
      try {
        store.notify('Preparing PayMongo checkout session...', 'info');
        const res = await GST_API.createPayMongoCheckout(o.id);
        if (res.data?.checkout_url) {
          window.location.href = res.data.checkout_url;
        } else {
          store.notify('Unable to generate checkout URL. Please try again.', 'error');
        }
      } catch (err) {
        store.notify(err.response?.data?.message || 'Failed to initialize PayMongo checkout.', 'error');
      }
    };

    const verifyPayMongoStatus = async (targetOrder) => {
      const o = targetOrder || order.value;
      if (!o) return;
      isVerifyingPaymongo.value = true;
      try {
        store.notify('Checking payment status with PayMongo...', 'info');
        const res = await GST_API.verifyPayMongoPayment(o.id);
        if (res.data?.paid) {
          o.payment_status = 'Paid';
          if (res.data.order) {
            Object.assign(o, res.data.order);
            store.activeOrder = o;
          }
          store.notify('Online payment verified via QR Ph! Order confirmed.', 'success');
        } else {
          store.notify('Payment is still pending on PayMongo. Please scan the QR code to pay.', 'info');
        }
      } catch (err) {
        store.notify(err.response?.data?.message || 'Verification check failed.', 'error');
      } finally {
        isVerifyingPaymongo.value = false;
      }
    };

    const playArrivalChime = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        
        // Two-tone cheerful doorbell chime: D5 -> A5
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.15);
        gain2.gain.setValueAtTime(0.3, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.8);

        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      } catch (e) {
        console.warn('Arrival chime notice:', e);
      }
    };

    const isAdjustingPin = Vue.ref(false);
    const tempCustLat = Vue.ref(null);
    const tempCustLng = Vue.ref(null);

    // --- Leaflet Map & Layers ---
    let trackerMap = null;
    let tileLayer = null;
    let customerMarker = null;
    let riderMarker = null;
    let routeLineCasing = null;
    let routeLineActive = null;

    // Base store location: Santa Rosa, Laguna (near Sinalhan / Amira Townhomes)
    const STORE_LAT = 14.3167;
    const STORE_LNG = 121.1111;

    let fullRoadRouteCoordinates = [];
    let fullRoadDistanceMeters = 0;
    let fullRoadDurationSeconds = 0;

    // Fetch turn-by-turn road route via OSRM (OpenStreetMap Routing)
    const fetchRoadRoute = async (startLat, startLng, endLat, endLng) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.routes && data.routes[0]) {
            const r = data.routes[0];
            fullRoadDistanceMeters = r.distance;
            fullRoadDurationSeconds = r.duration;
            fullRoadRouteCoordinates = r.geometry.coordinates.map(c => [c[1], c[0]]);
            return {
              coordinates: fullRoadRouteCoordinates,
              distance: r.distance,
              duration: r.duration
            };
          }
        }
      } catch (err) {
        console.warn('OSRM road route fetch fallback:', err);
      }

      // Graceful fallback if OSRM is offline
      const directDist = calcDirectDistance(startLat, startLng, endLat, endLng);
      return {
        coordinates: [[startLat, startLng], [endLat, endLng]],
        distance: directDist,
        duration: (directDist / (25 * 1000 / 3600)) // 25 km/h avg scooter speed
      };
    };

    // Icons matching the user's screenshot
    const getRiderIcon = (bearing) => {
      if (typeof L === 'undefined') return null;
      // Blue Circle with White Border, Inner Dot & Directional Heading Arrow (matches user image)
      return L.divIcon({
        className: 'custom-grab-rider-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="grab-rider-pulse"></div>
            
            <!-- Rotating Direction Heading Cone/Arrow -->
            <div class="rider-heading-cone" style="transform: rotate(${Math.round(bearing || 0)}deg)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 18,14 12,10 6,14" fill="#facc15" stroke="#000000" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Blue Disc with White Border and Inner Dot (matches user image) -->
            <div class="grab-rider-disc">
              <div class="grab-rider-inner-dot"></div>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
    };

    const getDestinationIcon = () => {
      if (typeof L === 'undefined') return null;
      // Red Teardrop Destination Pin with White Center Dot (matches user image)
      return L.divIcon({
        className: 'custom-grab-destination-pin',
        html: `
          <div class="relative flex items-center justify-center -translate-y-4 cursor-pointer">
            <svg viewBox="0 0 32 42" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26c0-8.837-7.163-16-16-16z" fill="#facc15"/>
              <circle cx="16" cy="15" r="5.5" fill="#000000"/>
            </svg>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        popupAnchor: [0, -44]
      });
    };

    // Apply or switch tile style
    const applyMapTiles = () => {
      if (!trackerMap) return;
      if (tileLayer) {
        trackerMap.removeLayer(tileLayer);
      }
      if (mapTheme.value === 'street') {
        // Clean pastel street tiles matching Grab / OpenStreetMap
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          className: 'grab-osm-tiles'
        }).addTo(trackerMap);
      } else {
        // Inverted Dark Mode Tiles
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          maxZoom: 19,
          className: 'dark-osm-tiles'
        }).addTo(trackerMap);
      }
    };

    const toggleMapTheme = () => {
      mapTheme.value = mapTheme.value === 'street' ? 'dark' : 'street';
      applyMapTiles();
      store.notify(`Switched to ${mapTheme.value === 'street' ? 'Street View (Grab Style)' : 'Night View'}`, 'info');
    };

    // Update navigation distance, ETA, direction & progress
    const updateNavigationHUD = (rLat, rLng, cLat, cLng, currentRoute) => {
      const remainingDist = calcDirectDistance(rLat, rLng, cLat, cLng);
      const bearing = calcBearing(rLat, rLng, cLat, cLng);
      const heading = getCompassHeading(bearing);

      riderBearingDeg.value = bearing;
      riderDirectionText.value = heading;
      riderDistanceText.value = formatDistance(remainingDist);

      const remainingSecs = Math.max(30, remainingDist / (25 * 1000 / 3600)); // 25 km/h scooter
      riderEtaText.value = formatEta(remainingSecs);

      // Progress percentage
      if (order.value?.status === 'Completed') {
        tripProgressPercent.value = 100;
        riderDistanceText.value = 'Arrived';
        riderEtaText.value = 'Delivered';
        riderProximityStatus.value = '? Order delivered to your doorstep!';
      } else if (order.value?.status === 'Out for Delivery') {
        const totalDist = fullRoadDistanceMeters > 0 ? fullRoadDistanceMeters : (calcDirectDistance(rLat, rLng, cLat, cLng) || 1);
        const traveled = Math.max(0, totalDist - remainingDist);
        tripProgressPercent.value = Math.min(95, Math.max(15, Math.round((traveled / totalDist) * 100)));

        if (remainingDist <= 100) {
          isRiderArrivedNear.value = true;
          if (!hasChimedArrival) {
            hasChimedArrival = true;
            playArrivalChime();
          }
          riderProximityStatus.value = '🎉 Rider has arrived right at your doorstep/gate!';
        } else if (remainingDist <= 350) {
          isRiderArrivedNear.value = false;
          riderProximityStatus.value = '🛵 Rider is approaching your street! Please prepare.';
        } else {
          isRiderArrivedNear.value = false;
          riderProximityStatus.value = `Rider is on the road heading towards your address (${heading})`;
        }
      } else {
        tripProgressPercent.value = 10;
        riderProximityStatus.value = 'Order in kitchen preparation. Route is ready for rider dispatch.';
      }

      // Update rider icon rotation
      if (riderMarker) {
        riderMarker.setIcon(getRiderIcon(bearing));
      }
    };

    const initOrUpdateMap = async () => {
      if (typeof window === 'undefined' || typeof window.L === 'undefined') return;
      if (!order.value || order.value.order_type !== 'Delivery') return;

      const mapEl = document.getElementById('order-tracker-map');
      if (!mapEl) return;

      // 1. Customer Destination Lat/Lng (if missing, fallback)
      let custLat = order.value.customer_lat ? Number(order.value.customer_lat) : null;
      let custLng = order.value.customer_lng ? Number(order.value.customer_lng) : null;

      if (!custLat || !custLng) {
        custLat = 14.3218;
        custLng = 121.1192;
        autoGeocodeMissingLocation();
      }

      tempCustLat.value = custLat;
      tempCustLng.value = custLng;

      // 2. Rider Lat/Lng Calculation (Computed BEFORE route fetching so no TDZ error occurs!)
      let riderLat = order.value.driver_lat ? Number(order.value.driver_lat) : null;
      let riderLng = order.value.driver_lng ? Number(order.value.driver_lng) : null;

      if (!riderLat || !riderLng) {
        if (order.value.status === 'Completed') {
          riderLat = custLat;
          riderLng = custLng;
        } else {
          // Santa Rosa Laguna rider origin
          riderLat = STORE_LAT;
          riderLng = STORE_LNG;
        }
      }

      // 3. Fetch turn-by-turn road route between Rider and Customer
      const roadData = await fetchRoadRoute(riderLat, riderLng, custLat, custLng);
      const roadPoints = roadData.coordinates;

      if (!trackerMap) {
        trackerMap = L.map('order-tracker-map', {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true
        }).setView([riderLat, riderLng], 15);

        applyMapTiles();

        // 2. Customer Destination Marker (Red teardrop pin from user image)
        customerMarker = L.marker([custLat, custLng], { 
          icon: getDestinationIcon(),
          draggable: false
        }).addTo(trackerMap)
          .bindPopup(`<b>📍 Delivery Destination</b><br>${order.value.delivery_address || 'Santa Rosa, Laguna'}<br><span class="text-[10px] text-gray-400">Tap "Fine-tune My Pin" to adjust gate</span>`);

        // Handle customer pin dragging during adjustment mode
        customerMarker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          tempCustLat.value = Number(pos.lat).toFixed(6);
          tempCustLng.value = Number(pos.lng).toFixed(6);
          updateRouteToTempPin(pos.lat, pos.lng);
        });

        // Click map during adjustment mode moves the pin
        trackerMap.on('click', (e) => {
          if (isAdjustingPin.value) {
            const lat = Number(e.latlng.lat).toFixed(6);
            const lng = Number(e.latlng.lng).toFixed(6);
            tempCustLat.value = lat;
            tempCustLng.value = lng;
            if (customerMarker) customerMarker.setLatLng([lat, lng]);
            updateRouteToTempPin(lat, lng);
          }
        });

        // 3. Rider Marker (Blue circle with white border & inner dot from user image)
        const initialBearing = calcBearing(riderLat, riderLng, custLat, custLng);
        riderMarker = L.marker([riderLat, riderLng], { icon: getRiderIcon(initialBearing) })
          .addTo(trackerMap)
          .bindPopup(`<b>🛵 G Shot Teas Delivery Rider</b><br>${order.value.status === 'Out for Delivery' ? 'En route to your doorstep!' : 'Awaiting dispatch'}`);

        // 4. Grab Green Route Line with White Contrast Casing
        routeLineCasing = L.polyline(roadPoints, {
          color: '#ffffff',
          weight: 8,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(trackerMap);

        routeLineActive = L.polyline(roadPoints, {
          color: '#facc15', // Vibrant Yellow Route
          weight: 5,
          opacity: 1,
          lineJoin: 'round',
          lineCap: 'round',
          className: 'grab-route-active'
        }).addTo(trackerMap);

        // Fit bounds with comfortable padding
        const bounds = L.latLngBounds([[custLat, custLng], [riderLat, riderLng]]);
        trackerMap.fitBounds(bounds, { padding: [55, 55] });

        setTimeout(() => { if (trackerMap) trackerMap.invalidateSize(); }, 100);
        setTimeout(() => { if (trackerMap) trackerMap.invalidateSize(); }, 350);
        setTimeout(() => { if (trackerMap) trackerMap.invalidateSize(); }, 800);

      } else {
        // Update positions
        if (customerMarker && !isAdjustingPin.value) {
          customerMarker.setLatLng([custLat, custLng]);
        }
        if (riderMarker) {
          riderMarker.setLatLng([riderLat, riderLng]);
          const currentBearing = calcBearing(riderLat, riderLng, custLat, custLng);
          riderMarker.setIcon(getRiderIcon(currentBearing));
        }
        if (routeLineCasing && routeLineActive) {
          routeLineCasing.setLatLngs(roadPoints);
          routeLineActive.setLatLngs(roadPoints);
        }
        if (trackerMap) trackerMap.invalidateSize();
      }

      // Update HUD metrics
      updateNavigationHUD(riderLat, riderLng, custLat, custLng, roadPoints);
    };

    const updateRouteToTempPin = async (tLat, tLng) => {
      let rLat = order.value?.driver_lat ? Number(order.value.driver_lat) : (riderMarker ? riderMarker.getLatLng().lat : STORE_LAT);
      let rLng = order.value?.driver_lng ? Number(order.value.driver_lng) : (riderMarker ? riderMarker.getLatLng().lng : STORE_LNG);
      const roadData = await fetchRoadRoute(rLat, rLng, tLat, tLng);
      if (routeLineCasing && routeLineActive && roadData.coordinates) {
        routeLineCasing.setLatLngs(roadData.coordinates);
        routeLineActive.setLatLngs(roadData.coordinates);
      }
      updateNavigationHUD(rLat, rLng, tLat, tLng, roadData.coordinates);
    };

    // Fine-tune Delivery Pin Controls
    const startPinAdjustment = () => {
      isAdjustingPin.value = true;
      if (customerMarker) {
        customerMarker.dragging.enable();
        customerMarker.bindPopup("<b>📍 Pin Adjustment Active</b><br>Drag this pin or tap map to place your exact gate.").openPopup();
      }
      store.notify('Pin adjustment active! Drag red pin or tap map to set exact gate.', 'info');
    };

    const saveAdjustedPin = async () => {
      if (!order.value || !tempCustLat.value || !tempCustLng.value) return;
      try {
        await GST_API.updateCustomerLocation(order.value.id, {
          customer_lat: Number(tempCustLat.value),
          customer_lng: Number(tempCustLng.value)
        });
        order.value.customer_lat = tempCustLat.value;
        order.value.customer_lng = tempCustLng.value;
        isAdjustingPin.value = false;
        if (customerMarker) {
          customerMarker.dragging.disable();
          customerMarker.bindPopup(`<b>📍 Delivery Destination</b><br>${order.value.delivery_address || 'Santa Rosa, Laguna'}`);
        }
        store.notify('✓ Delivery pin updated! Road route recalculated to your gate.', 'success');
        initOrUpdateMap();
      } catch (err) {
        store.notify('Failed to save updated pin location.', 'error');
      }
    };

    const cancelPinAdjustment = () => {
      isAdjustingPin.value = false;
      if (customerMarker) {
        customerMarker.dragging.disable();
        const origLat = order.value?.customer_lat ? Number(order.value.customer_lat) : 14.3218;
        const origLng = order.value?.customer_lng ? Number(order.value.customer_lng) : 121.1192;
        customerMarker.setLatLng([origLat, origLng]);
      }
      initOrUpdateMap();
    };

    // Auto-geocode order delivery address if coordinates are missing
    const autoGeocodeMissingLocation = async () => {
      if (!order.value || order.value.order_type !== 'Delivery') return;
      if (order.value.customer_lat && order.value.customer_lng) return;
      if (!order.value.delivery_address) return;

      try {
        const addr = order.value.delivery_address;
        const query = addr.toLowerCase().includes('santa rosa') ? addr : `${addr}, Santa Rosa, Laguna`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        if (res.ok) {
          const list = await res.json();
          if (list && list[0]) {
            const lat = Number(parseFloat(list[0].lat).toFixed(6));
            const lng = Number(parseFloat(list[0].lon).toFixed(6));
            order.value.customer_lat = lat;
            order.value.customer_lng = lng;
            GST_API.updateCustomerLocation(order.value.id, {
              customer_lat: lat,
              customer_lng: lng
            }).catch(() => {});
            initOrUpdateMap();
          }
        }
      } catch (err) {
        console.warn('Auto-geocoding failed:', err);
      }
    };

    const recenterMap = () => {
      if (!trackerMap) return;
      const custLat = order.value?.customer_lat ? Number(order.value.customer_lat) : 14.3218;
      const custLng = order.value?.customer_lng ? Number(order.value.customer_lng) : 121.1192;
      let riderLat = order.value?.driver_lat ? Number(order.value.driver_lat) : (STORE_LAT + (custLat - STORE_LAT) * 0.65);
      let riderLng = order.value?.driver_lng ? Number(order.value.driver_lng) : (STORE_LNG + (custLng - STORE_LNG) * 0.65);

      const bounds = L.latLngBounds([[custLat, custLng], [riderLat, riderLng]]);
      trackerMap.fitBounds(bounds, { padding: [55, 55] });
    };

    let pollInterval = null;
    let echoChannelSubscribed = null;
    let clockInterval = null;

    const subscribeToOrderEcho = (orderId) => {
      if (!orderId || !window.Echo) return;
      if (echoChannelSubscribed === orderId) return;
      if (echoChannelSubscribed) {
        try { window.Echo.leave(`orders.${echoChannelSubscribed}`); } catch (e) {}
      }
      echoChannelSubscribed = orderId;
      console.log(`📡 [Reverb] Subscribing to live updates for order #${orderId}`);
      window.Echo.channel(`orders.${orderId}`)
        .listen('.DriverLocationUpdated', (e) => {
          console.log('📍 [Reverb] Live Driver Location Received:', e);
          if (order.value && Number(order.value.id) === Number(e.order_id)) {
            order.value.driver_lat = e.driver_lat;
            order.value.driver_lng = e.driver_lng;
            lastGpsTimestamp.value = Date.now();
            if (e.driver_notes) order.value.driver_notes = e.driver_notes;

            if (riderMarker) {
              riderMarker.setLatLng([e.driver_lat, e.driver_lng]);
              const custLat = order.value.customer_lat ? Number(order.value.customer_lat) : 14.3218;
              const custLng = order.value.customer_lng ? Number(order.value.customer_lng) : 121.1192;
              updateNavigationHUD(e.driver_lat, e.driver_lng, custLat, custLng, fullRoadRouteCoordinates);
              // Dynamically update the route polyline from rider's live position to customer
              fetchRoadRoute(e.driver_lat, e.driver_lng, custLat, custLng).then(newRoad => {
                if (routeLineCasing && routeLineActive && newRoad.coordinates) {
                  routeLineCasing.setLatLngs(newRoad.coordinates);
                  routeLineActive.setLatLngs(newRoad.coordinates);
                }
              }).catch(() => {});
            } else {
              initOrUpdateMap();
            }
          }
        })
        .listen('.DriverOnTheWay', (e) => {
          console.log('🛵 [Reverb] Live Driver On The Way Notice Received:', e);
          if (order.value && Number(order.value.id) === Number(e.order_id)) {
            order.value.on_the_way_notified_at = e.notified_at;
            if (e.driver_lat && e.driver_lng) {
              order.value.driver_lat = e.driver_lat;
              order.value.driver_lng = e.driver_lng;
              lastGpsTimestamp.value = Date.now();
            }
            if (e.driver_name) order.value.driver_name = e.driver_name;
            if (e.driver_phone) order.value.driver_phone = e.driver_phone;
            playArrivalChime();
            store.notify('🛵 ' + (e.message || 'Rider is now on the way to your doorstep!'), 'success');
            store.refreshActiveOrder(order.value.id);
          }
        })
        .listen('.OrderStatusUpdated', (e) => {
          console.log('? [Reverb] Live Order Status Changed:', e);
          if (order.value && Number(order.value.id) === Number(e.order_id)) {
            order.value.status = e.status;
            if (e.driver) order.value.driver = e.driver;
            store.refreshActiveOrder(order.value.id);
          }
        });
    };

    Vue.onMounted(async () => {
      if (!order.value || !order.value.order_number) {
        await store.fetchUserActiveOrder();
      }
      Vue.nextTick(() => {
        initOrUpdateMap();
      });
      window.addEventListener('resize', onWindowResize);

      if (order.value && order.value.id) {
        subscribeToOrderEcho(order.value.id);
        if (order.value.driver_lat && order.value.driver_lng) {
          lastGpsTimestamp.value = Date.now();
        }
      }

      clockInterval = setInterval(() => {
        currentTimeSec.value = Math.floor(Date.now() / 1000);
      }, 2000);

      pollInterval = setInterval(async () => {
        if (order.value && order.value.id) {
          if (!echoChannelSubscribed) {
            subscribeToOrderEcho(order.value.id);
          }
          await store.refreshActiveOrder(order.value.id);
        } else if (store.user) {
          await store.fetchUserActiveOrder();
        }
      }, 5000);
    });

    Vue.watch(() => order.value?.id, (newId) => {
      if (newId) {
        subscribeToOrderEcho(newId);
      }
    });

    Vue.watch(() => order.value, () => {
      Vue.nextTick(() => {
        initOrUpdateMap();
      });
    }, { deep: true });

    const onWindowResize = () => {
      if (trackerMap) trackerMap.invalidateSize();
    };

    Vue.onBeforeUnmount(() => {
      window.removeEventListener('resize', onWindowResize);
      if (pollInterval) clearInterval(pollInterval);
      if (clockInterval) clearInterval(clockInterval);
      if (echoChannelSubscribed && window.Echo) {
        try { window.Echo.leave(`orders.${echoChannelSubscribed}`); } catch (e) {}
        echoChannelSubscribed = null;
      }
      if (trackerMap) {
        trackerMap.remove();
        trackerMap = null;
      }
    });

    return {
      store,
      estimatedDeliveryRange,
      etaStatusSubtitle,
      currentDeliveryStateTitle,
      currentDeliveryStateDesc,
      order,
      previewReceipt,
      currentStepIndex,
      progressPercentage,
      statusBadgeClass,
      statusDotClass,
      statusMessage,
      formatTime,
      backToHome,
      cancelOrder,
      recenterMap,
      mapTheme,
      toggleMapTheme,
      riderDistanceText,
      riderEtaText,
      riderDirectionText,
      riderBearingDeg,
      tripProgressPercent,
      riderProximityStatus,
      isAdjustingPin,
      startPinAdjustment,
      saveAdjustedPin,
      cancelPinAdjustment,
      isRiderArrivedNear,
      gpsFreshnessText,
      playArrivalChime,
      openPayMongoCheckout,
      verifyPayMongoStatus,
    };
  },
};
</script>
