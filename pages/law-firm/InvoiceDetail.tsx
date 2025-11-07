import React, { useState, useEffect, useMemo } from 'react';
import { demoInvoices, demoStudents, demoGuardians, demoSchools } from '../../services/demoData';
import { Invoice, Student, Guardian, InvoiceStatus, CollectionStage, AgreementDetails, School, User } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, SparklesIcon, EnvelopeIcon, ClipboardIcon, PencilIcon, DocumentReportIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AiCommunicationModal from '../../components/school/AiCommunicationModal';
import EmailCommunicationModal from '../../components/school/EmailCommunicationModal';
import ContactHistoryModal from '../../components/common/ContactHistoryModal';
import AgreementModal from '../../components/common/AgreementModal';
import { generateAgreementPdf } from '../../utils/agreementPdfGenerator';
import { useAuth } from '../../hooks/useAuth';


interface InvoiceDetailProps {
    invoiceId: string;
    onBack: () => void;
}

const collectionStageLabels: Record<CollectionStage, string> = {
    [CollectionStage.AGUARDANDO_CONTATO]: 'Aguardando Contato',
    [CollectionStage.EM_NEGOCIACAO]: 'Em Negociação',
    [CollectionStage.ACORDO_FEITO]: 'Acordo Feito',
    [CollectionStage.PAGAMENTO_RECUSADO]: 'Pagamento Recusado',
};

const LawFirmInvoiceDetail = ({ invoiceId, onBack }: InvoiceDetailProps): React.ReactElement => {
    const { user } = useAuth();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    
    const initialInvoice = demoInvoices.find(i => i.id === invoiceId);
    const [currentInvoice, setCurrentInvoice] = useState<Invoice | undefined>(initialInvoice);

    const [isEditingLink, setIsEditingLink] = useState(false);
    const [linkInputValue, setLinkInputValue] = useState(currentInvoice?.paymentLink || '');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (currentInvoice && currentInvoice.status === InvoiceStatus.VENCIDO && !currentInvoice.updatedValue) {
            handleCalculateUpdate(false); // Calculate on load without alert
        }
    }, [invoiceId]);

    const student = useMemo(() => demoStudents.find(s => s.id === currentInvoice?.studentId), [currentInvoice]);
    const guardian = useMemo(() => demoGuardians.find(g => g.id === student?.guardianId), [student]);
    const school = useMemo(() => demoSchools.find(s => s.id === student?.schoolId), [student]);
    
    const monthsOverdue = useMemo(() => {
        if (!currentInvoice) return 0;
        const dueDate = new Date(currentInvoice.dueDate);
        const today = new Date();
        if (today < dueDate) return 0;
        
        let months = (today.getFullYear() - dueDate.getFullYear()) * 12;
        months -= dueDate.getMonth();
        months += today.getMonth();
        
        // If today's date is before the due date's day of the month, we haven't completed the current month.
        if (today.getDate() < dueDate.getDate()) {
            months--;
        }
        
        return months <= 0 ? 0 : months;
    }, [currentInvoice?.dueDate]);

    const { fine, interest } = useMemo(() => {
        if (!currentInvoice || monthsOverdue <= 0) return { fine: 0, interest: 0 };
        const originalValue = currentInvoice.value;
        const calculatedFine = originalValue * 0.02;
        const calculatedInterest = originalValue * 0.01 * monthsOverdue;
        return { fine: calculatedFine, interest: calculatedInterest };
    }, [currentInvoice, monthsOverdue]);

    const handleCalculateUpdate = (showAlert = true) => {
        if (!currentInvoice) return;
        const originalValue = currentInvoice.value;
        const fine = originalValue * 0.02; // 2% multa
        const interest = originalValue * 0.01 * monthsOverdue; // 1% juros ao mês
        const updatedValue = originalValue + fine + interest;

        setCurrentInvoice(prev => prev ? { ...prev, updatedValue: updatedValue } : undefined);
        if (showAlert) {
            alert("Valor atualizado com sucesso!");
        }
    };

    if (!currentInvoice || !student || !guardian || !school || !user) {
        return (
            <div className="p-6">
                <p>Cobrança ou dados relacionados não encontrados.</p>
                <Button onClick={onBack} className="mt-4">Voltar</Button>
            </div>
        );
    }
    
    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 inline-block">Pago</div>;
            case InvoiceStatus.PENDENTE: return <div className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 inline-block">Pendente</div>;
            case InvoiceStatus.VENCIDO: return <div className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 inline-block">Vencido</div>;
        }
    };

    const handleCopyLink = () => {
        if (!currentInvoice?.paymentLink) return;
        navigator.clipboard.writeText(currentInvoice.paymentLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleSaveLink = () => {
        setCurrentInvoice(prev => prev ? { ...prev, paymentLink: linkInputValue } : undefined);
    };

    const handleSaveAgreement = (agreement: Omit<AgreementDetails, 'createdAt'>) => {
        const newAgreement = { ...agreement, createdAt: new Date().toISOString() };
        setCurrentInvoice(prev => prev ? { ...prev, agreement: newAgreement, collectionStage: CollectionStage.ACORDO_FEITO } : undefined);
        setIsAgreementModalOpen(false);
    };
    
    const handleGenerateAgreementPdf = () => {
        if(currentInvoice.agreement) {
            generateAgreementPdf(currentInvoice, student, guardian, school, user);
        }
    };
    
    const agreementProbability = currentInvoice.riskScore !== undefined ? 100 - currentInvoice.riskScore : null;
    const probabilityColor = agreementProbability === null ? 'text-neutral-700' : agreementProbability > 60 ? 'text-green-600' : agreementProbability > 30 ? 'text-yellow-600' : 'text-red-600';

    return (
        <>
            <div className="p-4 sm:p-6 h-full flex flex-col">
                <div className="mb-6">
                    <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                        Voltar
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6">
                    {agreementProbability !== null && (
                        <Card className="bg-primary-50 border-primary-200">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-primary-500" />
                                    <h3 className="text-lg font-bold text-primary-800">Análise de Risco (IA)</h3>
                                </div>
                                <div className="text-right">
                                    <p className={`text-3xl font-bold ${probabilityColor}`}>{agreementProbability}%</p>
                                    <p className="text-sm font-medium text-neutral-600">Probabilidade de Acordo</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-neutral-200">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800">Detalhes da Cobrança</h2>
                                <p className="text-sm text-neutral-500 mt-1">ID: {currentInvoice.id}</p>
                            </div>
                            <div className="mt-4 sm:mt-0 text-right">
                                <p className="text-3xl font-extrabold text-red-600">{formatCurrency(currentInvoice.updatedValue || currentInvoice.value)}</p>
                                {currentInvoice.updatedValue && currentInvoice.updatedValue > currentInvoice.value && (
                                    <div className="flex items-center justify-end gap-2 text-sm text-neutral-600 mt-1 flex-wrap">
                                        <span className="line-through">{formatCurrency(currentInvoice.value)}</span>
                                        <span className="text-red-500">+ {formatCurrency(fine)} (multa 2%)</span>
                                        <span className="text-red-500">+ {formatCurrency(interest)} (juros {monthsOverdue}m)</span>
                                    </div>
                                )}
                                <div className="mt-2">{getStatusChip(currentInvoice.status)}</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                             <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-3">Aluno e Responsável</h3>
                                 <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-neutral-500">Aluno:</span> <span className="font-medium text-neutral-800 text-right">{student.name} ({student.class})</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Responsável:</span> <span className="font-medium text-neutral-800 text-right">{guardian.name}</span></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-3">Informações da Dívida</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-neutral-500">Descrição:</span> <span className="font-medium text-neutral-800 text-right">{currentInvoice.notes || 'Mensalidade'}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">Vencimento:</span> <span className="font-medium text-neutral-800">{formatDate(currentInvoice.dueDate)}</span></div>
                                    {currentInvoice.collectionStage && (
                                         <div className="flex justify-between pt-2 border-t mt-2"><span className="text-neutral-500">Etapa da Cobrança:</span> <span className="font-bold text-primary-700 text-right">{collectionStageLabels[currentInvoice.collectionStage]}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {currentInvoice.agreement && (
                             <div className="mt-6 pt-6 border-t border-neutral-200">
                                 <h3 className="text-lg font-semibold text-neutral-700 mb-3">Detalhes do Acordo</h3>
                                 <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm space-y-2">
                                     <div className="flex justify-between"><span className="text-neutral-600">Parcelas:</span> <span className="font-bold text-neutral-800">{currentInvoice.agreement.installments}x de {formatCurrency(currentInvoice.agreement.installmentValue)}</span></div>
                                     <div className="flex justify-between"><span className="text-neutral-600">Forma de Pagamento:</span> <span className="font-bold text-neutral-800">{currentInvoice.agreement.paymentMethod}</span></div>
                                     <div className="flex justify-between"><span className="text-neutral-600">Venc. da 1ª Parcela:</span> <span className="font-bold text-neutral-800">{formatDate(currentInvoice.agreement.firstDueDate)}</span></div>
                                     <Button onClick={handleGenerateAgreementPdf} size="sm" variant="secondary" icon={<DocumentReportIcon />} className="mt-3">Gerar Termo de Acordo (PDF)</Button>
                                </div>
                             </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 justify-end flex-wrap">
                            <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)}>Ver Histórico</Button>
                            {currentInvoice.status !== InvoiceStatus.PAGO && (
                                <>
                                    {!currentInvoice.agreement && <Button variant="secondary" onClick={() => setIsAgreementModalOpen(true)}>Criar Acordo</Button>}
                                    <Button variant="secondary" onClick={() => setIsEmailModalOpen(true)} icon={<EnvelopeIcon className="w-5 h-5" />}>Email</Button>
                                    <Button variant="primary" onClick={() => setIsAiModalOpen(true)} icon={<SparklesIcon className="w-5 h-5" />}>WhatsApp com IA</Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            {isEmailModalOpen && (
                <EmailCommunicationModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} invoice={currentInvoice} student={student} guardian={guardian} />
            )}
            {isAiModalOpen && (
                <AiCommunicationModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} invoice={currentInvoice} student={student} guardian={guardian} />
            )}
            <ContactHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} invoiceId={currentInvoice.id} />
            <AgreementModal isOpen={isAgreementModalOpen} onClose={() => setIsAgreementModalOpen(false)} onSave={handleSaveAgreement} invoice={currentInvoice} />
        </>
    );
};

export default LawFirmInvoiceDetail;