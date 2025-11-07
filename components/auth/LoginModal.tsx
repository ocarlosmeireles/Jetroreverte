
import React, { useState } from 'react';
// FIX: Imported motion and Variants for self-contained animation.
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { DEMO_USERS } from '../../constants';
// FIX: Imported XIcon for the close button.
import { XIcon } from '../common/icons';

interface LoginModalProps {
    onClose: () => void;
    onSwitchToReset: () => void;
    onSwitchToRegister: () => void;
}

// FIX: Added animation variants for the modal.
const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const LoginModal = ({ onClose, onSwitchToReset, onSwitchToRegister }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (!user) {
                 setError('Credenciais inválidas. Verifique e tente novamente.');
            } else {
                onClose(); // Close modal on successful login
            }
        } catch (err: any) {
             const friendlyMessage = err.code === 'auth/invalid-credential' 
                ? 'Credenciais inválidas. Verifique e tente novamente.'
                : 'Ocorreu um erro ao fazer login.';
             setError(friendlyMessage);
        }
    };

    const handleDemoLogin = async (userType: keyof typeof DEMO_USERS) => {
        setError('');
        try {
            const user = await login(DEMO_USERS[userType].email, DEMO_USERS[userType].password);
            if (!user) {
                setError('Falha ao fazer login com usuário de demonstração.');
            } else {
                onClose(); // Close modal on successful login
            }
        } catch (err: any) {
            setError('Ocorreu um erro ao fazer login com o usuário de demonstração.');
        }
    };

    return (
        // FIX: Replaced Modal component with a self-contained motion.div to work directly with App.tsx's AnimatePresence.
        <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-800">Entrar na sua conta</h2>
                <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
            </header>
            <div className="p-8 pt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-neutral-300 bg-neutral-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition" required />
                    </div>
                    <div>
                         <div className="flex justify-between items-baseline mb-1 ml-3">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Senha</label>
                            <button type="button" onClick={onSwitchToReset} className="text-xs text-primary-600 hover:underline">Esqueci minha senha</button>
                        </div>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-neutral-300 bg-neutral-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition" required />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-md shadow-primary-500/20 disabled:bg-primary-400/50">
                        {loading ? 'Entrando...' : 'Entrar'}
                    </motion.button>
                </form>
                
                 <div className="text-center mt-6 text-sm">
                    <p className="text-neutral-500">Não tem uma conta? <button onClick={onSwitchToRegister} className="font-semibold text-primary-600 hover:underline">Cadastre-se</button></p>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                    <p className="text-center text-sm font-semibold text-neutral-600 mb-2">Para testar, entre com um perfil de exemplo:</p>
                    <div className="space-y-3 mt-4">
                        <Button size="md" variant="secondary" onClick={() => handleDemoLogin('ESCRITORIO')} disabled={loading} className="w-full">
                            Visão do Escritório de Advocacia
                        </Button>
                        <Button size="md" variant="secondary" onClick={() => handleDemoLogin('ESCOLA')} disabled={loading} className="w-full">
                            Visão da Escola
                        </Button>
                        <Button size="md" variant="secondary" onClick={() => handleDemoLogin('RESPONSAVEL')} disabled={loading} className="w-full">
                            Visão do Responsável (Pai/Mãe)
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoginModal;
