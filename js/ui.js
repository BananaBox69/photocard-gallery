import { displayCards } from './cards.js';
import { openModal } from './modals.js';

export function initUI() {
    // Event listeners for search and filters
    document.getElementById('search').addEventListener('input', displayCards);
    document.getElementById('groupFilter').addEventListener('change', displayCards);
    document.getElementById('statusFilter').addEventListener('change', displayCards);
    document.getElementById('sortOrder').addEventListener('change', displayCards);
    
    // Event listeners for export modal
    document.getElementById('export-shipping').addEventListener('change', generateExportText);
    document.getElementById('export-country').addEventListener('input', generateExportText);
    document.getElementById('export-payment').addEventListener('change', generateExportText);
    
    // Event listeners for admin login
    document.getElementById('admin-password-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkAdminPassword();
    });
    
    // Event listeners for card form
    document.getElementById('card-group-input').addEventListener('blur', updateMemberAlbumSuggestions);
    document.getElementById('card-member-input').addEventListener('blur', updateDisplayIdField);
    
    // Event listener for add card button
    document.getElementById('add-card-btn').addEventListener('click', () => {
        const existingDescriptions = [...new Set(allCards.map(c => c.description).filter(d => d))];
        setupAutocomplete(document.getElementById('card-description-input'), document.getElementById('description-suggestions'), existingDescriptions, { nextFieldId: 'card-price-input' });
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            document.getElementById('group-suggestions').classList.add('hidden');
            document.getElementById('member-suggestions').classList.add('hidden');
            document.getElementById('album-suggestions').classList.add('hidden');
            document.getElementById('description-suggestions').classList.add('hidden');
            document.getElementById('country-suggestions').classList.add('hidden');
        }
    });
}
