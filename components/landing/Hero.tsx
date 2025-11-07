
import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    onLogin: () => void;
    onRegister: () => void;
}

const Hero = ({ onLogin, onRegister }: HeroProps) => (
    <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-white to-primary-50/60 overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900"
            >
                Transforme a Inadimplência Escolar <br /> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">Receita Previsível</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 max-w-2xl mx-auto text-lg text-neutral-600"
            >
                Nossa plataforma une tecnologia e expertise jurídica para automatizar a cobrança, reduzir a inadimplência e fortalecer a saúde financeira da sua instituição de ensino.
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 flex justify-center items-center gap-4"
            >
                <motion.button onClick={onRegister} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 shadow-md shadow-primary-500/20">
                    Comece Agora
                </motion.button>
                 <motion.button onClick={onLogin} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-semibold text-primary-600 bg-white/50 rounded-full hover:bg-white border border-transparent hover:border-primary-200">
                    Acessar Plataforma
                </motion.button>
            </motion.div>
        </div>
    </section>
);

export default Hero;
