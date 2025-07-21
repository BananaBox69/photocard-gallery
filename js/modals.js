import { db, photocardsCollection } from './firebase.js';
import { getFirestore, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ARTIST_DATA, COUNTRY_LIST } from './utils.js';
import { generateDisplayId, updateLastUpdatedTimestamp } from './cards.js';
import { displayCards } from './cards.js';

export function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    if (id === 'admin-login-modal') {
        setTimeout(() => document.getElementById('admin-password-input').focus(), 50);
    }
}

export function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

export async function openAddCardModal() {
    document.getElementById('add-card-form').reset();
    document.getElementById('modal-title').textContent = 'Add a New Card';
    document.getElementById('card-id-input').value = '';
    const existingDescriptions = [...new Set(allCards.map(c => c.description).filter(d => d))];
    setupAutocomplete(document.getElementById('card-description-input'), document.getElementById('description-suggestions'), existingDescriptions, null);
    openModal('add-card-modal');
    updateDisplayIdField();
}

export async function openEditModal(cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;
    document.getElementById('add-card-form').reset();
    document.getElementById('modal-title').textContent = 'Edit Card';
    document.getElementById('card-id-input').value = card.id;
    document.getElementById('card-display-id-input').value = card.displayId;
    document.getElementById('card-group-input').value = card.group;
    document.getElementById('card-member-input').value = card.member;
    document.getElementById('card-album-input').value = card.album;
    document.getElementById('card-image-url-input').value = card.imageUrl;
    document.getElementById('card-description-input').value = card.description;
    document.getElementById('card-price-input').value = card.price;
    const existingDescriptions = [...new Set(allCards.map(c => c.description).filter(d => d))];
    setupAutocomplete(document.getElementById('card-description-input'), document.getElementById('description-suggestions'), existingDescriptions, null);
    openModal('add-card-modal');
}

export async function openSingleDeleteModal(cardId) {
    openModal('delete-confirm-modal');
    document.getElementById('confirm-delete-btn').onclick = () => deleteCard(cardId);
}

export async function deleteCard(cardId) {
    await deleteDoc(doc(db, "photocards", cardId));
    await updateLastUpdatedTimestamp();
    closeModal('delete-confirm-modal');
}

export async function openBulkPriceModal() {
    if (selectedCards.length === 0) return;
    document.getElementById('bulk-price-input').value = '';
    openModal('bulk-price-modal');
}

export async function openBulkDeleteModal() {
    if (selectedCards.length === 0) return;
    openModal('delete-confirm-modal');
    document.getElementById('confirm-delete-btn').onclick = () => bulkDelete();
}

export async function handleSave(closeOnFinish) {
    const cardId = document.getElementById('card-id-input').value;
    const cardData = {
        displayId: document.getElementById('card-display-id-input').value,
        group: document.getElementById('card-group-input').value,
        member: document.getElementById('card-member-input').value,
        album: document.getElementById('card-album-input').value,
        imageUrl: document.getElementById('card-image-url-input').value,
        description: document.getElementById('card-description-input').value,
        price: parseFloat(document.getElementById('card-price-input').value),
    };

    if (cardId) {
        const oldCard = allCards.find(c => c.id === cardId);
        if (oldCard && oldCard.price !== cardData.price) {
            cardData.discountType = null;
            cardData.originalPrice = null;
        }
    }

    try {
        if (cardId) {
            const cardRef = doc(db, "photocards", cardId);
            await updateDoc(cardRef, cardData);
        } else {
            cardData.status = 'available';
            cardData.createdAt = new Date().toISOString();
            if (!cardData.displayId) {
                cardData.displayId = await generateDisplayId(cardData.group, cardData.member);
            }
            await addDoc(photocardsCollection, cardData);
        }
        
        await updateLastUpdatedTimestamp();

        if (closeOnFinish) {
            closeModal('add-card-modal');
        } else {
            const savedGroup = cardData.group;
            const savedMember = cardData.member;
            document.getElementById('add-card-form').reset();
            document.getElementById('card-group-input').value = savedGroup;
            document.getElementById('card-member-input').value = savedMember;
            await updateDisplayIdField();
            const confirmMsg = document.getElementById('save-another-confirm');
            confirmMsg.style.opacity = 1;
            setTimeout(() => { confirmMsg.style.opacity = 0; }, 2000);
        }
    } catch (error) {
        console.error("Error saving card: ", error);
    }
}

export async function saveAndAddAnother() {
    await handleSave(false);
}

export function setupAutocomplete(inputElement, suggestionsElement, sourceArray, moveToNextConfig) {
    let currentFocus = -1;

    const closeAllLists = () => {
        if(suggestionsElement) {
            suggestionsElement.innerHTML = '';
            suggestionsElement.classList.add('hidden');
        }
    };

    inputElement.addEventListener('input', function() {
        const value = this.value;
        closeAllLists();
        if (!value) return false;
        currentFocus = -1;
        
        const filtered = sourceArray.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        if (filtered.length > 0) {
            suggestionsElement.classList.remove('hidden');
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                div.className = 'suggestion-item';
                div.addEventListener('click', function() {
                    inputElement.value = this.textContent;
                    closeAllLists();
                    inputElement.dispatchEvent(new Event('blur'));
                });
                suggestionsElement.appendChild(div);
            });
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        let items = suggestionsElement.getElementsByTagName('div');
        if (items.length === 0) return;

        if (e.keyCode === 40) { // Arrow DOWN
            currentFocus++;
            addActive(items);
        } else if (e.keyCode === 38) { // Arrow UP
            currentFocus--;
            addActive(items);
        } else if (e.keyCode === 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1) {
                if (items) items[currentFocus].click();
            } else if (items.length === 1 && moveToNextConfig) {
                items[0].click();
                const nextField = document.getElementById(moveToNextConfig.nextFieldId);
                if(nextField) nextField.focus();
            }
        }
    });

    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (items.length - 1);
        items[currentFocus].classList.add("suggestion-active");
    }

    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("suggestion-active");
        }
    }
}

export function updateMemberAlbumSuggestions() {
    const groupName = document.getElementById('card-group-input').value;
    const groupData = ARTIST_DATA[groupName];

    if (groupData) {
        setupAutocomplete(document.getElementById('card-member-input'), document.getElementById('member-suggestions'), groupData.members, { nextFieldId: 'card-album-input' });
        setupAutocomplete(document.getElementById('card-album-input'), document.getElementById('album-suggestions'), groupData.albums, { nextFieldId: 'card-description-input' });
    } else {
        setupAutocomplete(document.getElementById('card-member-input'), document.getElementById('member-suggestions'), [], null);
        setupAutocomplete(document.getElementById('card-album-input'), document.getElementById('album-suggestions'), [], null);
    }
}

export async function updateDisplayIdField() {
    const cardId = document.getElementById('card-id-input').value;
    if (cardId) return;
    
    const group = document.getElementById('card-group-input').value;
    const member = document.getElementById('card-member-input').value;
    if (group && member) {
        document.getElementById('card-display-id-input').value = await generateDisplayId(group, member);
    }
}

export function generateExportText() {
    const items = selectedCards.map(id => allCards.find(c => c.id === id)).filter(c => c);
    if (items.length === 0) {
        document.getElementById('export-textarea').value = "No cards selected.";
        return;
    }

    let message = "Hello! I would like to buy the following card(s):\n\n";
    let totalPrice = 0;

    items.forEach(item => {
        message += `------------------------------\n`;
        message += `${item.displayId}\n`;
        message += `${item.member} (${item.group}) - ${item.album}\n`;
        if (item.description) {
            message += `${item.description}\n`;
        }
        
        let priceLine = `€${(item.price || 0).toFixed(2)}`;
        if (item.discountType === 'sale') {
            priceLine += ' (SALE)';
        } else if (item.discountType === 'super-sale') {
            priceLine += ' (SUPER SALE)';
        }
        message += `${priceLine}\n`;
        totalPrice += item.price || 0;
    });

    message += `------------------------------\n\n`;
    message += `TOTAL (${items.length} cards): €${totalPrice.toFixed(2)} (excl. shipping)\n\n`;
    message += `--- Shipping & Payment ---\n`;
    message += `Ship to: ${document.getElementById('export-country').value || 'Please specify'}\n`;
    message += `Shipping Method: ${document.getElementById('export-shipping').value}\n`;
    message += `Payment Method: ${document.getElementById('export-payment').value}\n`;

    document.getElementById('export-textarea').value = message;
}

export function copyExportText() {
    document.getElementById('export-textarea').select();
    document.execCommand('copy');
    document.getElementById('copy-export-btn').textContent = 'Copied!';
    setTimeout(() => { document.getElementById('copy-export-btn').textContent = 'Copy Text'; }, 2000);
}

export function openExportModal() {
    generateExportText();
    openModal('export-modal');
}
