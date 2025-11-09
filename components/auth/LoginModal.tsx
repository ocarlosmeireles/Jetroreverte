
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { DEMO_USERS } from '../../constants';
import { XIcon } from '../common/icons';

interface LoginModalProps {
    onClose: () => void;
    onSwitchToReset: () => void;
    onSwitchToRegister: () => void;
}

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const LoginModal = ({ onClose, onSwitchToReset, onSwitchToRegister }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
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
                : 'Ocorreu um erro ao fazer login. Por favor, tente novamente.';
             setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const fillDemoCredentials = (role: keyof typeof DEMO_USERS) => {
        setEmail(DEMO_USERS[role].email);
        setPassword(DEMO_USERS[role].password);
    }

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
                <h2 className="text-xl font-bold text-neutral-800">Acessar Plataforma</h2>
                <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
            </header>
            <div className="p-8 pt-0">
                <div className="bg-primary-50 border border-primary-200/50 rounded-lg p-3 text-center text-xs text-primary-800 mb-6">
                    <p className="font-semibold">Use os dados de demonstração:</p>
                    <div className="flex justify-center gap-2 mt-2 flex-wrap">
                        <button onClick={() => fillDemoCredentials('ESCRITORIO')} className="px-2 py-0.5 bg-primary-100 rounded-full hover:bg-primary-200">Escritório</button>
                        <button onClick={() => fillDemoCredentials('ESCOLA')} className="px-2 py-0.5 bg-primary-100 rounded-full hover:bg-primary-200">Escola</button>
                        <button onClick={() => fillDemoCredentials('RESPONSAVEL')} className="px-2 py-0.5 bg-primary-100 rounded-full hover:bg-primary-200">Responsável</button>
                        <button onClick={() => fillDemoCredentials('SUPER_ADMIN')} className="px-2 py-0.5 bg-primary-100 rounded-full hover:bg-primary-200">Super Admin</button>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-neutral-300 bg-neutral-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Senha</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-neutral-300 bg-neutral-100/50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition" required />
                    </div>
                    
                    <div className="text-right text-sm">
                        <button type="button" onClick={onSwitchToReset} className="font-medium text-primary-600 hover:underline">Esqueceu a senha?</button>
                    </div>
                    
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm text-center">
                            {error}
                        </motion.p>
                    )}
                    
                    <Button type="submit" disabled={isLoading} className="w-full !py-3 !text-base">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-neutral-500">Não tem uma conta? <button onClick={onSwitchToRegister} className="font-semibold text-primary-600 hover:underline">Cadastre-se</button></p>
                </div>
            </div>
             <style>{`.form-input { border-radius: 0.75rem; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </motion.div>
    );
};

export default LoginModal;
