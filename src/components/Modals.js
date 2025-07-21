import React, { useState, useEffect, useMemo } from 'react';
import { photocardService } from '../services/photocardService';
import { ARTIST_DATA, COUNTRY_LIST } from '../constants/config';

// --- Reusable UI Components for Modals ---

const Modal = ({ children, closeModal, size = 'max-w-md' }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
        <div 
            className={`bg-white rounded-lg shadow-xl p-6 w-full text-gray-800 ${size}`} 
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

const AutocompleteInput = ({ value, name, onChange, placeholder, source }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isActive, setIsActive] = useState(false);

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(e); // Propagate event up
        if (val && source) {
            const filtered = source.filter(item => item.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (item) => {
        // Create a synthetic event to mimic a real input change
        onChange({ target: { name, value: item } });
        setSuggestions([]);
        setIsActive(false);
    };

    return (
        <div className="relative autocomplete-container">
            <input
                type="text"
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                autoComplete="off"
                onFocus={() => setIsActive(true)}
                onBlur={() => setTimeout(() => setIsActive(false), 150)} // Delay to allow click
            />
            {isActive && suggestions.length > 0 && (
                <div className="autocomplete-suggestions">
                    {suggestions.map(item => (
                        <div key={item} className="suggestion-item" onMouseDown={() => handleSelect(item)}>
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Specific Modal Components ---

const AdminLoginModal = ({ closeModal, onSetAdmin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = () => {
        if (!onSetAdmin(password)) {
            setError(true);
            setPassword('');
        }
    };

    return (
        <Modal closeModal={closeModal} size="max-w-sm">
            <h3 className="text-xl font-bold mb-4">Admin Login</h3>
            {error && <p className="text-red-500 text-sm mb-2">Incorrect password. Please try again.</p>}
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                placeholder="Password"
                autoFocus
            />
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleLogin} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Login</button>
            </div>
        </Modal>
    );
};

const TitleEditModal = ({ closeModal, onUpdateTitle, currentTitle }) => {
    const [title, setTitle] = useState(currentTitle);
    return (
        <Modal closeModal={closeModal} size="max-w-sm">
             <h3 className="text-xl font-bold mb-4">Edit Title</h3>
             <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="New Title" autoFocus/>
             <div className="flex justify-end space-x-2">
                 <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                 <button onClick={() => onUpdateTitle(title)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
             </div>
        </Modal>
    );
};

const SubtitleEditModal = ({ closeModal, onUpdateSubtitle, currentSubtitle }) => {
    const [subtitle, setSubtitle] = useState(currentSubtitle);
    return (
        <Modal closeModal={closeModal} size="max-w-sm">
             <h3 className="text-xl font-bold mb-4">Edit Subtitle</h3>
             <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="New Subtitle" autoFocus/>
             <div className="flex justify-end space-x-2">
                 <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                 <button onClick={() => onUpdateSubtitle(subtitle)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
             </div>
        </Modal>
    );
};

const DeleteConfirmModal = ({ closeModal, onDelete, count }) => (
    <Modal closeModal={closeModal} size="max-w-sm">
        <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-6">You are about to delete {count} card(s). This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
                <button onClick={closeModal} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={onDelete} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </Modal>
);

const AddEditCardModal = ({ closeModal, cardId, allCards }) => {
    const isEditing = !!cardId;
    const [cardData, setCardData] = useState({
        displayId: '', group: '', member: '', album: '', description: '', price: '', imageUrl: ''
    });
    const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'

    useEffect(() => {
        if (isEditing) {
            const fetchCard = async () => {
                const card = await photocardService.getCard(cardId);
                if (card) setCardData(card);
            };
            fetchCard();
        }
    }, [cardId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (andClose) => {
        setSaveStatus('saving');
        const dataToSave = { ...cardData, price: parseFloat(cardData.price) || 0 };
        
        try {
            if (isEditing) {
                await photocardService.updateCard(cardId, dataToSave);
            } else {
                await photocardService.addCard(dataToSave);
            }

            if (andClose) {
                closeModal();
            } else {
                setSaveStatus('saved');
                // Reset form for next entry, keeping group and member
                setCardData({ displayId: '', group: dataToSave.group, member: dataToSave.member, album: '', description: '', price: '', imageUrl: '' });
                setTimeout(() => setSaveStatus(''), 2000);
            }
        } catch (error) {
            console.error("Failed to save card:", error);
            setSaveStatus('');
        }
    };
    
    // Suggestions for autocomplete
    const groupSuggestions = Object.keys(ARTIST_DATA);
    const memberSuggestions = cardData.group ? (ARTIST_DATA[cardData.group]?.members || []) : [];
    const albumSuggestions = cardData.group ? (ARTIST_DATA[cardData.group]?.albums || []) : [];
    const descriptionSuggestions = [...new Set(allCards.map(c => c.description).filter(d => d))];

    return (
        <Modal closeModal={closeModal}>
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Card' : 'Add a New Card'}</h3>
            <form onSubmit={e => { e.preventDefault(); handleSave(true); }} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Card ID</label>
                    <input type="text" name="displayId" value={cardData.displayId} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Group</label>
                        <AutocompleteInput name="group" value={cardData.group} onChange={handleChange} source={groupSuggestions} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Member</label>
                        <AutocompleteInput name="member" value={cardData.member} onChange={handleChange} source={memberSuggestions} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Album / Origin</label>
                    <AutocompleteInput name="album" value={cardData.album} onChange={handleChange} source={albumSuggestions} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <AutocompleteInput name="description" value={cardData.description} onChange={handleChange} source={descriptionSuggestions} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price (€)</label>
                    <input type="number" step="0.01" name="price" value={cardData.price} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input type="text" name="imageUrl" value={cardData.imageUrl} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                </div>

                <div className="flex justify-between items-center pt-4">
                    {saveStatus === 'saved' && <span className="text-green-600 transition-opacity duration-300">Saved!</span>}
                    <div className="flex justify-end space-x-2 flex-grow">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        {!isEditing && <button type="button" onClick={() => handleSave(false)} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Save & Add Another</button>}
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save & Close</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const ExportModal = ({ closeModal, selectedCards, allCards }) => {
    const [details, setDetails] = useState({ shipping: 'Cheapest', country: '', payment: 'PayPal F&F' });
    const [copyStatus, setCopyStatus] = useState(false);

    const selectedItems = useMemo(() => {
        return selectedCards.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    }, [selectedCards, allCards]);

    const exportText = useMemo(() => {
        if (selectedItems.length === 0) return "No cards selected.";
        
        let message = "Hello! I would like to buy the following card(s):\n\n";
        let totalPrice = 0;

        selectedItems.forEach(item => {
            message += `------------------------------\n`;
            message += `${item.displayId}\n`;
            message += `${item.member} (${item.group}) - ${item.album}\n`;
            if (item.description) message += `${item.description}\n`;
            
            let priceLine = `€${(item.price || 0).toFixed(2)}`;
            if (item.discountType) priceLine += ` (${item.discountType.toUpperCase()} SALE)`;
            message += `${priceLine}\n`;
            totalPrice += item.price || 0;
        });

        message += `------------------------------\n\n`;
        message += `TOTAL (${selectedItems.length} cards): €${totalPrice.toFixed(2)} (excl. shipping)\n\n`;
        message += `--- Shipping & Payment ---\n`;
        message += `Ship to: ${details.country || 'Please specify'}\n`;
        message += `Shipping Method: ${details.shipping}\n`;
        message += `Payment Method: ${details.payment}\n`;
        
        return message;
    }, [selectedItems, details]);

    const handleCopy = () => {
        navigator.clipboard.writeText(exportText);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    return (
        <Modal closeModal={closeModal} size="max-w-2xl">
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
                <h3 className="text-2xl font-bold mb-4">Export Selection</h3>
                <p className="text-sm text-gray-600 mb-4">Please fill in the details below, then copy the text and send it to me!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select value={details.shipping} onChange={e => setDetails(d => ({...d, shipping: e.target.value}))} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                        <option>Cheapest</option><option>Tracked</option><option>Insured</option>
                    </select>
                    <AutocompleteInput name="country" value={details.country} onChange={e => setDetails(d => ({...d, country: e.target.value}))} source={COUNTRY_LIST} placeholder="e.g., Germany" />
                    <select value={details.payment} onChange={e => setDetails(d => ({...d, payment: e.target.value}))} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                        <option>PayPal F&F</option><option>Wise</option><option>Bank Transfer</option>
                    </select>
                </div>
                <textarea readOnly value={exportText} className="w-full h-64 p-3 bg-gray-100 border border-gray-300 rounded-md resize-none font-mono text-sm"></textarea>
                <div className="flex justify-between items-center mt-4">
                    <a href="https://www.instagram.com/bananatrades877/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        <span>Send on Instagram</span>
                    </a>
                    <div className="flex space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleCopy} className="px-4 py-2 text-white rounded-md theme-bg-gradient">{copyStatus ? 'Copied!' : 'Copy Text'}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const BulkPriceModal = ({ closeModal, onConfirm }) => {
    const [price, setPrice] = useState('');
    return (
        <Modal closeModal={closeModal} size="max-w-sm">
            <h3 className="text-xl font-bold mb-4">Bulk Edit Price</h3>
            <p className="text-sm text-gray-600 mb-2">Enter a new price for all selected cards.</p>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-4" placeholder="e.g., 10.50" autoFocus />
            <div className="flex justify-end space-x-2">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={() => onConfirm(parseFloat(price))} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Set Price</button>
            </div>
        </Modal>
    );
};


/**
 * Modal Manager Component
 * This component acts as a controller, rendering the correct modal based on the app's state.
 */
const Modals = ({ modalConfig, closeModal, allCards, selectedCards, onSetAdmin, onUpdateTitle, onUpdateSubtitle, onDeselectAll }) => {
    const { name, props } = modalConfig;

    // --- Handlers for Modal Actions ---
    const handleBulkAction = async (action) => {
        if (selectedCards.length === 0) return;
        
        // Actions that don't need a confirmation modal
        const statusActions = ['available', 'on-hold', 'sold'];
        if (statusActions.includes(action)) {
            await photocardService.batchUpdateCards(selectedCards, { status: action });
            onDeselectAll();
            closeModal();
        }
        // Note: Discount logic would be more complex and is simplified here
    };

    const handleBulkPrice = async (price) => {
        if (isNaN(price) || price < 0) return;
        await photocardService.batchUpdateCards(selectedCards, { price, discountType: null, originalPrice: null });
        onDeselectAll();
        closeModal();
    };

    const handleDelete = async () => {
        await photocardService.deleteCards(props.cardIds);
        onDeselectAll();
        closeModal();
    };

    if (!name) return null;

    // --- Render correct modal based on name ---
    switch (name) {
        case 'adminLogin':
            return <AdminLoginModal closeModal={closeModal} onSetAdmin={onSetAdmin} />;
        case 'editTitle':
            return <TitleEditModal closeModal={closeModal} onUpdateTitle={onUpdateTitle} currentTitle={props.currentTitle} />;
        case 'editSubtitle':
            return <SubtitleEditModal closeModal={closeModal} onUpdateSubtitle={onUpdateSubtitle} currentSubtitle={props.currentSubtitle} />;
        case 'addCard':
            return <AddEditCardModal closeModal={closeModal} allCards={allCards} />;
        case 'editCard':
            return <AddEditCardModal closeModal={closeModal} cardId={props.cardId} allCards={allCards} />;
        case 'deleteCard':
            return <DeleteConfirmModal closeModal={closeModal} onDelete={handleDelete} count={props.cardIds.length} />;
        case 'export':
            return <ExportModal closeModal={closeModal} selectedCards={selectedCards} allCards={allCards} />;
        case 'bulkAction':
            if (props.action === 'setPrice') {
                return <BulkPriceModal closeModal={closeModal} onConfirm={handleBulkPrice} />;
            }
            if (props.action === 'delete') {
                return <DeleteConfirmModal closeModal={closeModal} onDelete={() => { photocardService.deleteCards(selectedCards); onDeselectAll(); closeModal(); }} count={selectedCards.length} />;
            }
            // For simple bulk actions that don't need a modal
            handleBulkAction(props.action);
            return null;
        default:
            return null;
    }
};

export default Modals;
