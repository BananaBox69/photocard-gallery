import { db, photocardsCollection, settingsDoc } from './firebase.js';
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { MEMBER_COLORS, GROUP_ABBR, GROUP_ORDER, MEMBER_ORDER, ARTIST_DATA, calculateDiscountedPrice } from './utils.js';
import { getCurrentBias } from './themes.js';

let allCards = [];
let selectedCards = [];

export function initCards() {
    onSnapshot(photocardsCollection, (snapshot) => {
        allCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateGroupFilter();
        displayCards();
    });

    onSnapshot(settingsDoc, (doc) => {
        const data = doc.exists() ? doc.data() : {};
        document.getElementById('main-title').textContent = data.title || "Photocard Sale";
        document.getElementById('subtitle').textContent = data.subtitle || "Welcome to my collection! Feel free to browse.";
        document.title = document.getElementById('main-title').textContent;
        const lastUpdatedDisplay = document.getElementById('last-updated-display');
        if (data.lastUpdated) {
            lastUpdatedDisplay.textContent = `Last updated: ${data.lastUpdated}`;
            lastUpdatedDisplay.classList.remove('hidden');
        } else {
            lastUpdatedDisplay.classList.add('hidden');
        }
    });
}

export function displayCards() {
    const photocardGrid = document.getElementById('photocard-grid');
    photocardGrid.innerHTML = '';
    
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const selectedGroup = document.getElementById('groupFilter').value;
    const selectedStatus = document.getElementById('statusFilter').value;
    const sortMethod = document.getElementById('sortOrder').value;

    let cardsToDisplay = allCards.filter(card => {
        const isAdmin = document.getElementById('admin-logout-btn').classList.contains('hidden');
        if (!isAdmin && card.status === 'sold') {
            return false;
        }
        const searchCorpus = `${card.member || ''} ${card.group || ''} ${card.album || ''} ${card.displayId || ''}`.toLowerCase();
        const matchesSearch = searchCorpus.includes(searchTerm);
        const matchesGroup = selectedGroup === 'all' || card.group === selectedGroup;
        const matchesStatus = isAdmin ? (selectedStatus === 'all' || card.status === selectedStatus) : true;
        return matchesSearch && matchesGroup && matchesStatus;
    });
    
    document.getElementById('no-results').classList.toggle('hidden', cardsToDisplay.length > 0);

    switch(sortMethod) {
        case 'price-desc':
            cardsToDisplay.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'price-asc':
            cardsToDisplay.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'date-desc':
            cardsToDisplay.sort((a, b) => (b.createdAt || "0").localeCompare(a.createdAt || "0"));
            break;
        case 'id-asc':
            cardsToDisplay.sort((a, b) => (a.displayId || '').localeCompare(b.displayId || ''));
            break;
        case 'default':
        default:
            cardsToDisplay.sort((a, b) => {
                const currentBias = getCurrentBias();
                if (currentBias) {
                    const isABias = a.member === currentBias;
                    const isBBias = b.member === currentBias;
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

    cardsToDisplay.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        photocardGrid.appendChild(cardElement);
    });
}

function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    const memberKey = card.member ? card.member.toLowerCase() : '';
    const memberColor = MEMBER_COLORS[memberKey] || '#FFFFFF';
    const darkTextColor = darkenColor(memberColor, 35);
    
    const isSelected = selectedCards.includes(card.id);
    cardElement.className = `group-item rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 fade-in flex flex-col ${isSelected ? 'card-selected' : ''}`;
    cardElement.style.backgroundColor = memberColor;
    cardElement.style.animationDelay = `${index * 50}ms`;
    cardElement.onclick = (e) => {
        if (e.target.closest('button')) return;
        toggleCardSelection(card.id);
    };

    let cardOpacity = '';
    if (card.status === 'sold') {
        cardOpacity = 'opacity-50';
    } else if (card.status === 'on-hold') {
        cardOpacity = 'opacity-60 grayscale';
    }

    const isAdmin = !document.getElementById('admin-logout-btn').classList.contains('hidden');
    const showCheckbox = !isAdmin ? card.status !== 'sold' : true;
    const selectionCheckbox = createSelectionCheckbox(card.id, isSelected);
    const statusBadge = createStatusBadge(card);
    const adminControls = isAdmin ? createAdminControls(card.id) : '';

    cardElement.innerHTML = `
        <div class="relative">
            <img src="${card.imageUrl || ''}" alt="${card.member || ''} from ${card.group || ''}" class="w-full h-auto object-cover aspect-[2/3] ${cardOpacity}" onerror="this.onerror=null;this.src='https://placehold.co/400x600/cccccc/ffffff?text=No+Image';">
            <div class="absolute top-2 left-2 bg-black/50 text-white text-xs font-mono px-1.5 py-0.5 rounded">${card.displayId || 'N/A'}</div>
            ${showCheckbox ? selectionCheckbox : ''}
            <div class="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
                ${statusBadge ? `<div>${statusBadge}</div>` : ''}
                ${adminControls}
            </div>
        </div>
        <div class="p-4 flex flex-col flex-grow">
            <div>
                <p class="font-bold text-lg" style="color: ${darkTextColor};">${card.member || 'Unknown'}</p>
                <p class="text-sm" style="color: ${darkTextColor}; opacity: 0.8;">${card.group || 'Unknown'}</p>
                <p class="text-sm line-clamp-2" style="color: ${darkTextColor}; opacity: 0.8; min-height: 2.5rem;" title="${card.album || ''}">${card.album || 'Unknown'}</p>
                <p class="text-xs mt-1 h-8 overflow-hidden" style="color: ${darkTextColor}; opacity: 0.7;">${card.description || ''}</p>
            </div>
            <p class="text-xl font-semibold mt-auto pt-2" style="color: ${darkTextColor};">€${parseFloat(card.price || 0).toFixed(2)}</p>
        </div>`;
    
    return cardElement;
}

function createSelectionCheckbox(cardId, isSelected) {
    return `
        <button onclick="window.toggleCardSelection('${cardId}')" class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/50 rounded-full text-indigo-600 hover:bg-white/80 transition z-20">
            ${isSelected ? 
                `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="text-green-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>` : 
                `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><circle cx="12" cy="12" r="10"></circle></svg>`
            }
        </button>
    `;
}

function createStatusBadge(card) {
    if (card.status === 'sold') {
        return `<span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD</span>`;
    } else if (card.status === 'on-hold') {
        return `<span class="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">RESERVED</span>`;
    } else if (card.discountType === 'sale') {
        return `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</span>`;
    } else if (card.discountType === 'super-sale') {
        return `<span class="bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full">SUPER SALE</span>`;
    }
    return '';
}

function createAdminControls(cardId) {
    return `
        <div class="flex flex-col gap-1">
            <button onclick="window.toggleDiscount('${cardId}', 'sale')" class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600" title="Toggle 10% Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
            <button onclick="window.toggleDiscount('${cardId}', 'super-sale')" class="p-1 bg-purple-700 text-white rounded-full hover:bg-purple-800" title="Toggle 20% Super Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
            <button onclick="window.openEditModal('${cardId}')" class="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
            <button onclick="window.toggleStatus('${cardId}', 'sold')" class="p-1 bg-red-600 text-white rounded-full hover:bg-red-700" title="Toggle Sold"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>
            <button onclick="window.toggleStatus('${cardId}', 'on-hold')" class="p-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600" title="Toggle Reserved"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></button>
            <button onclick="window.openSingleDeleteModal('${cardId}')" class="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>`;
}

function updateGroupFilter() {
    const groups = [...new Set(allCards.map(card => card.group).filter(g => g))];
    groups.sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
    const groupFilter = document.getElementById('groupFilter');
    groupFilter.innerHTML = '<option value="all">All Groups</option>';
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupFilter.appendChild(option);
    });
}

export function toggleCardSelection(cardId) {
    const cardIndex = selectedCards.indexOf(cardId);
    if (cardIndex > -1) {
        selectedCards.splice(cardIndex, 1);
    } else {
        selectedCards.push(cardId);
    }
    displayCards();
    updateUiAfterSelection();
}

function updateUiAfterSelection() {
    const isAdmin = !document.getElementById('admin-logout-btn').classList.contains('hidden');
    if (isAdmin) {
        updateBulkActionBar();
    } else {
        updateCartButton();
    }
}

function updateCartButton() {
    const count = selectedCards.length;
    const cartButton = document.getElementById('cart-button');
    cartButton.classList.toggle('hidden', count === 0);
    document.getElementById('cart-count').textContent = count;
}

function updateBulkActionBar() {
    const count = selectedCards.length;
    const bulkActionBar = document.getElementById('bulk-action-bar');
    const addCardBtn = document.getElementById('add-card-btn');
    
    if (count > 0) {
        bulkActionBar.classList.remove('hidden');
        addCardBtn.classList.add('hidden');
        document.getElementById('bulk-count').textContent = count;
    } else {
        bulkActionBar.classList.add('hidden');
        addCardBtn.classList.remove('hidden');
    }
}

export function deselectAll() {
    selectedCards = [];
    displayCards();
    updateUiAfterSelection();
}

export async function bulkUpdateStatus(status) {
    if (selectedCards.length === 0) return;
    const batch = writeBatch(db);
    selectedCards.forEach(id => {
        const cardRef = doc(db, "photocards", id);
        batch.update(cardRef, { status: status });
    });
    await batch.commit();
    await updateLastUpdatedTimestamp();
    deselectAll();
}

export async function bulkUpdatePrice(newPrice) {
    if (isNaN(newPrice) {
        alert("Please enter a valid price.");
        return;
    }
    const batch = writeBatch(db);
    selectedCards.forEach(id => {
        const cardRef = doc(db, "photocards", id);
        batch.update(cardRef, { price: newPrice, discountType: null, originalPrice: null });
    });
    await batch.commit();
    await updateLastUpdatedTimestamp();
    deselectAll();
}

export async function bulkDelete() {
    const batch = writeBatch(db);
    selectedCards.forEach(id => {
        const cardRef = doc(db, "photocards", id);
        batch.delete(cardRef);
    });
    await batch.commit();
    await updateLastUpdatedTimestamp();
    deselectAll();
}

export async function toggleDiscount(cardId, type) {
    const cardRef = doc(db, "photocards", cardId);
    const cardDoc = await getDoc(cardRef);
    if (!cardDoc.exists()) return;

    const cardData = cardDoc.data();
    const originalPrice = cardData.originalPrice || cardData.price;
    
    if (cardData.discountType === type) {
        await updateDoc(cardRef, {
            price: originalPrice,
            discountType: null,
            originalPrice: null
        });
    } else {
        const newPrice = calculateDiscountedPrice(originalPrice, type);
        await updateDoc(cardRef, {
            price: newPrice,
            discountType: type,
            originalPrice: originalPrice
        });
    }
    await updateLastUpdatedTimestamp();
}

export async function bulkToggleDiscount(type) {
    if (selectedCards.length === 0) return;
    const batch = writeBatch(db);
    
    for (const id of selectedCards) {
        const cardRef = doc(db, "photocards", id);
        const cardDoc = await getDoc(cardRef);
        if (cardDoc.exists()) {
            const cardData = cardDoc.data();
            const originalPrice = cardData.originalPrice || cardData.price;

            if (cardData.discountType === type) {
                batch.update(cardRef, { price: originalPrice, discountType: null, originalPrice: null });
            } else {
                const newPrice = calculateDiscountedPrice(originalPrice, type);
                batch.update(cardRef, { price: newPrice, discountType: type, originalPrice: originalPrice });
            }
        }
    }
    await batch.commit();
    await updateLastUpdatedTimestamp();
    deselectAll();
}

export async function toggleStatus(cardId, targetStatus) {
    const cardRef = doc(db, "photocards", cardId);
    const cardDoc = await getDoc(cardRef);
    if (!cardDoc.exists()) return;
    const currentStatus = cardDoc.data().status;
    const newStatus = currentStatus === targetStatus ? 'available' : targetStatus;
    
    await updateDoc(cardRef, { status: newStatus });
    await updateLastUpdatedTimestamp();
}

export async function updateLastUpdatedTimestamp() {
    await setDoc(settingsDoc, { lastUpdated: new Date().toISOString().split('T')[0] }, { merge: true });
}

export async function generateDisplayId(group, member) {
    const groupCode = GROUP_ABBR[group] || group.substring(0,2).toUpperCase();
    const memberCode = member.charAt(0).toUpperCase();
    
    const q = query(photocardsCollection, where("group", "==", group), where("member", "==", member));
    const querySnapshot = await getDocs(q);
    const newNumber = String(querySnapshot.size + 1).padStart(3, '0');
    
    return `${groupCode}-${memberCode}-${newNumber}`;
}
