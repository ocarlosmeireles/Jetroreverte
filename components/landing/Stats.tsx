import React from 'react';
import { motion, useInView } from 'framer-motion';
import { CountUp } from './CountUp';

const stats = [
    { value: 35, suffix: '%', label: 'Redução na Inadimplência', description: 'Em média, no primeiro semestre de uso da plataforma.' },
    { value: 90, suffix: '%', label: 'de Tarefas Automatizadas', description: 'Deixando sua equipe livre para focar no que é estratégico.' },
    { value: 2, prefix: 'R$ ', suffix: 'M+', label: 'Recuperados para Escolas', description: 'Em valores totais nos últimos 12 meses através da plataforma.' },
];

const Stats = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <section ref={ref} className="py-20 sm:py-28 bg-primary-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Resultados que Falam por Si</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-200">Nossa tecnologia não é apenas sobre automação, é sobre gerar impacto real e mensurável.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
                        >
                            <div className="text-6xl font-extrabold text-white">
                                {stat.prefix}
                                {isInView && <CountUp end={stat.value} duration={2} />}
                                {stat.suffix}
                            </div>
                            <h3 className="mt-2 text-lg font-bold text-white">{stat.label}</h3>
                            <p className="mt-1 text-primary-200">{stat.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;