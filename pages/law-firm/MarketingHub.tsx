
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, XIcon } from '../../components/common/icons';

const AiContentGenerator = () => {
    const [contentType, setContentType] = useState('Email de Prospecção');
    const [painPoint, setPainPoint] = useState('Inadimplência alta');
    const [tone, setTone] = useState('Profissional');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedContent('');

        const prompt = `
            Aja como um especialista em marketing para um escritório de advocacia que oferece uma plataforma de cobrança educacional.
            Sua tarefa é criar um(a) "${contentType}" com um tom "${tone}".
            O texto deve focar em resolver a seguinte dor da escola cliente: "${painPoint}".
            O objetivo é captar o interesse do diretor ou gestor financeiro da escola, mostrando como nossa solução pode ajudá-los.
            O texto deve ser conciso, profissional e persuasivo.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setGeneratedContent(response.text);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar conteúdo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        alert('Conteúdo copiado!');
    };

    const formRowClass = "grid grid-cols-1 sm:grid-cols-3 gap-4 items-end";
    const labelClass = "block text-sm font-medium text-neutral-700 mb-1";
    const selectClass = "w-full p-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white";

    return (
        <Card delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Gerador de Conteúdo com IA</h3>
            </div>
            <div className="space-y-4">
                <div className={formRowClass}>
                    <div>
                        <label className={labelClass}>Tipo de Conteúdo</label>
                        <select className={selectClass} value={contentType} onChange={e => setContentType(e.target.value)}>
                            <option>Email de Prospecção</option>
                            <option>Post para LinkedIn</option>
                            <option>Script de Ligação</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Ponto de Dor</label>
                        <select className={selectClass} value={painPoint} onChange={e => setPainPoint(e.target.value)}>
                            <option>Inadimplência alta</option>
                            <option>Equipe sobrecarregada</option>
                            <option>Relacionamento com pais</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Tom</label>
                        <select className={selectClass} value={tone} onChange={e => setTone(e.target.value)}>
                            <option>Profissional</option>
                            <option>Urgente</option>
                            <option>Educativo</option>
                        </select>
                    </div>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">Gerar Conteúdo</Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {(isLoading || generatedContent) && (
                     <div className="mt-4">
                        <textarea
                            readOnly
                            value={isLoading ? "Gerando, por favor aguarde..." : generatedContent}
                            className="w-full h-48 p-3 border border-neutral-200 rounded-lg bg-neutral-50"
                        />
                        <Button onClick={handleCopy} variant="secondary" size="sm" className="mt-2" disabled={!generatedContent}>Copiar Texto</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ProposalGenerator = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        setProposal('');

        const prompt = `
            Elabore um modelo de proposta comercial detalhada para o "Escritório de Advocacia Jetro Reverte", que oferece uma plataforma de software para gestão e recuperação de créditos educacionais para escolas particulares.

            A proposta deve conter as seguintes seções bem definidas:
            1.  **Introdução:** Apresente o escritório e o propósito da proposta.
            2.  **O Desafio da Inadimplência Escolar:** Descreva as dores que as escolas enfrentam (impacto no fluxo de caixa, desgaste da equipe, dano no relacionamento com os pais).
            3.  **Nossa Solução: A Plataforma Jetro Reverte:** Apresente a solução como uma combinação de tecnologia (software) e expertise jurídica. Destaque os benefícios: automação, centralização, portal para os pais, e redução da inadimplência.
            4.  **Como Funciona:** Um passo a passo simples (Ex: Cadastro da escola > Importação de débitos > Automação da cobrança > Ação jurídica como último recurso).
            5.  **Planos e Investimento:** Crie dois planos fictícios, "Plano Essencial" e "Plano Pro", com preços e features diferentes. Inclua também a comissão sobre o valor recuperado.
            6.  **Próximos Passos:** Indique como a escola pode contratar o serviço.
        `;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setProposal(response.text);
        } catch (err) {
            console.error(err);
            setProposal('Erro ao gerar proposta. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card delay={0.2}>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Gerador de Proposta Comercial</h3>
                <p className="text-sm text-neutral-600 mb-4">Crie um rascunho completo de uma proposta comercial para enviar a escolas em potencial.</p>
                <Button onClick={handleGenerate}>Gerar Proposta com IA</Button>
            </Card>
            <AnimatePresence>
                {isModalOpen && <ProposalModal proposal={proposal} isLoading={isLoading} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

const ProposalModal = ({ proposal, isLoading, onClose }: { proposal: string, isLoading: boolean, onClose: () => void }) => {
    
    const handleCopy = () => {
        navigator.clipboard.writeText(proposal);
        alert('Proposta copiada!');
    };

    return (
         <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Rascunho da Proposta Comercial</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100"><XIcon /></button>
                </header>
                <div className="overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center">Carregando...</div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm font-sans bg-neutral-50 p-4 rounded-lg border">{proposal}</pre>
                    )}
                </div>
                <footer className="p-6 border-t bg-neutral-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                    <Button onClick={handleCopy} disabled={isLoading}>Copiar Texto</Button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

const LeadPipeline = () => {
    const leads = [
        { name: 'Colégio Alfa', status: 'Prospect' },
        { name: 'Escola Beta Gênesis', status: 'Prospect' },
        { name: 'Instituto Delta', status: 'Contato Inicial' },
        { name: 'Centro Educacional Gama', status: 'Negociação' },
    ];
    
    const columns = ['Prospect', 'Contato Inicial', 'Negociação', 'Fechado'];

    return (
        <Card className="lg:col-span-2" delay={0.3}>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Pipeline de Leads (Exemplo)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {columns.map(col => (
                    <div key={col} className="bg-neutral-100/70 rounded-lg p-3">
                        <h4 className="font-bold text-sm text-neutral-600 mb-3 text-center">{col}</h4>
                        <div className="space-y-2">
                            {leads.filter(l => l.status === col).map(lead => (
                                <div key={lead.name} className="bg-white p-3 rounded-md shadow-sm border text-sm">
                                    {lead.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const MarketingHub = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AiContentGenerator />
                <ProposalGenerator />
            </div>
            <LeadPipeline />
        </div>
    );
};

export default MarketingHub;