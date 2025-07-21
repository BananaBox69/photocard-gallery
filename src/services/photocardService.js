import { db } from './firebase';
import { 
    collection, 
    onSnapshot, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    setDoc, 
    query, 
    where, 
    getDocs, 
    writeBatch 
} from "firebase/firestore";
import { GROUP_ABBR, GROUP_ORDER, MEMBER_ORDER } from '../constants/config';

// --- Collection and Document References ---
const photocardsCollection = collection(db, "photocards");
const settingsDocRef = doc(db, "settings", "main");

// --- Real-time Data Streams ---

/**
 * Listens for real-time updates to the photocards collection.
 * @param {function} callback - Function to call with the updated cards array.
 * @returns {function} - The unsubscribe function.
 */
export const getPhotocardsStream = (callback) => {
    return onSnapshot(photocardsCollection, (snapshot) => {
        const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(cards);
    });
};

/**
 * Listens for real-time updates to the settings document.
 * @param {function} callback - Function to call with the updated settings object.
 * @returns {function} - The unsubscribe function.
 */
export const getSettingsStream = (callback) => {
    return onSnapshot(settingsDocRef, (doc) => {
        const settings = doc.exists() ? doc.data() : { title: "Photocard Sale", subtitle: "Welcome!" };
        callback(settings);
    });
};

// --- Helper Functions ---

const updateLastUpdatedTimestamp = async () => {
    try {
        await setDoc(settingsDocRef, { lastUpdated: new Date().toISOString().split('T')[0] }, { merge: true });
    } catch (error) {
        console.error("Error updating timestamp: ", error);
    }
};

const generateDisplayId = async (group, member) => {
    const groupCode = GROUP_ABBR[group] || group.substring(0, 2).toUpperCase();
    const memberCode = member.charAt(0).toUpperCase();
    
    const q = query(photocardsCollection, where("group", "==", group), where("member", "==", member));
    const querySnapshot = await getDocs(q);
    const newNumber = String(querySnapshot.size + 1).padStart(3, '0');
    
    return `${groupCode}-${memberCode}-${newNumber}`;
};

// --- Main Service Object ---

export const photocardService = {
    /**
     * Adds a new card to the database.
     * @param {object} cardData - The data for the new card.
     */
    addCard: async (cardData) => {
        cardData.status = 'available';
        cardData.createdAt = new Date().toISOString();
        if (!cardData.displayId) {
            cardData.displayId = await generateDisplayId(cardData.group, cardData.member);
        }
        await addDoc(photocardsCollection, cardData);
        await updateLastUpdatedTimestamp();
    },

    /**
     * Updates an existing card.
     * @param {string} cardId - The ID of the card to update.
     * @param {object} cardData - The new data for the card.
     */
    updateCard: async (cardId, cardData) => {
        const cardRef = doc(db, "photocards", cardId);
        await updateDoc(cardRef, cardData);
        await updateLastUpdatedTimestamp();
    },

    /**
     * Deletes one or more cards using a batch operation.
     * @param {string[]} cardIds - An array of card IDs to delete.
     */
    deleteCards: async (cardIds) => {
        const batch = writeBatch(db);
        cardIds.forEach(id => {
            const cardRef = doc(db, "photocards", id);
            batch.delete(cardRef);
        });
        await batch.commit();
        await updateLastUpdatedTimestamp();
    },
    
    /**
     * Performs a batch update on multiple cards.
     * @param {string[]} cardIds - An array of card IDs to update.
     * @param {object} updateData - The data to apply to each card.
     */
    batchUpdateCards: async (cardIds, updateData) => {
        const batch = writeBatch(db);
        cardIds.forEach(id => {
            const cardRef = doc(db, "photocards", id);
            batch.update(cardRef, updateData);
        });
        await batch.commit();
        await updateLastUpdatedTimestamp();
    },
    
    /**
     * Fetches a single card's data.
     * @param {string} cardId - The ID of the card to fetch.
     * @returns {object|null} - The card data or null if not found.
     */
    getCard: async (cardId) => {
        const cardRef = doc(db, "photocards", cardId);
        const cardDoc = await getDoc(cardRef);
        return cardDoc.exists() ? { id: cardDoc.id, ...cardDoc.data() } : null;
    },
    
    /**
     * The main sorting logic for photocards.
     */
    sortCards: (a, b, sortMethod, bias = null) => {
        switch (sortMethod) {
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'date-desc':
                return (b.createdAt || "0").localeCompare(a.createdAt || "0");
            case 'id-asc':
                return (a.displayId || '').localeCompare(b.displayId || '');
            case 'default':
            default:
                if (bias) {
                    const isABias = a.member === bias;
                    const isBBias = b.member === bias;
                    if (isABias && !isBBias) return -1;
                    if (!isABias && isBBias) return 1;
                }
                const groupAIndex = GROUP_ORDER.indexOf(a.group);
                const groupBIndex = GROUP_ORDER.indexOf(b.group);
                if (groupAIndex !== groupBIndex) return groupAIndex - groupBIndex;

                const memberAIndex = MEMBER_ORDER.indexOf(a.member);
                const memberBIndex = MEMBER_ORDER.indexOf(b.member);
                if (memberAIndex !== memberBIndex) return memberAIndex - memberBIndex;

                return (a.album || '').localeCompare(b.album || '');
        }
    }
};

/**
 * Updates the main settings document.
 * @param {object} newSettings - The new settings to merge.
 */
export const updateSettings = async (newSettings) => {
    await setDoc(settingsDocRef, newSettings, { merge: true });
    await updateLastUpdatedTimestamp();
};
