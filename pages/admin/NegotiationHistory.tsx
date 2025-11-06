
import React, { useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { InvoiceStatus, NegotiationAttemptType, NegotiationChannel, School, Guardian, Student, Invoice, NegotiationAttempt } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DocumentPlusIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon } from '../../components/common/icons';
import PetitionGeneratorModal from '../../components/admin/PetitionGeneratorModal';

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

const NegotiationHistory = (): React.ReactElement => {
    const [selectedCase, setSelectedCase] = useState<NegotiationCase | null>(null);

    const negotiationCases = useMemo<NegotiationCase[]>(() => {
        const overdueInvoices = demoInvoices.filter(i => i.status === InvoiceStatus.VENCIDO);

        return overdueInvoices.map(invoice => {
            const student = demoStudents.find(s => s.id === invoice.studentId);
            const guardian = demoGuardians.find(g => g.id === student?.guardianId);
            const school = demoSchools.find(s => s.id === student?.schoolId);
            const attempts = demoNegotiationAttempts
                .filter(a => a.invoiceId === invoice.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return { invoice, student, guardian, school, attempts };
        }).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
    }, []);

    return (
        <>
            <div className="space-y-6">
                {negotiationCases.map((caseItem, index) => {
                    const administrativeAttempts = caseItem.attempts.filter(a => a.type === NegotiationAttemptType.ADMINISTRATIVE).length;
                    const isReadyForLegal = administrativeAttempts >= 2;

                    return (
                        <Card key={caseItem.invoice.id} delay={index * 0.05}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Details Column */}
                                <div className="md:col-span-1 border-r-0 md:border-r md:pr-6 border-neutral-200">
                                    <h3 className="font-bold text-lg text-neutral-800">{caseItem.student?.name}</h3>
                                    <p className="text-sm text-neutral-500">Responsável: {caseItem.guardian?.name}</p>
                                    <p className="text-sm text-neutral-500 font-medium">Escola: {caseItem.school?.name}</p>
                                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-700">Dívida Vencida</p>
                                        <p className="font-bold text-2xl text-red-800">{formatCurrency(caseItem.invoice.value)}</p>
                                        <p className="text-xs text-red-600">Venceu em: {formatDate(caseItem.invoice.dueDate)}</p>
                                    </div>
                                    <Button 
                                        icon={<DocumentPlusIcon className="w-5 h-5"/>} 
                                        className="w-full mt-4"
                                        disabled={!isReadyForLegal}
                                        onClick={() => setSelectedCase(caseItem)}
                                    >
                                        Gerar Petição com IA
                                    </Button>
                                    {!isReadyForLegal && (
                                         <p className="text-xs text-center text-neutral-500 mt-2">
                                            Aguardando {2 - administrativeAttempts} contato(s) administrativo(s).
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
                    )
                })}
            </div>
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

export default NegotiationHistory;
