import React from 'react';

/**
 * Displays the main page header, title, subtitle, and admin controls.
 */
const Header = ({ title, subtitle, lastUpdated, isAdmin, onAdminLogin, onAdminLogout, onEditTitle, onEditSubtitle }) => (
    <header className="text-center mb-8 relative">
        {/* Last Updated Timestamp */}
        {lastUpdated && <p className="text-xs text-gray-500 absolute top-0 left-0">Last updated: {lastUpdated}</p>}
        
        {/* Main Title */}
        <div className="flex justify-center items-center gap-3 title-container">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 transition-colors duration-500 theme-text">{title}</h1>
            {isAdmin && (
                <span className="edit-pen admin-visible text-gray-500" onClick={onEditTitle} title="Edit Title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </span>
            )}
        </div>

        {/* Subtitle */}
        <div className="flex justify-center items-center gap-2 title-container">
            <p className="text-lg text-gray-600 mt-2 transition-colors duration-500 theme-text">{subtitle}</p>
             {isAdmin && (
                <span className="edit-pen admin-visible text-gray-500 mt-2" onClick={onEditSubtitle} title="Edit Subtitle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </span>
            )}
        </div>

        {/* Admin Login/Logout Button */}
        <div className="absolute top-0 right-0">
            {!isAdmin ? (
                <button onClick={onAdminLogin} className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-md hover:bg-gray-100">Admin</button>
            ) : (
                <button onClick={onAdminLogout} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700">Exit Admin</button>
            )}
        </div>
    </header>
);

export default Header;
