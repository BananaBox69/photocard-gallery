import React from 'react';

/**
 * Renders the theme selection bubbles.
 */
const ThemeSwitcher = ({ themes, currentTheme, setCurrentTheme }) => (
    <div className="mb-8 text-center">
        <h2 className="font-bold text-gray-700 text-xl mb-2">Choose your bias!</h2>
        <div className="flex justify-center items-center gap-3">
            {Object.entries(themes).map(([name, theme]) => (
                <button
                    key={name}
                    onClick={() => setCurrentTheme(name)}
                    // Apply dynamic classes for the selected theme
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md transition-all hover:opacity-100 ${name !== currentTheme ? 'opacity-70' : 'ring-2 ring-offset-2 theme-ring-focus'}`}
                    style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                    title={name}
                >
                    {theme.initial}
                </button>
            ))}
        </div>
    </div>
);

export default ThemeSwitcher;
