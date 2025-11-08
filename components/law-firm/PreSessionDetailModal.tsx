import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { NegotiationCase } from '../../types';
import Button from '../common/Button';
import { XIcon, UserCircleIcon, AcademicCapIcon, PhoneIcon } from '../common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface PreSessionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: NegotiationCase | null;
    onStartSession: (caseData: NegotiationCase) => void;
    isLoading: boolean;
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

const PreSessionDetailModal = ({ isOpen, onClose, caseData, onStartSession, isLoading }: PreSessionDetailModalProps): React.ReactElement | null => {
    if (!caseData) return null;

    const { invoice, student, guardian, school } = caseData;
    const { updatedValue, fine, interest } = calculateUpdatedInvoiceValues(invoice);

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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Revisão do Caso</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>

                        <div className="overflow-y-auto flex-grow p-6 space-y-6">
                            <section>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Aluno & Responsável</h3>
                                <div className="p-4 bg-neutral-50 rounded-lg border space-y-3">
                                    <div className="flex items-center gap-3">
                                        <AcademicCapIcon className="w-5 h-5 text-neutral-500" />
                                        <div>
                                            <p className="font-medium">{student?.name}</p>
                                            <p className="text-xs text-neutral-500">{school?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <UserCircleIcon className="w-5 h-5 text-neutral-500" />
                                        <div>
                                            <p className="font-medium">{guardian?.name}</p>
                                            <p className="text-xs text-neutral-500">{guardian?.email} / {guardian?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Resumo Financeiro</h3>
                                <div className="p-4 bg-neutral-50 rounded-lg border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-500">Valor Atualizado da Dívida</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(updatedValue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Valor Original (Venc. {formatDate(invoice.dueDate)})</span>
                                        <span className="font-medium text-neutral-800">{formatCurrency(invoice.value)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Multa (2%)</span>
                                        <span className="font-medium text-neutral-800">{formatCurrency(fine)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Juros por Atraso</span>
                                        <span className="font-medium text-neutral-800">{formatCurrency(interest)}</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button 
                                type="button" 
                                onClick={() => onStartSession(caseData)} 
                                isLoading={isLoading} 
                                icon={<PhoneIcon className="w-5 h-5" />}
                            >
                                Iniciar Sessão Live
                            </Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PreSessionDetailModal;