

import React, { useState } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { NegotiationChannel } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface AddNegotiationAttemptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { channel: NegotiationChannel, notes: string }) => void;
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

const channelLabels: Record<string, string> = {
    [NegotiationChannel.EMAIL]: 'E-mail',
    [NegotiationChannel.WHATSAPP]: 'WhatsApp',
    [NegotiationChannel.PHONE_CALL]: 'Ligação Telefônica',
};

const AddNegotiationAttemptModal = ({ isOpen, onClose, onSave }: AddNegotiationAttemptModalProps): React.ReactElement => {
    const [channel, setChannel] = useState<NegotiationChannel>(NegotiationChannel.WHATSAPP);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const availableChannels = [NegotiationChannel.WHATSAPP, NegotiationChannel.EMAIL, NegotiationChannel.PHONE_CALL];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onSave({ channel, notes });
            setIsLoading(false);
            setNotes(''); // Reset form
            setChannel(NegotiationChannel.WHATSAPP);
        }, 500);
    };
    
    const isFormValid = () => notes.trim() !== '';

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
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-neutral-800">Registrar Contato</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                             <div>
                                <label htmlFor="channel" className="block text-sm font-medium text-neutral-700 mb-1">Canal de Contato *</label>
                                <select 
                                    id="channel" 
                                    value={channel} 
                                    onChange={e => setChannel(e.target.value as NegotiationChannel)} 
                                    className="w-full form-input"
                                >
                                    {availableChannels.map(ch => (
                                        <option key={ch} value={ch}>{channelLabels[ch]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">Anotações / Resumo da Conversa *</label>
                                <textarea 
                                    id="notes" 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    rows={5} 
                                    className="w-full form-input" 
                                    placeholder="Ex: Responsável informou que irá verificar a situação e pediu para retornar em 2 dias."
                                    required 
                                />
                            </div>
                             <style>{`.form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Registro</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddNegotiationAttemptModal;