<template>
  <div 
    v-if="store.authModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    @click.self="store.authModalOpen = false">
    
    <div class="relative w-full max-w-md bg-surface-900 border border-surface-700 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] p-5 sm:p-8">
      
      <!-- Close Button -->
      <button 
        @click="store.authModalOpen = false"
        class="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close modal">
        ✕
      </button>

      <!-- Brand Icon & Header -->
      <div class="text-center mb-5">
        <div class="w-11 h-11 rounded-2xl bg-surface-800 border border-surface-700 mx-auto mb-3 flex items-center justify-center text-yellow-400 font-black text-xl">
          <i v-if="store.authMode === 'forgot' || store.authMode === 'reset'" class="pi pi-lock text-yellow-400 text-lg"></i>
          <i v-else-if="store.authMode === 'register_verify'" class="pi pi-envelope text-yellow-400 text-lg"></i>
          <span v-else>G'</span>
        </div>
        <h2 class="text-2xl font-black text-white">
          <span v-if="store.authMode === 'login'">Sign In</span>
          <span v-else-if="store.authMode === 'register'">Create Account</span>
          <span v-else-if="store.authMode === 'register_verify'">Verify Your Email</span>
          <span v-else-if="store.authMode === 'forgot'">Forgot Password</span>
          <span v-else-if="store.authMode === 'reset'">Reset Password</span>
        </h2>
        <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
          <span v-if="store.authMode === 'login'">Sign in to your customer account to place orders and track deliveries</span>
          <span v-else-if="store.authMode === 'register'">Register to start ordering milk tea and comfort snacks</span>
          <span v-else-if="store.authMode === 'register_verify'">Enter the 6-digit verification code sent to your email to activate your account</span>
          <span v-else-if="store.authMode === 'forgot'">Enter your registered email and we'll send a 6-digit verification code to reset your password</span>
          <span v-else-if="store.authMode === 'reset'">Enter the 6-digit verification code sent to your email and your new password</span>
        </p>
      </div>

      <!-- In-Modal Error Banner -->
      <div v-if="authError" class="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-shake">
        <i class="pi pi-exclamation-triangle text-rose-400 mt-0.5 shrink-0 text-sm"></i>
        <span class="flex-1 leading-snug">{{ authError }}</span>
      </div>

      <!-- In-Modal Success Banner -->
      <div v-if="authSuccess" class="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
        <i class="pi pi-check-circle text-emerald-400 mt-0.5 shrink-0 text-sm"></i>
        <span class="flex-1 leading-snug">{{ authSuccess }}</span>
      </div>

      <!-- Dev/Demo Mode Code Auto-Fill Helper -->
      <div v-if="devCode && (store.authMode === 'reset' || store.authMode === 'register_verify')" class="mb-4 p-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <i class="pi pi-info-circle text-yellow-400 shrink-0"></i>
          <span class="truncate">Testing OTP: <strong class="font-mono text-white text-sm tracking-widest">{{ devCode }}</strong></span>
        </div>
        <button 
          type="button" 
          @click="store.authMode === 'register_verify' ? (form.registerCode = devCode) : (form.code = devCode)" 
          class="shrink-0 px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] transition-all cursor-pointer">
          Auto Fill
        </button>
      </div>

      <!-- MODE 1 & 2: LOGIN / REGISTER -->
      <div v-if="store.authMode === 'login' || store.authMode === 'register'">
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
            v-if="!isGoogleClientConfigured || !hasGoogleRendered"
            type="button"
            @click="handleContinueWithGoogle"
            :disabled="googleLoading"
            class="w-full py-3 px-4 rounded-xl bg-surface-800 hover:bg-surface-700/80 border border-surface-700 hover:border-gray-500 text-white font-bold text-xs flex items-center justify-center gap-3 transition-all duration-200 shadow-md group cursor-pointer">
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <i v-if="googleLoading" class="pi pi-spin pi-spinner"></i>
            <span v-else>Continue with Google</span>
          </button>

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

          <!-- Password with Forgot Password link and Show/Hide Toggle -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <!-- FORGOT PASSWORD LINK -->
              <button 
                v-if="store.authMode === 'login'"
                type="button"
                @click="setAuthMode('forgot')"
                class="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer">
                Forgot password?
              </button>
            </div>
            <div class="relative">
              <input 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 pr-10 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                tabindex="-1">
                <i class="pi" :class="showPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg">
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
              class="text-brand-400 hover:text-brand-300 font-bold ml-1 transition-colors cursor-pointer">
              {{ store.authMode === 'login' ? 'Register here' : 'Sign In here' }}
            </button>
          </p>
        </div>
      </div>

      <!-- MODE 3: FORGOT PASSWORD (Enter Email) -->
      <div v-else-if="store.authMode === 'forgot'" class="space-y-4">
        <form @submit.prevent="handleSendResetCode" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Registered Email Address
            </label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
            <p class="text-[11px] text-gray-500 mt-1.5">
              We will send a 6-digit verification code to this address if it exists in our system.
            </p>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>Send Verification Code</span>
          </button>
        </form>

        <div class="text-center mt-5 pt-3 border-t border-surface-800">
          <button 
            type="button"
            @click="setAuthMode('login')"
            class="text-xs text-gray-400 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
            <i class="pi pi-arrow-left text-xs"></i> Back to Sign In
          </button>
        </div>
      </div>

      <!-- MODE 4: RESET PASSWORD (Code + New Password) -->
      <div v-else-if="store.authMode === 'reset'" class="space-y-4">
        <form @submit.prevent="handleResetPassword" class="space-y-4 text-xs">
          
          <!-- Verification Code -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-gray-400 uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <button 
                v-if="resendCountdown > 0" 
                type="button" 
                disabled 
                class="text-[11px] text-gray-500">
                Resend in {{ resendCountdown }}s
              </button>
              <button 
                v-else 
                type="button" 
                @click="handleResendCode" 
                :disabled="loading" 
                class="text-[11px] text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer">
                Resend Code
              </button>
            </div>
            <input 
              v-model="form.code"
              type="text" 
              inputmode="numeric"
              maxlength="6"
              required
              placeholder="••••••"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-lg text-center font-mono tracking-[0.35em] text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-bold"
            />
          </div>

          <!-- New Password -->
          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div class="relative">
              <input 
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'" 
                required
                minlength="6"
                placeholder="At least 6 characters"
                class="w-full px-4 py-3 pr-10 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <button 
                type="button" 
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                tabindex="-1">
                <i class="pi" :class="showNewPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div class="relative">
              <input 
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'" 
                required
                minlength="6"
                placeholder="Re-type new password"
                class="w-full px-4 py-3 pr-10 rounded-xl bg-surface-800 border border-surface-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <button 
                type="button" 
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                tabindex="-1">
                <i class="pi" :class="showConfirmPassword ? 'pi-eye-slash' : 'pi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>Reset Password & Sign In</span>
          </button>
        </form>

        <div class="text-center mt-5 pt-3 border-t border-surface-800 flex items-center justify-between text-xs">
          <button 
            type="button" 
            @click="setAuthMode('forgot')" 
            class="text-gray-400 hover:text-white font-medium transition-colors cursor-pointer">
            ← Change Email
          </button>
          <button 
            type="button" 
            @click="setAuthMode('login')" 
            class="text-brand-400 hover:text-brand-300 font-bold transition-colors cursor-pointer">
            Back to Sign In
          </button>
        </div>
      </div>

      <!-- MODE 5: REGISTER VERIFICATION (Enter 6-digit code) -->
      <div v-else-if="store.authMode === 'register_verify'" class="space-y-4">
        <div class="p-4 rounded-2xl bg-surface-800/80 border border-surface-700 text-center">
          <div class="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mx-auto mb-2 text-yellow-400">
            <i class="pi pi-envelope text-lg"></i>
          </div>
          <p class="text-xs text-gray-300">
            A 6-digit verification code was sent to:
          </p>
          <p class="text-sm font-bold text-yellow-400 font-mono mt-0.5 break-all">
            {{ form.email }}
          </p>
          <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">
            Please check your inbox (and spam folder). The code is valid for 15 minutes.
          </p>
        </div>

        <form @submit.prevent="handleVerifyRegister" class="space-y-4 text-xs">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-gray-400 uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <button 
                v-if="resendCountdown > 0" 
                type="button" 
                disabled 
                class="text-[11px] text-gray-500">
                Resend in {{ resendCountdown }}s
              </button>
              <button 
                v-else 
                type="button" 
                @click="handleResendRegisterCode" 
                :disabled="loading" 
                class="text-[11px] text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer">
                Resend Code
              </button>
            </div>
            <input 
              v-model="form.registerCode"
              type="text" 
              maxlength="6"
              required
              placeholder="123456"
              class="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-center text-2xl font-bold tracking-[8px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>Verify & Complete Registration</span>
          </button>
        </form>

        <div class="text-center mt-5 pt-3 border-t border-surface-800 flex items-center justify-between text-xs">
          <button 
            type="button" 
            @click="setAuthMode('register')" 
            class="text-gray-400 hover:text-white font-medium transition-colors cursor-pointer">
            ← Change Details
          </button>
          <button 
            type="button" 
            @click="setAuthMode('login')" 
            class="text-brand-400 hover:text-brand-300 font-bold transition-colors cursor-pointer">
            Back to Sign In
          </button>
        </div>
      </div>

      <!-- Operations Personnel Redirection Box -->
      <div v-if="store.authMode === 'login' || store.authMode === 'register'" class="mt-4 p-3 rounded-2xl bg-surface-950/80 border border-surface-800 text-[11px] text-gray-400 flex items-start gap-2.5">
        <i class="pi pi-shield text-amber-400 mt-0.5 shrink-0 text-xs"></i>
        <div>
          <span class="font-bold text-gray-200">Staff, Admin, or Delivery Rider?</span>
          <p class="text-[10px] text-gray-400 mt-0.5 leading-snug">
            Operational credentials are not allowed on the customer page.
            <a href="/admin" class="text-amber-400 hover:text-amber-300 font-bold underline ml-1">Open Operations Portal &rarr;</a>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import * as Vue from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';
import GST_API from '@/services/api';

// G Shot Teas — Unified Customer Authentication Modal with Google Sign-In & Password Reset
export default {
  name: 'AuthModal',
  setup() {
    const store = useGShotStore();
    const loading = Vue.ref(false);
    const googleLoading = Vue.ref(false);
    const authError = Vue.ref('');
    const authSuccess = Vue.ref('');
    const devCode = Vue.ref('');
    const resendCountdown = Vue.ref(0);
    let timer = null;

    const showPassword = Vue.ref(false);
    const showNewPassword = Vue.ref(false);
    const showConfirmPassword = Vue.ref(false);

    const form = Vue.reactive({
      name: '',
      email: '',
      password: '',
      code: '',
      registerCode: '',
      newPassword: '',
      confirmPassword: '',
    });

    const isGoogleClientConfigured = Vue.computed(() => {
      const id = store.googleConfig?.client_id || store.settings?.google_client_id;
      return Boolean(id && id.trim().length > 10);
    });

    const setAuthMode = (mode) => {
      authError.value = '';
      authSuccess.value = '';
      store.authMode = mode;
      if (mode === 'login' || mode === 'register') {
        Vue.nextTick(() => {
          initGoogleIdentity();
        });
      }
    };

    const toggleAuthMode = () => {
      setAuthMode(store.authMode === 'login' ? 'register' : 'login');
    };

    const startCountdown = (seconds = 30) => {
      if (timer) clearInterval(timer);
      resendCountdown.value = seconds;
      timer = setInterval(() => {
        if (resendCountdown.value > 0) {
          resendCountdown.value--;
        } else {
          clearInterval(timer);
          timer = null;
        }
      }, 1000);
    };

    const handleSendResetCode = async () => {
      if (!form.email || !form.email.includes('@')) {
        authError.value = 'Please enter a valid email address.';
        return;
      }
      loading.value = true;
      authError.value = '';
      authSuccess.value = '';
      try {
        const res = await store.forgotPassword(form.email);
        authSuccess.value = res.message || 'Verification code sent to your email!';
        if (res.dev_code) {
          devCode.value = res.dev_code;
        }
        startCountdown(30);
        store.authMode = 'reset';
      } catch (err) {
        authError.value = err.message || 'Failed to send reset code. Please verify email.';
      } finally {
        loading.value = false;
      }
    };

    const handleResendCode = async () => {
      if (resendCountdown.value > 0 || loading.value) return;
      loading.value = true;
      authError.value = '';
      authSuccess.value = '';
      try {
        const res = await store.forgotPassword(form.email);
        authSuccess.value = 'A new 6-digit verification code has been sent!';
        if (res.dev_code) {
          devCode.value = res.dev_code;
        }
        startCountdown(30);
      } catch (err) {
        authError.value = err.message || 'Failed to resend code.';
      } finally {
        loading.value = false;
      }
    };

    const handleResetPassword = async () => {
      authError.value = '';
      authSuccess.value = '';

      if (!form.code || form.code.trim().length !== 6) {
        authError.value = 'Please enter the complete 6-digit verification code.';
        return;
      }

      if (!form.newPassword || form.newPassword.length < 6) {
        authError.value = 'New password must be at least 6 characters.';
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        authError.value = 'Passwords do not match. Please re-enter.';
        return;
      }

      loading.value = true;
      try {
        await store.resetPassword({
          email: form.email,
          code: form.code.trim(),
          password: form.newPassword,
          password_confirmation: form.confirmPassword,
        });
      } catch (err) {
        authError.value = err.message || 'Password reset failed. Please check your verification code.';
      } finally {
        loading.value = false;
      }
    };

    const hasGoogleRendered = Vue.ref(false);

    const initGoogleIdentity = () => {
      const clientId = store.googleConfig?.client_id || store.settings?.google_client_id;
      if (!clientId || !window.google?.accounts?.id) {
        hasGoogleRendered.value = false;
        return;
      }

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
          hasGoogleRendered.value = true;
        }
      } catch (err) {
        console.warn('Google Identity initialization:', err);
        hasGoogleRendered.value = false;
      }
    };

    const handleGoogleSuccess = async (response) => {
      if (!response?.credential) return;
      googleLoading.value = true;
      authError.value = '';
      try {
        await store.loginWithGoogle(response.credential, 'customer');
      } catch (err) {
        authError.value = err.response?.data?.message || err.message || 'Google Sign-In failed.';
      } finally {
        googleLoading.value = false;
      }
    };

    const handleContinueWithGoogle = () => {
      authError.value = '';
      if (isGoogleClientConfigured.value && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.prompt();
          return;
        } catch (e) {
          console.warn('Google prompt error:', e);
        }
      }
      if (!window.google?.accounts?.id) {
        store.notify('Google Sign-In is blocked by Brave Shields or an ad-blocker. Please turn Brave Shields OFF for 127.0.0.1 (click the lion icon in your address bar) or sign in with email and password below.', 'warning');
      } else {
        store.notify('Google OAuth credentials need authorized origins set in Google Cloud Console. You can sign in with your email and password below.', 'info');
      }
    };

    const handleVerifyRegister = async () => {
      authError.value = '';
      authSuccess.value = '';

      if (!form.registerCode || form.registerCode.trim().length !== 6) {
        authError.value = 'Please enter the complete 6-digit verification code.';
        return;
      }

      loading.value = true;
      try {
        await store.verifyRegister({
          email: form.email,
          code: form.registerCode.trim(),
        });
      } catch (err) {
        authError.value = err.message || 'Verification failed. Please check your code or request a new one.';
      } finally {
        loading.value = false;
      }
    };

    const handleResendRegisterCode = async () => {
      if (resendCountdown.value > 0 || loading.value) return;
      loading.value = true;
      authError.value = '';
      authSuccess.value = '';
      try {
        const res = await store.resendRegisterOtp(form.email);
        authSuccess.value = res.message || 'A new verification code has been sent!';
        if (res.dev_code) {
          devCode.value = res.dev_code;
        }
        startCountdown(30);
      } catch (err) {
        authError.value = err.message || 'Failed to resend code.';
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      loading.value = true;
      authError.value = '';
      authSuccess.value = '';
      try {
        if (store.authMode === 'login') {
          await store.login(form.email, form.password, 'customer');
        } else {
          const res = await store.register({
            name: form.name,
            email: form.email,
            password: form.password,
          });
          if (res?.requires_verification) {
            authSuccess.value = res.message || 'Verification code sent to your email!';
            if (res.dev_code) {
              devCode.value = res.dev_code;
            }
            form.registerCode = '';
            startCountdown(30);
            store.authMode = 'register_verify';
          }
        }
      } catch (err) {
        authError.value = err.response?.data?.message || err.message || 'Authentication failed. Please verify your credentials.';
      } finally {
        loading.value = false;
      }
    };

    // Watch modal state to initialize Google button when open
    Vue.watch(() => store.authModalOpen, (isOpen) => {
      if (isOpen) {
        authError.value = '';
        authSuccess.value = '';
        if (store.authMode === 'login' || store.authMode === 'register') {
          Vue.nextTick(() => {
            initGoogleIdentity();
          });
        }
      } else {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
    });

    Vue.onMounted(() => {
      if (store.authModalOpen && (store.authMode === 'login' || store.authMode === 'register')) {
        initGoogleIdentity();
      }
    });

    Vue.onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });

    return {
      store,
      form,
      loading,
      googleLoading,
      authError,
      authSuccess,
      devCode,
      resendCountdown,
      showPassword,
      showNewPassword,
      showConfirmPassword,
      isGoogleClientConfigured,
      hasGoogleRendered,
      setAuthMode,
      toggleAuthMode,
      handleSubmit,
      handleSendResetCode,
      handleResendCode,
      handleResetPassword,
      handleContinueWithGoogle,
      handleVerifyRegister,
      handleResendRegisterCode,
    };
  },
};
</script>