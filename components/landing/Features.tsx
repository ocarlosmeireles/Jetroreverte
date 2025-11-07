
import React from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    LightbulbIcon,
    DocumentChartBarIcon,
} from '../common/icons';

const Features = () => {
    const features = [
        { icon: <ShieldCheckIcon />, title: "Análise de Risco com IA", description: "Nossa IA analisa o perfil de cada dívida e prevê a probabilidade de acordo, otimizando sua estratégia." },
        { icon: <ChatBubbleLeftRightIcon />, title: "Comunicação Automatizada", description: "Crie réguas de cobrança personalizadas com envios automáticos de lembretes por WhatsApp e E-mail." },
        { icon: <LightbulbIcon />, title: "Geração de Petições (IA)", description: "Para casos judiciais, nossa IA gera o rascunho da petição inicial, economizando horas de trabalho." },
        { icon: <DocumentChartBarIcon />, title: "Relatórios Completos", description: "Acompanhe a evolução da inadimplência, valores recuperados e comissões em tempo real." },
    ];
    return (
        <section id="funcionalidades" className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Uma Plataforma, Múltiplas Soluções</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Recursos poderosos para simplificar a gestão de cobranças educacionais.</p>
                </div>
                <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: i * 0.1 }} >
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600">{React.cloneElement(feature.icon, { className: 'w-6 h-6' })}</div>
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
