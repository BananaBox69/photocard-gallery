import { initThemes } from './themes.js';
import { initCards } from './cards.js';
import { initUI } from './ui.js';
import { setupAutocomplete } from './modals.js';
import { ARTIST_DATA, COUNTRY_LIST } from './utils.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initThemes();
    initCards();
    initUI();
    
    // Setup autocomplete for group and country inputs
    setupAutocomplete(document.getElementById('card-group-input'), document.getElementById('group-suggestions'), Object.keys(ARTIST_DATA), { nextFieldId: 'card-member-input' });
    setupAutocomplete(document.getElementById('export-country'), document.getElementById('country-suggestions'), COUNTRY_LIST, null);
    
    // Expose functions to window for inline event handlers
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.checkAdminPassword = checkAdminPassword;
    window.logoutAdmin = logoutAdmin;
    window.openAddCardModal = openAddCardModal;
    window.openEditModal = openEditModal;
    window.openSingleDeleteModal = openSingleDeleteModal;
    window.toggleStatus = toggleStatus;
    window.toggleDiscount = toggleDiscount;
    window.bulkToggleDiscount = bulkToggleDiscount;
    window.toggleCardSelection = toggleCardSelection;
    window.deselectAll = deselectAll;
    window.bulkUpdateStatus = bulkUpdateStatus;
    window.openBulkPriceModal = openBulkPriceModal;
    window.bulkUpdatePrice = bulkUpdatePrice;
    window.openBulkDeleteModal = openBulkDeleteModal;
    window.openExportModal = openExportModal;
    window.copyExportText = copyExportText;
    window.saveAndAddAnother = saveAndAddAnother;
    window.openTitleEditModal = openTitleEditModal;
    window.openSubtitleEditModal = openSubtitleEditModal;
    window.saveTitle = saveTitle;
    window.saveSubtitle = saveSubtitle;
});
