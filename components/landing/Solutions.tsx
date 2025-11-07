
import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ScaleIcon, ShieldCheckIcon, UsersIcon, SparklesIcon } from '../common/icons';

const SolutionCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 shadow-md">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-neutral-800">{title}</h4>
            <p className="text-sm text-neutral-600 mt-1">{description}</p>
        </div>
    </div>
);


const Solutions = () => (
    <>
        {/* For Schools */}
        <section id="escolas" className="py-20 sm:py-28 bg-neutral-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                        <AcademicCapIcon className="w-5 h-5 mr-2" /> Para Escolas
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Foco na educação, saúde financeira garantida</h2>
                    <p className="mt-4 text-lg text-neutral-600">Delegue a cobrança para uma plataforma especialista e preserve o bom relacionamento com as famílias. Tenha total visibilidade do processo sem o desgaste da negociação.</p>
                    <div className="mt-8 space-y-6">
                        <SolutionCard 
                            icon={<UsersIcon className="w-5 h-5"/>}
                            title="Visão 360° da Inadimplência"
                            description="Acompanhe em tempo real o status de cada aluno devedor em um dashboard intuitivo e completo."
                        />
                         <SolutionCard 
                            icon={<ShieldCheckIcon className="w-5 h-5"/>}
                            title="Auditor de Contratos com IA"
                            description="Analise seus contratos educacionais com nossa IA e identifique cláusulas de risco antes que virem um problema."
                        />
                         <SolutionCard 
                            icon={<SparklesIcon className="w-5 h-5"/>}
                            title="Portal Transparente para Pais"
                            description="Ofereça aos responsáveis um canal direto para consulta, negociação e pagamento dos débitos online."
                        />
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="relative h-full min-h-[300px]">
                     <div className="p-2 bg-white rounded-2xl shadow-2xl shadow-primary-500/10 border border-neutral-200/80">
                        <img src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=2072&auto=format&fit=crop" alt="Dashboard para Escolas" className="rounded-xl aspect-[16/10] object-cover" />
                    </div>
                </motion.div>
            </div>
        </section>

        {/* For Law Firms */}
        <section id="escritorios" className="py-20 sm:py-28 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="relative h-full min-h-[300px] order-last md:order-first">
                     <div className="p-2 bg-white rounded-2xl shadow-2xl shadow-primary-500/10 border border-neutral-200/80">
                        <img src="https://plus.unsplash.com/premium_photo-1661601529322-12e035079a4a?q=80&w=2070&auto=format&fit=crop" alt="Dashboard para Escritórios" className="rounded-xl aspect-[16/10] object-cover" />
                    </div>
                </motion.div>
                 <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        <ScaleIcon className="w-5 h-5 mr-2" /> Para Escritórios
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Eleve a performance da sua carteira de clientes</h2>
                    <p className="mt-4 text-lg text-neutral-600">Centralize a gestão, automatize tarefas repetitivas e use IA para acelerar processos, desde a negociação até a ação judicial, enquanto atrai novos clientes.</p>
                     <div className="mt-8 space-y-6">
                        <SolutionCard 
                            icon={<ScaleIcon className="w-5 h-5"/>}
                            title="Pipeline Jurídico Automatizado"
                            description="Gerencie todo o fluxo de cobrança, da notificação extrajudicial à geração de petições com IA, em um kanban visual."
                        />
                         <SolutionCard 
                            icon={<SparklesIcon className="w-5 h-5"/>}
                            title="Hub de Marketing e Aquisição"
                            description="Utilize IA para criar conteúdo, propostas e gerenciar um funil de vendas para atrair novas escolas."
                        />
                         <SolutionCard 
                            icon={<UsersIcon className="w-5 h-5"/>}
                            title="Gestão Centralizada de Escolas"
                            description="Monitore a saúde financeira e a performance de todas as suas escolas clientes em um único dashboard."
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    </>
);

export default Solutions;
