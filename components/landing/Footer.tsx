
import React from 'react';

const Footer = () => (
    <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl font-bold text-white/80">Jetro Reverte</p>
            <p className="mt-4 text-neutral-400">Simplificando a gestão financeira educacional.</p>
            <p className="mt-6 text-sm text-neutral-500">&copy; {new Date().getFullYear()} Jetro Reverte. Todos os direitos reservados.</p>
        </div>
    </footer>
);

export default Footer;
