import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    LightbulbIcon,
    DocumentChartBarIcon,
    ScaleIcon,
    PhoneIcon
} from '../common/icons';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    uiMock: React.ReactNode;
    // FIX: Added an optional key to props to allow passing it when mapping over a list.
    key?: React.Key;
}

const FeatureCard = ({ icon, title, description, uiMock }: FeatureCardProps) => (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-soft hover:shadow-soft-hover transition-shadow duration-300">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600">{icon}</div>
            <div>
                <h3 className="font-bold text-neutral-900">{title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{description}</p>
            </div>
        </div>
        <div className="mt-4 p-4 bg-neutral-100/70 rounded-lg h-32 flex items-center justify-center">
            {uiMock}
        </div>
    </div>
);

const Features = () => {
    const [activeTab, setActiveTab] = useState('escritorios');

    const featuresData = {
        escritorios: [
            { icon: <PhoneIcon />, title: "Negociação \"Live\" com IA", description: "Receba transcrições em tempo real e sugestões de argumentos durante chamadas de negociação.", uiMock: <div className="text-xs text-neutral-500 text-center">"Sugestão: Ofereça um desconto de 5% nos juros para pagamento à vista."</div> },
            { icon: <ScaleIcon />, title: "Gerador de Petições", description: "A IA cria o rascunho completo de petições de cobrança, bastando apenas a revisão final do advogado.", uiMock: <div className="text-[10px] text-neutral-400">EXCELENTÍSSIMO SENHOR...</div> },
            { icon: <DocumentChartBarIcon />, title: "Hub de Marketing", description: "Gerencie um funil de vendas (CRM), crie campanhas e gere conteúdo para atrair novas escolas.", uiMock: <div className="w-full h-full flex items-end gap-1 p-2"><div className="w-1/4 h-1/2 bg-neutral-300 rounded-t-sm"></div><div className="w-1/4 h-3/4 bg-primary-300 rounded-t-sm"></div><div className="w-1/4 h-1/3 bg-neutral-300 rounded-t-sm"></div></div> },
        ],
        escolas: [
            { icon: <ShieldCheckIcon />, title: "Auditor de Contratos", description: "Submeta seus contratos de matrícula e receba uma análise de risco instantânea das cláusulas financeiras.", uiMock: <div className="text-center"><p className="text-sm text-neutral-400">Score de Risco</p><p className="text-3xl font-bold text-green-500">85</p></div> },
            { icon: <LightbulbIcon />, title: "Prevenção de Inadimplência", description: "A IA identifica alunos com risco de se tornarem inadimplentes e sugere ações de engajamento.", uiMock: <div className="text-xs text-neutral-500 text-center">Risco Futuro: 78%<br/>Sugestão: Oferecer opções de pagamento recorrente.</div> },
            { icon: <ChatBubbleLeftRightIcon />, title: "Consultor Financeiro Virtual", description: "Converse com um chatbot especialista para tirar dúvidas sobre gestão, políticas financeiras e melhores práticas.", uiMock: <div className="text-xs text-neutral-500 self-start p-1.5 bg-white rounded-md">Como posso melhorar minha política de bolsas?</div> },
        ],
        responsaveis: [
            { icon: <ChatBubbleLeftRightIcon />, title: "Portal de Autonegociação", description: "Consulte débitos, simule parcelamentos e aceite acordos 24/7, de forma privada e sem constrangimento.", uiMock: <div className="text-center"><p className="text-xs text-neutral-400">Simulação</p><p className="text-lg font-bold text-primary-600">6x de R$ 152,50</p></div> },
            { icon: <DocumentChartBarIcon />, title: "Simulador de Orçamento", description: "Uma ferramenta simples para ajudar os responsáveis a entenderem como a parcela do acordo impacta seu orçamento mensal.", uiMock: <div className="text-center"><p className="text-xs text-neutral-400">Saldo Restante</p><p className="text-lg font-bold text-green-500">R$ 347,50</p></div> },
            { icon: <LightbulbIcon />, title: "Assistente Financeiro IA", description: "Um chatbot amigável que tira dúvidas sobre o débito e guia o responsável para a melhor solução financeira.", uiMock: <div className="text-xs text-neutral-500 self-start p-1.5 bg-white rounded-md">Como funcionam os juros?</div> },
        ],
    };

    const tabs = [
        { id: 'escritorios', name: 'Para Escritórios' },
        { id: 'escolas', name: 'Para Escolas' },
        { id: 'responsaveis', name: 'Para Responsáveis' },
    ];

    return (
        <section id="funcionalidades" className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Um Ecossistema de Inteligência para Cada Necessidade</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Explore as funcionalidades de IA desenhadas para cada perfil de usuário da nossa plataforma.</p>
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="flex justify-center p-1 bg-neutral-200/70 rounded-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full relative px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
                                    activeTab === tab.id ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.span
                                        layoutId="bubble"
                                        className="absolute inset-0 z-0 bg-primary-600 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="mt-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid lg:grid-cols-3 gap-8"
                        >
                            {/* FIX: Changed from spread operator to explicit props to resolve TypeScript error. */}
                            {featuresData[activeTab as keyof typeof featuresData].map(feature => (
                                <FeatureCard 
                                    key={feature.title} 
                                    icon={feature.icon} 
                                    title={feature.title} 
                                    description={feature.description} 
                                    uiMock={feature.uiMock} 
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};

export default Features;