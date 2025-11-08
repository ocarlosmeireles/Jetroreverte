import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../../hooks/useAuth';
import { demoStudents } from '../../services/demoData';
import { Student } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, ShieldCheckIcon } from '../../components/common/icons';

const DelinquencyPrevention = (): React.ReactElement => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<Record<string, string>>({});
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

    const atRiskStudents = useMemo(() => {
        if (!user?.schoolId) return [];
        return demoStudents.filter(s => s.schoolId === user.schoolId && s.futureRiskScore);
    }, [user]);

    const handleGenerateSuggestion = async (student: Student) => {
        if (!student.futureRiskScore) return;
        setLoadingSuggestion(student.id);
        const prompt = `Aja como um consultor de relacionamento para uma escola. Um aluno chamado ${student.name} tem um score de risco de inadimplência futura de ${student.futureRiskScore}/100, baseado no padrão: "${student.riskPattern}". Gere uma sugestão de ação de engajamento positiva e não-agressiva que a escola pode tomar para fortalecer o relacionamento com a família e prevenir um futuro débito. A sugestão deve ser curta, direta e acionável.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSuggestions(prev => ({ ...prev, [student.id]: response.text }));
        } catch (err) {
            console.error(err);
            setSuggestions(prev => ({ ...prev, [student.id]: 'Erro ao gerar sugestão.' }));
        } finally {
            setLoadingSuggestion(null);
        }
    };

    const getRiskColor = (score: number) => {
        if (score > 75) return 'text-red-600';
        if (score > 40) return 'text-yellow-600';
        return 'text-orange-500';
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold text-neutral-800">Prevenção à Inadimplência (IA)</h2>
            </div>
            <p className="text-sm text-neutral-600 mb-6">Nossa IA analisa padrões de pagamento para identificar alunos com risco de inadimplência futura, permitindo uma ação proativa.</p>

            <div className="space-y-4">
                {atRiskStudents.length > 0 ? atRiskStudents.map((student, index) => (
                    <motion.div 
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg bg-neutral-50/70"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <div>
                                <h3 className="font-bold text-neutral-800">{student.name}</h3>
                                <p className="text-sm text-neutral-500">Responsável: {student.guardianName}</p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                                <p className={`text-2xl font-bold ${getRiskColor(student.futureRiskScore!)}`}>
                                    {student.futureRiskScore}<span className="text-lg text-neutral-400">/100</span>
                                </p>
                                <p className="text-xs text-neutral-500">Score de Risco Futuro</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold text-neutral-500 uppercase">Padrão Identificado</p>
                            <p className="text-sm text-neutral-700 italic">"{student.riskPattern}"</p>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            {suggestions[student.id] ? (
                                <div>
                                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-1">Ação Sugerida</p>
                                    <p className="text-sm text-primary-700 font-medium">"{suggestions[student.id]}"</p>
                                </div>
                            ) : (
                                <Button size="sm" variant="secondary" icon={<SparklesIcon />} onClick={() => handleGenerateSuggestion(student)} isLoading={loadingSuggestion === student.id}>
                                    Gerar Sugestão de Engajamento
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-neutral-500">Nenhum aluno em observação no momento. Bom trabalho!</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DelinquencyPrevention;
