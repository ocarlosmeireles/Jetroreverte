

import React, { useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { InvoiceStatus, NegotiationAttemptType, NegotiationChannel, School, Guardian, Student, Invoice, NegotiationAttempt } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon, DocumentPlusIcon, SparklesIcon } from '../../components/common/icons';
import { useAuth } from '../../hooks/useAuth';
import AddNegotiationAttemptModal from '../../components/law-firm/AddNegotiationAttemptModal';
import PetitionGeneratorModal from '../../components/admin/PetitionGeneratorModal';
import Switch from '../../components/common/Switch';
import { DEMO_USERS } from '../../constants';

interface NegotiationCase {
    invoice: Invoice;
    student: Student | undefined;
    guardian: Guardian | undefined;
    school: School | undefined;
    attempts: NegotiationAttempt[];
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
        [NegotiationChannel.EMAIL]: <EnvelopeIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.WHATSAPP]: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PHONE_CALL]: <PhoneIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PETITION_GENERATED]: <DocumentPlusIcon className="w-5 h-5 text-neutral-500" />,
    };
    return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 ring-4 ring-white">{iconMap[channel]}</div>;
};

const NegotiationsDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [allAttempts, setAllAttempts] = useState(demoNegotiationAttempts);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedCase, setSelectedCase] = useState<NegotiationCase | null>(null);
    
    // State to manage automation toggles locally
    const [automationStatus, setAutomationStatus] = useState<Record<string, boolean>>(() => 
        demoInvoices.reduce((acc, inv) => {
            acc[inv.id] = !!inv.isAutomationActive;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const negotiationCases = useMemo<NegotiationCase[]>(() => {
        // Start with an empty set if the user is not the demo user or doesn't exist.
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) {
            return [];
        }

        // Get schools associated with the demo user
        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        const activeInvoices = demoInvoices.filter(i => 
            officeSchoolIds.has(i.schoolId) && 
            (i.status === InvoiceStatus.VENCIDO || i.status === InvoiceStatus.PENDENTE)
        );

        return activeInvoices.map(invoice => {
            const student = demoStudents.find(s => s.id === invoice.studentId);
            const guardian = demoGuardians.find(g => g.id === student?.guardianId);
            const school = officeSchools.find(s => s.id === student?.schoolId);
            const attempts = allAttempts
                .filter(a => a.invoiceId === invoice.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return { invoice, student, guardian, school, attempts };
        }).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
    }, [allAttempts, user]);

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
        setSelectedInvoiceId(null);
    };
    
    const handleToggleAutomation = (invoiceId: string) => {
        setAutomationStatus(prev => ({ ...prev, [invoiceId]: !prev[invoiceId] }));
    };


    return (
        <>
            <div className="space-y-6">
                {negotiationCases.map((caseItem, index) => {
                    const administrativeAttempts = caseItem.attempts.filter(a => a.type === NegotiationAttemptType.ADMINISTRATIVE).length;
                    const isReadyForLegal = administrativeAttempts >= 2;
                    const isAutomationActive = automationStatus[caseItem.invoice.id];

                    return (
                    <Card key={caseItem.invoice.id} delay={index * 0.05}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Details Column */}
                            <div className="md:col-span-1 border-r-0 md:border-r md:pr-6 border-neutral-200 flex flex-col">
                                <h3 className="font-bold text-lg text-neutral-800">{caseItem.student?.name}</h3>
                                <p className="text-sm text-neutral-500">Responsável: {caseItem.guardian?.name}</p>
                                <p className="text-sm text-neutral-500 font-medium">Escola: {caseItem.school?.name}</p>
                                <div className={`my-4 p-3 rounded-lg ${caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'bg-red-50' : 'bg-yellow-50'}`}>
                                    <p className={`text-sm ${caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'text-red-700' : 'text-yellow-700'}`}>
                                        {caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'Dívida Vencida' : 'Dívida Pendente'}
                                    </p>
                                    <p className={`font-bold text-2xl ${caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'text-red-800' : 'text-yellow-800'}`}>{formatCurrency(caseItem.invoice.value)}</p>
                                    <p className={`text-xs ${caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'text-red-600' : 'text-yellow-600'}`}>
                                        Vence{caseItem.invoice.status === InvoiceStatus.VENCIDO ? 'u' : ''} em: {formatDate(caseItem.invoice.dueDate)}
                                    </p>
                                </div>
                                
                                {/* AI Automation Section */}
                                <div className="p-3 bg-primary-50/70 border border-primary-200/50 rounded-lg space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <SparklesIcon className="w-5 h-5 text-primary-600" />
                                            <h4 className="font-semibold text-sm text-primary-800">Automação de Cobrança IA</h4>
                                        </div>
                                        <Switch checked={isAutomationActive} onChange={() => handleToggleAutomation(caseItem.invoice.id)} />
                                    </div>
                                    {isAutomationActive && (
                                        <div className="text-xs text-neutral-600 bg-white/50 p-2 rounded">
                                            {caseItem.invoice.nextAutomatedAction ? (
                                                <>
                                                    <span className="font-semibold">Próxima Ação:</span> {caseItem.invoice.nextAutomatedAction.action}
                                                    <br />
                                                    <span className="font-semibold">Em:</span> {getRelativeTime(caseItem.invoice.nextAutomatedAction.date)}
                                                </>
                                            ) : "Nenhuma ação futura agendada."}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto space-y-2">
                                    <Button 
                                        icon={<PlusIcon className="w-5 h-5"/>} 
                                        className="w-full"
                                        variant="secondary"
                                        onClick={() => setSelectedInvoiceId(caseItem.invoice.id)}
                                    >
                                        Adicionar Contato Manual
                                    </Button>
                                    <Button 
                                        icon={<DocumentPlusIcon className="w-5 h-5"/>} 
                                        className="w-full"
                                        disabled={!isReadyForLegal}
                                        onClick={() => setSelectedCase(caseItem)}
                                    >
                                        Gerar Petição com IA
                                    </Button>
                                </div>
                                {!isReadyForLegal && (
                                     <p className="text-xs text-center text-neutral-500 mt-2">
                                        Aguardando {2 - administrativeAttempts} contato(s) para habilitar ação judicial.
                                     </p>
                                )}
                            </div>
                            {/* Timeline Column */}
                            <div className="md:col-span-2">
                                <h4 className="font-semibold mb-3 text-neutral-700">Histórico de Contato</h4>
                                {caseItem.attempts.length > 0 ? (
                                    <div className="relative pl-6">
                                         <div className="absolute top-0 bottom-0 left-[21px] w-0.5 bg-neutral-200" />
                                        {caseItem.attempts.map(attempt => (
                                            <div key={attempt.id} className="relative mb-6">
                                                 <ChannelIcon channel={attempt.channel} />
                                                <div className="ml-12 pt-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <p className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>
                                                            {attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'Contato Administrativo' : 'Preparação Judicial'}
                                                        </p>
                                                        <p className="text-xs text-neutral-400">{formatDate(attempt.date)} ({getRelativeTime(attempt.date)})</p>
                                                    </div>
                                                    <p className="text-sm text-neutral-600 mt-1">{attempt.notes}</p>
                                                    <p className="text-xs text-neutral-500 mt-1">por: {attempt.author}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 bg-neutral-50 rounded-lg">
                                        <p className="text-neutral-500">Nenhuma tentativa de contato registrada.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {selectedInvoiceId && (
                <AddNegotiationAttemptModal
                    isOpen={!!selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                    onSave={(data) => handleSaveAttempt(selectedInvoiceId, data)}
                />
            )}
            {selectedCase && (
                <PetitionGeneratorModal
                    isOpen={!!selectedCase}
                    onClose={() => setSelectedCase(null)}
                    negotiationCase={selectedCase}
                />
            )}
        </>
    );
};

export default NegotiationsDashboard;