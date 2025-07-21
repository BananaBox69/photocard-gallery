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
  <!-- All the HTML from the body of the old file goes here -->
  <!-- You'll need to replace direct DOM manipulation with Vue directives like v-if, v-for, @click, etc. -->
  <!-- For example: <div v-if="isAdmin" id="admin-dashboard">...</div> -->
  <!-- And: <div v-for="card in filteredCards" :key="card.id">...</div> -->
</template>
