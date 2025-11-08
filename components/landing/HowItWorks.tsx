import React from 'react';
import { motion } from 'framer-motion';
import { DocumentPlusIcon, SparklesIcon, ChatBubbleLeftRightIcon, ScaleIcon, ShieldCheckIcon } from '../common/icons';

const HowItWorks = () => {
    const steps = [
        { icon: <ShieldCheckIcon className="w-8 h-8"/>, title: "Prevenção & Análise", description: "A IA analisa padrões e identifica alunos com risco de inadimplência, permitindo ações proativas." },
        { icon: <SparklesIcon className="w-8 h-8"/>, title: "Automação Inteligente", description: "Lembretes automáticos são enviados, e os responsáveis são direcionados para um portal de autonegociação." },
        { icon: <ChatBubbleLeftRightIcon className="w-8 h-8"/>, title: "Negociação Assistida", description: "O escritório assume os casos, usando a IA para transcrever chamadas e sugerir abordagens de negociação." },
        { icon: <ScaleIcon className="w-8 h-8"/>, title: "Resolução Jurídica", description: "Se necessário, a IA gera o rascunho da petição, e o caso avança para o pipeline judicial com um clique." },
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
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Do Alerta de Risco à Resolução: Um Ecossistema Inteligente</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-600">Nosso fluxo de trabalho cobre todas as etapas do ciclo de vida da cobrança, de forma integrada e eficiente.</p>
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