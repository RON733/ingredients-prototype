// G Shot Teas — AI Chatbot Assistant (Powered by Google Gemini AI)
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

      <!-- Chat Modal Window -->
      <div 
        v-if="isOpen"
        class="fixed bottom-6 right-6 z-50 w-full max-w-[360px] sm:max-w-[420px] bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-toast-in max-h-[600px]">
        
        <!-- Header -->
        <div class="p-4 bg-surface-800 border-b border-surface-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 p-0.5 flex items-center justify-center text-surface-900 font-black text-lg shrink-0">
              🧋
            </div>
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>Gshot Assistant</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h3>
              <p class="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <span>Online</span>
                <span class="text-gray-500">•</span>
                <span class="text-gray-300">Powered by Google Gemini AI ✨</span>
              </p>
            </div>
          </div>

          <button 
            @click="isOpen = false"
            class="w-7 h-7 rounded-full bg-surface-700 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors">
            ✕
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
                ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white rounded-br-xs' 
                : 'bg-surface-800 text-gray-100 border border-surface-700/80 rounded-bl-xs'">
              <div v-html="formatMessage(msg.text)"></div>
            </div>

            <!-- AI Model Badge Indicator -->
            <div v-if="msg.sender === 'bot'" class="mt-1 flex items-center gap-1.5 px-1 text-[9px] text-gray-500 font-mono">
              <span class="text-brand-400 font-bold">✨ Gemini AI</span>
              <span>•</span>
              <span>Owner: Jefferson Alulod</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex flex-col items-start gap-1">
            <div class="bg-surface-800 text-gray-400 px-3.5 py-2.5 rounded-2xl border border-surface-700 flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span class="text-[10px] text-gray-400 ml-1">Gemini AI is thinking...</span>
            </div>
          </div>
        </div>

        <!-- Quick Question Chips -->
        <div class="px-3 py-2 border-t border-surface-800/80 bg-surface-900/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button 
            v-for="chip in quickChips" 
            :key="chip"
            @click="sendQuick(chip)"
            class="text-[10px] font-bold px-3 py-1.5 rounded-full bg-surface-800 hover:bg-surface-700 text-brand-300 hover:text-white border border-brand-500/30 whitespace-nowrap transition-all hover:scale-105 active:scale-95 shrink-0">
            {{ chip }}
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
            class="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white text-xs disabled:opacity-40 transition-all shadow-md">
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
        text: 'Hello! I am your Gshot Assistant powered by Google Gemini AI. 🧋\n\nI can think freely and answer questions about our drinks, burgers, pizzas, walk-in orders, our owner **Jefferson Alulod**, or our store at **Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna**! How can I help you today?',
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
          text: 'Yes! Walk-in orders and online delivery are always welcomed at **G Shot Teas**! 😊\n\nOwner: **Jefferson Alulod**\nAddress: **Block 9 Lot 3 Amira Townhomes, Brgy. Sinalhan, Santa Rosa, Laguna**\nHours: Mon–Sat, 9:00 AM – 10:00 PM\nPhone: **0993.700.5426**',
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

    return {
      store,
      isOpen,
      inputMessage,
      isTyping,
      messages,
      quickChips,
      chatContainer,
      formatMessage,
      sendMessage,
      sendQuick,
    };
  },
};

window.ChatbotAssistant = ChatbotAssistant;
