<template>
  <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
    <button @click="$emit('open-modal', 'info')" class="theme-bg-gradient text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl hover:scale-110 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    </button>
    <button v-if="selectedCardsCount > 0 && !isAdmin" @click="$emit('open-modal', 'export')" class="theme-bg-gradient text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl hover:scale-110 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{{ selectedCardsCount }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  selectedCardsCount: Number,
  isAdmin: Boolean,
});
defineEmits(['open-modal']);
</script>
