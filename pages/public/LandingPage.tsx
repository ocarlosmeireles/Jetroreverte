import React from 'react';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import Solutions from '../../components/landing/Solutions';
import Features from '../../components/landing/Features';
import Testimonials from '../../components/landing/Testimonials';
import Footer from '../../components/landing/Footer';
import HowItWorks from '../../components/landing/HowItWorks';
import CTA from '../../components/landing/CTA';
import TrustedBy from '../../components/landing/TrustedBy';
import Stats from '../../components/landing/Stats';
import { motion } from 'framer-motion';
import { PhoneIcon, MegaphoneIcon, ShieldCheckIcon } from '../../components/common/icons';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const WhatsNew = () => {
    const innovations = [
        {
            icon: <PhoneIcon className="w-8 h-8 text-primary-600" />,
            title: 'Sessão Live com IA',
            description: 'Conduza negociações por telefone com um copiloto de IA que transcreve a chamada e sugere argumentos em tempo real para aumentar suas chances de acordo.',
        },
        {
            icon: <MegaphoneIcon className="w-8 h-8 text-primary-600" />,
            title: 'Hub de Marketing para Escritórios',
            description: 'Atraia novas escolas com um CRM integrado, gerador de personas e ferramentas de conteúdo, tudo potencializado por inteligência artificial.',
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8 text-primary-600" />,
            title: 'Auditor de Contratos para Escolas',
            description: 'Receba uma análise de risco instantânea de seus contratos para fortalecer cláusulas financeiras e prevenir futuras inadimplências.',
        },
    ];

    return (
        <section className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }} className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Nossas Últimas Inovações</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-600">Estamos na vanguarda da tecnologia de cobrança, trazendo ferramentas que redefinem a eficiência.</p>
                </motion.div>

                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    {innovations.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-soft hover:shadow-soft-hover transition-all duration-300"
                        >
                            <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-primary-100 mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                            <p className="mt-2 text-neutral-600">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const LandingPage = ({ onLogin, onRegister }: LandingPageProps): React.ReactElement => {
    return (
        <div className="bg-white">
            <Header onLogin={onLogin} onRegister={onRegister} />

            <main>
                <Hero onRegister={onRegister} onLogin={onLogin} />
                <TrustedBy />
                <WhatsNew />
                <Solutions />
                <HowItWorks />
                <Stats />
                <Features />
                <Testimonials />
                <CTA onRegister={onRegister} />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;