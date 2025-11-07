
import React from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '../common/icons';

const Testimonials = () => {
    const testimonials = [
        { quote: "A Jetro Reverte mudou nossa gestão financeira. Reduzimos a inadimplência em 35% no primeiro semestre e, o mais importante, sem desgastar o relacionamento com os pais.", name: "Ana Clara Matos", title: "Diretora Financeira, Colégio Aprender Mais" },
        { quote: "Como escritório, precisávamos de uma ferramenta que centralizasse as informações das escolas. A automação e a geração de petições com IA nos deram uma eficiência que não tínhamos antes.", name: "Dr. Ricardo Borges", title: "Sócio, Advocacia Foco" },
        { quote: "Foi a primeira vez que consegui negociar uma dívida escolar de forma tão simples e sem constrangimento. O portal é claro e o assistente virtual ajudou a tirar minhas dúvidas na hora.", name: "Carlos Silva", title: "Pai de Aluno" }
    ];
    return (
        <section className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">O que nossos parceiros dizem</h2>
                </div>
                <div className="mt-16 grid lg:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.figure key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, delay: i * 0.1 }} className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                            <blockquote className="text-neutral-700">
                                <p>“{t.quote}”</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-4">
                                <UserCircleIcon className="w-12 h-12 text-neutral-300"/>
                                <div>
                                    <div className="font-semibold text-neutral-900">{t.name}</div>
                                    <div className="text-neutral-600 text-sm">{t.title}</div>
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
