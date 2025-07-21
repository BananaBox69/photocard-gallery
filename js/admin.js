// Admin Configuration
const ADMIN_PASSWORD = "4649"; // Replace with your actual password
let isAdmin = false;

// DOM Elements
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminPasswordInput = document.getElementById('admin-password-input');
const addCardBtn = document.getElementById('add-card-btn');
const editTitleBtn = document.getElementById('edit-title-btn');
const editSubtitleBtn = document.getElementById('edit-subtitle-btn');
const statusFilterWrapper = document.getElementById('status-filter-wrapper');

// Admin Mode Functions
function setAdminMode(enabled) {
    isAdmin = enabled;
    
    // Toggle admin UI elements
    if (adminLoginBtn) adminLoginBtn.classList.toggle('hidden', enabled);
    if (adminLogoutBtn) adminLogoutBtn.classList.toggle('hidden', !enabled);
    if (addCardBtn) addCardBtn.classList.toggle('hidden', !enabled);
    
    // Toggle edit buttons
    if (editTitleBtn) {
        editTitleBtn.classList.toggle('hidden', !enabled);
        editTitleBtn.classList.toggle('admin-visible', enabled);
    }
    
    if (editSubtitleBtn) {
        editSubtitleBtn.classList.toggle('hidden', !enabled);
        editSubtitleBtn.classList.toggle('admin-visible', enabled);
    }
    
    // Toggle status filter
    if (statusFilterWrapper) statusFilterWrapper.classList.toggle('hidden', !enabled);
    
    // Clear any selections when changing admin mode
    if (typeof deselectAll === 'function') {
        deselectAll();
    }
    
    // Refresh the display
    if (typeof displayCards === 'function') {
        displayCards();
    }
}

function checkAdminPassword() {
    if (!adminPasswordInput) {
        console.error('Admin password input not found');
        return;
    }
    
    const password = adminPasswordInput.value;
    if (password === ADMIN_PASSWORD) {
        setAdminMode(true);
        closeModal('admin-login-modal');
        adminPasswordInput.value = '';
    } else {
        alert('Incorrect password!');
        adminPasswordInput.focus();
    }
}

function logoutAdmin() {
    setAdminMode(false);
}

// Title/Subtitle Management
function openTitleEditModal() {
    const titleInput = document.getElementById('title-edit-input');
    const currentTitle = document.getElementById('main-title').textContent;
    
    if (titleInput) {
        titleInput.value = currentTitle;
        openModal('title-edit-modal');
    } else {
        console.error('Title edit input not found');
    }
}

function openSubtitleEditModal() {
    const subtitleInput = document.getElementById('subtitle-edit-input');
    const currentSubtitle = document.getElementById('subtitle').textContent;
    
    if (subtitleInput) {
        subtitleInput.value = currentSubtitle;
        openModal('subtitle-edit-modal');
    } else {
        console.error('Subtitle edit input not found');
    }
}

async function saveTitle() {
    const titleInput = document.getElementById('title-edit-input');
    if (!titleInput) return;
    
    const newTitle = titleInput.value.trim();
    if (newTitle) {
        try {
            await setDoc(settingsDoc, { title: newTitle }, { merge: true });
            await updateLastUpdatedTimestamp();
            closeModal('title-edit-modal');
            
            // Update the displayed title
            const mainTitle = document.getElementById('main-title');
            if (mainTitle) mainTitle.textContent = newTitle;
            
            // Update the page title
            document.title = newTitle;
        } catch (error) {
            console.error('Error saving title:', error);
            alert('Failed to save title. Please try again.');
        }
    }
}

async function saveSubtitle() {
    const subtitleInput = document.getElementById('subtitle-edit-input');
    if (!subtitleInput) return;
    
    const newSubtitle = subtitleInput.value.trim();
    if (newSubtitle) {
        try {
            await setDoc(settingsDoc, { subtitle: newSubtitle }, { merge: true });
            await updateLastUpdatedTimestamp();
            closeModal('subtitle-edit-modal');
            
            // Update the displayed subtitle
            const subtitleEl = document.getElementById('subtitle');
            if (subtitleEl) subtitleEl.textContent = newSubtitle;
        } catch (error) {
            console.error('Error saving subtitle:', error);
            alert('Failed to save subtitle. Please try again.');
        }
    }
}

// Initialize Admin Event Listeners
function initAdminEventListeners() {
    // Admin login button
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            openModal('admin-login-modal');
            setTimeout(() => {
                if (adminPasswordInput) adminPasswordInput.focus();
            }, 100);
        });
    }
    
    // Admin logout button
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', logoutAdmin);
    }
    
    // Password input enter key
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                checkAdminPassword();
            }
        });
    }
    
    // Add card button
    if (addCardBtn) {
        addCardBtn.addEventListener('click', openAddCardModal);
    }
}

// Initialize admin functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAdminEventListeners();
});

// Expose functions to global scope
window.setAdminMode = setAdminMode;
window.checkAdminPassword = checkAdminPassword;
window.logoutAdmin = logoutAdmin;
window.openTitleEditModal = openTitleEditModal;
window.openSubtitleEditModal = openSubtitleEditModal;
window.saveTitle = saveTitle;
window.saveSubtitle = saveSubtitle;
