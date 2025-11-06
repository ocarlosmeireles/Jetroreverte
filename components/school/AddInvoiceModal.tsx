

import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Student, Invoice } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    existingStudents: Student[];
    preselectedStudentId?: string;
    invoiceToEdit?: Invoice | null;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// FIX: Explicitly type modalVariants with the Variants type.
const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const AddInvoiceModal = ({ isOpen, onClose, onSave, existingStudents, preselectedStudentId, invoiceToEdit }: AddInvoiceModalProps): React.ReactElement => {
    const [formData, setFormData] = useState({
        studentId: '',
        invoiceDescription: '',
        invoiceValue: '',
        invoiceDueDate: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (invoiceToEdit) { // Edit mode
                setFormData({
                    studentId: invoiceToEdit.studentId,
                    invoiceDescription: invoiceToEdit.notes || '',
                    invoiceValue: String(invoiceToEdit.value),
                    invoiceDueDate: invoiceToEdit.dueDate.split('T')[0], // Format YYYY-MM-DD for date input
                });
            } else { // Add mode
                setFormData({
                    studentId: preselectedStudentId || (existingStudents.length > 0 ? existingStudents[0].id : ''),
                    invoiceDescription: '',
                    invoiceValue: '',
                    invoiceDueDate: '',
                });
            }
        }
    }, [isOpen, existingStudents, preselectedStudentId, invoiceToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onSave(formData);
            setIsLoading(false);
        }, 1000);
    };

    const isFormValid = () => {
        return formData.studentId && formData.invoiceDescription && formData.invoiceValue && formData.invoiceDueDate;
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-neutral-800">{invoiceToEdit ? 'Editar Cobrança' : 'Gerar Nova Cobrança'}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="studentId" className="block text-sm font-medium text-neutral-700 mb-1">Selecione o Aluno *</label>
                                <select name="studentId" id="studentId" value={formData.studentId} onChange={handleChange} className="w-full form-input disabled:bg-neutral-100" required disabled={!!preselectedStudentId || !!invoiceToEdit}>
                                    {existingStudents.length > 0 ? (
                                        existingStudents.map(s => <option key={s.id} value={s.id}>{s.name} - Turma: {s.class}</option>)
                                    ) : (
                                        <option disabled>Nenhum aluno cadastrado</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="invoiceDescription" className="block text-sm font-medium text-neutral-700 mb-1">Descrição da Cobrança *</label>
                                <input type="text" name="invoiceDescription" id="invoiceDescription" value={formData.invoiceDescription} onChange={handleChange} className="w-full form-input" placeholder="Ex: Mensalidade de Setembro" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="invoiceValue" className="block text-sm font-medium text-neutral-700 mb-1">Valor (R$) *</label>
                                    <input type="number" step="0.01" name="invoiceValue" id="invoiceValue" value={formData.invoiceValue} onChange={handleChange} className="w-full form-input" placeholder="Ex: 750.50" required />
                                </div>
                                <div>
                                    <label htmlFor="invoiceDueDate" className="block text-sm font-medium text-neutral-700 mb-1">Data de Vencimento *</label>
                                    <input type="date" name="invoiceDueDate" id="invoiceDueDate" value={formData.invoiceDueDate} onChange={handleChange} className="w-full form-input" required />
                                </div>
                            </div>
                            <style>{`.form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>
                                {invoiceToEdit ? 'Salvar Alterações' : 'Salvar Cobrança'}
                            </Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddInvoiceModal;