import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ChatBubbleLeftRightIcon, ScaleIcon, ShieldCheckIcon } from '../common/icons';

const HowItWorks = () => {
    const steps = [
        { icon: <ShieldCheckIcon className="w-8 h-8"/>, title: "Prevenção & Análise de Risco", description: "A IA analisa padrões e identifica alunos com risco de inadimplência, permitindo ações proativas antes do vencimento." },
        { icon: <SparklesIcon className="w-8 h-8"/>, title: "Automação Inteligente", description: "Lembretes e notificações são enviados automaticamente. Responsáveis podem negociar em um portal 24/7." },
        { icon: <ChatBubbleLeftRightIcon className="w-8 h-8"/>, title: "Negociação Assistida", description: "O escritório assume os casos complexos, usando a IA para transcrever chamadas e sugerir as melhores abordagens." },
        { icon: <ScaleIcon className="w-8 h-8"/>, title: "Resolução Jurídica", description: "Para casos extremos, a IA gera o rascunho da petição, e o processo avança para o pipeline judicial com um clique." },
    ];

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.3 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    return (
        <section className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Nosso Ecossistema: Da Prevenção à Resolução</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-600">Nossa jornada de trabalho integrada garante eficiência em cada etapa do ciclo de vida da cobrança.</p>
                </div>

                <div className="max-w-3xl mx-auto mt-16">
                     <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="relative"
                    >
                         {/* The connecting line */}
                        <div className="absolute top-10 left-10 w-0.5 h-[calc(100%-5rem)] bg-neutral-200"></div>

                        {steps.map((step, index) => (
                            <motion.div key={index} variants={itemVariants} className="relative pl-28 pb-12">
                                <div className="absolute top-0 left-0 flex items-center justify-center w-20 h-20 rounded-full bg-white text-primary-600 shadow-md border-4 border-neutral-50 z-10">
                                    {step.icon}
                                </div>
                                <div className="pt-5">
                                    <h3 className="font-bold text-xl text-neutral-800">{step.title}</h3>
                                    <p className="mt-2 text-neutral-600">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;