import React from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, ShieldCheckIcon, ScaleIcon } from '../common/icons';

const innovations = [
    {
        icon: <PhoneIcon className="w-8 h-8 text-white" />,
        title: "Co-piloto de Negociação",
        description: "Nossa IA transcreve chamadas em tempo real e sussurra os melhores argumentos no seu ouvido para fechar acordos mais rápido."
    },
    {
        icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
        title: "Prevenção Proativa",
        description: "Identificamos padrões de risco antes que a inadimplência aconteça, permitindo que as escolas ajam de forma preventiva."
    },
    {
        icon: <ScaleIcon className="w-8 h-8 text-white" />,
        title: "Automação Jurídica",
        description: "Gere rascunhos de petições iniciais em segundos, transformando horas de trabalho em minutos de revisão."
    }
];

const WhatsNew = () => (
    <section id="whatsNew" className="py-20 sm:py-28 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.5 }} 
                transition={{ duration: 0.7 }} 
                className="text-center"
            >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Inovação em Cada Etapa</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">
                    Estamos constantemente evoluindo nossa IA para trazer as ferramentas mais avançadas do mercado.
                </p>
            </motion.div>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
                {innovations.map((item, index) => (
                    <motion.div 
                        key={item.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: index * 0.15 }}
                        className="bg-primary-700 text-white p-8 rounded-2xl shadow-lg flex flex-col items-start"
                    >
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 mb-6">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="mt-2 text-primary-200 flex-grow">{item.description}</p>
                        <a href="#" className="mt-6 font-semibold text-white hover:text-primary-100 transition-colors">
                            Saiba mais &rarr;
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default WhatsNew;
