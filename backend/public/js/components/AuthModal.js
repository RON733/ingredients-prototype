// G Shot Teas — Unified Login & Registration Modal with Google Sign-In Integration
const AuthModal = {
  template: `
    <div 
      v-if="store.authModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      @click.self="store.authModalOpen = false">
      
      <div class="relative w-full max-w-md bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        <!-- Close Button -->
        <button 
          @click="store.authModalOpen = false"
          class="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close modal">
          ✕
        </button>

        <!-- Brand Icon -->
        <div class="text-center mb-5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 p-0.5 mx-auto mb-3 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div class="w-full h-full bg-surface-900 rounded-[14px] flex items-center justify-center">
              <span class="text-2xl font-black text-brand-500">G'</span>
            </div>
          </div>
          <h2 class="text-2xl font-black text-white">
            {{ store.authMode === 'login' ? 'Sign In' : 'Create Account' }}
          </h2>
          <p class="text-xs text-gray-400 mt-1">
            {{ store.authMode === 'login' 
              ? 'Access online ordering, real-time tracking, or admin dashboard' 
              : 'Register to start ordering milk tea and comfort snacks' }}
          </p>
        </div>

        <!-- Google Sign-In Section -->
        <div class="space-y-3 mb-5">
          <!-- Official Google Identity Button Mount (renders when client_id is set) -->
          <div 
            v-show="isGoogleClientConfigured" 
            id="googleSignInBtn" 
            class="flex justify-center min-h-[44px]">
          </div>

          <!-- Custom Google Sign-In Button (Primary trigger or fallback when client_id pending) -->
          <button 
            v-if="!isGoogleClientConfigured"
            type="button"
            @click="handleContinueWithGoogle"
            :disabled="googleLoading"
            class="w-full py-3 px-4 rounded-xl bg-surface-800 hover:bg-surface-700/80 border border-surface-700 hover:border-gray-500 text-white font-bold text-xs flex items-center justify-center gap-3 transition-all duration-200 shadow-md group">
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <i v-if="googleLoading" class="pi pi-spin pi-spinner"></i>
            <span v-else>Continue with Google</span>
          </button>

          <!-- Google Options & Live Client ID Config Drawer -->
          <div 
            v-if="showGoogleHelper" 
            class="p-4 rounded-2xl bg-surface-800 border border-brand-500/30 text-left space-y-3 animate-fade-in">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-brand-400 flex items-center gap-1.5">
                <i class="pi pi-google"></i> Google Authentication Setup
              </span>
              <button 
                type="button" 
                @click="showGoogleHelper = false" 
                class="text-gray-400 hover:text-white text-xs">
                ✕
              </button>
            </div>
            
            <p class="text-[11px] text-gray-300 leading-relaxed">
              Google Sign-In is fully integrated! For live OAuth with your Google Cloud project, enter your Client ID below. You can also test the full authentication flow instantly using our 1-click test profile:
            </p>

            <div class="space-y-2 pt-1">
              <!-- One-Click Instant Google Test -->
              <button 
                type="button" 
                @click="handleGoogleDemoLogin('Jane Doe (Google)', 'janedoe.google@gmail.com')"
                :disabled="googleLoading"
                class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                <i v-if="googleLoading" class="pi pi-spin pi-spinner"></i>
                <span v-else>🚀 Test Google Sign-In (Instant Demo Customer)</span>
              </button>

              <!-- Optional Live Client ID Input -->
              <div class="pt-2 border-t border-surface-700/60">
                <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Google Cloud Client ID (Optional for Live OAuth):
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    v-model="customClientId"
                    type="text" 
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    class="flex-1 px-3 py-1.5 text-[11px] rounded-lg bg-surface-900 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                  <button 
                    type="button"
                    @click="saveGoogleClientId"
                    :disabled="savingClientId || !customClientId"
                    class="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition-all disabled:opacity-50">
                    {{ savingClientId ? 'Saving...' : 'Apply' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-surface-800"></div>
            <span class="flex-shrink mx-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              or continue with email
            </span>
            <div class="flex-grow border-t border-surface-800"></div>
          </div>
        </div>

        <!-- Standard Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          
          <!-- Name (Only on register) -->
          <div v-if="store.authMode === 'register'">
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input 
              v-model="form.name"
              type="text" 
              required
              placeholder="e.g. John Doe"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Email Address -->
          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input 
              v-model="form.password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-2">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ store.authMode === 'login' ? 'Sign In' : 'Register' }}</span>
          </button>
        </form>

        <!-- Toggle Mode Link -->
        <div class="text-center mt-5 pt-3 border-t border-surface-800">
          <p class="text-xs text-gray-400">
            <span v-if="store.authMode === 'login'">Don't have an account? </span>
            <span v-else>Already have an account? </span>
            <button 
              type="button"
              @click="toggleAuthMode"
              class="text-brand-400 hover:text-brand-300 font-bold ml-1 transition-colors">
              {{ store.authMode === 'login' ? 'Register here' : 'Sign In here' }}
            </button>
          </p>
        </div>

        <!-- 1-Click Demo Accounts -->
        <div class="mt-5 pt-3 border-t border-surface-800/80">
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center mb-2">
            Quick 1-Click Demo Credentials:
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button 
              type="button"
              @click="fillDemo('superadmin@gshotteas.com')"
              class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-left border border-surface-700 text-[11px] text-gray-300 transition-colors">
              <span class="block font-bold text-purple-400">Super Admin</span>
              <span class="text-[10px] text-gray-500">Tyron Erick</span>
            </button>
            <button 
              type="button"
              @click="fillDemo('admin@gshotteas.com')"
              class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-left border border-surface-700 text-[11px] text-gray-300 transition-colors">
              <span class="block font-bold text-amber-400">Admin (Owner)</span>
              <span class="text-[10px] text-gray-500">Jefferson A.</span>
            </button>
            <button 
              type="button"
              @click="fillDemo('staff@gshotteas.com')"
              class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-left border border-surface-700 text-[11px] text-gray-300 transition-colors">
              <span class="block font-bold text-sky-400">Staff / Barista</span>
              <span class="text-[10px] text-gray-500">Mhar Anthony</span>
            </button>
            <button 
              type="button"
              @click="fillDemo('customer@gmail.com')"
              class="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-left border border-surface-700 text-[11px] text-gray-300 transition-colors">
              <span class="block font-bold text-emerald-400">Customer</span>
              <span class="text-[10px] text-gray-500">Jane Doe</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const googleLoading = Vue.ref(false);
    const showGoogleHelper = Vue.ref(false);
    const customClientId = Vue.ref('');
    const savingClientId = Vue.ref(false);

    const form = Vue.reactive({
      name: '',
      email: '',
      password: '',
    });

    const isGoogleClientConfigured = Vue.computed(() => {
      const id = store.googleConfig?.client_id || store.settings?.google_client_id;
      return Boolean(id && id.trim().length > 10);
    });

    const toggleAuthMode = () => {
      store.authMode = store.authMode === 'login' ? 'register' : 'login';
      Vue.nextTick(() => {
        initGoogleIdentity();
      });
    };

    const fillDemo = (email) => {
      form.email = email;
      form.password = 'password123';
      store.authMode = 'login';
    };

    const initGoogleIdentity = () => {
      const clientId = store.googleConfig?.client_id || store.settings?.google_client_id;
      if (!clientId || !window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: handleGoogleSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const container = document.getElementById('googleSignInBtn');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 320,
            text: store.authMode === 'login' ? 'signin_with' : 'signup_with',
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization:', err);
      }
    };

    const handleGoogleSuccess = async (response) => {
      if (!response?.credential) return;
      googleLoading.value = true;
      try {
        await store.loginWithGoogle(response.credential);
      } catch (err) {
        // error notification handled in store
      } finally {
        googleLoading.value = false;
      }
    };

    const handleContinueWithGoogle = () => {
      if (isGoogleClientConfigured.value && window.google?.accounts?.id) {
        // Try native Google GIS prompt
        try {
          window.google.accounts.id.prompt();
          return;
        } catch (e) {
          // fallback to helper
        }
      }
      showGoogleHelper.value = !showGoogleHelper.value;
    };

    const handleGoogleDemoLogin = async (name, email) => {
      googleLoading.value = true;
      try {
        await store.loginWithGoogle({
          mock: true,
          email: email || 'customer@gmail.com',
          name: name || 'Google Customer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        });
        showGoogleHelper.value = false;
      } catch (err) {
        // Handled in store
      } finally {
        googleLoading.value = false;
      }
    };

    const saveGoogleClientId = async () => {
      if (!customClientId.value.trim()) return;
      savingClientId.value = true;
      try {
        await GST_API.updateSettings({ google_client_id: customClientId.value.trim() });
        store.googleConfig = { client_id: customClientId.value.trim(), configured: true };
        store.settings.google_client_id = customClientId.value.trim();
        store.notify('Google Client ID updated! Initializing Google Sign-In...');
        showGoogleHelper.value = false;
        Vue.nextTick(() => {
          initGoogleIdentity();
        });
      } catch (err) {
        store.notify('Failed to save Google Client ID', 'error');
      } finally {
        savingClientId.value = false;
      }
    };

    const handleSubmit = async () => {
      loading.value = true;
      try {
        if (store.authMode === 'login') {
          await store.login(form.email, form.password);
        } else {
          await store.register({
            name: form.name,
            email: form.email,
            password: form.password,
          });
        }
      } catch (err) {
        // error handled in store
      } finally {
        loading.value = false;
      }
    };

    // Watch modal state to initialize Google button when open
    Vue.watch(() => store.authModalOpen, (isOpen) => {
      if (isOpen) {
        Vue.nextTick(() => {
          initGoogleIdentity();
        });
      }
    });

    Vue.onMounted(() => {
      if (store.authModalOpen) {
        initGoogleIdentity();
      }
    });

    return {
      store,
      form,
      loading,
      googleLoading,
      showGoogleHelper,
      customClientId,
      savingClientId,
      isGoogleClientConfigured,
      toggleAuthMode,
      fillDemo,
      handleContinueWithGoogle,
      handleGoogleDemoLogin,
      saveGoogleClientId,
      handleSubmit,
    };
  },
};
