import React from 'react';
import Photocard from './Photocard';

/**
 * Renders the grid of photocards or a "no results" message.
 */
const PhotocardGrid = ({ cards, isAdmin, selectedCards, onCardSelect, onEditCard, onDeleteCard }) => (
    <>
        {cards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {cards.map((card, index) => (
                    <Photocard
                        key={card.id}
                        card={card}
                        isAdmin={isAdmin}
                        isSelected={selectedCards.includes(card.id)}
                        onSelect={() => onCardSelect(card.id)}
                        onEdit={() => onEditCard(card.id)}
                        onDelete={() => onDeleteCard(card.id)}
                        animationDelay={index * 50} // Staggered fade-in animation
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-gray-700">No cards found!</h3>
                <p className="text-gray-500 mt-2">Try changing your search or filter settings.</p>
            </div>
        )}
    </>
);

export default PhotocardGrid;
