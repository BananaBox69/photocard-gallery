<template>
  <div v-if="isAdmin" class="bg-indigo-100 border border-indigo-200 rounded-lg p-4 mb-8">
    <h3 class="text-lg font-bold text-indigo-800 mb-2">Admin Dashboard</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
        <p class="text-2xl font-bold text-indigo-600">{{ stats.total }}</p>
        <p class="text-sm text-indigo-500">Total Cards</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-green-600">{{ stats.available }}</p>
        <p class="text-sm text-green-500">Available</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-yellow-600">{{ stats.onHold }}</p>
        <p class="text-sm text-yellow-500">On Hold</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-indigo-600">{{ stats.value }}</p>
        <p class="text-sm text-indigo-500">Available Stock Value</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isAdmin: Boolean,
  stats: Object,
});
</script>
