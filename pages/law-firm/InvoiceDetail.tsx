

import React, { useState, useMemo } from 'react';
import { demoInvoices, demoStudents, demoGuardians, demoSchools } from '../../services/demoData';
import { Invoice, Student, Guardian, InvoiceStatus, CollectionStage, AgreementDetails, School, User } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, SparklesIcon, EnvelopeIcon, DocumentReportIcon, CheckCircleIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AiCommunicationModal from '../../components/school/AiCommunicationModal';
import EmailCommunicationModal from '../../components/school/EmailCommunicationModal';
import ContactHistoryModal from '../../components/common/ContactHistoryModal';
import AgreementModal from '../../components/common/AgreementModal';
import { generateAgreementPdf } from '../../utils/agreementPdfGenerator';
import { useAuth } from '../../hooks/useAuth';
import Switch from '../../components/common/Switch';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';


interface InvoiceDetailProps {
    invoiceId: string;
    onBack: () => void;
}

// FIX: Added missing PREPARACAO_JUDICIAL key to satisfy the Record<CollectionStage, string> type.
const collectionStageLabels: Record<CollectionStage, string> = {
    [CollectionStage.AGUARDANDO_CONTATO]: 'Aguardando Contato',
    [CollectionStage.EM_NEGOCIACAO]: 'Em Negociação',
    [CollectionStage.ACORDO_FEITO]: 'Acordo Feito',
    [CollectionStage.PREPARACAO_JUDICIAL]: 'Preparação Judicial',
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

    const [discounts, setDiscounts] = useState({ excludeInterest: false, excludeFine: false });

    const student = useMemo(() => demoStudents.find(s => s.id === currentInvoice?.studentId), [currentInvoice]);
    const guardian = useMemo(() => demoGuardians.find(g => g.id === student?.guardianId), [student]);
    const school = useMemo(() => demoSchools.find(s => s.id === student?.schoolId), [student]);
    
    const { fine, interest } = useMemo(() => {
        if (!currentInvoice) return { fine: 0, interest: 0 };
        const { fine, interest } = calculateUpdatedInvoiceValues(currentInvoice);
        return { fine, interest };
    }, [currentInvoice]);

    const isOverdue = fine > 0 || interest > 0;

    const negotiatedValue = useMemo(() => {
        if (!currentInvoice) return 0;
        return parseFloat((currentInvoice.value + (discounts.excludeFine ? 0 : fine) + (discounts.excludeInterest ? 0 : interest)).toFixed(2));
    }, [currentInvoice, discounts, fine, interest]);


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

    const handleSaveAgreement = (agreement: Omit<AgreementDetails, 'createdAt' | 'protocolNumber'>) => {
        const newAgreement: AgreementDetails = { 
            ...agreement, 
            createdAt: new Date().toISOString(),
            protocolNumber: `ACORDO-${currentInvoice.id}-${Date.now()}`,
            isApproved: false, // Agreements start as not approved
        };
        // This is a hack for the demo to simulate a database update
        const invoiceIndex = demoInvoices.findIndex(i => i.id === currentInvoice.id);
        if (invoiceIndex !== -1) {
            demoInvoices[invoiceIndex].agreement = newAgreement;
            demoInvoices[invoiceIndex].collectionStage = CollectionStage.ACORDO_FEITO;
        }

        setCurrentInvoice(prev => prev ? { ...prev, agreement: newAgreement, collectionStage: CollectionStage.ACORDO_FEITO } : undefined);
        setIsAgreementModalOpen(false);
    };
    
    const handleGenerateAgreementPdf = () => {
        if(currentInvoice.agreement) {
            generateAgreementPdf(currentInvoice, student, guardian, school, user);
        }
    };
    
     const handleApproveAgreement = () => {
        if (!currentInvoice?.agreement) return;

        // This is a hack for the demo to simulate a database update
        const invoiceIndex = demoInvoices.findIndex(i => i.id === currentInvoice.id);
        if (invoiceIndex !== -1 && demoInvoices[invoiceIndex].agreement) {
            demoInvoices[invoiceIndex].agreement!.isApproved = true;
        }

        setCurrentInvoice(prev => {
            if (!prev || !prev.agreement) return prev;
            return {
                ...prev,
                agreement: {
                    ...prev.agreement,
                    isApproved: true,
                }
            };
        });
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
                                <p className="text-3xl font-extrabold text-red-600">{formatCurrency(negotiatedValue)}</p>
                                {isOverdue && (
                                    <div className="flex items-center justify-end gap-2 text-sm text-neutral-600 mt-1 flex-wrap">
                                        <span>{formatCurrency(currentInvoice.value)} (original)</span>
                                        {fine > 0 && (
                                            <span className={discounts.excludeFine ? 'line-through text-neutral-400' : 'text-red-500'}>
                                                + {formatCurrency(fine)} (multa)
                                            </span>
                                        )}
                                        {interest > 0 && (
                                            <span className={discounts.excludeInterest ? 'line-through text-neutral-400' : 'text-red-500'}>
                                                + {formatCurrency(interest)} (juros)
                                            </span>
                                        )}
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

                        {(isOverdue && (fine > 0 || interest > 0)) && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-3">Opções de Desconto</h3>
                                <div className="p-4 bg-neutral-50 rounded-lg border space-y-3">
                                    {fine > 0 && (
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="excludeFine" className="text-sm text-neutral-700">Excluir Multa ({formatCurrency(fine)})</label>
                                            <Switch checked={discounts.excludeFine} onChange={(checked) => setDiscounts(d => ({ ...d, excludeFine: checked }))} />
                                        </div>
                                    )}
                                    {interest > 0 && (
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="excludeInterest" className="text-sm text-neutral-700">Excluir Juros ({formatCurrency(interest)})</label>
                                            <Switch checked={discounts.excludeInterest} onChange={(checked) => setDiscounts(d => ({ ...d, excludeInterest: checked }))} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentInvoice.agreement && (
                             <div className="mt-6 pt-6 border-t border-neutral-200">
                                 <h3 className="text-lg font-semibold text-neutral-700 mb-3">Detalhes do Acordo</h3>
                                 <div className={`p-4 rounded-lg border ${currentInvoice.agreement.isApproved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} text-sm space-y-2`}>
                                     <div className="flex justify-between"><span className="text-neutral-600">Protocolo:</span> <span className="font-bold text-neutral-800 font-mono text-xs">{currentInvoice.agreement.protocolNumber}</span></div>
                                     <div className="flex justify-between"><span className="text-neutral-600">Parcelas:</span> <span className="font-bold text-neutral-800">{currentInvoice.agreement.installments}x de {formatCurrency(currentInvoice.agreement.installmentValue)}</span></div>
                                     <div className="flex justify-between"><span className="text-neutral-600">Forma de Pagamento:</span> <span className="font-bold text-neutral-800">{currentInvoice.agreement.paymentMethod}</span></div>
                                     <div className="flex justify-between"><span className="text-neutral-600">Venc. da 1ª Parcela:</span> <span className="font-bold text-neutral-800">{formatDate(currentInvoice.agreement.firstDueDate)}</span></div>
                                     
                                     {!currentInvoice.agreement.isApproved ? (
                                        <div className="pt-3 mt-3 border-t">
                                            <Button onClick={handleApproveAgreement} size="sm" icon={<CheckCircleIcon />} className="w-full">Aprovar Acordo</Button>
                                        </div>
                                     ) : (
                                        <div className="pt-3 mt-3 border-t">
                                            <Button onClick={handleGenerateAgreementPdf} size="sm" variant="secondary" icon={<DocumentReportIcon />} className="w-full">Gerar Termo de Acordo (PDF)</Button>
                                        </div>
                                     )}
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
            <AgreementModal isOpen={isAgreementModalOpen} onClose={() => setIsAgreementModalOpen(false)} onSave={handleSaveAgreement} invoice={{...currentInvoice, updatedValue: negotiatedValue}} />
        </>
    );
};

export default LawFirmInvoiceDetail;