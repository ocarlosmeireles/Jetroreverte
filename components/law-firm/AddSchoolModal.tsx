

import React, { useState, useEffect } from 'react';
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

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const initialFormData = {
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    financialContactName: '',
    financialContactEmail: '',
    financialContactPhone: '',
    legalRepresentativeName: '',
    legalRepresentativeCpf: '',
    totalStudents: '',
    averageTuition: '',
    currentDefaultRate: '',
    internalCollectionProcess: '',
};

const AddSchoolModal = ({ isOpen, onClose, onSave }: AddSchoolModalProps): React.ReactElement => {
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        return formData.name && formData.cnpj && formData.address && formData.phone && formData.financialContactName && formData.financialContactEmail && formData.legalRepresentativeName;
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
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
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-8">
                            
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">1. Dados da Escola</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="form-label">Nome da Escola *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <label className="form-label">CNPJ *</label>
                                        <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <label className="form-label">Telefone Principal *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="form-label">Endereço Completo *</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">2. Contatos Principais</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Nome do Contato Financeiro *</label>
                                        <input type="text" name="financialContactName" value={formData.financialContactName} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <label className="form-label">Email do Financeiro *</label>
                                        <input type="email" name="financialContactEmail" value={formData.financialContactEmail} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                     <div>
                                        <label className="form-label">Telefone do Financeiro</label>
                                        <input type="tel" name="financialContactPhone" value={formData.financialContactPhone} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Nome do Representante Legal *</label>
                                        <input type="text" name="legalRepresentativeName" value={formData.legalRepresentativeName} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <label className="form-label">CPF do Representante Legal</label>
                                        <input type="text" name="legalRepresentativeCpf" value={formData.legalRepresentativeCpf} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">3. Informações da Cobrança</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="form-label">Nº Total de Alunos</label>
                                        <input type="number" name="totalStudents" value={formData.totalStudents} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Mensalidade Média (R$)</label>
                                        <input type="number" name="averageTuition" value={formData.averageTuition} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Inadimplência Atual (%)</label>
                                        <input type="number" name="currentDefaultRate" value={formData.currentDefaultRate} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                </div>
                                 <div className="mt-4">
                                    <label className="form-label">Como é o processo de cobrança interno?</label>
                                    <textarea name="internalCollectionProcess" value={formData.internalCollectionProcess} onChange={handleChange} rows={3} className="w-full form-input" placeholder="Ex: A secretaria liga para o responsável após 15 dias de atraso..."></textarea>
                                </div>
                            </section>

                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
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