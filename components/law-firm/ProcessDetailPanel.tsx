



import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { JudicialProcess, ProcessEvent } from '../../types';
import Button from '../common/Button';
import { XIcon, SparklesIcon, GavelIcon, DocumentTextIcon, CalendarDaysIcon } from '../common/icons';
import { formatDate } from '../../utils/formatters';

interface ProcessDetailPanelProps {
    // FIX: Renamed `process` to `judicialProcess` to avoid shadowing the global `process` object.
    judicialProcess: JudicialProcess;
    onClose: () => void;
}

const TimelineIcon = ({ type }: { type: ProcessEvent['type'] }) => {
    const iconMap: Record<ProcessEvent['type'], ReactNode> = {
        'FILING': <DocumentTextIcon className="w-5 h-5 text-primary-600" />,
        'DECISION': <GavelIcon className="w-5 h-5 text-yellow-600" />,
        'HEARING': <CalendarDaysIcon className="w-5 h-5 text-green-600" />,
        'UPDATE': <SparklesIcon className="w-5 h-5 text-neutral-500" />,
    };
    return <div className="absolute top-0 -left-4 w-8 h-8 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center">{iconMap[type]}</div>;
};

const ProcessDetailPanel = ({ judicialProcess, onClose }: ProcessDetailPanelProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiAction, setAiAction] = useState('');
    const [error, setError] = useState('');

    const handleGenerateSummary = async () => {
        setIsAnalyzing(true);
        setAiSummary('');
        setAiAction('');
        setError('');

        const timelineText = judicialProcess.events.map(e => `- ${formatDate(e.date)} (${e.type}): ${e.title} - ${e.description}`).join('\n');

        const prompt = `
            Aja como um advogado sênior especialista em processos cíveis. Analise o seguinte andamento processual e forneça um resumo e uma recomendação.

            **Dados do Processo:**
            - Partes: ${judicialProcess.schoolName} (Autor) vs. (Réu)
            - Nº do Processo: ${judicialProcess.processNumber}
            - Status Atual no Sistema: ${judicialProcess.status}

            **Linha do Tempo de Eventos:**
            ${timelineText}

            **Sua Tarefa:**
            Gere uma análise concisa em formato JSON com duas chaves:
            1.  "currentStatus": Um resumo em um parágrafo curto sobre a situação atual do processo.
            2.  "recommendedAction": Qual é a próxima ação estratégica que o advogado do autor deve tomar? Seja específico (ex: "Juntar petição de réplica", "Aguardar o prazo para o réu", "Solicitar o julgamento antecipado da lide").
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            currentStatus: { type: Type.STRING },
                            recommendedAction: { type: Type.STRING }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text);
            setAiSummary(result.currentStatus);
            setAiAction(result.recommendedAction);
        } catch (err) {
            console.error("Error generating AI analysis:", err);
            setError('Falha ao gerar análise. Verifique sua chave de API e tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <motion.div
            key={judicialProcess.id}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0 bg-neutral-50 border-l border-neutral-200/80 flex flex-col h-full"
        >
            <header className="p-4 border-b border-neutral-200 flex justify-between items-start flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-neutral-800">Dossiê do Processo</h2>
                    <p className="text-sm text-neutral-500 font-mono">{judicialProcess.processNumber}</p>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-200/60">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI Analysis Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="w-6 h-6 text-primary-500" />
                        <h3 className="text-lg font-semibold text-neutral-800">Análise Estratégica</h3>
                    </div>
                    {(!aiSummary && !isAnalyzing) && (
                         <Button onClick={handleGenerateSummary} isLoading={isAnalyzing} className="w-full">
                            Gerar Resumo e Próximo Passo com IA
                        </Button>
                    )}
                    {isAnalyzing && <p className="text-sm text-center text-neutral-500">Analisando o processo...</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {(aiSummary || aiAction) && (
                        <div className="space-y-3 text-sm p-4 bg-primary-50/50 border border-primary-100 rounded-lg">
                            <div>
                                <h4 className="font-semibold text-primary-800">Status Atual (IA):</h4>
                                <p className="text-neutral-700 mt-1">{aiSummary}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-primary-800">Ação Recomendada (IA):</h4>
                                <p className="text-neutral-700 mt-1">{aiAction}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Timeline Section */}
                <section>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Linha do Tempo do Processo</h3>
                    <div className="relative border-l-2 border-neutral-200 ml-4">
                        {judicialProcess.events.map(event => (
                            <div key={event.id} className="mb-8 pl-10">
                                <TimelineIcon type={event.type} />
                                <p className="text-xs text-neutral-500">{formatDate(event.date)}</p>
                                <h4 className="font-semibold text-sm text-neutral-800">{event.title}</h4>
                                <p className="text-sm text-neutral-600">{event.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                 {/* Documents Section */}
                <section>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">Repositório de Documentos</h3>
                    <div className="space-y-2">
                        {judicialProcess.events.flatMap(e => e.documents || []).map((doc, i) => (
                             <div key={i} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                                    <span className="font-medium">{doc.name}</span>
                                </div>
                                <Button size="sm" variant="secondary">Visualizar</Button>
                            </div>
                        ))}
                         <Button variant="secondary" className="w-full mt-2">Adicionar Documento</Button>
                    </div>
                </section>
            </div>
            <footer className="p-4 border-t bg-white flex-shrink-0">
                <Button className="w-full">Registrar Andamento</Button>
            </footer>
        </motion.div>
    );
};

export default ProcessDetailPanel;