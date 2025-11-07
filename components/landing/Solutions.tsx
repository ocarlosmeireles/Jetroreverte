
import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ScaleIcon, CheckIcon } from '../common/icons';

const Solutions = () => (
    <>
        {/* For Schools */}
        <section id="escolas" className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                        <AcademicCapIcon className="w-5 h-5 mr-2" /> Para Escolas
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Diga Adeus às Conversas Difíceis</h2>
                    <p className="mt-4 text-lg text-neutral-600">Foque na educação enquanto nossa plataforma cuida da saúde financeira. Automatize a comunicação de cobrança de forma profissional e mantenha um bom relacionamento com os pais.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Reduza a inadimplência em até 40% com nossa régua de cobrança inteligente.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Tenha visibilidade completa dos alunos inadimplentes e do status da negociação.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Envie os casos mais complexos para o escritório de advocacia com um clique.</span></li>
                    </ul>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[300px]">
                     <div className="p-2 bg-white rounded-2xl shadow-soft border border-neutral-200/80">
                        <img src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=2072&auto=format&fit=crop" alt="Dashboard" className="rounded-xl aspect-[16/10] object-cover" />
                    </div>
                </motion.div>
            </div>
        </section>

        {/* For Law Firms */}
        <section id="escritorios" className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[300px] order-last md:order-first">
                     <div className="p-2 bg-white rounded-2xl shadow-soft border border-neutral-200/80">
                        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" alt="Dashboard" className="rounded-xl aspect-[16/10] object-cover" />
                    </div>
                </motion.div>
                 <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        <ScaleIcon className="w-5 h-5 mr-2" /> Para Escritórios
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Automatize a Cobrança e Maximize a Eficiência</h2>
                    <p className="mt-4 text-lg text-neutral-600">Abandone as planilhas complexas. Gerencie todas as escolas clientes em um único painel, automatize as etapas de cobrança e gere petições iniciais com o poder da Inteligência Artificial.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Painel centralizado para gerenciar a inadimplência de múltiplas escolas.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Gere rascunhos de petições de cobrança em segundos com nossa IA.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Acompanhe o histórico de negociações e a performance da sua carteira.</span></li>
                    </ul>
                </motion.div>
            </div>
        </section>
    </>
);

export default Solutions;
