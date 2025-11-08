import React, { useState, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { NegotiationAttemptType, NegotiationChannel, School, Guardian, Student, Invoice, NegotiationAttempt, CollectionStage, NegotiationCase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { SparklesIcon, ScaleIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/common/icons';
import { useAuth } from '../../hooks/useAuth';
import AddNegotiationAttemptModal from '../../components/law-firm/AddNegotiationAttemptModal';
import PetitionGeneratorModal from '../../components/admin/PetitionGeneratorModal';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import StatCard from '../../components/common/StatCard';
import AgreementModal from '../../components/common/AgreementModal';
import NegotiationDetailModal from '../../components/law-firm/NegotiationDetailModal';


const pipelineColumns: { id: CollectionStage; title: string, description: string }[] = [
    { id: CollectionStage.AGUARDANDO_CONTATO, title: 'Aguardando Contato', description: 'Casos novos que precisam da primeira abordagem.' },
    { id: CollectionStage.EM_NEGOCIACAO, title: 'Em Negociação', description: 'Contato já iniciado e em andamento.' },
    { id: CollectionStage.ACORDO_FEITO, title: 'Acordo Feito', description: 'Negociação concluída e acordo formalizado.' },
    { id: CollectionStage.PREPARACAO_JUDICIAL, title: 'Preparação Judicial', description: 'Casos que esgotaram a via amigável.' }
];

interface NegotiationCardProps {
    caseItem: NegotiationCase;
    onOpenModal: (type: "addAttempt" | "createAgreement" | "generatePetition", caseData: NegotiationCase) => void;
    onMoveStage: (invoiceId: string, direction: "prev" | "next") => void;
    onViewDetails: (caseData: NegotiationCase) => void;
    key?: React.Key;
}

const NegotiationCard = ({ 
    caseItem, 
    onOpenModal,
    onMoveStage,
    onViewDetails,
}: NegotiationCardProps) => {
    const { invoice, student, school, attempts } = caseItem;
    const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
    const administrativeAttempts = attempts.filter(a => a.type === NegotiationAttemptType.ADMINISTRATIVE).length;
    const isReadyForLegal = administrativeAttempts >= 2;

    const currentStageIndex = pipelineColumns.findIndex(c => c.id === (invoice.collectionStage || CollectionStage.AGUARDANDO_CONTATO));
    const canMovePrev = currentStageIndex > 0;
    const canMoveNext = currentStageIndex < pipelineColumns.length - 1;

    const getRiskColor = (score?: number) => {
        if (score === undefined) return 'bg-neutral-300';
        if (score > 70) return 'bg-red-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm space-y-3"
        >
            <div onClick={() => onViewDetails(caseItem)} className="cursor-pointer hover:bg-neutral-50/70 -m-3.5 mb-0 p-3.5 rounded-t-xl transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${getRiskColor(invoice.riskScore)}`} title={`Risco de Inadimplência: ${invoice.riskScore}%`} />
                            <h4 className="font-bold text-sm text-neutral-800">{student?.name}</h4>
                        </div>
                        <p className="text-xs text-neutral-500">{school?.name}</p>
                    </div>
                    <p className="font-bold text-lg text-red-600">{formatCurrency(updatedValue)}</p>
                </div>
            </div>
            
            <div className="text-xs text-neutral-600 flex items-center justify-between">
                <span>Tentativas de contato: <span className="font-bold">{attempts.length}</span></span>
                {attempts.length > 0 && <span className="text-neutral-400">Última: {formatDate(attempts[0].date)}</span>}
            </div>

            <div className="flex gap-2 pt-3 border-t">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => onOpenModal("addAttempt", caseItem)}>Contato</Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => onOpenModal("createAgreement", caseItem)}>Acordo</Button>
                <Button size="sm" variant="secondary" title="Gerar Petição" onClick={() => onOpenModal("generatePetition", caseItem)} disabled={!isReadyForLegal}><SparklesIcon className="w-4 h-4" /></Button>
            </div>
            
             <div className="flex justify-between items-center pt-2 border-t border-dashed">
                <Button size="sm" variant="secondary" className="!p-1.5" onClick={() => onMoveStage(invoice.id, 'prev')} disabled={!canMovePrev}>
                    <ChevronLeftIcon />
                </Button>
                 <span className="text-xs font-semibold text-neutral-500">{pipelineColumns[currentStageIndex].title}</span>
                <Button size="sm" variant="secondary" className="!p-1.5" onClick={() => onMoveStage(invoice.id, 'next')} disabled={!canMoveNext}>
                    <ChevronRightIcon />
                </Button>
            </div>
        </motion.div>
    );
};

const NegotiationsDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [allInvoices, setAllInvoices] = useState(demoInvoices);
    const [allAttempts, setAllAttempts] = useState(demoNegotiationAttempts);
    const [modalState, setModalState] = useState<{ type: 'addAttempt' | 'createAgreement' | 'generatePetition' | null; caseData: NegotiationCase | null }>({ type: null, caseData: null });
    const [detailModalCase, setDetailModalCase] = useState<NegotiationCase | null>(null);

    const negotiationCases = useMemo<NegotiationCase[]>(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) return [];
        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));
        const activeInvoices = allInvoices.filter(i => officeSchoolIds.has(i.schoolId) && i.status === 'VENCIDO');
        return activeInvoices.map(invoice => ({
            invoice,
            student: demoStudents.find(s => s.id === invoice.studentId),
            guardian: demoGuardians.find(g => g.id === demoStudents.find(s => s.id === invoice.studentId)?.guardianId),
            school: officeSchools.find(s => s.id === invoice.schoolId),
            attempts: allAttempts.filter(a => a.invoiceId === invoice.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
    }, [allInvoices, allAttempts, user]);
    
    const { totalInNegotiation, totalFromAgreements } = useMemo(() => {
        let inNegotiation = 0;
        let fromAgreements = 0;
        negotiationCases.forEach(c => {
            const { updatedValue } = calculateUpdatedInvoiceValues(c.invoice);
            if (c.invoice.agreement) {
                fromAgreements += c.invoice.agreement.installments * c.invoice.agreement.installmentValue;
            } else if (c.invoice.collectionStage === 'EM_NEGOCIACAO') {
                inNegotiation += updatedValue;
            }
        });
        return { totalInNegotiation: inNegotiation, totalFromAgreements: fromAgreements };
    }, [negotiationCases]);

    const handleSaveAttempt = (invoiceId: string, data: { channel: NegotiationChannel, notes: string }) => {
        const newAttempt: NegotiationAttempt = {
            id: `neg-${Date.now()}`, invoiceId, date: new Date().toISOString(), type: NegotiationAttemptType.ADMINISTRATIVE,
            channel: data.channel, notes: data.notes, author: user?.name || 'Advocacia Foco',
        };
        setAllAttempts(prev => [...prev, newAttempt]);
        setModalState({ type: null, caseData: null });
    };

    const handleSaveAgreement = (caseData: NegotiationCase, agreementData: any) => {
        const newAgreement = {
            ...agreementData, createdAt: new Date().toISOString(),
            protocolNumber: `AC-${caseData.invoice.id.slice(-4)}-${Date.now().toString().slice(-4)}`
        };
        setAllInvoices(prev => prev.map(inv => inv.id === caseData.invoice.id ? {...inv, agreement: newAgreement, collectionStage: CollectionStage.ACORDO_FEITO} : inv));
        setModalState({ type: null, caseData: null });
    };
    
    const handleMoveStage = (invoiceId: string, direction: 'prev' | 'next') => {
        const invoice = allInvoices.find(i => i.id === invoiceId);
        if (!invoice) return;
        
        const currentStage = invoice.collectionStage || CollectionStage.AGUARDANDO_CONTATO;
        const currentIndex = pipelineColumns.findIndex(c => c.id === currentStage);
        
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        
        if (newIndex >= 0 && newIndex < pipelineColumns.length) {
            const newStage = pipelineColumns[newIndex].id;
            setAllInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, collectionStage: newStage } : inv));
        }
    };

    return (
        <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Potencial em Negociação Ativa" value={formatCurrency(totalInNegotiation)} icon={<ScaleIcon />} color="secondary" />
                <StatCard title="Valor Consolidado em Acordos" value={formatCurrency(totalFromAgreements)} icon={<CheckCircleIcon />} color="green" />
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 -mx-10 px-10">
                {pipelineColumns.map(column => {
                    const columnCases = negotiationCases.filter(c => (c.invoice.collectionStage || CollectionStage.AGUARDANDO_CONTATO) === column.id);
                    return (
                        <div key={column.id} className="w-80 md:w-96 flex-shrink-0">
                            <div className="px-2 mb-3">
                                <h3 className="font-bold text-neutral-800 flex justify-between items-center">
                                    <span>{column.title}</span>
                                    <span className="text-sm font-semibold text-neutral-400 bg-neutral-200/70 rounded-full px-2.5 py-0.5">{columnCases.length}</span>
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1">{column.description}</p>
                            </div>
                            <div className="space-y-3 h-full bg-neutral-100/60 p-2 rounded-xl">
                                <AnimatePresence>
                                    {columnCases.map(caseItem => (
                                        <NegotiationCard 
                                            key={caseItem.invoice.id}
                                            caseItem={caseItem} 
                                            onOpenModal={(type, caseData) => setModalState({ type, caseData })}
                                            onMoveStage={handleMoveStage}
                                            onViewDetails={setDetailModalCase}
                                        />
                                    ))}
                                </AnimatePresence>
                                {columnCases.length === 0 && (
                                    <div className="text-center py-10 text-sm text-neutral-400">Nenhum caso aqui.</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {modalState.caseData && (
                <>
                    <AddNegotiationAttemptModal 
                        isOpen={modalState.type === 'addAttempt'} 
                        onClose={() => setModalState({ type: null, caseData: null })} 
                        onSave={(data) => handleSaveAttempt(modalState.caseData!.invoice.id, data)} 
                    />
                    <AgreementModal
                        isOpen={modalState.type === 'createAgreement'}
                        onClose={() => setModalState({ type: null, caseData: null })}
                        onSave={(data) => handleSaveAgreement(modalState.caseData!, data)}
                        invoice={modalState.caseData.invoice}
                    />
                    <PetitionGeneratorModal 
                        isOpen={modalState.type === 'generatePetition'}
                        onClose={() => setModalState({ type: null, caseData: null })} 
                        negotiationCase={modalState.caseData} 
                    />
                </>
            )}
            
            {detailModalCase && (
                <NegotiationDetailModal 
                    isOpen={!!detailModalCase}
                    onClose={() => setDetailModalCase(null)}
                    caseData={detailModalCase}
                />
            )}
        </>
    );
};

export default NegotiationsDashboard;