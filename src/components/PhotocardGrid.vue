<template>
  <div v-if="cards.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="group-item rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 fade-in flex flex-col"
      :class="{ 'card-selected': isSelected(card.id) }"
      :style="{ backgroundColor: getMemberColor(card.member), animationDelay: `${index * 50}ms` }"
      @click="$emit('toggle-selection', card.id)"
    >
      <div class="relative">
        <img :src="card.imageUrl || ''" :alt="`${card.member} from ${card.group}`" class="w-full h-auto object-cover aspect-[2/3]" :class="cardOpacity(card)" onerror="this.onerror=null;this.src='https://placehold.co/400x600/cccccc/ffffff?text=No+Image';">
        <div class="absolute top-2 left-2 bg-black/50 text-white text-xs font-mono px-1.5 py-0.5 rounded">{{ card.displayId || 'N/A' }}</div>
        
        <button v-if="showCheckbox(card)" @click.stop="$emit('toggle-selection', card.id)" class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/50 rounded-full text-indigo-600 hover:bg-white/80 transition z-20">
          <template v-if="isSelected(card.id)">
            <svg v-if="isAdmin" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="text-green-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-text"><path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"/></svg>
          </template>
          <template v-else>
            <svg v-if="isAdmin" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><circle cx="12" cy="12" r="10"></circle></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="theme-text"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </template>
        </button>
        
        <div class="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
          <div v-if="statusBadge(card)">
            <span :class="statusBadge(card).class">{{ statusBadge(card).text }}</span>
          </div>
          <div v-if="isAdmin" class="flex flex-col gap-1">
            <button @click.stop="$emit('admin-action', { type: 'toggle-discount', id: card.id, payload: 'sale' })" class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600" title="Toggle 10% Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
            <button @click.stop="$emit('admin-action', { type: 'toggle-discount', id: card.id, payload: 'super-sale' })" class="p-1 bg-purple-700 text-white rounded-full hover:bg-purple-800" title="Toggle 20% Super Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
            <button @click.stop="$emit('open-modal', { name: 'edit-card', id: card.id })" class="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
            <button @click.stop="$emit('admin-action', { type: 'toggle-status', id: card.id, payload: 'sold' })" class="p-1 bg-red-600 text-white rounded-full hover:bg-red-700" title="Toggle Sold"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>
            <button @click.stop="$emit('admin-action', { type: 'toggle-status', id: card.id, payload: 'on-hold' })" class="p-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600" title="Toggle Reserved"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></button>
            <button @click.stop="$emit('open-modal', { name: 'delete-confirm-single', id: card.id })" class="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <div>
          <p class="font-bold text-lg" :style="{ color: getDarkTextColor(card.member) }">{{ card.member || 'Unknown' }}</p>
          <p class="text-sm" :style="{ color: getDarkTextColor(card.member), opacity: 0.8 }">{{ card.group || 'Unknown' }}</p>
          <p class="text-sm line-clamp-2" :style="{ color: getDarkTextColor(card.member), opacity: 0.8, minHeight: '2.5rem' }" :title="card.album || ''">{{ card.album || 'Unknown' }}</p>
          <p class="text-xs mt-1 h-8 overflow-hidden" :style="{ color: getDarkTextColor(card.member), opacity: 0.7 }">{{ card.description || '' }}</p>
        </div>
        <p class="text-xl font-semibold mt-auto pt-2" :style="{ color: getDarkTextColor(card.member) }">€{{ (card.price || 0).toFixed(2) }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16">
    <h3 class="text-2xl font-semibold text-gray-700">No cards found!</h3>
    <p class="text-gray-500 mt-2">Try changing your search or filter settings.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  cards: Array,
  selectedCards: Array,
  isAdmin: Boolean,
  memberColors: Object,
  darkenColor: Function,
});

const emit = defineEmits(['toggle-selection', 'open-modal', 'admin-action']);

const isSelected = (id) => props.selectedCards.includes(id);
const getMemberColor = (member) => props.memberColors[member?.toLowerCase()] || '#FFFFFF';
const getDarkTextColor = (member) => props.darkenColor(getMemberColor(member), 35);
const cardOpacity = (card) => ({
  'opacity-50': card.status === 'sold',
  'opacity-60 grayscale': card.status === 'on-hold',
});
const showCheckbox = (card) => !props.isAdmin ? card.status !== 'sold' : true;

const statusBadge = (card) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isNew = new Date(card.createdAt) > sevenDaysAgo;
  
  if (isNew) return { text: 'NEW', class: 'bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full' };
  if (card.status === 'sold') return { text: 'SOLD', class: 'bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full' };
  if (card.status === 'on-hold') return { text: 'RESERVED', class: 'bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full' };
  if (card.discountType === 'sale') return { text: 'SALE', class: 'bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full' };
  if (card.discountType === 'super-sale') return { text: 'SUPER SALE', class: 'bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full' };
  return null;
};
</script>
