import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { XIcon } from '../common/icons';
import Button from '../common/Button';

interface ResetPasswordModalProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const ResetPasswordModal = ({ onClose, onSwitchToLogin }: ResetPasswordModalProps) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { sendPasswordResetEmail } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(email);
            setMessage('Se existir uma conta com este e-mail, um link para redefinição de senha foi enviado.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                <h2 className="text-xl font-bold text-neutral-800">Recuperar Senha</h2>
                <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
            </header>
            <div className="p-8 pt-0">
                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <p className="text-sm text-neutral-600 text-center">Digite seu e-mail e enviaremos um link para você redefinir sua senha.</p>
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Email</label>
                            <input
                                type="email"
                                id="reset-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 border border-neutral-300 bg-neutral-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-green-700 bg-green-50 p-4 rounded-lg">{message}</p>
                        <Button onClick={onClose} className="w-full">
                            Fechar
                        </Button>
                    </div>
                )}
                 <div className="mt-6 text-center text-sm">
                    <button onClick={onSwitchToLogin} className="text-primary-600 hover:underline">Voltar para o Login</button>
                </div>
            </div>
        </motion.div>
    );
};

export default ResetPasswordModal;