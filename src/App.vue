<template>
  <div>
    <!-- Admin Login Modal -->
    <div v-if="activeModal === 'admin-login'" class="modal-backdrop">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-xl font-bold mb-4">Admin Login</h3>
        <input type="password" :value="adminPassword" @input="$emit('update:adminPassword', $event.target.value)" @keydown.enter="$emit('admin-login')" class="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="Password">
        <div class="flex justify-end space-x-2">
          <button type="button" @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
          <button @click="$emit('admin-login')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Login</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Card Modal -->
    <div v-if="activeModal === 'add-card' || activeModal === 'edit-card'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-800">
            <h3 class="text-xl font-bold mb-4">{{ cardData.id ? 'Edit Card' : 'Add a New Card' }}</h3>
            <form @submit.prevent="$emit('save-card', { cardData: cardData, closeOnFinish: true })" class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Card ID</label>
                    <input type="text" v-model="cardData.displayId" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="relative autocomplete-container">
                        <label class="block text-sm font-medium text-gray-700">Group</label>
                        <input type="text" v-model="cardData.group" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required autocomplete="off">
                        <div id="group-suggestions" class="autocomplete-suggestions hidden"></div>
                    </div>
                    <div class="relative autocomplete-container">
                        <label class="block text-sm font-medium text-gray-700">Member</label>
                        <input type="text" v-model="cardData.member" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required autocomplete="off">
                        <div id="member-suggestions" class="autocomplete-suggestions hidden"></div>
                    </div>
                </div>
                <div class="relative autocomplete-container">
                    <label class="block text-sm font-medium text-gray-700">Album / Origin</label>
                    <input type="text" v-model="cardData.album" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required autocomplete="off">
                    <div id="album-suggestions" class="autocomplete-suggestions hidden"></div>
                </div>
                <div class="relative autocomplete-container">
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea v-model="cardData.description" rows="2" class="mt-1 w-full p-2 border border-gray-300 rounded-md" autocomplete="off"></textarea>
                    <div id="description-suggestions" class="autocomplete-suggestions hidden"></div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Price (€)</label>
                    <input type="number" step="0.01" v-model="cardData.price" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" v-model="cardData.imageUrl" class="mt-1 w-full p-2 border border-gray-300 rounded-md" required>
                </div>
                <div class="flex justify-between items-center pt-4">
                    <span id="save-another-confirm" class="text-green-600 opacity-0 transition-opacity">Saved!</span>
                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="button" @click="$emit('save-card', { cardData: cardData, closeOnFinish: false })" class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save & Add Another</button>
                        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save & Close</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="activeModal === 'delete-confirm-single' || activeModal === 'delete-confirm-bulk'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <h3 class="text-xl font-bold mb-2">Are you sure?</h3>
            <p class="text-gray-600 mb-6">This action cannot be undone.</p>
            <div class="flex justify-center space-x-4">
                <button @click="$emit('close-modal')" class="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="$emit('confirm-delete')" class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

    <!-- Title Edit Modal -->
    <div v-if="activeModal === 'title-edit'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-xl font-bold mb-4">Edit Title</h3>
            <input type="text" :value="title" @input="$emit('update:title', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="New Title">
            <div class="flex justify-end space-x-2">
                <button @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="$emit('save-title')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
            </div>
        </div>
    </div>

    <!-- Subtitle Edit Modal -->
    <div v-if="activeModal === 'subtitle-edit'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-xl font-bold mb-4">Edit Subtitle</h3>
            <input type="text" :value="subtitle" @input="$emit('update:subtitle', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="New Subtitle">
            <div class="flex justify-end space-x-2">
                <button @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="$emit('save-subtitle')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
            </div>
        </div>
    </div>
    
    <!-- Export Modal -->
    <div v-if="activeModal === 'export'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl text-gray-800 flex flex-col" style="max-height: 90vh;">
            <h3 class="text-2xl font-bold mb-4">Export Selection</h3>
            <p class="text-sm text-gray-600 mb-4">Please fill in the details below, then copy the text and send it to me!</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Shipping Method</label>
                    <select :value="exportData.shipping" @change="$emit('update:exportShipping', $event.target.value)" class="mt-1 w-full p-2 border border-gray-300 rounded-md">
                        <option>Cheapest</option>
                        <option>Tracked</option>
                        <option>Insured</option>
                    </select>
                </div>
                <div class="relative autocomplete-container">
                    <label class="block text-sm font-medium text-gray-700">Ship to Country</label>
                    <input type="text" :value="exportData.country" @input="$emit('update:exportCountry', $event.target.value)" class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Germany" autocomplete="off">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select :value="exportData.payment" @change="$emit('update:exportPayment', $event.target.value)" class="mt-1 w-full p-2 border border-gray-300 rounded-md">
                        <option>PayPal F&F</option>
                        <option>Wise</option>
                        <option>Bank Transfer</option>
                    </select>
                </div>
            </div>
            <div class="flex-grow min-h-0">
                <textarea :value="exportText" readonly class="w-full h-96 p-3 bg-gray-100 border border-gray-300 rounded-md resize-none font-mono text-sm"></textarea>
            </div>
            <div class="flex justify-between items-center mt-4">
                 <a href="https://www.instagram.com/bananatrades877/" target="_blank" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <span>Send on Instagram</span>
                </a>
                <div class="flex space-x-2">
                    <button type="button" @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
                    <button @click="$emit('copy-export-text')" id="copy-export-btn" class="px-4 py-2 text-white rounded-md theme-bg-gradient">Copy Text</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bulk Price Modal -->
    <div v-if="activeModal === 'bulk-price'" class="modal-backdrop">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-xl font-bold mb-4">Bulk Edit Price</h3>
            <p class="text-sm text-gray-600 mb-2">Enter a new price for all selected cards.</p>
            <input type="number" step="0.01" :value="bulkPrice" @input="$emit('update:bulkPrice', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="e.g., 10.50">
            <div class="flex justify-end space-x-2">
                <button type="button" @click="$emit('close-modal')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="$emit('bulk-action', 'price')" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Set Price</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeModal: String,
  adminPassword: String,
  cardData: Object,
  title: String,
  subtitle: String,
  exportData: Object,
  exportText: String,
  bulkPrice: Number,
});

defineEmits([
  'close-modal',
  'update:adminPassword',
  'admin-login',
  'save-card',
  'confirm-delete',
  'update:title',
  'save-title',
  'update:subtitle',
  'save-subtitle',
  'update:exportShipping',
  'update:exportCountry',
  'update:exportPayment',
  'copy-export-text',
  'update:bulkPrice',
  'bulk-action',
]);
</script>
