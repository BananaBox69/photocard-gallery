// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing application...');
        
        // Initialize all components
        if (typeof initThemes === 'function') {
            initThemes();
        } else {
            console.error('initThemes function not found');
        }

        if (typeof initCards === 'function') {
            initCards();
        } else {
            console.error('initCards function not found');
        }

        if (typeof initUI === 'function') {
            initUI();
        } else {
            console.error('initUI function not found');
        }

        // Setup autocompletes
        const groupInput = document.getElementById('card-group-input');
        if (groupInput) {
            setupAutocomplete(
                groupInput,
                document.getElementById('group-suggestions'),
                Object.keys(ARTIST_DATA),
                { nextFieldId: 'card-member-input' }
            );
        }

        const countryInput = document.getElementById('export-country');
        if (countryInput) {
            setupAutocomplete(
                countryInput,
                document.getElementById('country-suggestions'),
                COUNTRY_LIST,
                null
            );
        }

        // Expose functions to global scope for HTML event handlers
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
        window.updateDisplayIdField = updateDisplayIdField;
        window.updateMemberAlbumSuggestions = updateMemberAlbumSuggestions;

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Application initialization failed:', error);
        alert('Failed to initialize application. Please check console for details.');
    }
});

// Fallback for functions that might not be loaded yet
function fallbackFunction() {
    console.warn('Function called before it was loaded');
    alert('Please wait for the page to fully load before taking this action.');
}

// Initialize fallbacks
window.openModal = fallbackFunction;
window.closeModal = fallbackFunction;
window.checkAdminPassword = fallbackFunction;
// ... other fallbacks for all exposed functions

// Replace fallbacks when real functions are available
function replaceFallbacks() {
    if (typeof openModal !== 'undefined') {
        window.openModal = openModal;
    }
    if (typeof closeModal !== 'undefined') {
        window.closeModal = closeModal;
    }
    // ... repeat for all other functions
}

// Check every 100ms for function availability
const fallbackInterval = setInterval(() => {
    if (typeof initThemes !== 'undefined' && 
        typeof initCards !== 'undefined' && 
        typeof initUI !== 'undefined') {
        replaceFallbacks();
        clearInterval(fallbackInterval);
    }
}, 100);
