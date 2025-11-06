import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface RegisterProps {
    onSwitchToLogin: () => void;
}

const Register = ({ onSwitchToLogin }: RegisterProps): React.ReactElement => {
    const [officeName, setOfficeName] = useState('');
    const [personName, setPersonName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register, loading } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        try {
            await register(personName, officeName, email, password);
            // On success, the AuthProvider will update the user and App.tsx will redirect.
        } catch (err: any) {
            setError(err.message || 'Falha no cadastro. Tente novamente.');
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="w-full max-w-sm">
            <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-2xl font-bold text-neutral-800">Jetro Reverte</h1>
                <p className="mt-2 text-neutral-600">Crie sua conta e comece a otimizar suas cobranças.</p>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-200/80"
            >
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label htmlFor="officeName" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Nome do Escritório</label>
                        <input type="text" id="officeName" value={officeName} onChange={(e) => setOfficeName(e.target.value)} className="w-full px-5 py-3 border border-neutral-200 bg-neutral-50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="personName" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Seu Nome</label>
                        <input type="text" id="personName" value={personName} onChange={(e) => setPersonName(e.target.value)} className="w-full px-5 py-3 border border-neutral-200 bg-neutral-50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="reg-email" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Email</label>
                        <input type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 border border-neutral-200 bg-neutral-50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="reg-password" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Senha</label>
                        <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 border border-neutral-200 bg-neutral-50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1 ml-3">Confirmar Senha</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-5 py-3 border border-neutral-200 bg-neutral-50 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition" required />
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm text-center mb-4">
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98, y: 0 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-glow-primary disabled:bg-primary-400 disabled:shadow-none"
                    >
                        {loading ? 'Criando...' : 'Criar Conta'}
                    </motion.button>
                </form>
                 <div className="text-center mt-4">
                    <button onClick={onSwitchToLogin} className="text-sm text-primary-600 hover:underline">Já tem uma conta? Entre aqui</button>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;