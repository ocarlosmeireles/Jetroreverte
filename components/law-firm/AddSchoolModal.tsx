

import React, { useState } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface AddSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
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

const AddSchoolModal = ({ isOpen, onClose, onSave }: AddSchoolModalProps): React.ReactElement => {
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        address: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onSave(formData);
            setIsLoading(false);
        }, 1000);
    };
    
    const isFormValid = () => {
        return formData.name && formData.cnpj && formData.address && formData.phone;
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Cadastrar Nova Escola Cliente</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6">
                            <section className="mb-6">
                                <h3 className="text-lg font-semibold text-neutral-700 mb-4">Dados da Escola</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" name="name" placeholder="Nome da Escola *" value={formData.name} onChange={handleChange} className="w-full form-input" required />
                                    <input type="text" name="cnpj" placeholder="CNPJ *" value={formData.cnpj} onChange={handleChange} className="w-full form-input" required />
                                    <input type="text" name="address" placeholder="Endereço *" value={formData.address} onChange={handleChange} className="w-full form-input sm:col-span-2" required />
                                    <input type="tel" name="phone" placeholder="Telefone *" value={formData.phone} onChange={handleChange} className="w-full form-input" required />
                                </div>
                            </section>
                            <style>{`.form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Escola</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddSchoolModal;
