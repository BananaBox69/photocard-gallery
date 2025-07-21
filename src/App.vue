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
}

function closeModal() {
  activeModal.value = null;
}

// ... rest of the functions will go here ...

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
    // initThemes(); // Will be added back later
});

</script>

<template>
  <div class="container mx-auto p-4 md:p-8 pb-24">
    <!-- THEME SWITCHER -->
    <div class="mb-8 text-center">
        <h2 class="font-bold text-gray-700 text-xl mb-2">Choose your bias!</h2>
        <div id="theme-switcher" class="flex justify-center items-center gap-3"></div>
    </div>

    <header class="text-center mb-8 relative">
        <p id="last-updated-display" class="text-xs text-gray-500 absolute top-0 left-0 hidden"></p>
        <div class="flex justify-center items-center gap-3 title-container">
             <h1 id="main-title" class="text-4xl md:text-5xl font-bold text-gray-900 transition-colors duration-500">Photocard Sale</h1>
             <span id="edit-title-btn" class="edit-pen hidden text-gray-500" @click="openTitleEditModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
             </span>
        </div>
        <div class="flex justify-center items-center gap-2 title-container">
            <p id="subtitle" class="text-lg text-gray-600 mt-2 transition-colors duration-500">Welcome to my collection! Feel free to browse.</p>
            <span id="edit-subtitle-btn" class="edit-pen hidden text-gray-500 mt-2" @click="openSubtitleEditModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </span>
        </div>
        <div class="absolute top-0 right-0">
            <button id="admin-login-btn" @click="openModal('admin-login-modal')" class="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-md hover:bg-gray-100">Admin</button>
            <button id="admin-logout-btn" @click="logoutAdmin()" class="hidden px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Exit Admin</button>
        </div>
    </header>

    <div id="control-panel" class="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 sticky top-4 z-10 transition-all duration-500">
         <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" v-model="searchTerm" placeholder="Search..." class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
            <select v-model="selectedGroup" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                <option value="all">All Groups</option>
                <option v-for="group in GROUP_ORDER" :key="group" :value="group">{{ group }}</option>
            </select>
            <div id="status-filter-wrapper" class="hidden">
                <select v-model="selectedStatus" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                    <option value="all">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="on-hold">On Hold</option>
                    <option value="sold">Sold</option>
                </select>
            </div>
            <select v-model="sortOrder" class="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                <option value="default">Default Sort</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="date-desc">Newest Added</option>
                <option value="id-asc">ID: A to Z</option>
            </select>
         </div>
         <div class="flex items-center justify-between mt-4">
            <button id="add-card-btn" @click="openAddCardModal()" class="hidden px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add New Card</button>
            <!-- BULK ACTION BAR -->
            <div id="bulk-action-bar" class="hidden w-full">
                <div class="bg-indigo-100 border border-indigo-200 rounded-md p-2 flex justify-between items-center">
                    <div>
                        <span id="bulk-count" class="font-bold">0</span> cards selected
                    </div>
                    <div class="flex items-center gap-1 flex-wrap justify-end">
                        <button @click="bulkToggleDiscount('sale')" class="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600">10% Off</button>
                        <button @click="bulkToggleDiscount('super-sale')" class="px-2 py-1 bg-purple-700 text-white rounded-md text-xs hover:bg-purple-800">20% Off</button>
                        <button @click="openBulkPriceModal()" class="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700">Set Price</button>
                        <button @click="bulkUpdateStatus('available')" class="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700">Mark Available</button>
                        <button @click="bulkUpdateStatus('on-hold')" class="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600">Mark Reserved</button>
                        <button @click="bulkUpdateStatus('sold')" class="px-2 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700">Mark Sold</button>
                        <button @click="openBulkDeleteModal()" class="px-2 py-1 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700">Delete</button>
                        <button @click="deselectAll()" class="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300">Deselect All</button>
                    </div>
                </div>
            </div>
         </div>
    </div>

    <div v-if="filteredCards.length > 0" id="photocard-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        <!-- Card rendering will be done here with v-for -->
    </div>
    <div v-else id="no-results" class="text-center py-16">
        <h3 class="text-2xl font-semibold text-gray-700">No cards found!</h3>
        <p class="text-gray-500 mt-2">Try changing your search or filter settings.</p>
    </div>

    <!-- Floating Cart Button -->
    <button id="cart-button" @click="openExportModal()" class="hidden fixed bottom-6 right-6 theme-bg-gradient text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-30">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <span id="cart-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
    </button>
</template>
