import React from 'react';
import { MEMBER_COLORS } from '../constants/config';
import { photocardService } from '../services/photocardService';

// Helper function to calculate a darker shade of a hex color for text contrast
function darkenColor(hex, percent) {
    if (!hex || hex.length < 7) return '#000000'; // Default to black on error
    let [r, g, b] = [parseInt(hex.substring(1, 3), 16), parseInt(hex.substring(3, 5), 16), parseInt(hex.substring(5, 7), 16)];
    const factor = (100 - percent) / 100;
    [r, g, b] = [Math.round(r * factor), Math.round(g * factor), Math.round(b * factor)];
    const toHex = c => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Displays a single photocard with its details and actions.
 */
const Photocard = ({ card, isAdmin, isSelected, onSelect, onEdit, onDelete, animationDelay }) => {
    const memberKey = card.member ? card.member.toLowerCase() : '';
    const memberColor = MEMBER_COLORS[memberKey] || '#FFFFFF';
    const darkTextColor = darkenColor(memberColor, 35);
    
    // Determine opacity and grayscale based on card status
    let cardOpacityClass = '';
    if (card.status === 'sold') cardOpacityClass = 'opacity-50';
    else if (card.status === 'on-hold') cardOpacityClass = 'opacity-60 grayscale';

    // Prevent clicks on admin buttons from triggering card selection
    const handleCardClick = (e) => {
        if (e.target.closest('button')) return; 
        onSelect();
    };

    // --- Direct actions from the card (for admin) ---
    const handleStatusToggle = async (status) => {
        const newStatus = card.status === status ? 'available' : status;
        await photocardService.updateCard(card.id, { status: newStatus });
    };

    const handleDiscountToggle = async (type) => {
        const originalPrice = card.originalPrice || card.price;
        if (card.discountType === type) { // Toggle off
            await photocardService.updateCard(card.id, { price: originalPrice, discountType: null, originalPrice: null });
        } else { // Toggle on
            const percentage = type === 'sale' ? 0.10 : 0.20;
            let discountAmount = originalPrice * percentage;
            if (discountAmount < 0.50) discountAmount = 0.50; // Minimum 50 cent discount
            const newPrice = Math.ceil((originalPrice - discountAmount) * 2) / 2; // Round to nearest .50
            await photocardService.updateCard(card.id, { price: newPrice, discountType: type, originalPrice: originalPrice });
        }
    };

    return (
        <div
            className={`group-item rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 fade-in flex flex-col cursor-pointer ${isSelected ? 'card-selected' : ''}`}
            style={{ backgroundColor: memberColor, animationDelay: `${animationDelay}ms` }}
            onClick={handleCardClick}
        >
            <div className="relative">
                <img src={card.imageUrl || ''} alt={`${card.member} from ${card.group}`} className={`w-full h-auto object-cover aspect-[2/3] ${cardOpacityClass}`} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600/cccccc/ffffff?text=No+Image'; }} />
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-mono px-1.5 py-0.5 rounded">{card.displayId || 'N/A'}</div>
                
                {/* Selection Checkbox (visible to users unless sold) */}
                {(isAdmin || card.status !== 'sold') && (
                    <button onClick={onSelect} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/80 transition z-20">
                        {isSelected ?
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-green-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><circle cx="12" cy="12" r="10"></circle></svg>
                        }
                    </button>
                )}

                {/* Badges and Admin Controls */}
                <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
                    {card.status === 'sold' && <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD</span>}
                    {card.status === 'on-hold' && <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">RESERVED</span>}
                    {card.discountType === 'sale' && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</span>}
                    {card.discountType === 'super-sale' && <span className="bg-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full">SUPER SALE</span>}
                    
                    {isAdmin && (
                        <div className="flex flex-col gap-1">
                            <button onClick={() => handleDiscountToggle('sale')} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600" title="Toggle 10% Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
                            <button onClick={() => handleDiscountToggle('super-sale')} className="p-1 bg-purple-700 text-white rounded-full hover:bg-purple-800" title="Toggle 20% Super Sale"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg></button>
                            <button onClick={onEdit} className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                            <button onClick={() => handleStatusToggle('sold')} className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700" title="Toggle Sold"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>
                            <button onClick={() => handleStatusToggle('on-hold')} className="p-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600" title="Toggle Reserved"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></button>
                            <button onClick={onDelete} className="p-1 bg-gray-700 text-white rounded-full hover:bg-gray-800" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="font-bold text-lg" style={{ color: darkTextColor }}>{card.member || 'Unknown'}</p>
                <p className="text-sm" style={{ color: darkTextColor, opacity: 0.8 }}>{card.group || 'Unknown'}</p>
                <p className="text-sm line-clamp-2" style={{ color: darkTextColor, opacity: 0.8, minHeight: '2.5rem' }} title={card.album || ''}>{card.album || 'Unknown'}</p>
                <p className="text-xs mt-1 h-8 overflow-hidden" style={{ color: darkTextColor, opacity: 0.7 }}>{card.description || ''}</p>
                <p className="text-xl font-semibold mt-auto pt-2" style={{ color: darkTextColor }}>€{parseFloat(card.price || 0).toFixed(2)}</p>
            </div>
        </div>
    );
};

export default Photocard;
