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
    alert('Failed to initialize app. Please check console for details.');
  }
});

// Fallback system
function ensureFunctions() {
  var requiredFunctions = [
    'openModal', 'closeModal', 'checkAdminPassword', 
    'openAddCardModal', 'toggleCardSelection'
    // ... add all other required functions
  ];
  
  requiredFunctions.forEach(function(funcName) {
    if (typeof window[funcName] === 'undefined') {
      window[funcName] = function() {
        console.warn(funcName + ' not loaded yet');
      };
    }
  });
}

// Check every 200ms until all functions are available
var loadCheck = setInterval(function() {
  ensureFunctions();
  if (typeof initThemes !== 'undefined' && 
      typeof initCards !== 'undefined' && 
      typeof initUI !== 'undefined') {
    clearInterval(loadCheck);
  }
}, 200);
