
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, ShieldCheckIcon } from '../../components/common/icons';

interface AnalysisResult {
    score: number;
    analysis: {
        type: 'Alerta' | 'Sugestão' | 'Ponto Forte';
        clause: string;
        comment: string;
    }[];
}

const ContractAuditorPage = (): React.ReactElement => {
    const [contractText, setContractText] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!contractText.trim()) {
            setError('Por favor, cole o texto do contrato para análise.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);

        const prompt = `
            Aja como um advogado especialista em direito do consumidor e contratos educacionais no Brasil. Sua tarefa é analisar o contrato de prestação de serviços educacionais fornecido e identificar pontos de risco, melhorias e pontos fortes, focando principalmente nas cláusulas financeiras.

            Analise o seguinte texto do contrato:
            ---
            ${contractText}
            ---

            Sua análise deve se concentrar em:
            1.  **Cláusula de Multa por Atraso:** Verificar se está de acordo com o Código de Defesa do Consumidor (limite de 2%).
            2.  **Cláusula de Juros Moratórios:** Verificar se a taxa é razoável (geralmente 1% ao mês).
            3.  **Cláusula de Rescisão Contratual:** Analisar as condições para rescisão por inadimplência.
            4.  **Clareza Geral:** Avaliar se as cláusulas financeiras são claras para o consumidor.

            Com base na sua análise, gere um JSON com a seguinte estrutura:
            - "score": um "Score de Risco Contratual" de 0 (muito arriscado) a 100 (muito seguro).
            - "analysis": um array de objetos, onde cada objeto contém:
                - "type": "Alerta" (para riscos legais), "Sugestão" (para melhorias) ou "Ponto Forte" (para cláusulas bem redigidas).
                - "clause": O nome ou um trecho da cláusula analisada.
                - "comment": Seu comentário ou recomendação sobre a cláusula.
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
                            score: { type: Type.NUMBER },
                            analysis: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING },
                                        clause: { type: Type.STRING },
                                        comment: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            const jsonResponse = JSON.parse(response.text) as AnalysisResult;
            setResult(jsonResponse);

        } catch (err) {
            console.error("Error analyzing contract:", err);
            setError("Ocorreu um erro ao analisar o contrato. Verifique a chave da API e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getScoreColor = (score: number) => {
        if (score > 75) return 'text-green-600';
        if (score > 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAnalysisItemColor = (type: AnalysisResult['analysis'][0]['type']) => {
        switch (type) {
            case 'Alerta': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
            case 'Sugestão': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' };
            case 'Ponto Forte': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
            default: return { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-800' };
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
                        <h2 className="text-xl font-bold text-neutral-800">Auditor de Contratos com IA</h2>
                    </div>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        Cole o texto do seu contrato de prestação de serviços para receber uma análise instantânea sobre os riscos e pontos de melhoria das suas cláusulas financeiras.
                    </p>
                </div>

                <div className="mt-6">
                    <textarea
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        rows={12}
                        className="w-full p-4 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition bg-neutral-50/50"
                        placeholder="Cole o texto completo do seu contrato aqui..."
                    />
                </div>

                <div className="mt-4 text-center">
                    <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!contractText.trim()} size="lg" icon={<SparklesIcon />}>
                        Analisar Contrato
                    </Button>
                </div>
            </Card>

            <AnimatePresence>
            {(isLoading || result || error) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <Card>
                        <h3 className="text-xl font-bold text-neutral-800 mb-4">Resultado da Análise</h3>
                        {isLoading && <p className="text-center text-neutral-600">Analisando... Isso pode levar alguns segundos.</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        {result && (
                            <div className="space-y-6">
                                <div className="text-center p-6 bg-neutral-50 rounded-xl border">
                                    <h4 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">Score de Risco Contratual</h4>
                                    <p className={`text-6xl font-extrabold ${getScoreColor(result.score)} mt-2`}>{result.score}<span className="text-3xl text-neutral-400">/100</span></p>
                                </div>
                                <div className="space-y-4">
                                    {result.analysis.map((item, index) => {
                                        const colors = getAnalysisItemColor(item.type);
                                        return (
                                            <div key={index} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors.bg} border ${colors.border} ${colors.text}`}>{item.type}</span>
                                                    <h5 className="font-bold text-neutral-800">{item.clause}</h5>
                                                </div>
                                                <p className="mt-2 text-sm text-neutral-700">{item.comment}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default ContractAuditorPage;
