import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPhotocardsStream, getSettingsStream, updateSettings, photocardService } from './services/photocardService';

// Import Components
import Header from './components/Header';
import ThemeSwitcher from './components/ThemeSwitcher';
import ControlPanel from './components/ControlPanel';
import PhotocardGrid from './components/PhotocardGrid';
import CartButton from './components/CartButton';
import Modals from './components/Modals';

// Import Constants
import { THEMES, GROUP_ORDER, MEMBER_ORDER } from './constants/config';

function App() {
  // --- STATE MANAGEMENT ---
  const [allCards, setAllCards] = useState([]);
  const [settings, setSettings] = useState({ title: 'Photocard Sale', subtitle: 'Loading...' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('selectedTheme') || 'Red Velvet');
  
  // Filters and Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  
  // Modal Visibility State
  const [modal, setModal] = useState({ name: null, props: {} }); // e.g., { name: 'addCard', props: { cardId: '123' } }

  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubscribeCards = getPhotocardsStream(setAllCards);
    const unsubscribeSettings = getSettingsStream(setSettings);

    return () => {
      unsubscribeCards();
      unsubscribeSettings();
    };
  }, []);

  // --- THEME MANAGEMENT ---
  useEffect(() => {
    const theme = THEMES[currentTheme] || THEMES['Red Velvet'];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    localStorage.setItem('selectedTheme', currentTheme);
    document.title = settings.title || 'Photocard Sale';
  }, [currentTheme, settings.title]);

  // --- DERIVED STATE & MEMOIZED VALUES ---
  const uniqueGroups = useMemo(() => {
    const groups = [...new Set(allCards.map(card => card.group).filter(g => g))];
    return groups.sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
  }, [allCards]);

  const filteredAndSortedCards = useMemo(() => {
    let cardsToDisplay = allCards.filter(card => {
      if (!isAdmin && card.status === 'sold') return false;
      
      const searchCorpus = `${card.member || ''} ${card.group || ''} ${card.album || ''} ${card.displayId || ''}`.toLowerCase();
      const matchesSearch = searchCorpus.includes(searchTerm.toLowerCase());
      const matchesGroup = groupFilter === 'all' || card.group === groupFilter;
      const matchesStatus = !isAdmin || statusFilter === 'all' || card.status === statusFilter;
      
      return matchesSearch && matchesGroup && matchesStatus;
    });

    // Sorting logic
    const bias = THEMES[currentTheme]?.isBias ? currentTheme : null;
    cardsToDisplay.sort((a, b) => photocardService.sortCards(a, b, sortOrder, bias));

    return cardsToDisplay;
  }, [allCards, isAdmin, searchTerm, groupFilter, statusFilter, sortOrder, currentTheme]);

  // --- CALLBACKS & HANDLERS ---
  const handleSetAdmin = (password) => {
    if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setModal({ name: null });
      return true;
    }
    return false;
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setSelectedCards([]);
  };

  const handleUpdateTitle = async (newTitle) => {
    await updateSettings({ title: newTitle });
    setModal({ name: null });
  };
  
  const handleUpdateSubtitle = async (newSubtitle) => {
    await updateSettings({ subtitle: newSubtitle });
    setModal({ name: null });
  };

  const handleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };
  
  const handleDeselectAll = useCallback(() => {
      setSelectedCards([]);
  }, []);

  // --- RENDER ---
  return (
    <>
      <div className="container mx-auto p-4 md:p-8 pb-24">
        <ThemeSwitcher 
          themes={THEMES} 
          currentTheme={currentTheme} 
          setCurrentTheme={setCurrentTheme} 
        />
        <Header
          title={settings.title}
          subtitle={settings.subtitle}
          lastUpdated={settings.lastUpdated}
          isAdmin={isAdmin}
          onAdminLogin={() => setModal({ name: 'adminLogin' })}
          onAdminLogout={handleLogoutAdmin}
          onEditTitle={() => setModal({ name: 'editTitle', props: { currentTitle: settings.title } })}
          onEditSubtitle={() => setModal({ name: 'editSubtitle', props: { currentSubtitle: settings.subtitle } })}
        />
        <ControlPanel
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          groupFilter={groupFilter}
          setGroupFilter={setGroupFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          uniqueGroups={uniqueGroups}
          isAdmin={isAdmin}
          selectedCards={selectedCards}
          onDeselectAll={handleDeselectAll}
          onBulkAction={(action) => setModal({ name: 'bulkAction', props: { action } })}
          onAddNew={() => setModal({ name: 'addCard' })}
        />
        <PhotocardGrid
          cards={filteredAndSortedCards}
          isAdmin={isAdmin}
          selectedCards={selectedCards}
          onCardSelect={handleCardSelection}
          onEditCard={(cardId) => setModal({ name: 'editCard', props: { cardId } })}
          onDeleteCard={(cardId) => setModal({ name: 'deleteCard', props: { cardIds: [cardId] } })}
        />
      </div>

      {!isAdmin && <CartButton count={selectedCards.length} onClick={() => setModal({ name: 'export' })} />}
      
      <Modals
        modalConfig={modal}
        closeModal={() => setModal({ name: null })}
        allCards={allCards}
        selectedCards={selectedCards}
        onSetAdmin={handleSetAdmin}
        onUpdateTitle={handleUpdateTitle}
        onUpdateSubtitle={handleUpdateSubtitle}
        onDeselectAll={handleDeselectAll}
      />
    </>
  );
}

export default App;
