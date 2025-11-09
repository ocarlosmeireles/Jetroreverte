
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { UserRole } from '../../types';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, ScaleIcon, SchoolIcon, UserCircleIcon, XIcon } from '../../components/common/icons';

// Simple Logo component for display
const Logo = ({ className }: { className?: string }) => (
    <div className={`font-extrabold text-2xl tracking-tight ${className}`}>
        <span className="text-primary-800">Jetro</span>
        <span className="text-secondary-500">Reverte</span>
    </div>
);


type View = 'selection' | 'login' | 'register' | 'reset';
type RoleSelection = UserRole.ESCRITORIO | UserRole.ESCOLA | UserRole.RESPONSAVEL;

// --- Role Details ---
const roleDetails = {
    [UserRole.ESCRITORIO]: {
        label: 'Escritório',
        description: 'Gerencie clientes, automatize cobranças e aumente sua receita.',
        icon: <ScaleIcon className="w-10 h-10 text-primary-600" />,
    },
    [UserRole.ESCOLA]: {
        label: 'Escola',
        description: 'Acompanhe inadimplentes e a performance do seu escritório parceiro.',
        icon: <SchoolIcon className="w-10 h-10 text-primary-600" />,
    },
    [UserRole.RESPONSAVEL]: {
        label: 'Responsável',
        description: 'Consulte e negocie seus débitos de forma simples e rápida.',
        icon: <UserCircleIcon className="w-10 h-10 text-primary-600" />,
    }
};

// --- Sub-components for different views ---

const RoleSelection = ({ onSelectRole, onRegister }: { onSelectRole: (role: RoleSelection) => void, onRegister: () => void }) => (
    <motion.div 
        key="selection"
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.98 }} 
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
    >
        <div className="text-center mb-10">
            <Logo className="mx-auto text-4xl" />
            <h1 className="mt-6 text-3xl font-extrabold text-neutral-900 sm:text-4xl tracking-tight">
                A plataforma inteligente para cobrança educacional
            </h1>
            <p className="mt-4 text-lg text-neutral-600">Selecione seu perfil para continuar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([UserRole.ESCRITORIO, UserRole.ESCOLA, UserRole.RESPONSAVEL] as RoleSelection[]).map((role) => (
                <motion.button
                    key={role}
                    onClick={() => onSelectRole(role)}
                    className="text-left bg-white p-6 rounded-2xl shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 border border-neutral-200/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 mb-4">
                        {roleDetails[role].icon}
                    </div>
                    <h3 className="font-bold text-neutral-800">{roleDetails[role].label}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{roleDetails[role].description}</p>
                </motion.button>
            ))}
        </div>
        
        <div className="text-center mt-12">
            <p className="text-sm text-neutral-600">
                É um escritório de advocacia e ainda não tem conta?{' '}
                <button onClick={onRegister} className="font-semibold text-primary-600 hover:underline">
                    Cadastre-se aqui
                </button>
            </p>
        </div>
    </motion.div>
);

const FormContainer = ({ children, onBack, title, subtitle }: { children: React.ReactNode, onBack: () => void, title: string, subtitle?: string }) => (
    <motion.div 
        key={title}
        initial={{ opacity: 0, x: 30 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -30 }} 
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-sm"
    >
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-200/80">
            <div className="flex justify-start mb-6">
                 <button onClick={onBack} className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 font-medium">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Voltar
                </button>
            </div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
                {subtitle && <p className="text-neutral-500 text-sm mt-2">{subtitle}</p>}
            </div>
            {children}
        </div>
    </motion.div>
);


const LoginForm = ({ role, onSwitchToReset, onBack }: { role: RoleSelection, onSwitchToReset: () => void, onBack: () => void }) => {
    const [email, setEmail] = useState(DEMO_USERS[role].email);
    const [password, setPassword] = useState(DEMO_USERS[role].password);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
             const friendlyMessage = err.code === 'auth/invalid-credential' 
                ? 'Credenciais inválidas. Verifique e tente novamente.'
                : 'Ocorreu um erro ao fazer login. Por favor, tente novamente.';
             setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <FormContainer onBack={onBack} title={`Login - ${roleDetails[role].label}`}>
             <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full form-input" required />
                </div>
                <div>
                    <label htmlFor="password" className="form-label">Senha</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full form-input" required />
                </div>
                 <div className="text-right text-sm">
                    <button type="button" onClick={onSwitchToReset} className="font-medium text-primary-600 hover:underline">Esqueceu a senha?</button>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full !py-3 !text-base">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
            <style>{`.form-label { display: block; text-align: left; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; margin-left: 0.75rem;} .form-input { border-radius: 9999px; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </FormContainer>
    );
};

const RegisterForm = ({ onSwitchToLogin, onBack }: { onSwitchToLogin: () => void, onBack: () => void }) => {
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
            await register(personName, officeName, email, password);
        } catch (err: any) {
            const friendlyMessage = err.code === 'auth/email-already-in-use' ? 'Este e-mail já está em uso.' : 'Falha no cadastro. Tente novamente.';
            setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormContainer onBack={onBack} title="Criar Conta de Escritório" subtitle="Comece a otimizar suas cobranças hoje mesmo.">
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
             <style>{`.form-input { border-radius: 0.75rem; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </FormContainer>
    );
};

const ResetPasswordForm = ({ onSwitchToLogin, onBack }: { onSwitchToLogin: () => void, onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { sendPasswordResetEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(email);
            setMessage('Se existir uma conta com este e-mail, um link para redefinição de senha foi enviado.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <FormContainer onBack={onBack} title="Recuperar Senha" subtitle="Digite seu e-mail e enviaremos um link para você redefinir sua senha.">
            {!message ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="reset-email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="reset-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full form-input"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </Button>
                </form>
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-green-700 bg-green-50 p-4 rounded-lg">{message}</p>
                    <Button onClick={() => onSwitchToLogin()} className="w-full">
                        Voltar para o Login
                    </Button>
                </div>
            )}
            <div className="mt-6 text-center text-sm">
                <button onClick={() => onSwitchToLogin()} className="text-primary-600 hover:underline">Lembrou a senha? Faça login</button>
            </div>
            <style>{`.form-label { display: block; text-align: left; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; margin-left: 0.75rem;} .form-input { border-radius: 9999px; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </FormContainer>
    );
};

// Main Component
const LandingPage = (): React.ReactElement => {
    const [view, setView] = useState<View>('selection');
    const [selectedRole, setSelectedRole] = useState<RoleSelection | null>(null);

    const handleSelectRole = (role: RoleSelection) => {
        setSelectedRole(role);
        setView('login');
    };
    
    const handleSwitchToLogin = (role: RoleSelection = UserRole.ESCRITORIO) => {
        setSelectedRole(role);
        setView('login');
    };

    const renderCurrentView = () => {
        switch(view) {
            case 'selection':
                return <RoleSelection 
                            onSelectRole={handleSelectRole}
                            onRegister={() => setView('register')}
                        />
            case 'login':
                return selectedRole && <LoginForm
                    role={selectedRole}
                    onBack={() => setView('selection')}
                    onSwitchToReset={() => setView('reset')}
                />
            case 'register':
                return <RegisterForm
                    onBack={() => setView('selection')}
                    onSwitchToLogin={() => handleSwitchToLogin()}
                 />
            case 'reset':
                return <ResetPasswordForm
                    onBack={() => setView(selectedRole ? 'login' : 'selection')}
                    onSwitchToLogin={() => handleSwitchToLogin(selectedRole || UserRole.ESCRITORIO)}
                />
            default:
                return <RoleSelection 
                            onSelectRole={handleSelectRole}
                            onRegister={() => setView('register')}
                        />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {renderCurrentView()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LandingPage;