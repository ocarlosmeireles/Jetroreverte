import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Guardian } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface AddGuardianModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Guardian, 'id' | 'schoolId'>) => Promise<void>;
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

const initialFormData = {
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    address: '',
    relationship: '',
};

const AddGuardianModal = ({ isOpen, onClose, onSave }: AddGuardianModalProps): React.ReactElement => {
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSave(formData);
        setIsLoading(false);
    };
    
    const isFormValid = () => {
        return formData.name && formData.email && formData.phone && formData.cpf && formData.address;
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Cadastrar Novo Responsável</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div><label className="form-label">Nome completo *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full form-input" required /></div>
                                 <div><label className="form-label">CPF *</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="w-full form-input" required /></div>
                            </div>
                            <div><label className="form-label">Endereço completo *</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full form-input" required /></div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div><label className="form-label">Telefone (Celular) *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full form-input" required /></div>
                                 <div><label className="form-label">E-mail *</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full form-input" required /></div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="form-label">RG (opcional)</label><input type="text" name="rg" value={formData.rg} onChange={handleChange} className="w-full form-input" /></div>
                                <div><label className="form-label">Parentesco</label><input type="text" name="relationship" placeholder="Pai, Mãe, Tutor, etc." value={formData.relationship} onChange={handleChange} className="w-full form-input" /></div>
                            </div>
                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Responsável</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddGuardianModal;