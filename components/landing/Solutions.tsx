
import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ScaleIcon, CheckCircleIcon } from '../common/icons';

const BenefitItem = ({ text }: { text: string }) => (
    <li className="flex items-start">
        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
        <span className="text-neutral-700">{text}</span>
    </li>
);

const Solutions = () => (
    <section id="solutions" className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }} className="text-center">
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Uma Solução Completa para:</h2>
                 <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-600">Projetado para fortalecer a parceria entre escolas e escritórios de advocacia, resolvendo as dores de cada um.</p>
            </motion.div>

            <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                {/* For Schools */}
                <motion.div id="escolas" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="flex flex-col">
                    <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex-grow">
                        <div className="flex items-center gap-4 mb-6">
                            <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=300&auto=format&fit=crop" alt="Diretora escolar em corredor da escola" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                            <div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800 shadow-sm mb-2">
                                    <AcademicCapIcon className="w-5 h-5 mr-2" /> Para Escolas
                                </span>
                                <h3 className="text-2xl font-bold text-neutral-900">Foque na educação, nós cuidamos da saúde financeira.</h3>
                            </div>
                        </div>
                        <ul className="mt-6 space-y-4">
                            <BenefitItem text="Reduza a inadimplência em até 35% com prevenção e automação." />
                            <BenefitItem text="Preserve o bom relacionamento com pais e responsáveis." />
                            <BenefitItem text="Tenha total visibilidade do processo de cobrança em tempo real." />
                            <BenefitItem text="Receba insights de IA para melhorar seus contratos e políticas financeiras." />
                        </ul>
                    </div>
                </motion.div>
                
                {/* For Law Firms */}
                <motion.div id="escritorios" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="flex flex-col">
                     <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex-grow">
                        <div className="flex items-center gap-4 mb-6">
                             <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=300&auto=format&fit=crop" alt="Advogado moderno trabalhando em notebook" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                            <div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 shadow-sm mb-2">
                                    <ScaleIcon className="w-5 h-5 mr-2" /> Para Escritórios
                                </span>
                                <h3 className="text-2xl font-bold text-neutral-900">Escale sua operação com automação e IA.</h3>
                            </div>
                        </div>
                         <ul className="mt-6 space-y-4">
                            <BenefitItem text="Automatize até 90% das tarefas manuais de cobrança e negociação." />
                            <BenefitItem text="Aumente sua receita com ferramentas de IA para marketing e petições." />
                            <BenefitItem text="Gerencie toda sua carteira de clientes em um único dashboard." />
                            <BenefitItem text="Ofereça um diferencial competitivo e de alto valor agregado para as escolas." />
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

export default Solutions;
