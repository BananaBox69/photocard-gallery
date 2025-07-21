<template>
  <header class="text-center mb-8 relative">
    <p v-if="settings.lastUpdated" class="text-xs text-gray-500 absolute top-0 left-0">
      Last updated: {{ settings.lastUpdated }}
    </p>
    <div class="flex justify-center items-center gap-3 title-container">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 transition-colors duration-500 theme-text">
        {{ settings.title }}
      </h1>
      <span v-if="isAdmin" class="edit-pen text-gray-500 admin-visible" @click="$emit('open-modal', 'title-edit')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
      </span>
    </div>
    <div class="flex justify-center items-center gap-2 title-container">
      <p class="text-lg text-gray-600 mt-2 transition-colors duration-500 theme-text">
        {{ settings.subtitle }}
      </p>
      <span v-if="isAdmin" class="edit-pen text-gray-500 mt-2 admin-visible" @click="$emit('open-modal', 'subtitle-edit')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
      </span>
    </div>
    <div class="absolute top-0 right-0 flex items-center gap-2">
        <button @click="$emit('open-modal', 'info')" class="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-md hover:bg-gray-100">Info</button>
        <button v-if="!isAdmin" @click="$emit('open-modal', 'admin-login')" class="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-md hover:bg-gray-100">Admin</button>
        <button v-if="isAdmin" @click="$emit('logout')" class="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Exit Admin</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  settings: Object,
  isAdmin: Boolean,
});
defineEmits(['open-modal', 'logout']);
</script>
