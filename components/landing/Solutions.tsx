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
    <section id="solutions" className="py-20 sm:py-28 bg-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }} className="text-center">
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Uma Plataforma, Múltiplos Benefícios</h2>
                 <p className="mt-4 max-w-3xl mx-auto text-lg text-neutral-600">Projetado para fortalecer a parceria entre escolas e escritórios de advocacia, resolvendo as dores de cada um.</p>
            </motion.div>

            <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* For Schools */}
                <motion.div id="escolas" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop" alt="Diretora de escola" className="rounded-2xl w-full h-64 object-cover" />
                        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800 shadow-sm">
                            <AcademicCapIcon className="w-5 h-5 mr-2" /> Para Escolas
                        </span>
                    </div>
                    <div className="bg-white p-8 rounded-b-2xl border-x border-b border-neutral-200/80 shadow-soft -mt-2">
                        <h3 className="text-2xl font-bold text-neutral-900">Foque na educação, nós cuidamos da saúde financeira</h3>
                        <ul className="mt-6 space-y-4">
                            <BenefitItem text="Reduza a inadimplência com prevenção e automação." />
                            <BenefitItem text="Preserve o bom relacionamento com pais e responsáveis." />
                            <BenefitItem text="Tenha total visibilidade do processo de cobrança." />
                        </ul>
                    </div>
                </motion.div>
                
                {/* For Law Firms */}
                <motion.div id="escritorios" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
                     <div className="relative">
                        <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=300&auto=format&fit=crop" alt="Advogado em escritório" className="rounded-2xl w-full h-64 object-cover" />
                        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 shadow-sm">
                            <ScaleIcon className="w-5 h-5 mr-2" /> Para Escritórios
                        </span>
                    </div>
                    <div className="bg-white p-8 rounded-b-2xl border-x border-b border-neutral-200/80 shadow-soft -mt-2">
                        <h3 className="text-2xl font-bold text-neutral-900">Escale sua operação com automação e IA</h3>
                         <ul className="mt-6 space-y-4">
                            <BenefitItem text="Automatize até 90% das tarefas manuais de cobrança." />
                            <BenefitItem text="Aumente sua receita com ferramentas de IA para marketing e petições." />
                            <BenefitItem text="Gerencie toda sua carteira de clientes em um único dashboard." />
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

export default Solutions;