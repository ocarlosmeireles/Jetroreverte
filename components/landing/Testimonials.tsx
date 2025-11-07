
import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const testimonials = [
        { quote: "A Jetro Reverte mudou nossa gestão financeira. Reduzimos a inadimplência em 35% no primeiro semestre e, o mais importante, sem desgastar o relacionamento com os pais.", name: "Ana Clara Matos", title: "Diretora Financeira, Colégio Aprender Mais" },
        { quote: "Como escritório, precisávamos de uma ferramenta que centralizasse as informações das escolas. A automação e a geração de petições com IA nos deram uma eficiência que não tínhamos antes.", name: "Dr. Ricardo Borges", title: "Sócio, Advocacia Foco" }
    ];
    return (
        <section className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">O que nossos parceiros dizem</h2>
                </div>
                <div className="mt-16 grid lg:grid-cols-2 gap-8">
                    {testimonials.map(t => (
                        <motion.figure key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="p-8 bg-white rounded-2xl shadow-soft border border-neutral-200/60">
                            <blockquote className="text-neutral-700 text-lg">
                                <p>“{t.quote}”</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
                                <div>
                                    <div className="font-semibold text-neutral-900">{t.name}</div>
                                    <div className="text-neutral-600">{t.title}</div>
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
