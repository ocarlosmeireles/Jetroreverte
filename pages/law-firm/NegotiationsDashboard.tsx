import React, { useState, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        [NegotiationChannel.EMAIL]: <EnvelopeIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.WHATSAPP]: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PHONE_CALL]: <PhoneIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PETITION_GENERATED]: <DocumentPlusIcon className="w-5 h-5 text-neutral-500" />,
    };
    return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 ring-4 ring-white">{iconMap[channel]}</div>;
};

const calculateUpdatedValues = (invoice: Invoice) => {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    if (invoice.status !== InvoiceStatus.VENCIDO || today < dueDate) {
        return { updatedValue: invoice.value, fine: 0, interest: 0, monthsOverdue: 0 };
    }

    let months = (today.getFullYear() - dueDate.getFullYear()) * 12;
    months -= dueDate.getMonth();
    months += today.getMonth();
    
    if (today.getDate() < dueDate.getDate()) {
        months--;
    }
    
    const monthsOverdue = Math.max(0, months);
    if (monthsOverdue === 0 && today.getDate() <= dueDate.getDate()) {
         return { updatedValue: invoice.value, fine: 0, interest: 0, monthsOverdue: 0 };
    }

    const originalValue = invoice.value;
    const fine = originalValue * 0.02;
    const interest = originalValue * 0.01 * monthsOverdue;
    const updatedValue = parseFloat((originalValue + fine + interest).toFixed(2));
    
    return { updatedValue, fine, interest, monthsOverdue };
};


const NegotiationsDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [allAttempts, setAllAttempts] = useState(demoNegotiationAttempts);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedCaseForPetition, setSelectedCaseForPetition] = useState<NegotiationCase | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [automationStatus, setAutomationStatus] = useState<Record<string, boolean>>(() => 
        demoInvoices.reduce((acc, inv) => {
            acc[inv.id] = !!inv.isAutomationActive;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const negotiationCases = useMemo<NegotiationCase[]>(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) return [];

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        const activeInvoices = demoInvoices.filter(i => 
            officeSchoolIds.has(i.schoolId) && i.status === InvoiceStatus.VENCIDO
        );

        return activeInvoices.map(invoice => {
            const student = demoStudents.find(s => s.id === invoice.studentId);
            const guardian = demoGuardians.find(g => g.id === student?.guardianId);
            const school = officeSchools.find(s => s.id === student?.schoolId);
            const attempts = allAttempts
                .filter(a => a.invoiceId === invoice.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const { updatedValue, fine, interest, monthsOverdue } = calculateUpdatedValues(invoice);
            const updatedInvoice = { ...invoice, updatedValue };
            
            return { invoice: updatedInvoice, student, guardian, school, attempts, monthsOverdue, fine, interest };
        }).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
    }, [allAttempts, user]);
    
    const filteredCases = useMemo(() => {
        return negotiationCases.filter(c => {
            const search = searchTerm.toLowerCase();
            return (
                c.student?.name.toLowerCase().includes(search) ||
                c.guardian?.name.toLowerCase().includes(search) ||
                c.school?.name.toLowerCase().includes(search)
            );
        });
    }, [negotiationCases, searchTerm]);

    const priorityCases = useMemo(() => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

        return filteredCases.filter(c => {
            const isOverdueForLong = new Date(c.invoice.dueDate) < thirtyDaysAgo;
            const lastAttemptDate = c.attempts.length > 0 ? new Date(c.attempts[0].date) : new Date(0);
            const noRecentContact = lastAttemptDate < fifteenDaysAgo;
            return isOverdueForLong && noRecentContact;
        });
    }, [filteredCases]);


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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <input
                        type="text"
                        placeholder="Buscar por aluno, escola..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                    <Card>
                        <h3 className="font-bold text-lg text-red-700 mb-3">Casos Prioritários</h3>
                        <div className="space-y-3">
                            {priorityCases.length > 0 ? priorityCases.map(pCase => (
                                <div key={pCase.invoice.id} className="p-2 bg-red-50 rounded-md text-sm">
                                    <p className="font-semibold text-red-800">{pCase.student?.name}</p>
                                    <p className="text-xs text-red-600">Vencido desde {formatDate(pCase.invoice.dueDate)}</p>
                                </div>
                            )) : <p className="text-sm text-neutral-500">Nenhum caso prioritário no momento.</p>}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <AnimatePresence>
                        {filteredCases.map((caseItem, index) => {
                            const administrativeAttempts = caseItem.attempts.filter(a => a.type === NegotiationAttemptType.ADMINISTRATIVE).length;
                            const isReadyForLegal = administrativeAttempts >= 2;
                            const isAutomationActive = automationStatus[caseItem.invoice.id];

                            return (
                            <motion.div key={caseItem.invoice.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1, transition:{delay: index * 0.05} }} exit={{ opacity: 0 }}>
                                <Card>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 border-r-0 md:border-r md:pr-6 border-neutral-200 flex flex-col">
                                            <h3 className="font-bold text-lg text-neutral-800">{caseItem.student?.name}</h3>
                                            <p className="text-sm text-neutral-500">Responsável: {caseItem.guardian?.name}</p>
                                            <p className="text-sm text-neutral-500 font-medium">Escola: {caseItem.school?.name}</p>
                                            <div className="my-4 p-3 bg-red-50 rounded-lg">
                                                <p className="text-sm text-red-700">Dívida Vencida</p>
                                                
                                                {caseItem.invoice.updatedValue && caseItem.invoice.updatedValue > caseItem.invoice.value ? (
                                                    <>
                                                        <p className="font-bold text-2xl text-red-800">{formatCurrency(caseItem.invoice.updatedValue)}</p>
                                                        <div className="flex items-center gap-2 text-xs text-neutral-600 flex-wrap">
                                                            <span className="line-through">{formatCurrency(caseItem.invoice.value)}</span>
                                                            <span className="text-red-500">+ {formatCurrency(caseItem.fine)} (multa 2%)</span>
                                                            <span className="text-red-500">+ {formatCurrency(caseItem.interest)} (juros {caseItem.monthsOverdue}m)</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="font-bold text-2xl text-red-800">{formatCurrency(caseItem.invoice.value)}</p>
                                                )}
                                                
                                                <p className="text-xs text-red-600 mt-1">
                                                    Venceu em: {formatDate(caseItem.invoice.dueDate)}
                                                    <span className="font-semibold"> ({caseItem.monthsOverdue} {caseItem.monthsOverdue === 1 ? 'mês' : 'meses'} em atraso)</span>
                                                </p>
                                            </div>
                                            <div className="mt-auto space-y-2">
                                                <Button icon={<PlusIcon />} className="w-full" variant="secondary" onClick={() => setSelectedInvoiceId(caseItem.invoice.id)}>Adicionar Contato</Button>
                                                <Button icon={<DocumentPlusIcon />} className="w-full" disabled={!isReadyForLegal} onClick={() => setSelectedCaseForPetition(caseItem)}>Gerar Petição com IA</Button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <h4 className="font-semibold mb-3 text-neutral-700">Histórico de Contato</h4>
                                            {caseItem.attempts.length > 0 ? (
                                                <div className="relative pl-6">
                                                    <div className="absolute top-0 bottom-0 left-[21px] w-0.5 bg-neutral-200" />
                                                    {caseItem.attempts.map(attempt => (
                                                        <div key={attempt.id} className="relative mb-6">
                                                            <ChannelIcon channel={attempt.channel} />
                                                            <div className="ml-12 pt-1">
                                                                <div className="flex justify-between items-baseline"><p className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>{attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'Contato Administrativo' : 'Preparação Judicial'}</p><p className="text-xs text-neutral-400">{formatDate(attempt.date)} ({getRelativeTime(attempt.date)})</p></div>
                                                                <p className="text-sm text-neutral-600 mt-1">{attempt.notes}</p>
                                                                <p className="text-xs text-neutral-500 mt-1">por: {attempt.author}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <div className="text-center py-8 px-4 bg-neutral-50 rounded-lg"><p className="text-neutral-500">Nenhum contato registrado.</p></div>}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )})}
                    </AnimatePresence>
                </div>
            </div>
            {selectedInvoiceId && (
                <AddNegotiationAttemptModal isOpen={!!selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} onSave={(data) => handleSaveAttempt(selectedInvoiceId, data)} />
            )}
            {selectedCaseForPetition && (
                <PetitionGeneratorModal isOpen={!!selectedCaseForPetition} onClose={() => setSelectedCaseForPetition(null)} negotiationCase={selectedCaseForPetition} />
            )}
        </>
    );
};

export default NegotiationsDashboard;