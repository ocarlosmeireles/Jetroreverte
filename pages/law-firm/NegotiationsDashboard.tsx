

import React, { useState, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { InvoiceStatus, NegotiationAttemptType, NegotiationChannel, School, Guardian, Student, Invoice, NegotiationAttempt, CollectionStage } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon, DocumentPlusIcon, SparklesIcon, DollarIcon, CheckCircleIcon, ScaleIcon } from '../../components/common/icons';
import { useAuth } from '../../hooks/useAuth';
import AddNegotiationAttemptModal from '../../components/law-firm/AddNegotiationAttemptModal';
import PetitionGeneratorModal from '../../components/admin/PetitionGeneratorModal';
import Switch from '../../components/common/Switch';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import StatCard from '../../components/common/StatCard';
import AgreementModal from '../../components/common/AgreementModal';

interface NegotiationCase {
    invoice: Invoice;
    student: Student | undefined;
    guardian: Guardian | undefined;
    school: School | undefined;
    attempts: NegotiationAttempt[];
    monthsOverdue: number;
    fine: number;
    interest: number;
}

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
};

const ChannelIcon = ({ channel }: { channel: NegotiationChannel }) => {
    const iconMap: Record<NegotiationChannel, ReactNode> = {
        [NegotiationChannel.EMAIL]: <EnvelopeIcon className="w-4 h-4 text-neutral-500" />,
        [NegotiationChannel.WHATSAPP]: <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-neutral-500" />,
        [NegotiationChannel.PHONE_CALL]: <PhoneIcon className="w-4 h-4 text-neutral-500" />,
        [NegotiationChannel.PETITION_GENERATED]: <DocumentPlusIcon className="w-4 h-4 text-neutral-500" />,
    };
    return <div className="w-7 h-7 rounded-full flex items-center justify-center bg-neutral-100 ring-2 ring-white">{iconMap[channel]}</div>;
};

const pipelineColumns: { id: CollectionStage; title: string }[] = [
    { id: CollectionStage.AGUARDANDO_CONTATO, title: 'Aguardando Contato' },
    { id: CollectionStage.EM_NEGOCIACAO, title: 'Em Negociação' },
    { id: CollectionStage.ACORDO_FEITO, title: 'Acordo Feito' },
    { id: CollectionStage.PREPARACAO_JUDICIAL, title: 'Preparação Judicial' }
];

const NegotiationsDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [allInvoices, setAllInvoices] = useState(demoInvoices);
    const [allAttempts, setAllAttempts] = useState(demoNegotiationAttempts);

    const [modalState, setModalState] = useState<{ type: 'addAttempt' | 'createAgreement' | 'generatePetition'; caseData: NegotiationCase | null }>({ type: null, caseData: null });
    
    const [discounts, setDiscounts] = useState<Record<string, { excludeInterest: boolean; excludeFine: boolean }>>({});

    const negotiationCases = useMemo<NegotiationCase[]>(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) return [];

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        const activeInvoices = allInvoices.filter(i => 
            officeSchoolIds.has(i.schoolId) && i.status === InvoiceStatus.VENCIDO
        );

        return activeInvoices.map(invoice => {
            const student = demoStudents.find(s => s.id === invoice.studentId);
            const guardian = demoGuardians.find(g => g.id === student?.guardianId);
            const school = officeSchools.find(s => s.id === student?.schoolId);
            const attempts = allAttempts
                .filter(a => a.invoiceId === invoice.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const { updatedValue, fine, interest, monthsOverdue } = calculateUpdatedInvoiceValues(invoice);
            const updatedInvoice = { ...invoice, updatedValue };
            
            return { invoice: updatedInvoice, student, guardian, school, attempts, monthsOverdue, fine, interest };
        }).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
    }, [allInvoices, allAttempts, user]);
    
    const { totalInNegotiation, totalFromAgreements } = useMemo(() => {
        let inNegotiation = 0;
        let fromAgreements = 0;

        negotiationCases.forEach(c => {
            if (c.invoice.agreement) {
                fromAgreements += c.invoice.agreement.installments * c.invoice.agreement.installmentValue;
            } else if (c.invoice.collectionStage === 'EM_NEGOCIACAO') {
                inNegotiation += c.invoice.updatedValue || c.invoice.value;
            }
        });

        return { totalInNegotiation: inNegotiation, totalFromAgreements: fromAgreements };
    }, [negotiationCases]);

    const handleSaveAttempt = (invoiceId: string, data: { channel: NegotiationChannel, notes: string }) => {
        const newAttempt: NegotiationAttempt = {
            id: `neg-${Date.now()}`,
            invoiceId,
            date: new Date().toISOString(),
            type: NegotiationAttemptType.ADMINISTRATIVE,
            channel: data.channel,
            notes: data.notes,
            author: user?.name || 'Advocacia Foco',
        };
        setAllAttempts(prev => [...prev, newAttempt]);
        setModalState({ type: null, caseData: null });
    };

    const handleSaveAgreement = (caseData: NegotiationCase, agreementData: any) => {
        const newAgreement = {
            ...agreementData,
            createdAt: new Date().toISOString(),
            protocolNumber: `AC-${caseData.invoice.id.slice(-4)}-${Date.now().toString().slice(-4)}`
        };
        setAllInvoices(prev => prev.map(inv => inv.id === caseData.invoice.id ? {...inv, agreement: newAgreement, collectionStage: CollectionStage.ACORDO_FEITO} : inv));
        setModalState({ type: null, caseData: null });
    };
    
     const handleDiscountChange = (invoiceId: string, type: 'interest' | 'fine', isExcluded: boolean) => {
        setDiscounts(prev => ({
            ...prev,
            [invoiceId]: {
                ...(prev[invoiceId] || { excludeInterest: false, excludeFine: false }),
                [type === 'interest' ? 'excludeInterest' : 'excludeFine']: isExcluded,
            }
        }));
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
                        <div key={column.id} className="w-80 flex-shrink-0">
                            <h3 className="font-semibold text-neutral-700 mb-3 px-2 flex justify-between items-center">
                                <span>{column.title}</span>
                                <span className="text-sm text-neutral-400 bg-neutral-200/70 rounded-full px-2 py-0.5">{columnCases.length}</span>
                            </h3>
                            <div className="space-y-3 h-full bg-neutral-100/60 p-2 rounded-lg">
                                <AnimatePresence>
                                {columnCases.map((caseItem) => {
                                    const administrativeAttempts = caseItem.attempts.filter(a => a.type === NegotiationAttemptType.ADMINISTRATIVE).length;
                                    const isReadyForLegal = administrativeAttempts >= 2;
                                    const currentDiscounts = discounts[caseItem.invoice.id] || { excludeInterest: false, excludeFine: false };
                                    const negotiatedValue = caseItem.invoice.value +
                                        (currentDiscounts.excludeFine ? 0 : caseItem.fine) +
                                        (currentDiscounts.excludeInterest ? 0 : caseItem.interest);
                                    const lastAttempt = caseItem.attempts[0];

                                    return (
                                        <motion.div key={caseItem.invoice.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <Card className="!p-3.5 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-neutral-800">{caseItem.student?.name}</h4>
                                                        <p className="text-xs text-neutral-500">{caseItem.school?.name}</p>
                                                    </div>
                                                    <p className="font-bold text-lg text-red-700">{formatCurrency(negotiatedValue)}</p>
                                                </div>

                                                {(caseItem.fine > 0 || caseItem.interest > 0) && (
                                                    <div className="p-2 border border-dashed rounded-md bg-neutral-50">
                                                        <div className="space-y-1">
                                                            {caseItem.fine > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-xs text-neutral-700">Excluir Multa</label>
                                                                    <Switch checked={currentDiscounts.excludeFine} onChange={(c) => handleDiscountChange(caseItem.invoice.id, 'fine', c)} />
                                                                </div>
                                                            )}
                                                            {caseItem.interest > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-xs text-neutral-700">Excluir Juros</label>
                                                                    <Switch checked={currentDiscounts.excludeInterest} onChange={(c) => handleDiscountChange(caseItem.invoice.id, 'interest', c)} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {lastAttempt && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <ChannelIcon channel={lastAttempt.channel} />
                                                        <span>Último contato {getRelativeTime(lastAttempt.date)}</span>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-2 border-t">
                                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setModalState({ type: 'addAttempt', caseData: caseItem })}>Contato</Button>
                                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setModalState({ type: 'createAgreement', caseData: { ...caseItem, invoice: { ...caseItem.invoice, updatedValue: negotiatedValue } } })}>Acordo</Button>
                                                    <Button size="sm" variant="secondary" title="Gerar Petição" onClick={() => setModalState({ type: 'generatePetition', caseData: caseItem })} disabled={!isReadyForLegal}><SparklesIcon className="w-4 h-4" /></Button>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                                </AnimatePresence>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {modalState.type === 'addAttempt' && modalState.caseData && (
                <AddNegotiationAttemptModal 
                    isOpen={true} 
                    onClose={() => setModalState({ type: null, caseData: null })} 
                    onSave={(data) => handleSaveAttempt(modalState.caseData!.invoice.id, data)} 
                />
            )}
            
            {modalState.type === 'createAgreement' && modalState.caseData && (
                <AgreementModal
                    isOpen={true}
                    onClose={() => setModalState({ type: null, caseData: null })}
                    onSave={(data) => handleSaveAgreement(modalState.caseData!, data)}
                    invoice={modalState.caseData.invoice}
                />
            )}

            {modalState.type === 'generatePetition' && modalState.caseData && (
                <PetitionGeneratorModal 
                    isOpen={true} 
                    onClose={() => setModalState({ type: null, caseData: null })} 
                    negotiationCase={modalState.caseData} 
                />
            )}
        </>
    );
};

export default NegotiationsDashboard;