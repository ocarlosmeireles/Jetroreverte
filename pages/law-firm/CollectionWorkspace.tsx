import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import AnimatePresence from framer-motion.
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { NegotiationCase, Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { SparklesIcon } from '../../components/common/icons';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface PriorityCaseCardProps {
    caseData: NegotiationCase & { criticality: number, nextAction?: string };
    onOpenDossier: (caseData: NegotiationCase) => void;
    // FIX: Add key to props to allow usage in a list map, resolving a TypeScript error.
    key?: React.Key;
}

const PriorityCaseCard = ({ caseData, onOpenDossier }: PriorityCaseCardProps) => {
    const { invoice, student, school, criticality, nextAction } = caseData;
    const { updatedValue } = calculateUpdatedInvoiceValues(invoice);

    const CriticalityBadge = ({ score }: { score: number }) => {
        let styles = 'bg-green-100 text-green-700 border-green-200'; let label = 'Baixa';
        if (score > 80) { styles = 'bg-red-100 text-red-700 border-red-200'; label = 'Crítica'; }
        else if (score > 60) { styles = 'bg-orange-100 text-orange-700 border-orange-200'; label = 'Alta'; }
        else if (score > 30) { styles = 'bg-yellow-100 text-yellow-700 border-yellow-200'; label = 'Média'; }
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles}`}>{label}</span>;
    };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => onOpenDossier(caseData)}
            className="w-full bg-white p-4 rounded-xl border border-neutral-200/80 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h4 className="font-bold text-neutral-800">{student?.name}</h4>
                    <p className="text-xs text-neutral-500 truncate">{school?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-red-600">{formatCurrency(updatedValue)}</p>
                    <CriticalityBadge score={criticality} />
                </div>
            </div>
             {nextAction && (
                 <div className="mt-3 pt-3 border-t text-sm text-primary-800 bg-primary-50/60 p-2 rounded-md flex items-start gap-2">
                    <SparklesIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" />
                    <div>
                        <span className="font-semibold">Ação Sugerida (IA):</span> {nextAction}
                    </div>
                 </div>
            )}
        </motion.div>
    );
};

interface CollectionWorkspaceProps {
    onOpenDossier: (caseData: NegotiationCase) => void;
}

const CollectionWorkspace = ({ onOpenDossier }: CollectionWorkspaceProps): React.ReactElement => {
    const { user } = useAuth();
    const [cases, setCases] = useState<(NegotiationCase & { criticality: number, nextAction?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const calculateCriticalityScore = (caseData: NegotiationCase) => {
        const { invoice, attempts } = caseData;
        const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
        const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24)));
        
        const daysFactor = Math.min(daysOverdue / 180, 1);
        const valueFactor = Math.min(updatedValue / 5000, 1);
        const attemptsFactor = 1 - Math.min(attempts.length / 5, 1);
        const riskFactor = (invoice.riskScore || 50) / 100;
        
        const score = (daysFactor * 40) + (valueFactor * 30) + (riskFactor * 20) + (attemptsFactor * 10);
        return Math.min(100, Math.round(score));
    };

    useEffect(() => {
        const fetchAndProcessCases = async () => {
            if (user?.email !== DEMO_USERS.ESCRITORIO.email) {
                setIsLoading(false);
                return;
            }

            const officeSchools = demoSchools.filter(s => s.officeId === user.id);
            const officeSchoolIds = new Set(officeSchools.map(s => s.id));
            const activeInvoices = demoInvoices.filter(i => officeSchoolIds.has(i.schoolId) && i.status === 'VENCIDO');

            const initialCases = activeInvoices.map(invoice => {
                const caseData: NegotiationCase = {
                    invoice,
                    student: demoStudents.find(s => s.id === invoice.studentId),
                    guardian: demoGuardians.find(g => g.id === demoStudents.find(s => s.id === invoice.studentId)?.guardianId),
                    school: officeSchools.find(s => s.id === invoice.schoolId),
                    attempts: demoNegotiationAttempts.filter(a => a.invoiceId === invoice.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                };
                return { ...caseData, criticality: calculateCriticalityScore(caseData) };
            }).sort((a, b) => b.criticality - a.criticality);
            
            setCases(initialCases);
            setIsLoading(false);

            // Batch fetch AI actions for top 5 cases
            const topCases = initialCases.slice(0, 5);
            if (topCases.length === 0) return;

            const topCasesData = topCases.map(caseItem => ({
                invoiceId: caseItem.invoice.id,
                value: formatCurrency(calculateUpdatedInvoiceValues(caseItem.invoice).updatedValue),
                daysOverdue: Math.floor((new Date().getTime() - new Date(caseItem.invoice.dueDate).getTime()) / (1000 * 3600 * 24)),
                attempts: caseItem.attempts.length
            }));

            const prompt = `Aja como especialista em cobrança. Para cada um dos casos de dívida a seguir, sugira a próxima ação.
Dados dos casos:
${JSON.stringify(topCasesData, null, 2)}

Responda em JSON com um array de objetos, onde cada objeto tem "invoiceId" (o ID da fatura correspondente) e "title" (a ação sugerida).
Seja breve nas sugestões. Ex: "Enviar WhatsApp amigável", "Ligar para propor acordo", "Gerar Petição Inicial".`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    invoiceId: { type: Type.STRING },
                                    title: { type: Type.STRING }
                                },
                                required: ["invoiceId", "title"]
                            }
                        }
                    }
                });
                const actions = JSON.parse(response.text) as { invoiceId: string; title: string }[];
                const actionMap = new Map(actions.map(a => [a.invoiceId, a.title]));
                setCases(prev => prev.map(c => ({
                    ...c,
                    nextAction: actionMap.get(c.invoice.id) || c.nextAction
                })));
            } catch (err) {
                console.error("AI Action Error (Batch):", err);
            }
        };

        fetchAndProcessCases();
    }, [user]);

    if (isLoading) {
        return <div className="text-center text-neutral-500">Carregando e priorizando casos...</div>;
    }

    return (
        <div className="h-full">
            <h3 className="font-semibold text-neutral-700 mb-4 px-2">Casos Priorizados para Ação</h3>
             <AnimatePresence>
                <div className="space-y-3 overflow-y-auto h-[calc(100%-2rem)] pr-2">
                    {cases.map(caseData => (
                        <PriorityCaseCard key={caseData.invoice.id} caseData={caseData} onOpenDossier={onOpenDossier} />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
};

export default CollectionWorkspace;
