<template>
  <div class="mb-8 text-center">
    <h2 class="font-bold text-gray-700 text-xl mb-2">Choose your bias!</h2>
    <div class="flex justify-center items-center gap-3">
      <button
        v-for="(theme, name) in themes"
        :key="name"
        class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md transition-all hover:opacity-100"
        :style="{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }"
        :class="{ 'ring-2 ring-offset-2 theme-ring-focus opacity-100': currentTheme === name, 'opacity-70': currentTheme !== name }"
        :style="{ borderColor: theme.primary }"
        @click="$emit('theme-changed', name)"
      >
        {{ theme.initial }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  themes: Object,
  currentTheme: String,
});
defineEmits(['theme-changed']);
</script>
