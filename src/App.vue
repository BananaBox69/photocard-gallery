<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, query, where, getDocs, writeBatch } from "firebase/firestore";

// --- CONSTANTS ---
const firebaseConfig = {
  apiKey: "AIzaSyAmTGZo-kU-HsDwczXb2sjTw5VZgCDJn68",
  authDomain: "k-pop-price-list-pro.firebaseapp.com",
  projectId: "k-pop-price-list-pro",
  storageBucket: "k-pop-price-list-pro.appspot.com",
  messagingSenderId: "386977468923",
  appId: "1:386977468923:web:4fecd8b5971976063e7b5e"
};
const ADMIN_PASSWORD = "4649";
const MEMBER_COLORS = { 'irene': '#F8C8DC', 'seulgi': '#FFFACD', 'wendy': '#A7C7E7', 'joy': '#C1E1C1', 'yeri': '#D8BFD8', 'iu': '#E6E6FA', 'karina': '#ADD8E6', 'giselle': '#F5F5F5', 'winter': '#E0FFFF', 'ningning': '#FFB6C1' };
const THEMES = { 'Red Velvet': { primary: '#F05252', secondary: '#F87171', initial: 'RV' }, 'Irene': { primary: '#F472B6', secondary: '#FBCFE8', initial: 'I' }, 'Seulgi': { primary: '#FBBF24', secondary: '#FCD34D', initial: 'S' }, 'Wendy': { primary: '#60A5FA', secondary: '#93C5FD', initial: 'W' }, 'Joy': { primary: '#34D399', secondary: '#86EFAC', initial: 'J' }, 'Yeri': { primary: '#A78BFA', secondary: '#C4B5FD', initial: 'Y' } };
const GROUP_ABBR = { 'Red Velvet': 'RV', 'IU': 'IU', 'aespa': 'AE' };
const GROUP_ORDER = ['Red Velvet', 'IU', 'aespa'];
const MEMBER_ORDER = ['Irene', 'Seulgi', 'Wendy', 'Joy', 'Yeri', 'IU', 'Karina', 'Giselle', 'Winter', 'Ningning'];
const ARTIST_DATA = { "Red Velvet": { members: ["Irene", "Seulgi", "Wendy", "Joy", "Yeri"], albums: ["Ice Cream Cake", "The Red", "The Velvet", "Russian Roulette", "Rookie", "The Red Summer", "Perfect Velvet", "The Perfect Red Velvet", "Summer Magic", "#Cookie Jar", "RBB", "Sappy", "The ReVe Festival: Day 1", "The ReVe Festival: Day 2", "The ReVe Festival: Finale", "Queendom", "Bloom", "The ReVe Festival 2022 - Feel My Rhythm", "The ReVe Festival 2022 - Birthday", "Chill Kill", "Cosmic", "Like a Flower", "28 Reasons", "Accidentally on Purpose", "Like Water", "Wish You Hell", "Hello", "Monster", "Naughty", "Tilt"] }, "IU": { members: ["IU"], albums: ["Lost and Found", "Growing Up", "IU...IM", "Real", "Real+", "Last Fantasy", "Spring of a Twenty Year Old", "Modern Times", "Modern Times - Epilogue", "A Flower Bookmark", "Chat-Shire", "Palette", "A Flower Bookmark 2", "Love Poem", "Lilac", "Pieces", "The Winning"] }, "aespa": { members: ["Karina", "Giselle", "Winter", "Ningning"], albums: ["Savage", "Girls", "My World", "Drama", "Armageddon", "Whiplash"] } };
const COUNTRY_LIST = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic of the","Congo, Republic of the","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

// --- FIREBASE SETUP ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const photocardsCollection = collection(db, "photocards");
const settingsDoc = doc(db, "settings", "main");

// --- REACTIVE STATE ---
const allCards = ref([]);
const isAdmin = ref(false);
const selectedCards = ref([]);
const currentBias = ref(null);
const siteSettings = ref({ title: 'Photocard Sale', subtitle: 'Welcome to my collection!', lastUpdated: '' });
const activeModal = ref(null);
const newCardData = ref({});
const editCardId = ref(null);
const exportData = ref({ shipping: 'Cheapest', country: '', payment: 'PayPal F&F' });
const bulkPrice = ref(null);
const adminPasswordInput = ref('');
const searchTerm = ref('');
const selectedGroup = ref('all');
const selectedStatus = ref('all');
const sortOrder = ref('default');
const albumSuggestions = ref([]);
const memberSuggestions = ref([]);
const showAlbumSuggestions = ref(false);
const showMemberSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);

// --- COMPUTED PROPERTIES ---
const filteredCards = computed(() => {
    let cards = allCards.value.filter(card => {
        if (!isAdmin.value && card.status === 'sold') return false;
        
        const searchCorpus = `${card.member || ''} ${card.group || ''} ${card.album || ''} ${card.displayId || ''}`.toLowerCase();
        const matchesSearch = searchCorpus.includes(searchTerm.value.toLowerCase());
        const matchesGroup = selectedGroup.value === 'all' || card.group === selectedGroup.value;
        const matchesStatus = isAdmin.value ? (selectedStatus.value === 'all' || card.status === selectedStatus.value) : true;
        
        return matchesSearch && matchesGroup && matchesStatus;
    });

    // Sorting logic
    switch (sortOrder.value) {
        case 'price-desc':
            cards.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'price-asc':
            cards.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'date-desc':
            cards.sort((a, b) => (b.createdAt || "0").localeCompare(a.createdAt || "0"));
            break;
        case 'id-asc':
            cards.sort((a, b) => (a.displayId || '').localeCompare(b.displayId || ''));
            break;
        default: // 'default'
            cards.sort((a, b) => {
                if (currentBias.value) {
                    const isABias = a.member === currentBias.value;
                    const isBBias = b.member === currentBias.value;
                    if (isABias && !isBBias) return -1;
                    if (!isABias && isBBias) return 1;
                }
                const groupAIndex = GROUP_ORDER.indexOf(a.group);
                const groupBIndex = GROUP_ORDER.indexOf(b.group);
                if (groupAIndex !== groupBIndex) return groupAIndex - groupBIndex;
                const memberAIndex = MEMBER_ORDER.indexOf(a.member);
                const memberBIndex = MEMBER_ORDER.indexOf(b.member);
                if (memberAIndex !== memberBIndex) return memberAIndex - memberBIndex;
                const albumCompare = (a.album || '').localeCompare(b.album || '');
                if (albumCompare !== 0) return albumCompare;
                const priceCompare = (b.price || 0) - (a.price || 0);
                if (priceCompare !== 0) return priceCompare;
                return (a.displayId || '').localeCompare(b.displayId || '');
            });
            break;
    }
    return cards;
});

const adminDashboardStats = computed(() => {
    if (!isAdmin.value) return {};
    const available = allCards.value.filter(c => c.status === 'available');
    const onHold = allCards.value.filter(c => c.status === 'on-hold');
    const value = available.reduce((sum, card) => sum + (card.price || 0), 0);
    return {
        total: allCards.value.length,
        available: available.length,
        onHold: onHold.length,
        value: `€${value.toFixed(2)}`
    };
});

const selectedCardsTotal = computed(() => {
    return selectedCards.value.reduce((sum, id) => {
        const card = allCards.value.find(c => c.id === id);
        return sum + (card?.price || 0);
    }, 0);
});

// --- METHODS ---
function darkenColor(hex, percent) {
    if (!hex || hex.length < 7) return '#000000';
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);
    R = parseInt(R * (100 - percent) / 100);
    G = parseInt(G * (100 - percent) / 100);
    B = parseInt(B * (100 - percent) / 100);
    R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;  
    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
}

function openModal(modalName) {
    activeModal.value = modalName;
    if (modalName === 'add-card') {
        newCardData.value = { group: 'Red Velvet', member: '', album: '', price: '', status: 'available' };
    }
}

function closeModal() {
    activeModal.value = null;
    newCardData.value = {};
    editCardId.value = null;
    showAlbumSuggestions.value = false;
    showMemberSuggestions.value = false;
}

function verifyAdminPassword() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        isAdmin.value = true;
        adminPasswordInput.value = '';
        closeModal();
    } else {
        alert('Incorrect password');
    }
}

function toggleCardSelection(cardId) {
    const index = selectedCards.value.indexOf(cardId);
    if (index === -1) {
        selectedCards.value.push(cardId);
    } else {
        selectedCards.value.splice(index, 1);
    }
}

function clearSelection() {
    selectedCards.value = [];
}

async function addNewCard() {
    try {
        const cardData = {
            ...newCardData.value,
            price: parseFloat(newCardData.value.price),
            createdAt: new Date().toISOString(),
            displayId: generateDisplayId(newCardData.value)
        };
        await addDoc(photocardsCollection, cardData);
        closeModal();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

function generateDisplayId(card) {
    const groupAbbr = GROUP_ABBR[card.group] || card.group.substring(0, 2).toUpperCase();
    const memberInitial = card.member ? card.member.substring(0, 1) : '';
    return `${groupAbbr}${memberInitial}${Math.floor(1000 + Math.random() * 9000)}`;
}

async function updateCard() {
    try {
        const cardRef = doc(photocardsCollection, editCardId.value);
        await updateDoc(cardRef, {
            ...newCardData.value,
            price: parseFloat(newCardData.value.price),
            displayId: generateDisplayId(newCardData.value)
        });
        closeModal();
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

async function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        try {
            await deleteDoc(doc(photocardsCollection, cardId));
            closeModal();
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }
}

function prepareEditCard(card) {
    editCardId.value = card.id;
    newCardData.value = { ...card };
    openModal('edit-card');
}

function updateBulkPrice() {
    if (!bulkPrice.value || isNaN(bulkPrice.value)) return;
    
    const batch = writeBatch(db);
    selectedCards.value.forEach(cardId => {
        const cardRef = doc(photocardsCollection, cardId);
        batch.update(cardRef, { price: parseFloat(bulkPrice.value) });
    });
    
    batch.commit()
        .then(() => {
            bulkPrice.value = null;
            closeModal();
            clearSelection();
        })
        .catch(error => {
            console.error("Error updating batch: ", error);
        });
}

function updateBulkStatus(status) {
    const batch = writeBatch(db);
    selectedCards.value.forEach(cardId => {
        const cardRef = doc(photocardsCollection, cardId);
        batch.update(cardRef, { status });
    });
    
    batch.commit()
        .then(() => {
            closeModal();
            clearSelection();
        })
        .catch(error => {
            console.error("Error updating batch: ", error);
        });
}

function updateAlbumSuggestions() {
    if (!newCardData.value.group) return;
    const groupData = ARTIST_DATA[newCardData.value.group];
    if (groupData) {
        albumSuggestions.value = groupData.albums.filter(album => 
            album.toLowerCase().includes(newCardData.value.album.toLowerCase())
        );
        showAlbumSuggestions.value = newCardData.value.album.length > 0 && albumSuggestions.value.length > 0;
    }
}

function updateMemberSuggestions() {
    if (!newCardData.value.group) return;
    const groupData = ARTIST_DATA[newCardData.value.group];
    if (groupData) {
        memberSuggestions.value = groupData.members.filter(member => 
            member.toLowerCase().includes(newCardData.value.member.toLowerCase())
        );
        showMemberSuggestions.value = newCardData.value.member.length > 0 && memberSuggestions.value.length > 0;
    }
}

function selectAlbumSuggestion(album) {
    newCardData.value.album = album;
    showAlbumSuggestions.value = false;
}

function selectMemberSuggestion(member) {
    newCardData.value.member = member;
    showMemberSuggestions.value = false;
}

function handleAlbumKeyDown(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex.value = Math.min(activeSuggestionIndex.value + 1, albumSuggestions.value.length - 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex.value = Math.max(activeSuggestionIndex.value - 1, -1);
    } else if (e.key === 'Enter' && activeSuggestionIndex.value >= 0) {
        e.preventDefault();
        selectAlbumSuggestion(albumSuggestions.value[activeSuggestionIndex.value]);
    }
}

function handleMemberKeyDown(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex.value = Math.min(activeSuggestionIndex.value + 1, memberSuggestions.value.length - 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex.value = Math.max(activeSuggestionIndex.value - 1, -1);
    } else if (e.key === 'Enter' && activeSuggestionIndex.value >= 0) {
        e.preventDefault();
        selectMemberSuggestion(memberSuggestions.value[activeSuggestionIndex.value]);
    }
}

async function updateSiteSettings() {
    try {
        await setDoc(settingsDoc, siteSettings.value, { merge: true });
        closeModal();
    } catch (error) {
        console.error("Error updating settings: ", error);
    }
}

// --- LIFECYCLE HOOKS ---
onMounted(() => {
    onSnapshot(photocardsCollection, (snapshot) => {
        allCards.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
    onSnapshot(settingsDoc, (doc) => {
        if (doc.exists()) {
            siteSettings.value = { ...siteSettings.value, ...doc.data() };
            document.title = siteSettings.value.title;
        }
    });
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="theme-bg-gradient text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <div class="title-container flex items-center">
          <h1 class="text-2xl font-bold">{{ siteSettings.title }}</h1>
          <span v-if="isAdmin" class="edit-pen ml-2" @click="openModal('edit-title')">✏️</span>
        </div>
        <div class="flex items-center space-x-4">
          <button v-if="!isAdmin" @click="openModal('admin-login')" class="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition">
            Admin
          </button>
          <div v-else class="flex items-center space-x-2">
            <span class="text-sm">Admin Mode</span>
            <button @click="isAdmin = false" class="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition">
              Exit
            </button>
          </div>
        </div>
      </div>
      <p class="container mx-auto mt-1 text-sm opacity-90">{{ siteSettings.subtitle }}</p>
    </header>

    <!-- Control Panel -->
    <div id="control-panel" class="theme-bg-gradient p-4 shadow-md">
      <div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search and filters -->
        <div class="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input v-model="searchTerm" type="text" placeholder="Search..." class="px-3 py-2 rounded">
          <select v-model="selectedGroup" class="px-3 py-2 rounded">
            <option value="all">All Groups</option>
            <option v-for="group in GROUP_ORDER" :value="group">{{ group }}</option>
          </select>
          <select v-model="sortOrder" class="px-3 py-2 rounded">
            <option value="default">Default Sort</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="date-desc">Newest First</option>
            <option value="id-asc">ID (A-Z)</option>
          </select>
        </div>
        
        <!-- Admin controls -->
        <div v-if="isAdmin" class="flex justify-end space-x-2">
          <button @click="openModal('add-card')" class="px-3 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition">
            Add Card
          </button>
          <button @click="openModal('bulk-edit')" class="px-3 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition">
            Bulk Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto p-4">
      <!-- Admin Dashboard -->
      <div v-if="isAdmin" id="admin-dashboard" class="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Dashboard</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-3 bg-white rounded shadow">
            <h3 class="text-sm text-gray-500">Total Cards</h3>
            <p class="text-xl font-bold">{{ adminDashboardStats.total }}</p>
          </div>
          <div class="p-3 bg-white rounded shadow">
            <h3 class="text-sm text-gray-500">Available</h3>
            <p class="text-xl font-bold">{{ adminDashboardStats.available }}</p>
          </div>
          <div class="p-3 bg-white rounded shadow">
            <h3 class="text-sm text-gray-500">On Hold</h3>
            <p class="text-xl font-bold">{{ adminDashboardStats.onHold }}</p>
          </div>
          <div class="p-3 bg-white rounded shadow">
            <h3 class="text-sm text-gray-500">Total Value</h3>
            <p class="text-xl font-bold">{{ adminDashboardStats.value }}</p>
          </div>
        </div>
      </div>

      <!-- Selection Info -->
      <div v-if="selectedCards.length > 0" class="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
        <div>
          <span class="font-semibold">{{ selectedCards.length }} card{{ selectedCards.length !== 1 ? 's' : '' }} selected</span>
          <span class="ml-3">Total: €{{ selectedCardsTotal.toFixed(2) }}</span>
        </div>
        <button @click="clearSelection" class="text-blue-600 hover:text-blue-800">
          Clear selection
        </button>
      </div>

      <!-- Photocard Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div 
          v-for="card in filteredCards" 
          :key="card.id"
          class="group-item relative rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
          :class="{
            'bg-white': card.status === 'available',
            'bg-yellow-100': card.status === 'on-hold',
            'opacity-70': card.status === 'sold',
            'card-selected': selectedCards.includes(card.id)
          }"
          @click="toggleCardSelection(card.id)"
        >
          <div class="p-3">
            <div class="flex justify-between items-start mb-1">
              <span class="font-semibold">{{ card.member }}</span>
              <span class="text-sm">{{ card.displayId }}</span>
            </div>
            <div class="text-sm text-gray-600 mb-1">{{ card.album }}</div>
            <div class="font-bold text-right theme-text">€{{ card.price }}</div>
          </div>
          
          <!-- Sold overlay -->
          <div v-if="card.status === 'sold'" class="sold-overlay">
            SOLD
          </div>

          <!-- Admin edit button -->
          <div v-if="isAdmin" class="absolute top-2 right-2">
            <button @click.stop="prepareEditCard(card)" class="p-1 bg-white bg-opacity-70 rounded-full shadow hover:bg-opacity-100">
              ✏️
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-100 p-4 mt-8">
      <div class="container mx-auto text-center text-sm text-gray-600">
        <p>Last updated: {{ siteSettings.lastUpdated }}</p>
      </div>
    </footer>

    <!-- Admin Login Modal -->
    <div v-if="activeModal === 'admin-login'" class="modal-backdrop">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Admin Login</h2>
        <input 
          v-model="adminPasswordInput" 
          type="password" 
          placeholder="Enter admin password" 
          class="w-full p-2 border rounded mb-4"
          @keyup.enter="verifyAdminPassword"
        >
        <div class="flex justify-end space-x-2">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button @click="verifyAdminPassword" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Login
          </button>
        </div>
      </div>
    </div>

    <!-- Add Card Modal -->
    <div v-if="activeModal === 'add-card'" class="modal-backdrop">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Add New Card</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <select v-model="newCardData.group" class="w-full p-2 border rounded">
              <option v-for="group in GROUP_ORDER" :value="group">{{ group }}</option>
            </select>
          </div>
          
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <input 
              v-model="newCardData.member" 
              @input="updateMemberSuggestions"
              @keydown="handleMemberKeyDown"
              type="text" 
              placeholder="Enter member name" 
              class="w-full p-2 border rounded"
            >
            <div v-if="showMemberSuggestions" class="autocomplete-suggestions">
              <div 
                v-for="(member, index) in memberSuggestions" 
                :key="member"
                class="suggestion-item"
                :class="{ 'suggestion-active': index === activeSuggestionIndex }"
                @click="selectMemberSuggestion(member)"
              >
                {{ member }}
              </div>
            </div>
          </div>
          
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Album</label>
            <input 
              v-model="newCardData.album" 
              @input="updateAlbumSuggestions"
              @keydown="handleAlbumKeyDown"
              type="text" 
              placeholder="Enter album name" 
              class="w-full p-2 border rounded"
            >
            <div v-if="showAlbumSuggestions" class="autocomplete-suggestions">
              <div 
                v-for="(album, index) in albumSuggestions" 
                :key="album"
                class="suggestion-item"
                :class="{ 'suggestion-active': index === activeSuggestionIndex }"
                @click="selectAlbumSuggestion(album)"
              >
                {{ album }}
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
            <input v-model="newCardData.price" type="number" step="0.01" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="newCardData.status" class="w-full p-2 border rounded">
              <option value="available">Available</option>
              <option value="on-hold">On Hold</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button @click="addNewCard" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Add Card
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Card Modal -->
    <div v-if="activeModal === 'edit-card'" class="modal-backdrop">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Card</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <select v-model="newCardData.group" class="w-full p-2 border rounded">
              <option v-for="group in GROUP_ORDER" :value="group">{{ group }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <input v-model="newCardData.member" type="text" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Album</label>
            <input v-model="newCardData.album" type="text" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
            <input v-model="newCardData.price" type="number" step="0.01" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="newCardData.status" class="w-full p-2 border rounded">
              <option value="available">Available</option>
              <option value="on-hold">On Hold</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <button @click="deleteCard(editCardId)" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
          <div class="space-x-2">
            <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button @click="updateCard" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Edit Modal -->
    <div v-if="activeModal === 'bulk-edit'" class="modal-backdrop">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Bulk Edit ({{ selectedCards.length }} cards)</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Set Price (€)</label>
            <div class="flex space-x-2">
              <input v-model="bulkPrice" type="number" step="0.01" class="flex-1 p-2 border rounded">
              <button @click="updateBulkPrice" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Apply
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Set Status</label>
            <div class="grid grid-cols-3 gap-2">
              <button @click="updateBulkStatus('available')" class="p-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
                Available
              </button>
              <button @click="updateBulkStatus('on-hold')" class="p-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                On Hold
              </button>
              <button @click="updateBulkStatus('sold')" class="p-2 bg-red-100 text-red-800 rounded hover:bg-red-200">
                Sold
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Title Modal -->
    <div v-if="activeModal === 'edit-title'" class="modal-backdrop">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Site Settings</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="siteSettings.title" type="text" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input v-model="siteSettings.subtitle" type="text" class="w-full p-2 border rounded">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <input v-model="siteSettings.lastUpdated" type="text" class="w-full p-2 border rounded">
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button @click="updateSiteSettings" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
