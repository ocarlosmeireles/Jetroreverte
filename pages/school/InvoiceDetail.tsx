import React, { useState, useEffect, useMemo } from 'react';
import { demoInvoices, demoStudents, demoGuardians } from '../../services/demoData';
import { Invoice, InvoiceStatus, CollectionStage } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, SparklesIcon, EnvelopeIcon, ClipboardIcon, PencilIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ContactHistoryModal from '../../components/common/ContactHistoryModal';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Modal from '../../components/common/Modal';

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

const InvoiceDetail = ({ invoiceId, onBack }: InvoiceDetailProps): React.ReactElement => {
    const [isActionRestrictedModalOpen, setIsActionRestrictedModalOpen] = useState(false);
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
    
    const { updatedValue, fine, interest } = useMemo(() => {
        if (!currentInvoice) return { updatedValue: 0, fine: 0, interest: 0 };
        return calculateUpdatedInvoiceValues(currentInvoice);
    }, [currentInvoice]);

    if (!currentInvoice || !student || !guardian) {
        return (
            <Card>
                <p>Cobrança não encontrada.</p>
                <Button onClick={onBack} className="mt-4">Voltar</Button>
            </Card>
        );
    }

    const displayValue = currentInvoice.status === InvoiceStatus.VENCIDO ? updatedValue : currentInvoice.value;
    
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
    };

    const handleViewReceipt = () => {
        const receiptHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Recibo de Pagamento - ${currentInvoice.id}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style> body { font-family: sans-serif; } </style>
            </head>
            <body class="bg-gray-100 p-10">
                <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Recibo de Pagamento</h1>
                    <p class="text-gray-500 mb-6">ID da Cobrança: ${currentInvoice.id}</p>
                    <div class="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                        <div>
                            <h2 class="text-sm font-semibold text-gray-500 uppercase">PAGO PARA</h2>
                            <p class="text-gray-800 font-medium">Escola Aprender Mais</p>
                        </div>
                        <div>
                            <h2 class="text-sm font-semibold text-gray-500 uppercase">PAGO POR</h2>
                            <p class="text-gray-800 font-medium">${guardian.name}</p>
                            <p class="text-gray-600 text-sm">${guardian.email}</p>
                        </div>
                    </div>
                    <h2 class="text-sm font-semibold text-gray-500 uppercase mb-2">DETALHES DO PAGAMENTO</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center"><span class="text-gray-600">Aluno:</span><span class="font-medium text-gray-800">${student.name}</span></div>
                        <div class="flex justify-between items-center"><span class="text-gray-600">Descrição:</span><span class="font-medium text-gray-800">${currentInvoice.notes || 'Mensalidade'}</span></div>
                        <div class="flex justify-between items-center"><span class="text-gray-600">Data de Pagamento:</span><span class="font-medium text-gray-800">${formatDate(currentInvoice.dueDate)}</span></div>
                    </div>
                    <div class="mt-6 pt-4 border-t-2 border-dashed">
                        <div class="flex justify-between items-center text-xl font-bold">
                            <span class="text-gray-600">TOTAL PAGO:</span>
                            <span class="text-green-600">${formatCurrency(currentInvoice.value)}</span>
                        </div>
                    </div>
                    <div class="mt-8 text-center text-sm text-gray-400">
                        <p>Este é um recibo gerado por computador e não requer assinatura.</p>
                        <p>Jetro Reverte - Plataforma de Cobrança Educacional</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
            receiptWindow.document.write(receiptHtml);
            receiptWindow.document.close();
        } else {
            alert('Não foi possível abrir a janela de recibo. Verifique se o seu navegador está bloqueando pop-ups.');
        }
    };

    return (
        <>
            <div>
                <div className="mb-6">
                    <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                        Voltar para a lista
                    </Button>
                </div>

                <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-neutral-200">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-800">Detalhes da Cobrança</h2>
                            <p className="text-sm text-neutral-500 mt-1">ID da Cobrança: ${currentInvoice.id}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-right">
                            <p className="text-3xl font-extrabold text-neutral-900">{formatCurrency(displayValue)}</p>
                            <div className="mt-1">{getStatusChip(currentInvoice.status)}</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-700 mb-3">Informações</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-neutral-500">Descrição:</span> <span className="font-medium text-neutral-800 text-right">{currentInvoice.notes || 'Mensalidade'}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Data de Vencimento:</span> <span className="font-medium text-neutral-800">{formatDate(currentInvoice.dueDate)}</span></div>
                                {currentInvoice.collectionStage && (
                                     <div className="flex justify-between pt-2 border-t mt-2"><span className="text-neutral-500">Status da Cobrança:</span> <span className="font-bold text-primary-700 text-right">{collectionStageLabels[currentInvoice.collectionStage]}</span></div>
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

                    {currentInvoice.status === InvoiceStatus.VENCIDO && (
                        <div className="mt-6 pt-6 border-t border-neutral-200">
                            <h3 className="text-lg font-semibold text-neutral-700 mb-3">Composição do Valor Atualizado</h3>
                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Valor Original:</span>
                                    <span className="font-medium text-neutral-800">{formatCurrency(currentInvoice.value)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Multa por atraso (2%):</span>
                                    <span className="font-medium text-neutral-800">{formatCurrency(fine)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Juros moratórios (1%/mês):</span>
                                    <span className="font-medium text-neutral-800">{formatCurrency(interest)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t mt-2">
                                    <span className="font-bold text-neutral-800">Total Atualizado:</span>
                                    <span className="font-bold text-red-600">{formatCurrency(updatedValue)}</span>
                                </div>
                            </div>
                        </div>
                    )}

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
                        {currentInvoice.status === InvoiceStatus.PAGO && <Button variant="secondary" onClick={handleViewReceipt}>Ver Recibo</Button>}
                        {currentInvoice.status !== InvoiceStatus.PAGO && (
                            <>
                                <Button variant="secondary" onClick={() => setIsActionRestrictedModalOpen(true)} icon={<EnvelopeIcon className="w-5 h-5" />}>
                                    Enviar Email
                                </Button>
                                <Button variant="secondary" onClick={() => setIsActionRestrictedModalOpen(true)} icon={<SparklesIcon className="w-5 h-5" />}>
                                    Gerar Mensagem WhatsApp
                                </Button>
                                {currentInvoice.status === InvoiceStatus.VENCIDO && <Button variant="danger" onClick={() => setIsActionRestrictedModalOpen(true)}>Enviar Lembrete de Atraso</Button>}
                            </>
                        )}
                        <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)}>Ver Histórico de Contato</Button>
                    </div>
                </Card>
            </div>
            <ContactHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                invoiceId={currentInvoice.id}
            />
            <Modal
                isOpen={isActionRestrictedModalOpen}
                onClose={() => setIsActionRestrictedModalOpen(false)}
                title="Ação do Escritório"
                size="sm"
            >
                <div className="p-6 text-center">
                    <p className="text-neutral-600">
                        O envio de comunicações e lembretes é uma ação estratégica gerenciada pelo escritório de advocacia para garantir a eficácia da cobrança.
                    </p>
                </div>
                <footer className="p-4 bg-neutral-50 flex justify-end rounded-b-2xl">
                    <Button onClick={() => setIsActionRestrictedModalOpen(false)}>Entendi</Button>
                </footer>
            </Modal>
        </>
    );
};

export default InvoiceDetail;