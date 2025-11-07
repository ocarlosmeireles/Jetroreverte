
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { demoJudicialProcesses } from '../../services/demoData';
import { JudicialProcess, JudicialProcessStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon } from '../../components/common/icons';
import { formatDate } from '../../utils/formatters';

const columns: { id: JudicialProcessStatus; title: string }[] = [
    { id: JudicialProcessStatus.PROTOCOLADO, title: 'Protocolado' },
    { id: JudicialProcessStatus.AGUARDANDO_CITACAO, title: 'Aguardando Citação' },
    { id: JudicialProcessStatus.CONTESTACAO, title: 'Contestação' },
    { id: JudicialProcessStatus.SENTENCA, title: 'Sentença' },
    { id: JudicialProcessStatus.RECURSO, title: 'Recurso' },
];

// FIX: Added an optional `key` prop to allow the component to be used in a list.
interface ProcessCardProps {
    process: JudicialProcess;
    key?: React.Key;
}

const ProcessCard = ({ process }: ProcessCardProps) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm mb-3"
    >
        <h4 className="font-bold text-sm text-neutral-800">{process.studentName}</h4>
        <p className="text-xs text-neutral-500">{process.schoolName}</p>
        <p className="text-xs text-neutral-400 font-mono mt-1">{process.processNumber}</p>
        <p className="text-xs text-neutral-500 mt-2">Última att: {formatDate(process.lastUpdate)}</p>
    </motion.div>
);

const AiAnalyzer = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<{ summary: string[], nextStep: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError('');
        setResult(null);

        const prompt = `
            Você é um assistente jurídico sênior. Sua tarefa é analisar o texto de um despacho ou decisão judicial e fornecer um resumo claro e uma sugestão de próximo passo.

            O texto para análise é:
            ---
            ${text}
            ---

            Por favor, retorne sua análise com o seguinte formato:
            1.  **Resumo dos Pontos Principais:** Liste em 3 a 5 bullet points os pontos mais cruciais da decisão.
            2.  **Próxima Ação Recomendada:** Em um parágrafo, sugira qual deve ser a próxima ação processual para o autor da ação, explicando o porquê.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            
            const responseText = response.text;
            const summaryMatch = responseText.match(/\*\*Resumo dos Pontos Principais:\*\*(.*?)\*\*Próxima Ação Recomendada:\*\*/s);
            const nextStepMatch = responseText.match(/\*\*Próxima Ação Recomendada:\*\*(.*)/s);

            if (summaryMatch && nextStepMatch) {
                const summaryPoints = summaryMatch[1].trim().split(/[\n-]\s+/).filter(Boolean);
                const nextStepText = nextStepMatch[1].trim();
                setResult({ summary: summaryPoints, nextStep: nextStepText });
            } else {
                // Fallback if formatting is unexpected
                setResult({ summary: [], nextStep: responseText });
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao analisar o texto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Analisador de Despachos com IA</h3>
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full p-3 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition bg-neutral-50"
                placeholder="Cole aqui o texto do despacho ou da decisão judicial..."
            />
            <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!text.trim()} className="mt-4 w-full">Analisar Texto</Button>
            
            <AnimatePresence>
            {(isLoading || result || error) && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                >
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        {isLoading && <p className="text-center text-neutral-600">Analisando documento...</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        {result && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-neutral-800">Resumo dos Pontos Principais:</h4>
                                    <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-neutral-700">
                                        {result.summary.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-800">Próxima Ação Recomendada:</h4>
                                    <p className="mt-2 text-sm text-neutral-700">{result.nextStep}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </Card>
    );
}

const JudicialProcessDashboard = (): React.ReactElement => {
    const processes = useMemo(() => demoJudicialProcesses, []);

    return (
        <div className="space-y-8">
            <Card noPadding>
                <div className="p-4 sm:p-6 border-b border-neutral-200">
                     <h3 className="text-lg font-semibold text-neutral-800">Kanban de Processos</h3>
                </div>
                 <div className="flex overflow-x-auto p-4 space-x-4 bg-neutral-50/70">
                    {columns.map(column => {
                        const columnProcesses = processes.filter(p => p.status === column.id);
                        return (
                            <div key={column.id} className="w-72 flex-shrink-0">
                                <h4 className="font-semibold text-sm text-neutral-700 mb-3 px-2 flex justify-between items-center">
                                    <span>{column.title}</span>
                                    <span className="text-xs text-neutral-400 bg-neutral-200 rounded-full px-2 py-0.5">{columnProcesses.length}</span>
                                </h4>
                                <div className="space-y-2 h-full bg-neutral-100/60 p-2 rounded-lg min-h-[200px]">
                                    <AnimatePresence>
                                        {columnProcesses.map(process => (
                                            <ProcessCard key={process.id} process={process} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <AiAnalyzer />
        </div>
    );
};

export default JudicialProcessDashboard;
