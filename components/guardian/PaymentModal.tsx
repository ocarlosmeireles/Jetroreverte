import React from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Invoice } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
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

const PaymentModal = ({ isOpen, onClose, invoice }: PaymentModalProps): React.ReactElement => {

    const handleRedirectToPayment = () => {
        if (invoice.paymentLink && invoice.paymentLink !== '#') {
            window.open(invoice.paymentLink, '_blank', 'noopener,noreferrer');
        } else {
            // Fallback for demo data or missing links
            alert("Link de pagamento não configurado. Em um ambiente real, você seria redirecionado para o portal de pagamentos.");
        }
        onClose();
    };

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
                            <h2 className="text-xl font-bold text-neutral-800">Realizar Pagamento</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="p-8 flex-grow text-center">
                            <h3 className="text-lg font-semibold text-neutral-800">Detalhes do Débito</h3>
                            <p className="text-4xl font-bold my-4 text-primary-600">{formatCurrency(invoice.value)}</p>
                            <p className="text-sm text-neutral-600 mb-6">
                                Referente a {invoice.notes || 'Mensalidade'} de {invoice.studentName}
                            </p>
                            
                            <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-700">
                                <p>Você será redirecionado para o portal de pagamentos para concluir a transação de forma segura.</p>
                            </div>

                            <Button onClick={handleRedirectToPayment} className="w-full mt-8" size="lg">
                                Ir para o Pagamento
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;