

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Invoice, AgreementDetails } from '../../types';
import { XIcon } from './icons';
import Button from './Button';
import { formatCurrency } from '../../utils/formatters';
import { INSTALLMENT_RATES } from '../../constants';

interface AgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Changed onSave prop to not expect 'protocolNumber', as it's generated in the parent component.
    onSave: (data: Omit<AgreementDetails, 'createdAt' | 'protocolNumber'>) => void;
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

const AgreementModal = ({ isOpen, onClose, onSave, invoice }: AgreementModalProps): React.ReactElement => {
    const totalValue = invoice.updatedValue || invoice.value;
    
    const [installments, setInstallments] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'Boleto' | 'Pix' | 'Cartão de Crédito'>('Boleto');
    const [firstDueDate, setFirstDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInstallments(1);
            setPaymentMethod('Boleto');
            setFirstDueDate('');
        }
    }, [isOpen]);
    
    const { installmentValue, totalWithInterest, interestRate, isInterestFree } = useMemo(() => {
        if (installments === 1) {
            return {
                installmentValue: totalValue,
                totalWithInterest: totalValue,
                interestRate: 0,
                isInterestFree: true,
            };
        }
        
        const rate = INSTALLMENT_RATES[installments as keyof typeof INSTALLMENT_RATES] || 0;
        const total = totalValue * (1 + rate);
        const installment = total / installments;

        return {
            installmentValue: installment,
            totalWithInterest: total,
            interestRate: rate * 100,
            isInterestFree: false,
        };
    }, [installments, totalValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onSave({
                installments,
                installmentValue,
                paymentMethod,
                firstDueDate,
            });
            setIsLoading(false);
        }, 500);
    };
    
    const isFormValid = () => firstDueDate !== '';

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
                            <h2 className="text-xl font-bold text-neutral-800">Criar Acordo de Parcelamento</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="text-center p-4 bg-primary-50 rounded-lg">
                                <p className="text-sm text-primary-800">Valor Atualizado para Acordo</p>
                                <p className="text-3xl font-bold text-primary-700">{formatCurrency(totalValue)}</p>
                            </div>
                             <div>
                                <label htmlFor="installments" className="form-label">Opções de Parcelamento</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        id="installments" 
                                        min="1" 
                                        max="12" 
                                        value={installments} 
                                        onChange={e => setInstallments(Number(e.target.value))}
                                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-bold text-lg text-neutral-700 w-8 text-center">{installments}x</span>
                                </div>
                                <div className="text-center mt-2 p-3 bg-neutral-50 rounded-md">
                                    <p className="text-lg font-semibold text-neutral-800">
                                        {installments}x de <span className="text-green-600">{formatCurrency(installmentValue)}</span>
                                    </p>
                                    {isInterestFree ? (
                                        <p className="text-sm font-medium text-green-700">Sem juros de parcelamento</p>
                                    ) : (
                                        <p className="text-sm text-neutral-500">
                                            Total com juros: {formatCurrency(totalWithInterest)} ({interestRate.toFixed(2)}%)
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="paymentMethod" className="form-label">Forma de Pagamento</label>
                                    <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full form-input">
                                        <option>Boleto</option>
                                        <option>Pix</option>
                                        <option>Cartão de Crédito</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="firstDueDate" className="form-label">Venc. da 1ª Parcela</label>
                                    <input type="date" id="firstDueDate" value={firstDueDate} onChange={e => setFirstDueDate(e.target.value)} className="w-full form-input" required />
                                </div>
                            </div>
                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Acordo</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AgreementModal;