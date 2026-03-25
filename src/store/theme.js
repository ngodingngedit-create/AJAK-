import { reactive, watch } from 'vue';

const saved = localStorage.getItem('ajak-theme') || 'light';

export const themeStore = reactive({
  mode: saved, // 'light' | 'dark'

  get isDark() {
    return this.mode === 'dark';
  },

  toggle() {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  },

  set(mode) {
    this.mode = mode;
  }
});

// Apply class to <html> and persist
watch(
  () => themeStore.mode,
  (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('ajak-theme', mode);
  },
  { immediate: true }
);
