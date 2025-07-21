<template>
  <div id="control-panel" class="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 sticky top-4 z-10 transition-all duration-500">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input type="text" :value="searchTerm" @input="$emit('update:searchTerm', $event.target.value)" placeholder="Search..." class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
      <select :value="selectedGroup" @change="$emit('update:selectedGroup', $event.target.value)" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
        <option value="all">All Groups</option>
        <option v-for="group in groupOrder" :key="group" :value="group">{{ group }}</option>
      </select>
      <div v-show="isAdmin" id="status-filter-wrapper">
        <select :value="selectedStatus" @change="$emit('update:selectedStatus', $event.target.value)" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="on-hold">On Hold</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      <select :value="sortOrder" @change="$emit('update:sortOrder', $event.target.value)" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
        <option value="default">Default Sort</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="date-desc">Newest Added</option>
        <option value="id-asc">ID: A to Z</option>
      </select>
    </div>
    <div v-if="isAdmin" class="flex items-center justify-between mt-4">
      <button @click="$emit('open-modal', 'add-card')" v-show="selectedCardsCount === 0" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add New Card</button>
      <div v-show="selectedCardsCount > 0" class="w-full">
        <div class="bg-indigo-100 border border-indigo-200 rounded-md p-2 flex justify-between items-center">
          <div>
            <span class="font-bold">{{ selectedCardsCount }}</span> cards selected
          </div>
          <div class="flex items-center gap-1 flex-wrap justify-end">
            <button @click="$emit('bulk-action', 'sale')" class="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600">10% Off</button>
            <button @click="$emit('bulk-action', 'super-sale')" class="px-2 py-1 bg-purple-700 text-white rounded-md text-xs hover:bg-purple-800">20% Off</button>
            <button @click="$emit('open-modal', 'bulk-price')" class="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700">Set Price</button>
            <button @click="$emit('bulk-action', 'available')" class="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700">Mark Available</button>
            <button @click="$emit('bulk-action', 'on-hold')" class="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600">Mark Reserved</button>
            <button @click="$emit('bulk-action', 'sold')" class="px-2 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700">Mark Sold</button>
            <button @click="$emit('open-modal', 'delete-confirm-bulk')" class="px-2 py-1 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700">Delete</button>
            <button @click="$emit('deselect-all')" class="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300">Deselect All</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isAdmin: Boolean,
  searchTerm: String,
  selectedGroup: String,
  selectedStatus: String,
  sortOrder: String,
  groupOrder: Array,
  selectedCardsCount: Number,
});
defineEmits([
  'update:searchTerm',
  'update:selectedGroup',
  'update:selectedStatus',
  'update:sortOrder',
  'open-modal',
  'bulk-action',
  'deselect-all',
]);
</script>
