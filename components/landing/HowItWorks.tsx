
import React from 'react';
import { motion } from 'framer-motion';
import { DocumentPlusIcon, SparklesIcon, ChatBubbleLeftRightIcon, ScaleIcon } from '../common/icons';

const HowItWorks = () => {
    const steps = [
        { icon: <DocumentPlusIcon className="w-8 h-8"/>, title: "Importação e Análise", description: "Cadastre as escolas e importe as carteiras de devedores. Nossa IA analisa o risco de cada dívida." },
        { icon: <SparklesIcon className="w-8 h-8"/>, title: "Automação Inteligente", description: "A plataforma inicia a régua de cobrança com lembretes automáticos por WhatsApp e e-mail." },
        { icon: <ChatBubbleLeftRightIcon className="w-8 h-8"/>, title: "Portal de Autonegociação", description: "Pais e responsáveis acessam um portal para consultar, simular parcelamentos e quitar débitos online." },
        { icon: <ScaleIcon className="w-8 h-8"/>, title: "Ação Jurídica", description: "Casos complexos são escalados para o escritório com um clique, com uma petição pré-gerada por IA." },
    ];

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <section className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Do Débito à Recuperação em 4 Passos</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Um fluxo de trabalho inteligente para maximizar a eficiência.</p>
                </div>

                <div className="relative">
                    {/* The connecting line - visible on larger screens */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 transform -translate-y-4"></div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10"
                    >
                        {steps.map((step, index) => (
                            <motion.div key={index} variants={itemVariants} className="text-center relative">
                                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 text-primary-600 mx-auto mb-5 border-4 border-white shadow-md relative z-10">
                                    {step.icon}
                                </div>
                                <h3 className="font-bold text-lg text-neutral-800">{step.title}</h3>
                                <p className="mt-2 text-neutral-600 text-sm">{step.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
