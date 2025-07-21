document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('Initializing application...');
    
    // Initialize components
    if (typeof initThemes === 'function') initThemes();
    if (typeof initCards === 'function') initCards();
    if (typeof initUI === 'function') initUI();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Global fallbacks
window.openModal = window.openModal || function() { 
  console.warn('openModal not loaded yet'); 
};
// ... other fallbacks as needed
