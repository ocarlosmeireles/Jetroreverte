
import React from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Invoice } from '../../types';
import { XIcon, ChatBubbleLeftRightIcon, CreditCardIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { INSTALLMENT_RATES } from '../../constants';

interface NegotiationIntentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmPayment: () => void;
    onRequestNegotiation: () => void;
    invoice: Invoice & {
        updatedValue: number;
        fine: number;
        interest: number;
    };
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

const NegotiationIntentModal = ({ isOpen, onClose, onConfirmPayment, onRequestNegotiation, invoice }: NegotiationIntentModalProps): React.ReactElement => {

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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Revisão de Débito Vencido</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="p-6 sm:p-8 flex-grow space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-neutral-800">Valor Atualizado para Pagamento</h3>
                                <p className="text-4xl font-bold my-2 text-red-600">{formatCurrency(invoice.updatedValue)}</p>
                            </div>
                            <div className="p-4 bg-neutral-50 rounded-lg text-sm space-y-2 border">
                                <div className="flex justify-between"><span className="text-neutral-500">Valor Original:</span> <span className="font-medium text-neutral-800">{formatCurrency(invoice.value)}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Multa (2%):</span> <span className="font-medium text-neutral-800">{formatCurrency(invoice.fine)}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500">Juros por atraso:</span> <span className="font-medium text-neutral-800">{formatCurrency(invoice.interest)}</span></div>
                            </div>

                            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/60 text-sm">
                                <h4 className="font-semibold text-blue-800 mb-2">Exemplo de Parcelamento do Acordo</h4>
                                <p className="text-xs text-blue-700 mb-3">Estes são valores aproximados para negociação e incluem juros de parcelamento. O valor final será confirmado pelo escritório.</p>
                                <div className="space-y-2">
                                    {[3, 6, 12].map(installments => {
                                        const rate = INSTALLMENT_RATES[installments as keyof typeof INSTALLMENT_RATES];
                                        if (!rate) return null;
                                        const totalWithInterest = invoice.updatedValue * (1 + rate);
                                        const installmentValue = totalWithInterest / installments;
                                        return (
                                            <div key={installments} className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-600">{installments} parcelas de</span>
                                                <span className="font-bold text-neutral-800">{formatCurrency(installmentValue)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <p className="text-center text-sm text-neutral-600">Por favor, confirme os valores atualizados. Você pode pagar o total agora ou solicitar um acordo para discutir as condições.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <Button onClick={onRequestNegotiation} size="lg" variant="secondary" className="flex-col h-auto py-4">
                                    <ChatBubbleLeftRightIcon className="w-6 h-6 mb-2" />
                                    <span className="font-semibold text-sm">Solicitar Acordo</span>
                                    <span className="text-xs font-normal mt-1">Abrir portal de negociação.</span>
                                </Button>
                                 <Button onClick={onConfirmPayment} size="lg" variant="primary" className="flex-col h-auto py-4">
                                    <CreditCardIcon className="w-6 h-6 mb-2" />
                                    <span className="font-semibold text-sm">Pagar Valor Total</span>
                                    <span className="text-xs font-normal mt-1">Ir para o pagamento.</span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NegotiationIntentModal;