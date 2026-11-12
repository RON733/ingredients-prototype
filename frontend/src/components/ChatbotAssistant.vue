<template>
<div>
      <!-- Floating Trigger Button (Positioned above mobile bottom navigation bar on cellphones) -->
      <button 
        v-if="!isOpen" 
        @click="isOpen = true"
        class="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black shadow-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
        aria-label="Open AI Assistant">
        <i class="pi pi-comments text-xl"></i>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface-900 rounded-full animate-pulse"></span>
      </button>

      <!-- Chat Modal Window -->
      <div 
        v-if="isOpen"
        class="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-[380px] sm:max-w-[420px] bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-toast-in max-h-[75vh] sm:max-h-[600px]">
        
        <!-- Header -->
        <div class="p-4 bg-surface-800 border-b border-surface-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-sm shrink-0">
              <i class="pi pi-sparkles text-amber-400"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>Gshot Assistant</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h3>
              <p class="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <span>Online</span>
              </p>
            </div>
          </div>

          <button 
            @click="isOpen = false"
            class="w-7 h-7 rounded-full bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx"
            class="flex flex-col"
            :class="msg.sender === 'user' ? 'items-end' : 'items-start'">
            
            <div 
              class="max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-md"
              :class="msg.sender === 'user' 
                ? 'bg-yellow-400 text-black font-medium rounded-br-xs' 
                : 'bg-surface-800 text-gray-100 border border-surface-700/80 rounded-bl-xs'">
              <div v-html="formatMessage(msg.text)"></div>
            </div>

            <!-- AI Model Badge Indicator -->
            <div v-if="msg.sender === 'bot'" class="mt-1 flex items-center gap-1.5 px-1 text-[9px] text-gray-500 font-mono">
              <span>Owner: Jefferson Alulod</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex flex-col items-start gap-1">
            <div class="bg-surface-800 text-gray-400 px-3.5 py-2.5 rounded-2xl border border-surface-700 flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span class="text-[10px] text-gray-400 ml-1">Assistant is thinking...</span>
            </div>
          </div>
        </div>

        <!-- Quick Question Chips -->
        <div class="px-2.5 py-2 border-t border-surface-800/80 bg-surface-900/90 flex items-center gap-1.5 relative">
          <!-- Scroll Left Arrow Button -->
          <button 
            type="button"
            @click="scrollChips('left')"
            :disabled="!canScrollLeft"
            class="w-6 h-6 rounded-full bg-surface-800 hover:bg-yellow-400 hover:text-black text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-surface-800 disabled:hover:text-yellow-400 border border-surface-700/80 shadow-xs flex items-center justify-center transition-all cursor-pointer shrink-0 z-10"
            title="Scroll left"
            aria-label="Scroll left">
            <i class="pi pi-chevron-left text-[9px]"></i>
          </button>

          <!-- Chips Scrollable Container -->
          <div 
            ref="chipsContainer"
            @scroll="updateScrollState"
            class="flex-1 flex items-center gap-1.5 overflow-x-auto select-none faq-chips-scroll py-1 touch-pan-x"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag">
            <button 
              v-for="chip in quickChips" 
              :key="chip"
              @click="handleChipClick(chip)"
              type="button"
              class="text-[10px] font-bold px-3 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-brand-300 hover:text-white border border-brand-500/30 whitespace-nowrap transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer">
              {{ chip }}
            </button>
          </div>

          <!-- Scroll Right Arrow Button -->
          <button 
            type="button"
            @click="scrollChips('right')"
            :disabled="!canScrollRight"
            class="w-6 h-6 rounded-full bg-surface-800 hover:bg-yellow-400 hover:text-black text-yellow-400 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-surface-800 disabled:hover:text-yellow-400 border border-surface-700/80 shadow-xs flex items-center justify-center transition-all cursor-pointer shrink-0 z-10"
            title="Scroll right"
            aria-label="Scroll right">
            <i class="pi pi-chevron-right text-[9px]"></i>
          </button>
        </div>

        <!-- Input Box -->
        <form @submit.prevent="sendMessage" class="p-3 bg-surface-800 border-t border-surface-700 flex items-center gap-2">
          <input 
            v-model="inputMessage"
            type="text" 
            placeholder="Ask about walk-in, menu, Jefferson Alulod, address..." 
            class="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-900 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
          <button 
            type="submit"
            :disabled="!inputMessage.trim() || isTyping"
            class="p-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold disabled:opacity-40 transition-all cursor-pointer">
            <i class="pi pi-send text-xs"></i>
          </button>
        </form>

      </div>
    </div>
</template>

<script>
import * as Vue from 'vue';
import { ref, reactive, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — AI Chatbot Assistant 
export default {
  name: 'ChatbotAssistant',
  setup() {
    const store = useGShotStore();
    const isOpen = Vue.ref(false);
    const inputMessage = Vue.ref('');
    const isTyping = Vue.ref(false);
    const chatContainer = Vue.ref(null);

    const quickChips = [
      'Can I order walk-in?',
      'Who is the owner?',
      'Store address & hours',
      'Best sellers',
      'Menu & prices',
      'Event Catering',
    ];

    const messages = Vue.reactive([
      {
        sender: 'bot',
        text: 'Hello! I am your Gshot Assistant.\n\nI can think freely and answer questions about our drinks, burgers, pizzas, walk-in orders, our owner **Jefferson Alulod**, or our store at **Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna**! How can I help you today?',
        ai_powered: true,
      },
    ]);

    const scrollToBottom = () => {
      Vue.nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    const formatMessage = (text) => {
      if (!text) return '';
      // Escape basic HTML tags to prevent XSS except bold
      let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Convert **bold** to <strong>bold</strong> (including multiline)
      formatted = formatted.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      
      // Convert * bullets or - bullets
      formatted = formatted.replace(/(^|\n)[\*\-]\s+/g, '$1• ');
      return formatted;
    };

    const sendMessage = async () => {
      const text = inputMessage.value.trim();
      if (!text) return;

      messages.push({ sender: 'user', text });
      inputMessage.value = '';
      scrollToBottom();

      isTyping.value = true;
      try {
        const res = await GST_API.sendChatbot(text);
        const reply = res.data?.reply || 'Sorry, I am having trouble connecting to the store server.';
        messages.push({ 
          sender: 'bot', 
          text: reply,
          ai_powered: res.data?.ai_powered ?? true,
          model: res.data?.model ?? 'gemini-3.5-flash'
        });
      } catch (err) {
        messages.push({
          sender: 'bot',
          text: 'Yes! Walk-in orders and online delivery are always welcomed at **G Shot Teas**!\n\nOwner: **Jefferson Alulod**\nAddress: **Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna**\nHours: Mon–Sat, 9:00 AM – 10:00 PM\nPhone: **0994 612 1933**',
          ai_powered: false
        });
      } finally {
        isTyping.value = false;
        scrollToBottom();
      }
    };

    const sendQuick = (chip) => {
      inputMessage.value = chip;
      sendMessage();
    };
    const chipsContainer = Vue.ref(null);
    const canScrollLeft = Vue.ref(false);
    const canScrollRight = Vue.ref(true);
    const isDragging = Vue.ref(false);
    let isMouseDown = false;
    let startX = 0;
    let scrollStartX = 0;

    const updateScrollState = () => {
      if (!chipsContainer.value) return;
      const el = chipsContainer.value;
      canScrollLeft.value = el.scrollLeft > 2;
      canScrollRight.value = el.scrollLeft < (el.scrollWidth - el.clientWidth - 2);
    };

    const scrollChips = (direction) => {
      if (!chipsContainer.value) return;
      const distance = direction === 'left' ? -150 : 150;
      chipsContainer.value.scrollBy({ left: distance, behavior: 'smooth' });
      setTimeout(updateScrollState, 250);
      setTimeout(updateScrollState, 450);
    };

    const startDrag = (e) => {
      if (!chipsContainer.value) return;
      isMouseDown = true;
      isDragging.value = false;
      startX = e.pageX;
      scrollStartX = chipsContainer.value.scrollLeft;
    };

    const onDrag = (e) => {
      if (!isMouseDown || !chipsContainer.value) return;
      e.preventDefault();
      const diff = e.pageX - startX;
      if (Math.abs(diff) > 4) {
        isDragging.value = true;
      }
      chipsContainer.value.scrollLeft = scrollStartX - diff;
      updateScrollState();
    };

    const stopDrag = () => {
      if (isMouseDown) {
        isMouseDown = false;
        setTimeout(() => {
          isDragging.value = false;
        }, 80);
      }
    };

    const handleChipClick = (chip) => {
      if (isDragging.value) return;
      sendQuick(chip);
    };

    const onWheel = (e) => {
      if (!chipsContainer.value) return;
      const el = chipsContainer.value;
      if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        updateScrollState();
      }
    };

    Vue.watch(chipsContainer, (newEl, oldEl) => {
      if (oldEl) {
        oldEl.removeEventListener('wheel', onWheel);
      }
      if (newEl) {
        newEl.addEventListener('wheel', onWheel, { passive: false });
        Vue.nextTick(updateScrollState);
      }
    });

    Vue.watch(isOpen, (open) => {
      if (open) {
        Vue.nextTick(() => {
          scrollToBottom();
          updateScrollState();
        });
        setTimeout(updateScrollState, 150);
        setTimeout(updateScrollState, 350);
      }
    });

    Vue.onMounted(() => {
      window.addEventListener('resize', updateScrollState);
      window.addEventListener('mouseup', stopDrag);
    });

    Vue.onUnmounted(() => {
      window.removeEventListener('resize', updateScrollState);
      window.removeEventListener('mouseup', stopDrag);
      if (chipsContainer.value) {
        chipsContainer.value.removeEventListener('wheel', onWheel);
      }
    });


    return {
      store,
      isOpen,
      inputMessage,
      isTyping,
      messages,
      quickChips,
      chatContainer,
      chipsContainer,
      canScrollLeft,
      canScrollRight,
      isDragging,
      formatMessage,
      sendMessage,
      sendQuick,
      scrollChips,
      startDrag,
      onDrag,
      stopDrag,
      handleChipClick,
      updateScrollState,
    };
  },
};
</script>

<style scoped>
.faq-chips-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(250, 204, 21, 0.45) transparent;
  -webkit-overflow-scrolling: touch;
}
.faq-chips-scroll::-webkit-scrollbar {
  height: 4px;
}
.faq-chips-scroll::-webkit-scrollbar-track {
  background: rgba(39, 39, 42, 0.4);
  border-radius: 9999px;
}
.faq-chips-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(250, 204, 21, 0.4);
  border-radius: 9999px;
}
.faq-chips-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(250, 204, 21, 0.85);
}
</style>
