
import React from 'react';

const Footer = () => {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    };

    return (
        <footer className="bg-neutral-900 text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-8 md:space-y-0">
                    <div>
                        <p className="text-xl font-bold text-white">Jetro Reverte</p>
                        <p className="mt-2 text-neutral-400">Simplificando a gestão financeira educacional.</p>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-300">
                        <a href="#escolas" onClick={(e) => handleScroll(e, 'escolas')} className="hover:text-white transition-colors">Para Escolas</a>
                        <a href="#escritorios" onClick={(e) => handleScroll(e, 'escritorios')} className="hover:text-white transition-colors">Para Escritórios</a>
                        <a href="#funcionalidades" onClick={(e) => handleScroll(e, 'funcionalidades')} className="hover:text-white transition-colors">Funcionalidades</a>
                    </nav>
                </div>
                <div className="mt-12 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
                    &copy; {new Date().getFullYear()} Jetro Reverte. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
