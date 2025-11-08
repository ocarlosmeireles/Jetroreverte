import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { NegotiationCase, NegotiationChannel } from '../../types';
import { XIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon, DocumentPlusIcon } from '../common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Button from '../common/Button';

interface NegotiationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: NegotiationCase;
}

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const channelInfo: Record<NegotiationChannel, { icon: ReactNode; label: string }> = {
    [NegotiationChannel.PHONE_CALL]: { icon: <PhoneIcon className="w-4 h-4 text-neutral-500" />, label: 'Ligação' },
    [NegotiationChannel.EMAIL]: { icon: <EnvelopeIcon className="w-4 h-4 text-neutral-500" />, label: 'E-mail' },
    [NegotiationChannel.WHATSAPP]: { icon: <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-neutral-500" />, label: 'WhatsApp' },
    [NegotiationChannel.PETITION_GENERATED]: { icon: <DocumentPlusIcon className="w-4 h-4 text-neutral-500" />, label: 'Petição Gerada' }
};

const NegotiationDetailModal = ({ isOpen, onClose, caseData }: NegotiationDetailModalProps): React.ReactElement => {
    const { invoice, student, guardian, attempts } = caseData;
    const { updatedValue, monthsOverdue } = calculateUpdatedInvoiceValues(invoice);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-800">Detalhes da Negociação</h2>
                                <p className="text-sm text-neutral-500">Caso do aluno: {student?.name}</p>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="overflow-y-auto flex-grow p-6 space-y-6">
                            {/* Financial Summary */}
                            <section>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Resumo Financeiro</h3>
                                <div className="p-4 bg-neutral-50 rounded-lg border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-500">Valor Atualizado da Dívida</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(updatedValue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Valor Original</span>
                                        <span className="font-medium text-neutral-800">{formatCurrency(invoice.value)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Vencimento Original</span>
                                        <span className="font-medium text-neutral-800">{formatDate(invoice.dueDate)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Meses em Atraso</span>
                                        <span className="font-medium text-neutral-800">{monthsOverdue}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Guardian Info */}
                            <section>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Dados do Responsável</h3>
                                <div className="text-sm">
                                    <p><span className="font-semibold">Nome:</span> {guardian?.name}</p>
                                    <p><span className="font-semibold">Email:</span> {guardian?.email}</p>
                                    <p><span className="font-semibold">Telefone:</span> {guardian?.phone}</p>
                                </div>
                            </section>

                            {/* Contact History */}
                            <section>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Histórico de Contato</h3>
                                <div className="space-y-4">
                                    {attempts.length > 0 ? (
                                        attempts.map(attempt => (
                                            <div key={attempt.id} className="flex gap-3">
                                                <div className="flex-shrink-0 pt-1">{channelInfo[attempt.channel].icon}</div>
                                                <div>
                                                    <p className="text-sm font-semibold">{channelInfo[attempt.channel].label} em {formatDate(attempt.date)}</p>
                                                    <p className="text-sm text-neutral-600">{attempt.notes}</p>
                                                    <p className="text-xs text-neutral-400">por {attempt.author}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-500">Nenhum contato registrado ainda.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NegotiationDetailModal;