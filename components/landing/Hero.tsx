
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

interface HeroProps {
    onRegister: () => void;
}

const Hero = ({ onRegister }: HeroProps) => (
    <section className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-gradient-to-b from-white via-primary-50/30 to-white overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight"
            >
                Transforme a Inadimplência Escolar <br /> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">Receita Previsível</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="mt-6 max-w-3xl mx-auto text-lg text-neutral-600"
            >
                A única plataforma que integra automação por IA, portal de negociação para pais e gestão jurídica completa para otimizar a recuperação de créditos educacionais.
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="mt-10 flex justify-center items-center"
            >
                <Button onClick={onRegister} size="lg">
                    Comece a Recuperar Créditos Agora
                </Button>
            </motion.div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="relative mt-16 sm:mt-20 max-w-5xl mx-auto px-4"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent z-10"></div>
            <div className="p-2 bg-white rounded-2xl shadow-2xl shadow-primary-500/10 border border-neutral-200/50">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" alt="Dashboard da plataforma Jetro Reverte" className="rounded-xl aspect-[16/9] object-cover" />
            </div>
        </motion.div>
    </section>
);

export default Hero;
