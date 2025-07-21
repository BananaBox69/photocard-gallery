document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('Initializing application...');
    
    // Initialize components
    if (typeof initThemes === 'function') initThemes();
    if (typeof initCards === 'function') initCards();
    if (typeof initUI === 'function') initUI();
    
    // Setup autocompletes
    if (document.getElementById('card-group-input')) {
      setupAutocomplete(
        document.getElementById('card-group-input'),
        document.getElementById('group-suggestions'),
        Object.keys(ARTIST_DATA),
        { nextFieldId: 'card-member-input' }
      );
    }
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Global function availability check
function ensureFunctions() {
  const requiredFunctions = [
    'openModal', 'closeModal', 'checkAdminPassword', 'logoutAdmin',
    'openAddCardModal', 'openEditModal', 'toggleStatus', 'toggleDiscount',
    'toggleCardSelection', 'deselectAll', 'openExportModal'
  ];
  
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'undefined') {
      window[funcName] = function() {
        console.warn(funcName + ' not loaded yet');
      };
    }
  });
}

// Check every 200ms until all functions are available
const loadCheck = setInterval(() => {
  ensureFunctions();
  if (typeof initThemes !== 'undefined' && 
      typeof initCards !== 'undefined' && 
      typeof initUI !== 'undefined') {
    clearInterval(loadCheck);
  }
}, 200);
