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
    key?: React.Key;
}

const FeatureCard = ({ icon, title, description, uiMock }: FeatureCardProps) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-soft hover:shadow-soft-hover transition-shadow duration-300 flex flex-col"
    >
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600">{icon}</div>
            <div>
                <h3 className="font-bold text-neutral-900">{title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{description}</p>
            </div>
        </div>
        <div className="mt-4 p-4 bg-neutral-100/70 rounded-lg flex-grow flex items-center justify-center overflow-hidden">
            {uiMock}
        </div>
    </motion.div>
);

const Features = () => {
    const [activeTab, setActiveTab] = useState('escritorios');

    const featuresData = {
        escritorios: [
            { icon: <PhoneIcon />, title: "Negociação \"Live\" com IA", description: "Receba transcrições e sugestões de argumentos em tempo real durante chamadas de negociação.", uiMock: <div className="w-full text-xs p-2 bg-white rounded-md shadow-inner"><p className="text-neutral-500">[Responsável] ...não tenho como pagar esse valor...</p><p className="mt-2 p-1.5 bg-yellow-100 text-yellow-800 rounded"><strong>Sugestão:</strong> Ofereça um parcelamento em 3x sem juros.</p></div> },
            { icon: <ScaleIcon />, title: "Gerador de Petições", description: "A IA cria o rascunho completo de petições, bastando apenas a revisão final do advogado.", uiMock: <div className="text-[10px] text-neutral-400 p-2 bg-white rounded-md shadow-inner text-left"><p className="font-bold">AÇÃO DE COBRANÇA</p><p>em face de CARLOS SILVA...</p><p>I - DOS FATOS...</p></div> },
            { icon: <DocumentChartBarIcon />, title: "Hub de Marketing", description: "Gerencie um funil de vendas (CRM), crie campanhas e gere conteúdo para atrair novas escolas.", uiMock: <div className="w-full h-full flex items-end gap-2 p-2 bg-white rounded-md shadow-inner"><div className="w-1/4 h-1/2 bg-neutral-300 rounded-t-sm"></div><div className="w-1/4 h-3/4 bg-primary-300 rounded-t-sm"></div><div className="w-1/4 h-1/3 bg-neutral-300 rounded-t-sm"></div><div className="w-1/4 h-full bg-primary-400 rounded-t-sm"></div></div> },
        ],
        escolas: [
            { icon: <ShieldCheckIcon />, title: "Auditor de Contratos", description: "Submeta contratos e receba uma análise de risco instantânea das cláusulas financeiras.", uiMock: <div className="text-center p-2 bg-white rounded-md shadow-inner"><p className="text-sm text-neutral-400">Score de Risco Contratual</p><p className="text-4xl font-bold text-green-500">85<span className="text-2xl text-neutral-300">/100</span></p><p className="text-xs text-green-600">Cláusulas seguras</p></div> },
            { icon: <LightbulbIcon />, title: "Prevenção de Inadimplência", description: "A IA identifica alunos com risco de inadimplência e sugere ações de engajamento.", uiMock: <div className="w-full text-xs p-2 bg-white rounded-md shadow-inner"><p><strong>Aluno:</strong> Beatriz Pereira</p><p className="text-red-600"><strong>Risco Futuro:</strong> 78% (Alto)</p><p className="mt-1 p-1.5 bg-blue-100 text-blue-800 rounded"><strong>Ação:</strong> Enviar comunicado sobre benefícios do débito automático.</p></div> },
            { icon: <ChatBubbleLeftRightIcon />, title: "Consultor Financeiro Virtual", description: "Converse com um chatbot especialista para tirar dúvidas sobre gestão e melhores práticas financeiras.", uiMock: <div className="w-full text-xs p-2 bg-white rounded-md shadow-inner text-left"><p className="p-1.5 bg-primary-100 rounded-lg self-end">Como posso melhorar minha política de bolsas?</p><p className="mt-2 p-1.5 bg-neutral-200 rounded-lg">Considere atrelar bolsas a um comitê de análise e exigir comprovação de renda semestral...</p></div> },
        ],
        responsaveis: [
            { icon: <ChatBubbleLeftRightIcon />, title: "Portal de Autonegociação", description: "Consulte débitos, simule parcelamentos e aceite acordos 24/7, de forma privada e sem constrangimento.", uiMock: <div className="text-center p-2 bg-white rounded-md shadow-inner"><p className="text-xs text-neutral-400">Simulação de Acordo</p><p className="text-2xl font-bold text-primary-600">6x de R$ 152,50</p><button className="text-xs bg-green-500 text-white px-3 py-1 rounded-full mt-2">Aceitar Acordo</button></div> },
            { icon: <DocumentChartBarIcon />, title: "Simulador de Orçamento", description: "Ferramenta para ajudar os responsáveis a entenderem como a parcela do acordo impacta seu orçamento.", uiMock: <div className="w-full text-xs p-2 bg-white rounded-md shadow-inner text-left"><p>Renda: <span className="font-bold">R$ 3.500</span></p><p>Despesas: <span className="font-bold">R$ 2.100</span></p><p>Parcela: <span className="font-bold text-red-600">- R$ 152,50</span></p><hr class="my-1"/><p>Sobra: <span className="font-bold text-green-600">R$ 1.247,50</span></p></div> },
            { icon: <LightbulbIcon />, title: "Assistente Financeiro IA", description: "Um chatbot amigável que tira dúvidas sobre o débito e guia o responsável para a melhor solução.", uiMock: <div className="w-full text-xs p-2 bg-white rounded-md shadow-inner text-left"><p className="p-1.5 bg-primary-100 rounded-lg">Como funcionam os juros?</p><p className="mt-2 p-1.5 bg-neutral-200 rounded-lg">Os juros são de 1% ao mês sobre o valor original, aplicados após o vencimento...</p></div> },
        ],
    };

    const tabs = [
        { id: 'escritorios', name: 'Para Escritórios' },
        { id: 'escolas', name: 'Para Escolas' },
        { id: 'responsaveis', name: 'Para Responsáveis' },
    ];

    return (
        <section id="funcionalidades" className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">O Poder da IA em Suas Mãos</h2>
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
                            transition={{ duration: 0.3 }}
                            className="grid lg:grid-cols-3 gap-8"
                        >
                            {featuresData[activeTab as keyof typeof featuresData].map((feature, i) => (
                                <FeatureCard 
                                    key={feature.title + i}
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