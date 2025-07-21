import React from 'react';

/**
 * The floating cart button for non-admin users.
 */
const CartButton = ({ count, onClick }) => (
    <button onClick={onClick} className="fixed bottom-6 right-6 theme-bg-gradient text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-30">
        {/* Cart Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        
        {/* Item Count Badge */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{count}</span>
    </button>
);

export default CartButton;
