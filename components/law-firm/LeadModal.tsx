import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Lead, Campaign } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (leadData: Omit<Lead, 'id' | 'status' | 'officeId'>, id?: string) => void;
    lead: Lead | null;
    campaigns: Campaign[];
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

const LeadModal = ({ isOpen, onClose, onSave, lead, campaigns }: LeadModalProps): React.ReactElement => {
    const [formData, setFormData] = useState({
        schoolName: '',
        contactName: '',
        contactEmail: '',
        potentialValue: '0',
        lastContactDate: new Date().toISOString().split('T')[0],
        notes: '',
        campaignId: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (lead) { // Editing mode
                setFormData({
                    schoolName: lead.schoolName,
                    contactName: lead.contactName,
                    contactEmail: lead.contactEmail,
                    potentialValue: String(lead.potentialValue),
                    lastContactDate: new Date(lead.lastContactDate).toISOString().split('T')[0],
                    notes: lead.notes || '',
                    campaignId: lead.campaignId || '',
                });
            } else { // Creating mode
                setFormData({
                    schoolName: '',
                    contactName: '',
                    contactEmail: '',
                    potentialValue: '0',
                    lastContactDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    campaignId: '',
                });
            }
        }
    }, [isOpen, lead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const dataToSave = {
            ...formData,
            potentialValue: parseFloat(formData.potentialValue) || 0,
            lastContactDate: new Date(formData.lastContactDate).toISOString(),
        };
        onSave(dataToSave, lead?.id);
        setIsLoading(false);
    };

    const isFormValid = () => formData.schoolName && formData.contactName;

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
                            <h2 className="text-xl font-bold text-neutral-800">{lead ? 'Editar Lead' : 'Adicionar Novo Lead'}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="form-label">Nome da Escola *</label><input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full form-input" required /></div>
                                <div><label className="form-label">Nome do Contato *</label><input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full form-input" required /></div>
                            </div>
                            <div><label className="form-label">Email do Contato</label><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full form-input" /></div>
                            <div>
                                <label className="form-label">Campanha</label>
                                <select name="campaignId" value={formData.campaignId} onChange={handleChange} className="w-full form-input">
                                    <option value="">Nenhuma</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="form-label">Valor Potencial (R$)</label><input type="number" name="potentialValue" value={formData.potentialValue} onChange={handleChange} className="w-full form-input" /></div>
                                <div><label className="form-label">Data do Último Contato</label><input type="date" name="lastContactDate" value={formData.lastContactDate} onChange={handleChange} className="w-full form-input" /></div>
                             </div>
                             <div>
                                <label className="form-label">Anotações</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full form-input" placeholder="Detalhes da negociação, próximos passos, etc." />
                            </div>
                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Lead</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LeadModal;