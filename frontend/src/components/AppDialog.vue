<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="dialog.open"
        class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        @click.self="handleCancel"
      >
        <div
          class="w-full max-w-md rounded-2xl bg-surface-900 border border-surface-700/80 shadow-2xl overflow-hidden transform transition-all"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Top Accent Strip -->
          <div class="h-1 w-full" :class="accentBarClass"></div>

          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-3.5">
              <!-- Variant Icon Badge -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                :class="iconBadgeClass"
              >
                <i class="pi text-base" :class="resolvedIcon"></i>
              </div>

              <!-- Title & Message -->
              <div class="flex-1 min-w-0">
                <h3
                  :id="titleId"
                  class="text-base font-bold text-white leading-snug"
                >
                  {{ dialog.title }}
                </h3>
                <p
                  v-if="dialog.message"
                  class="mt-1.5 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line break-words"
                >
                  {{ dialog.message }}
                </p>
              </div>
            </div>

            <!-- Prompt Input Field -->
            <div v-if="dialog.mode === 'prompt'" class="mt-4">
              <input
                ref="inputRef"
                v-model="inputValue"
                :type="dialog.inputType || 'text'"
                :placeholder="dialog.placeholder || ''"
                :maxlength="dialog.maxLength || undefined"
                @keydown.enter.prevent="handleConfirm"
                class="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-surface-700 focus:border-amber-400 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>

            <!-- Action Buttons -->
            <div class="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="handleCancel"
                class="px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-gray-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {{ dialog.cancelText || 'Cancel' }}
              </button>
              <button
                ref="confirmBtnRef"
                type="button"
                @click="handleConfirm"
                class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
                :class="confirmButtonClass"
              >
                {{ dialog.confirmText || 'OK' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useGShotStore } from '@/stores/useGShotStore';

export default {
  name: 'AppDialog',
  setup() {
    const store = useGShotStore();
    const inputRef = ref(null);
    const confirmBtnRef = ref(null);
    const inputValue = ref('');
    const titleId = 'app-dialog-title';

    const dialog = computed(() => store.dialog);

    const accentBarClass = computed(() => {
      switch (dialog.value.variant) {
        case 'danger':
          return 'bg-gradient-to-r from-rose-600 to-rose-400';
        case 'success':
          return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
        case 'info':
          return 'bg-gradient-to-r from-sky-600 to-sky-400';
        case 'warning':
        case 'brand':
        default:
          return 'bg-gradient-to-r from-amber-500 to-yellow-400';
      }
    });

    const iconBadgeClass = computed(() => {
      switch (dialog.value.variant) {
        case 'danger':
          return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
        case 'success':
          return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
        case 'info':
          return 'bg-sky-500/15 border-sky-500/30 text-sky-400';
        case 'warning':
        case 'brand':
        default:
          return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      }
    });

    const confirmButtonClass = computed(() => {
      switch (dialog.value.variant) {
        case 'danger':
          return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50';
        case 'success':
          return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50';
        case 'info':
          return 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/50';
        case 'warning':
        case 'brand':
        default:
          return 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-950/40';
      }
    });

    const resolvedIcon = computed(() => {
      if (dialog.value.icon) return dialog.value.icon;
      switch (dialog.value.variant) {
        case 'danger':
          return 'pi-exclamation-triangle';
        case 'success':
          return 'pi-check-circle';
        case 'info':
          return 'pi-info-circle';
        case 'warning':
          return 'pi-exclamation-circle';
        default:
          return 'pi-question-circle';
      }
    });

    const handleConfirm = () => {
      if (dialog.value.mode === 'prompt') {
        store.resolveDialog(inputValue.value);
      } else {
        store.resolveDialog(true);
      }
    };

    const handleCancel = () => {
      if (dialog.value.mode === 'prompt') {
        store.resolveDialog(null);
      } else {
        store.resolveDialog(false);
      }
    };

    const onKeyDown = (e) => {
      if (!dialog.value.open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    watch(
      () => dialog.value.open,
      async (isOpen) => {
        if (isOpen) {
          inputValue.value = dialog.value.defaultValue ?? '';
          await nextTick();
          if (dialog.value.mode === 'prompt' && inputRef.value) {
            inputRef.value.focus();
            inputRef.value.select();
          } else if (confirmBtnRef.value) {
            confirmBtnRef.value.focus();
          }
        }
      }
    );

    onMounted(() => {
      window.addEventListener('keydown', onKeyDown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeyDown);
    });

    return {
      dialog,
      inputRef,
      confirmBtnRef,
      inputValue,
      titleId,
      accentBarClass,
      iconBadgeClass,
      confirmButtonClass,
      resolvedIcon,
      handleConfirm,
      handleCancel,
    };
  },
};
</script>
