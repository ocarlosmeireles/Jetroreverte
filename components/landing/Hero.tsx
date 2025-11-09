import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

interface HeroProps {
    onRegister: () => void;
    onLogin: () => void;
}

const Hero = ({ onRegister, onLogin }: HeroProps) => {
    const handleScroll = (targetId: string) => {
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
        <section className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-neutral-50 overflow-hidden">
             <div className="absolute inset-0 bg-grid-neutral-200/40 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
            <div className="absolute top-0 left-0 -translate-x-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-60 animate-pulse [animation-delay:2s]"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                     <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight"
                    >
                        A Inteligência que Transforma <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Inadimplência</span> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-500 to-secondary-600">Receita</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="mt-6 text-lg text-neutral-600"
                    >
                        Nossa plataforma une escolas e escritórios em um ecossistema que previne a inadimplência e automatiza a recuperação de créditos com IA.
                    </motion.p>
                </div>
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                    className="relative max-w-lg mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button onClick={() => handleScroll('escolas')} size="lg" variant="primary">Soluções para Escolas</Button>
                    <Button onClick={() => handleScroll('escritorios')} size="lg" variant="secondary">Soluções para Escritórios</Button>
                </motion.div>
            </div>
             <style>{`
                .bg-grid-neutral-200\\/40 {
                    background-image:
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </section>
    );
}

export default Hero;