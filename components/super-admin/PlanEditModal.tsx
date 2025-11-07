
import React, { useState, useEffect } from 'react';
import { Plan } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface PlanEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Plan) => void;
    plan: Plan;
}

const PlanEditModal = ({ isOpen, onClose, onSave, plan }: PlanEditModalProps): React.ReactElement => {
    const [formData, setFormData] = useState({ ...plan, features: plan.features.join('\n') });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData({ ...plan, features: plan.features.join('\n') });
    }, [plan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'monthly' || name === 'yearly') {
            setFormData(prev => ({ ...prev, price: { ...prev.price, [name]: Number(value) } }));
        } else if (name === 'studentLimit') {
            setFormData(prev => ({ ...prev, studentLimit: value === '' ? null : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const planToSave: Plan = {
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim() !== ''),
        };
        setTimeout(() => { // Simulate API call
            onSave(planToSave);
            setIsLoading(false);
        }, 500);
    };

    return (
        // FIX: Ensured Modal component wraps its children to satisfy the 'children' prop requirement.
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Plano: ${plan.name}`} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Nome do Plano</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full form-input" required />
                        </div>
                        <div>
                            <label className="form-label">Limite de Alunos Inadimplentes</label>
                            <input type="number" name="studentLimit" value={formData.studentLimit ?? ''} onChange={handleChange} className="w-full form-input" placeholder="Deixe em branco para ilimitado" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Preço Mensal (R$)</label>
                            <input type="number" name="monthly" value={formData.price.monthly} onChange={handleChange} className="w-full form-input" required />
                        </div>
                        <div>
                            <label className="form-label">Preço Anual (R$)</label>
                            <input type="number" name="yearly" value={formData.price.yearly} onChange={handleChange} className="w-full form-input" required />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Funcionalidades (uma por linha)</label>
                        <textarea name="features" value={formData.features} onChange={handleChange} rows={6} className="w-full form-input" required />
                    </div>
                    <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                </div>
                <footer className="p-4 border-t bg-neutral-50 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" isLoading={isLoading}>Salvar Alterações</Button>
                </footer>
            </form>
        </Modal>
    );
};

export default PlanEditModal;
