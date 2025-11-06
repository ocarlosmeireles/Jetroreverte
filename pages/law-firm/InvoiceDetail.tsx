
import React, { useState, useEffect } from 'react';
import { demoInvoices, demoStudents, demoGuardians } from '../../services/demoData';
import { Invoice, Student, Guardian, InvoiceStatus, CollectionStage } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, SparklesIcon, EnvelopeIcon, ClipboardIcon, PencilIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AiCommunicationModal from '../../components/school/AiCommunicationModal';
import EmailCommunicationModal from '../../components/school/EmailCommunicationModal';
import ContactHistoryModal from '../../components/common/ContactHistoryModal';

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
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    const initialInvoice = demoInvoices.find(i => i.id === invoiceId);
    const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);

    const [isEditingLink, setIsEditingLink] = useState(false);
    const [linkInputValue, setLinkInputValue] = useState(currentInvoice?.paymentLink || '');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setLinkInputValue(currentInvoice?.paymentLink || '');
    }, [currentInvoice]);

    const student = demoStudents.find(s => s.id === currentInvoice?.studentId);
    const guardian = demoGuardians.find(g => g.id === student?.guardianId);
    
    if (!currentInvoice || !student || !guardian) {
        return (
            <Card>
                <p>Cobrança não encontrada.</p>
                <Button onClick={onBack} className="mt-4">Voltar</Button>
            </Card>
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
        setIsEditingLink(false);
        // In a real app, you would save this to the database.
    };
    
    const agreementProbability = currentInvoice.riskScore !== undefined ? 100 - currentInvoice.riskScore : null;
    const probabilityColor = agreementProbability === null ? 'text-neutral-700' : agreementProbability > 60 ? 'text-green-600' : agreementProbability > 30 ? 'text-yellow-600' : 'text-red-600';

    return (
        <>
            <div className="p-6">
                <div className="mb-6">
                    <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                        Voltar para a lista
                    </Button>
                </div>
                
                {agreementProbability !== null && (
                    <Card className="mb-6 bg-primary-50 border-primary-200">
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
                            <p className="text-sm text-neutral-500 mt-1">ID da Cobrança: ${currentInvoice.id}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-3xl font-extrabold text-neutral-900">{formatCurrency(currentInvoice.value)}</p>
                            {getStatusChip(currentInvoice.status)}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-700 mb-3">Informações</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-neutral-500">Descrição:</span> <span className="font-medium text-neutral-800 text-right">{currentInvoice.notes || 'Mensalidade'}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Vencimento:</span> <span className="font-medium text-neutral-800">{formatDate(currentInvoice.dueDate)}</span></div>
                                {currentInvoice.collectionStage && (
                                     <div className="flex justify-between pt-2 border-t mt-2"><span className="text-neutral-500">Etapa da Cobrança:</span> <span className="font-bold text-primary-700 text-right">{collectionStageLabels[currentInvoice.collectionStage]}</span></div>
                                )}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-neutral-700 mb-3">Aluno e Responsável</h3>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-neutral-500">Aluno:</span> <span className="font-medium text-neutral-800 text-right">{student.name} ({student.class})</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Responsável:</span> <span className="font-medium text-neutral-800 text-right">{guardian.name}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                        <h3 className="text-lg font-semibold text-neutral-700 mb-3">Link de Pagamento</h3>
                        {isEditingLink ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={linkInputValue}
                                    onChange={(e) => setLinkInputValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-primary-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition"
                                    placeholder="https://seu-link-de-pagamento.com"
                                />
                                <Button size="sm" onClick={handleSaveLink}>Salvar</Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsEditingLink(false)}>Cancelar</Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                {currentInvoice.paymentLink ? (
                                    <>
                                        <span className="text-sm text-neutral-600 truncate">{currentInvoice.paymentLink}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            <button onClick={handleCopyLink} className="p-2 rounded-full hover:bg-neutral-200 transition-colors" title="Copiar Link">
                                                <ClipboardIcon className="w-4 h-4 text-neutral-600" />
                                            </button>
                                            <button onClick={() => setIsEditingLink(true)} className="p-2 rounded-full hover:bg-neutral-200 transition-colors" title="Editar Link">
                                                <PencilIcon className="w-4 h-4 text-neutral-600" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                       <span className="text-sm text-neutral-500">Nenhum link cadastrado.</span>
                                       <Button size="sm" variant="secondary" onClick={() => setIsEditingLink(true)}>Adicionar Link</Button>
                                    </>
                                )}
                            </div>
                        )}
                        {isCopied && <p className="text-xs text-green-600 mt-1 animate-fade-in">Link copiado!</p>}
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 justify-end flex-wrap">
                        <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)}>Ver Histórico</Button>
                        {currentInvoice.status !== InvoiceStatus.PAGO && (
                            <>
                                <Button variant="secondary" onClick={() => setIsEmailModalOpen(true)} icon={<EnvelopeIcon className="w-5 h-5" />}>
                                    Enviar Email
                                </Button>
                                <Button variant="primary" onClick={() => setIsAiModalOpen(true)} icon={<SparklesIcon className="w-5 h-5" />}>
                                    WhatsApp com IA
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
            {isEmailModalOpen && (
                <EmailCommunicationModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    invoice={currentInvoice}
                    student={student}
                    guardian={guardian}
                />
            )}
            {isAiModalOpen && (
                <AiCommunicationModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    invoice={currentInvoice}
                    student={student}
                    guardian={guardian}
                />
            )}
            <ContactHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                invoiceId={currentInvoice.id}
            />
        </>
    );
};

export default LawFirmInvoiceDetail;
