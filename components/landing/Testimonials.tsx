import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const testimonials = [
        { 
            quote: "A Jetro Reverte mudou nossa gestão financeira. Reduzimos a inadimplência em 35% no primeiro semestre e, o mais importante, sem desgastar o relacionamento com os pais.", 
            name: "Ana Clara Matos", 
            title: "Diretora Financeira, Colégio Aprender Mais",
            imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=facearea&facepad=2&w=256&h=256" 
        },
        { 
            quote: "Como escritório, precisávamos de uma ferramenta que centralizasse as informações das escolas. A automação e a geração de petições com IA nos deram uma eficiência que não tínhamos antes.", 
            name: "Dr. Ricardo Borges", 
            title: "Sócio, Advocacia Foco",
            imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=facearea&facepad=2&w=256&h=256"
        },
        { 
            quote: "Foi a primeira vez que consegui negociar uma dívida escolar de forma tão simples e sem constrangimento. O portal é claro e o assistente virtual ajudou a tirar minhas dúvidas na hora.", 
            name: "Carlos Silva", 
            title: "Pai de Aluno",
            imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=facearea&facepad=2&w=256&h=256" 
        }
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
                                <img className="w-12 h-12 rounded-full object-cover" src={t.imgSrc} alt={t.name} />
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