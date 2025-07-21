import { darkenColor } from './utils.js';

export const THEMES = {
    'Red Velvet': { primary: '#F05252', secondary: '#F87171', initial: 'RV' }, // Red
    'Irene': { primary: '#F472B6', secondary: '#FBCFE8', initial: 'I' }, // Pink
    'Seulgi': { primary: '#FBBF24', secondary: '#FCD34D', initial: 'S' }, // Amber
    'Wendy': { primary: '#60A5FA', secondary: '#93C5FD', initial: 'W' }, // Blue
    'Joy': { primary: '#34D399', secondary: '#86EFAC', initial: 'J' }, // Green
    'Yeri': { primary: '#A78BFA', secondary: '#C4B5FD', initial: 'Y' }  // Violet
};

let currentBias = null;

export function initThemes() {
    const themeSwitcher = document.getElementById('theme-switcher');
    
    Object.entries(THEMES).forEach(([name, theme]) => {
        const bubble = document.createElement('button');
        bubble.className = `w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md transition-all hover:opacity-100`;
        bubble.style.backgroundImage = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
        bubble.textContent = theme.initial;
        bubble.dataset.themeName = name;
        bubble.onclick = () => applyTheme(name);
        themeSwitcher.appendChild(bubble);
    });

    const savedTheme = localStorage.getItem('selectedTheme') || 'Red Velvet';
    applyTheme(savedTheme);
}

export function applyTheme(name) {
    const theme = THEMES[name] || THEMES['Red Velvet'];
    currentBias = name === 'Red Velvet' ? null : name;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    localStorage.setItem('selectedTheme', name);

    const controlPanel = document.getElementById('control-panel');
    const mainTitle = document.getElementById('main-title');
    const subtitle = document.getElementById('subtitle');
    
    controlPanel.classList.add('theme-bg-gradient');
    mainTitle.classList.add('theme-text');
    subtitle.classList.add('theme-text');

    document.querySelectorAll('#theme-switcher button').forEach(btn => {
        if (btn.dataset.themeName === name) {
            btn.classList.add('ring-2', 'ring-offset-2', 'theme-ring-focus');
            btn.style.borderColor = theme.primary;
            btn.classList.remove('opacity-70');
        } else {
            btn.classList.remove('ring-2', 'ring-offset-2', 'theme-ring-focus');
            btn.classList.add('opacity-70');
        }
    });
}

export function getCurrentBias() {
    return currentBias;
}
