// G Shot Teas — AI Chatbot Assistant (Matches Figure 4)
const ChatbotAssistant = {
  template: `
    <div>
      <!-- Floating Trigger Button -->
      <button 
        v-if="!isOpen" 
        @click="isOpen = true"
        class="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group"
        aria-label="Open AI Assistant">
        <i class="pi pi-comments text-xl"></i>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface-900 rounded-full animate-pulse"></span>
      </button>

      <!-- Chat Modal Window (Matches Figure 4) -->
      <div 
        v-if="isOpen"
        class="fixed bottom-6 right-6 z-50 w-full max-w-[360px] sm:max-w-[400px] bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-toast-in max-h-[580px]">
        
        <!-- Header -->
        <div class="p-4 bg-surface-800 border-b border-surface-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 p-0.5 flex items-center justify-center text-surface-900 font-black">
              🧋
            </div>
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>Gshot Assistant</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h3>
              <p class="text-[10px] text-gray-400">Online | Powered by AI</p>
            </div>
          </div>

          <button 
            @click="isOpen = false"
            class="w-7 h-7 rounded-full bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center text-xs">
            ✕
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx"
            class="flex gap-2"
            :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
            
            <div 
              class="max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-line"
              :class="msg.sender === 'user' 
                ? 'bg-brand-600 text-white rounded-br-xs' 
                : 'bg-surface-800 text-gray-200 border border-surface-700/60 rounded-bl-xs'">
              {{ msg.text }}
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex gap-2 justify-start">
            <div class="bg-surface-800 text-gray-400 px-3 py-2 rounded-2xl border border-surface-700 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>

        <!-- Quick Question Chips (Matches Figure 4) -->
        <div class="px-4 py-2 border-t border-surface-800/80 bg-surface-900/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button 
            v-for="chip in quickChips" 
            :key="chip"
            @click="sendQuick(chip)"
            class="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surface-800 hover:bg-surface-700 text-brand-400 border border-brand-500/20 whitespace-nowrap transition-colors">
            {{ chip }}
          </button>
        </div>

        <!-- Input Box -->
        <form @submit.prevent="sendMessage" class="p-3 bg-surface-800 border-t border-surface-700 flex items-center gap-2">
          <input 
            v-model="inputMessage"
            type="text" 
            placeholder="Type a message..." 
            class="flex-1 px-3.5 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
          <button 
            type="submit"
            :disabled="!inputMessage.trim() || isTyping"
            class="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs disabled:opacity-40 transition-colors">
            <i class="pi pi-send text-xs"></i>
          </button>
        </form>

      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const isOpen = Vue.ref(false);
    const inputMessage = Vue.ref('');
    const isTyping = Vue.ref(false);
    const chatContainer = Vue.ref(null);

    const quickChips = [
      'Best sellers',
      'Show menu',
      'Milk Tea prices',
      'Catering Packages',
      'Store Location',
    ];

    const messages = Vue.reactive([
      {
        sender: 'bot',
        text: 'Hello! I am your Gshot Assistant. 🧋 How can I help you today? I can recommend drinks, explain pricing, or answer questions about our menu!',
      },
    ]);

    const scrollToBottom = () => {
      Vue.nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
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
        messages.push({ sender: 'bot', text: reply });
      } catch (err) {
        messages.push({
          sender: 'bot',
          text: 'Thank you for reaching out! You can reach our store directly at +63 912 345 6789 or visit us at Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna.',
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

    return {
      store,
      isOpen,
      inputMessage,
      isTyping,
      messages,
      quickChips,
      chatContainer,
      sendMessage,
      sendQuick,
    };
  },
};
