

import React, { useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
    AcademicCapIcon, 
    ScaleIcon,
    ShieldCheckIcon,
    ChatBubbleLeftRightIcon,
    DocumentChartBarIcon,
    LightbulbIcon,
    XIcon,
    CheckIcon
} from '../common/icons';
import ResetPasswordModal from './ResetPasswordModal';
import Button from '../common/Button';
import { DEMO_USERS } from '../../constants';

// #region Modal Components
// FIX: Made the 'children' prop optional. In TSX, children are passed implicitly,
// and type definitions for components that accept them should reflect this by making 'children' optional.
const ModalBackdrop = ({ children, onClose }: { children?: React.ReactNode, onClose: () => void }) => (
    <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
    >
        {children}
    </motion.div>
);

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const LoginModal = ({ onClose, onSwitchToReset, onSwitchToRegister }: { onClose: () => void; onSwitchToReset: () => void; onSwitchToRegister: () => void; }) => {
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
            }
        } catch (err: any) {
            setError('Ocorreu um erro ao fazer login com o usuário de demonstração.');
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
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
                <div className="p-8 pt-0">
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
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-500/30 disabled:bg-primary-400/50">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </motion.button>
                    </form>
                    
                     <div className="text-center mt-6 text-sm">
                        <p className="text-neutral-500">Não tem uma conta? <button onClick={onSwitchToRegister} className="font-semibold text-primary-600 hover:underline">Cadastre-se</button></p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                        <p className="text-center text-sm font-semibold text-neutral-500 mb-4">Acesso Rápido (Demonstração)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('ESCRITORIO')} disabled={loading}>
                                Entrar como Escritório
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('ESCOLA')} disabled={loading}>
                                Entrar como Escola
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('RESPONSAVEL')} disabled={loading}>
                                Entrar como Responsável
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('SUPER_ADMIN')} disabled={loading}>
                                Entrar como Super Admin
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </ModalBackdrop>
    );
};

const RegisterModal = ({ onClose, onSwitchToLogin }: { onClose: () => void; onSwitchToLogin: () => void; }) => {
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
            const friendlyMessage = err.code === 'auth/email-already-in-use'
                ? 'Este e-mail já está em uso.'
                : 'Falha no cadastro. Tente novamente.';
            setError(friendlyMessage);
        }
    };
    
    return (
        <ModalBackdrop onClose={onClose}>
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
                 <div className="p-8 pt-0">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input type="text" value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="Nome do Escritório" className="w-full form-input" required />
                        <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Seu Nome" className="w-full form-input" required />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full form-input" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" className="w-full form-input" required />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme sua Senha" className="w-full form-input" required />
                        
                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-500/30 disabled:bg-primary-400/50 mt-2">
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </motion.button>
                    </form>
                     <div className="text-center mt-6 text-sm">
                        <p className="text-neutral-500">Já tem uma conta? <button onClick={onSwitchToLogin} className="font-semibold text-primary-600 hover:underline">Entre aqui</button></p>
                    </div>
                </div>
            </motion.div>
        </ModalBackdrop>
    );
};

// #endregion

// #region Landing Page Sections
const Header = ({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void; }) => {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80; // h-20 = 5rem = 80px
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
        }
    };
    
    return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <span className="font-bold text-xl text-neutral-800">Jetro Reverte</span>
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#escolas" onClick={(e) => handleScroll(e, 'escolas')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Para Escolas</a>
                    <a href="#escritorios" onClick={(e) => handleScroll(e, 'escritorios')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Para Escritórios</a>
                    <a href="#funcionalidades" onClick={(e) => handleScroll(e, 'funcionalidades')} className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">Funcionalidades</a>
                </div>
                <div className="flex items-center space-x-2">
                     <motion.button onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-primary-600 rounded-full hover:bg-primary-50">
                        Fazer Login
                    </motion.button>
                     <motion.button onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 shadow-sm">
                        Criar Conta
                    </motion.button>
                </div>
            </div>
        </div>
    </header>
)};

const Hero = ({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void; }) => (
    <section className="relative py-20 sm:py-28 lg:py-32 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary-50 rounded-full blur-3xl opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900"
            >
                Transforme a Inadimplência Escolar <br /> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">Receita Previsível</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 max-w-2xl mx-auto text-lg text-neutral-600"
            >
                Nossa plataforma une tecnologia e expertise jurídica para automatizar a cobrança, reduzir a inadimplência e fortalecer a saúde financeira da sua instituição de ensino.
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 flex justify-center items-center gap-4"
            >
                <motion.button onClick={onRegister} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 shadow-lg shadow-primary-500/30">
                    Comece Agora
                </motion.button>
                 <motion.button onClick={onLogin} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-semibold text-primary-600 bg-white/50 rounded-full hover:bg-white border border-transparent hover:border-primary-200">
                    Acessar Plataforma
                </motion.button>
            </motion.div>
        </div>
    </section>
);

const Solutions = () => (
    <>
        {/* For Schools */}
        <section id="escolas" className="py-20 sm:py-28 bg-neutral-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                        <AcademicCapIcon className="w-5 h-5 mr-2" /> Para Escolas
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Diga Adeus às Conversas Difíceis</h2>
                    <p className="mt-4 text-lg text-neutral-600">Foque na educação enquanto nossa plataforma cuida da saúde financeira. Automatize a comunicação de cobrança de forma profissional e mantenha um bom relacionamento com os pais.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Reduza a inadimplência em até 40% com nossa régua de cobrança inteligente.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Tenha visibilidade completa dos alunos inadimplentes e do status da negociação.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Envie os casos mais complexos para o escritório de advocacia com um clique.</span></li>
                    </ul>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[300px]">
                    {/* Mockup */}
                    <div className="absolute w-full max-w-lg right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 transform md:rotate-3">
                        <div className="h-6 bg-neutral-100 rounded-t-lg flex items-center px-2"><div className="flex space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div></div></div>
                        <div className="p-4 bg-neutral-50 rounded-b-lg">
                            <div className="h-5 bg-neutral-200 rounded w-1/3 mb-4"></div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="h-16 bg-blue-100 rounded-lg"></div>
                                <div className="h-16 bg-green-100 rounded-lg"></div>
                            </div>
                            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                            <div className="space-y-1.5"><div className="h-8 bg-white rounded-md"></div><div className="h-8 bg-white rounded-md"></div></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* For Law Firms */}
        <section id="escritorios" className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="relative h-full min-h-[300px] order-last md:order-first">
                    <div className="absolute w-full max-w-lg left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 transform md:-rotate-3">
                        <div className="h-6 bg-neutral-100 rounded-t-lg flex items-center px-2"><div className="flex space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div></div></div>
                        <div className="p-4 bg-neutral-50 rounded-b-lg">
                            <div className="h-5 bg-neutral-200 rounded w-1/2 mb-4"></div>
                             <div className="h-28 bg-blue-100 rounded-lg mb-3"></div>
                            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                            <div className="space-y-1.5"><div className="h-8 bg-white rounded-md"></div><div className="h-8 bg-white rounded-md"></div></div>
                        </div>
                    </div>
                </motion.div>
                 <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        <ScaleIcon className="w-5 h-5 mr-2" /> Para Escritórios
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Automatize a Cobrança e Maximize a Eficiência</h2>
                    <p className="mt-4 text-lg text-neutral-600">Abandone as planilhas complexas. Gerencie todas as escolas clientes em um único painel, automatize as etapas de cobrança e gere petições iniciais com o poder da Inteligência Artificial.</p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Painel centralizado para gerenciar a inadimplência de múltiplas escolas.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Gere rascunhos de petições de cobrança em segundos com nossa IA.</span></li>
                        <li className="flex items-start"><CheckIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" /><span>Acompanhe o histórico de negociações e a performance da sua carteira.</span></li>
                    </ul>
                </motion.div>
            </div>
        </section>
    </>
);

const Features = () => {
    const features = [
        { icon: <ShieldCheckIcon />, title: "Análise de Risco com IA", description: "Nossa IA analisa o perfil de cada dívida e prevê a probabilidade de acordo, otimizando sua estratégia." },
        { icon: <ChatBubbleLeftRightIcon />, title: "Comunicação Automatizada", description: "Crie réguas de cobrança personalizadas com envios automáticos de lembretes por WhatsApp e E-mail." },
        { icon: <LightbulbIcon />, title: "Geração de Petições (IA)", description: "Para casos judiciais, nossa IA gera o rascunho da petição inicial, economizando horas de trabalho." },
        { icon: <DocumentChartBarIcon />, title: "Relatórios Completos", description: "Acompanhe a evolução da inadimplência, valores recuperados e comissões em tempo real." },
    ];
    return (
        <section id="funcionalidades" className="py-20 sm:py-28 bg-neutral-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">Uma Plataforma, Múltiplas Soluções</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">Recursos poderosos para simplificar a gestão de cobranças educacionais.</p>
                </div>
                <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-white p-6 rounded-2xl shadow-soft border border-neutral-200/60">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600">{React.cloneElement(feature.icon, { className: 'w-6 h-6' })}</div>
                            <h3 className="mt-5 text-lg font-semibold text-neutral-900">{feature.title}</h3>
                            <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    const testimonials = [
        { quote: "A Jetro Reverte mudou nossa gestão financeira. Reduzimos a inadimplência em 35% no primeiro semestre e, o mais importante, sem desgastar o relacionamento com os pais.", name: "Ana Clara Matos", title: "Diretora Financeira, Colégio Aprender Mais" },
        { quote: "Como escritório, precisávamos de uma ferramenta que centralizasse as informações das escolas. A automação e a geração de petições com IA nos deram uma eficiência que não tínhamos antes.", name: "Dr. Ricardo Borges", title: "Sócio, Jetro Reverte Advocacia" }
    ];
    return (
        <section className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">O que nossos parceiros dizem</h2>
                </div>
                <div className="mt-16 grid lg:grid-cols-2 gap-8">
                    {testimonials.map(t => (
                        <motion.figure key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }} className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                            <blockquote className="text-neutral-700">
                                <p>“{t.quote}”</p>
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
                                <div>
                                    <div className="font-semibold text-neutral-900">{t.name}</div>
                                    <div className="text-neutral-600">{t.title}</div>
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl font-bold text-white/80">Jetro Reverte</p>
            <p className="mt-4 text-neutral-400">Simplificando a gestão financeira educacional.</p>
            <p className="mt-6 text-sm text-neutral-500">&copy; {new Date().getFullYear()} Jetro Reverte. Todos os direitos reservados.</p>
        </div>
    </footer>
);
// #endregion

// Main component that orchestrates the landing page and modals
const Login = (): React.ReactElement => {
    const [activeModal, setActiveModal] = useState<'login' | 'reset' | 'register' | null>(null);

    return (
        <div className="bg-white">
            {/* Using a key to remount the component if auth state changes, preventing stale modal state */}
            <Header onLogin={() => setActiveModal('login')} onRegister={() => setActiveModal('register')} />

            <main>
                <Hero onLogin={() => setActiveModal('login')} onRegister={() => setActiveModal('register')} />
                <Solutions />
                <Features />
                <Testimonials />
            </main>

            <Footer />

            <AnimatePresence>
                {activeModal === 'login' && <LoginModal onClose={() => setActiveModal(null)} onSwitchToReset={() => setActiveModal('reset')} onSwitchToRegister={() => setActiveModal('register')} />}
                {activeModal === 'reset' && <ResetPasswordModal onClose={() => setActiveModal(null)} onSwitchToLogin={() => setActiveModal('login')} />}
                {activeModal === 'register' && <RegisterModal onClose={() => setActiveModal(null)} onSwitchToLogin={() => setActiveModal('login')} />}
            </AnimatePresence>
            
            <style>{`.form-input { border-radius: 0.75rem; border: 1px solid #cbd5e1; padding: 0.75rem 1.25rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 2px #c7d2fe; border-color: #4f46e5; }`}</style>
        </div>
    );
};

export default Login;