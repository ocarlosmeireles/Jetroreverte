

import React from 'react';
import { MenuIcon } from './icons';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
}

const Header = ({ pageTitle, onMenuClick }: HeaderProps): React.ReactElement => {
    return (
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-lg z-20 p-4 border-b border-neutral-200 flex items-center justify-between">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 rounded-full text-neutral-500 hover:bg-neutral-100"
                aria-label="Open menu"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-base font-bold text-neutral-800 truncate absolute left-1/2 -translate-x-1/2">{pageTitle}</h1>
            {/* Spacer to balance the title in the center */}
            <div className="w-10 h-6" />
        </header>
    );
};

export default Header;