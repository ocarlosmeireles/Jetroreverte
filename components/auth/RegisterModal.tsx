
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { XIcon } from '../common/icons';

interface RegisterModalProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const RegisterModal = ({ onClose, onSwitchToLogin }: RegisterModalProps) => {
    const [officeName, setOfficeName] = useState('');
    const [personName, setPersonName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        setIsLoading(true);
        try {
            const user = await register(personName, officeName, email, password);
            if (user) {
                onClose();
            }
        } catch (err: any) {
            const friendlyMessage = err.code === 'auth/email-already-in-use'
                ? 'Este e-mail já está em uso.'
                : 'Falha no cadastro. Tente novamente.';
            setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-800">Criar sua conta</h2>
                <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
            </header>
            <div className="p-8 pt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="Nome do Escritório" className="w-full form-input" required />
                    <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Seu Nome" className="w-full form-input" required />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full form-input" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" className="w-full form-input" required />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme sua Senha" className="w-full form-input" required />
                    
                    {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

                    <Button type="submit" disabled={isLoading} className="w-full !py-3 !text-base">
                        {isLoading ? 'Criando...' : 'Criar Conta'}
                    </Button>
                </form>
                 <div className="text-center mt-6 text-sm">
                    <p className="text-neutral-500">Já tem uma conta? <button onClick={onSwitchToLogin} className="font-semibold text-primary-600 hover:underline">Entre aqui</button></p>
                </div>
            </div>
             <style>{`.form-input { border-radius: 0.75rem; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </motion.div>
    );
};

export default RegisterModal;
