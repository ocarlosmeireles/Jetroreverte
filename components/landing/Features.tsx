
import React from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    LightbulbIcon,
    DocumentChartBarIcon,
    UsersIcon,
    MegaphoneIcon,
    BriefcaseIcon,
    DashboardIcon,
} from '../common/icons';

const Features = () => {
    const features = [
        { icon: <ShieldCheckIcon />, title: "Análise de Risco com IA", description: "Nossa IA analisa o perfil de cada dívida e prevê a probabilidade de acordo, otimizando sua estratégia." },
        { icon: <ChatBubbleLeftRightIcon />, title: "Portal do Responsável", description: "Empodere os pais com um portal de autoatendimento para negociação e pagamento, reduzindo o atrito." },
        { icon: <LightbulbIcon />, title: "Geração de Petições com IA", description: "Para casos judiciais, nossa IA gera o rascunho da petição inicial, economizando horas de trabalho." },
        { icon: <DocumentChartBarIcon />, title: "Relatórios Completos", description: "Acompanhe a evolução da inadimplência, valores recuperados e comissões em tempo real." },
        { icon: <MegaphoneIcon />, title: "Hub de Marketing Jurídico", description: "Gere conteúdo, propostas e gerencie um funil de vendas para atrair novas escolas clientes." },
        { icon: <BriefcaseIcon />, title: "Kanban de Processos Judiciais", description: "Visualize e gerencie o andamento de todos os processos judiciais de forma simples e intuitiva." },
        { icon: <DashboardIcon />, title: "Dashboards Unificados", description: "Tanto escolas quanto escritórios têm visões claras e adaptadas às suas necessidades específicas." },
        { icon: <UsersIcon />, title: "Gestão Multi-Escolas", description: "Escritórios podem gerenciar a carteira de diversas instituições de ensino em um só lugar." },
    ];
    return (
        <section id="funcionalidades" className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">O Poder da Nossa Tecnologia</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Recursos poderosos para simplificar a gestão de cobranças educacionais.</p>
                </div>
                <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {features.map((feature, i) => (
                        <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: i * 0.05 }} >
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 text-primary-600">{React.cloneElement(feature.icon, { className: 'w-6 h-6' })}</div>
                            <h3 className="mt-5 text-lg font-semibold text-neutral-900">{feature.title}</h3>
                            <p className="mt-2 text-base text-neutral-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
