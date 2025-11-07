
import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
    onLogin: () => void;
    onRegister: () => void;
}

const Header = ({ onLogin, onRegister }: HeaderProps) => {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80; // h-20 = 5rem = 80px
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    };
    
    return (
    <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-40 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <span className="font-bold text-xl text-neutral-800">Jetro Reverte</span>
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#escolas" onClick={(e) => handleScroll(e, 'escolas')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Para Escolas</a>
                    <a href="#escritorios" onClick={(e) => handleScroll(e, 'escritorios')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Para Escritórios</a>
                    <a href="#funcionalidades" onClick={(e) => handleScroll(e, 'funcionalidades')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Funcionalidades</a>
                </div>
                <div className="flex items-center space-x-2">
                     <motion.button onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-primary-600 rounded-full hover:bg-primary-50">
                        Fazer Login
                    </motion.button>
                     <motion.button onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 shadow-sm">
                        Criar Conta
                    </motion.button>
                </div>
            </div>
        </div>
    </header>
)};

export default Header;
