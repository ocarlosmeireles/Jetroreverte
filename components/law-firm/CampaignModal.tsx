import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Campaign } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaignData: Omit<Campaign, 'id' | 'status' | 'leadsGenerated' | 'officeId' | 'conversionRate' | 'valueGenerated'>, id?: string) => void;
    personas: any[];
    campaign: Campaign | null;
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

const CampaignModal = ({ isOpen, onClose, onSave, personas, campaign }: CampaignModalProps): React.ReactElement => {
    const [formData, setFormData] = useState({
        name: '',
        target: '',
        startDate: new Date().toISOString().split('T')[0],
        personaName: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if(campaign) {
                setFormData({
                    name: campaign.name,
                    target: campaign.target,
                    startDate: new Date(campaign.startDate).toISOString().split('T')[0],
                    personaName: (campaign as any).personaName || '',
                });
            } else {
                setFormData({
                    name: '',
                    target: '',
                    startDate: new Date().toISOString().split('T')[0],
                    personaName: '',
                });
            }
        }
    }, [isOpen, campaign]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const dataToSave = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            target: formData.personaName || formData.target, // Use persona name as target if selected
        };
        setTimeout(() => {
            onSave(dataToSave, campaign?.id);
            setIsLoading(false);
        }, 500);
    };

    const isFormValid = () => formData.name && (formData.target || formData.personaName) && formData.startDate;

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
                            <h2 className="text-xl font-bold text-neutral-800">{campaign ? 'Editar Campanha' : 'Criar Nova Campanha'}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-4">
                            <div>
                                <label className="form-label">Nome da Campanha *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full form-input" required />
                            </div>
                             <div>
                                <label className="form-label">Público-Alvo (Persona) *</label>
                                <select name="personaName" value={formData.personaName} onChange={handleChange} className="w-full form-input" required>
                                    <option value="">Selecione uma persona</option>
                                    {personas.map((p, i) => <option key={i} value={p.personaName}>{p.personaName}</option>)}
                                    <option value="custom">Outro (descrever abaixo)</option>
                                </select>
                            </div>
                            {formData.personaName === 'custom' && (
                                <div>
                                    <label className="form-label">Descreva o Público-Alvo</label>
                                    <input type="text" name="target" value={formData.target} onChange={handleChange} className="w-full form-input" placeholder="Ex: Escolas de Ensino Médio de SP" required />
                                </div>
                            )}
                            <div>
                                <label className="form-label">Data de Início *</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full form-input" required />
                            </div>
                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Campanha</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CampaignModal;
