import { db, photocardsCollection, settingsDoc } from './firebase.js';
import { getFirestore, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ADMIN_PASSWORD } from './utils.js';
import { displayCards } from './cards.js';

let isAdmin = false;

export function setAdminMode(enabled) {
    isAdmin = enabled;
    document.getElementById('admin-login-btn').classList.toggle('hidden', enabled);
    document.getElementById('admin-logout-btn').classList.toggle('hidden', !enabled);
    document.getElementById('add-card-btn').classList.toggle('hidden', !enabled);
    document.getElementById('edit-title-btn').classList.toggle('hidden', !enabled);
    document.getElementById('edit-title-btn').classList.toggle('admin-visible', enabled);
    document.getElementById('edit-subtitle-btn').classList.toggle('hidden', !enabled);
    document.getElementById('edit-subtitle-btn').classList.toggle('admin-visible', enabled);
    document.getElementById('status-filter-wrapper').classList.toggle('hidden', !enabled);
    
    displayCards();
}

export function checkAdminPassword() {
    const adminPasswordInput = document.getElementById('admin-password-input');
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        setAdminMode(true);
        closeModal('admin-login-modal');
        adminPasswordInput.value = '';
    } else {
        alert('Incorrect password!');
    }
}

export function logoutAdmin() {
    setAdminMode(false);
}

export async function saveTitle() {
    const newTitle = document.getElementById('title-edit-input').value;
    if (newTitle && newTitle.trim() !== "") {
        await setDoc(settingsDoc, { title: newTitle.trim() }, { merge: true });
        await updateLastUpdatedTimestamp();
        closeModal('title-edit-modal');
    }
}

export async function saveSubtitle() {
    const newSubtitle = document.getElementById('subtitle-edit-input').value;
    if (newSubtitle && newSubtitle.trim() !== "") {
        await setDoc(settingsDoc, { subtitle: newSubtitle.trim() }, { merge: true });
        await updateLastUpdatedTimestamp();
        closeModal('subtitle-edit-modal');
    }
}

export function openTitleEditModal() {
    document.getElementById('title-edit-input').value = document.getElementById('main-title').textContent;
    openModal('title-edit-modal');
}

export function openSubtitleEditModal() {
    document.getElementById('subtitle-edit-input').value = document.getElementById('subtitle').textContent;
    openModal('subtitle-edit-modal');
}
