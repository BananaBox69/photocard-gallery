import React from 'react';

/**
 * The main control panel for searching, filtering, sorting, and bulk actions.
 */
const ControlPanel = ({ 
    searchTerm, setSearchTerm, 
    groupFilter, setGroupFilter, 
    statusFilter, setStatusFilter, 
    sortOrder, setSortOrder, 
    uniqueGroups, isAdmin, 
    selectedCards, onDeselectAll, 
    onBulkAction, onAddNew 
}) => {
    const showBulkActions = isAdmin && selectedCards.length > 0;

    return (
        <div id="control-panel" className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 sticky top-4 z-10 transition-all duration-500 theme-bg-gradient">
            {/* Filter and Sort Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus" />
                <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                    <option value="all">All Groups</option>
                    {uniqueGroups.map(group => <option key={group} value={group}>{group}</option>)}
                </select>
                {isAdmin && (
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                        <option value="all">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="on-hold">On Hold</option>
                        <option value="sold">Sold</option>
                    </select>
                )}
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm p-2 theme-ring-focus">
                    <option value="default">Default Sort</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="date-desc">Newest Added</option>
                    <option value="id-asc">ID: A to Z</option>
                </select>
            </div>

            {/* Admin Actions: Add New or Bulk Actions */}
            <div className="flex items-center justify-between mt-4">
                {isAdmin && !showBulkActions && <button onClick={onAddNew} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add New Card</button>}
                {showBulkActions && (
                    <div className="w-full bg-indigo-100 border border-indigo-200 rounded-md p-2 flex justify-between items-center">
                        <div><span className="font-bold">{selectedCards.length}</span> cards selected</div>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button onClick={() => onBulkAction('sale')} className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600">10% Off</button>
                            <button onClick={() => onBulkAction('super-sale')} className="px-2 py-1 bg-purple-700 text-white rounded-md text-xs hover:bg-purple-800">20% Off</button>
                            <button onClick={() => onBulkAction('setPrice')} className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700">Set Price</button>
                            <button onClick={() => onBulkAction('available')} className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700">Mark Available</button>
                            <button onClick={() => onBulkAction('on-hold')} className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600">Mark Reserved</button>
                            <button onClick={() => onBulkAction('sold')} className="px-2 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700">Mark Sold</button>
                            <button onClick={() => onBulkAction('delete')} className="px-2 py-1 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700">Delete</button>
                            <button onClick={onDeselectAll} className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300">Deselect All</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
