import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Button from '../common/Button';
import { demoGuardians, demoStudents, demoInvoices } from '../../services/demoData';
import { InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import { MagnifyingGlassIcon } from '../common/icons';

interface HeroProps {
    onRegister: () => void;
    onLogin: () => void;
}

const Hero = ({ onRegister, onLogin }: HeroProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<{ status: 'not_found' | 'no_debt' | 'has_debt'; value?: number; message: string } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleScroll = (targetId: string) => {
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
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResult(null);

        // Simulate API call
        setTimeout(() => {
            const foundGuardian = demoGuardians.find(
                g => g.name.toLowerCase() === searchQuery.toLowerCase().trim() || g.cpf === searchQuery.trim()
            );

            if (foundGuardian) {
                const studentsOfGuardian = demoStudents.filter(s => s.guardianId === foundGuardian.id);
                const studentIds = studentsOfGuardian.map(s => s.id);
                const unpaidInvoices = demoInvoices.filter(
                    i => studentIds.includes(i.studentId) && (i.status === InvoiceStatus.VENCIDO || i.status === InvoiceStatus.PENDENTE)
                );

                if (unpaidInvoices.length === 0) {
                    setSearchResult({
                        status: 'no_debt',
                        message: `Ótimas notícias, ${foundGuardian.name}! Não encontramos débitos pendentes em seu nome.`
                    });
                } else {
                    const totalDebt = unpaidInvoices.reduce((acc, inv) => {
                        return acc + calculateUpdatedInvoiceValues(inv).updatedValue;
                    }, 0);
                    
                    setSearchResult({
                        status: 'has_debt',
                        value: totalDebt,
                        message: `Olá, ${foundGuardian.name}. Identificamos um valor em aberto. Negociar agora é a melhor forma de resolver pendências e garantir tranquilidade. Faça o login e veja as condições especiais que preparamos para você.`
                    });
                    
                }
            } else {
                setSearchResult({
                    status: 'not_found',
                    message: 'CPF ou nome não encontrado. Verifique os dados ou entre em contato com a escola.'
                });
            }
            setIsSearching(false);
        }, 1500);
    };


    // Parallax effect hooks
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      mouseX.set(x * 30);
      mouseY.set(y * 30);
    };

    const x1 = useTransform(mouseX, val => val * 0.8);
    const y1 = useTransform(mouseY, val => val * 0.8);
    const x2 = useTransform(mouseX, val => -val * 0.5);
    const y2 = useTransform(mouseY, val => -val * 0.5);

    return (
        <section
            onMouseMove={handleMouseMove}
            className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-neutral-50 overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute top-1/4 left-1/4 w-72 h-72 bg-secondary-100/30 rounded-full blur-3xl opacity-70"
                style={{ x: x1, y: y1 }}
                animate={{ x: [0, -20, 0, 20, 0], y: [0, 30, -10, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
              />
              <motion.div 
                className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-100/20 rounded-full blur-2xl opacity-80"
                style={{ x: x2, y: y2 }}
                animate={{ x: [0, 40, -20, 40, 0], y: [0, -10, 30, -10, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
              />
              {[...Array(15)].map((_, i) => {
                const size = Math.random() * 8 + 4;
                const duration = Math.random() * 20 + 15;
                const delay = Math.random() * 10;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      backgroundColor: i % 3 === 0 ? 'rgba(181, 142, 79, 0.2)' : 'rgba(42, 93, 138, 0.2)',
                      x: useTransform(mouseX, val => val * (Math.random() - 0.5) * (i % 5 + 1) * 0.5),
                      y: useTransform(mouseY, val => val * (Math.random() - 0.5) * (i % 5 + 1) * 0.5),
                    }}
                    animate={{
                      x: `+=${(Math.random() - 0.5) * 80}`,
                      y: `+=${(Math.random() - 0.5) * 80}`,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration,
                      delay,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                     <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight"
                    >
                        A Inteligência que Transforma <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Inadimplência</span> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-500 to-secondary-600">Receita</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="mt-6 text-lg text-neutral-600"
                    >
                        Nossa plataforma une escolas e escritórios em um ecossistema que previne a inadimplência e automatiza a recuperação de créditos com IA.
                    </motion.p>
                </div>
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                    className="relative max-w-lg mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button onClick={() => handleScroll('escolas')} size="lg" variant="primary">Soluções para Escolas</Button>
                    <Button onClick={() => handleScroll('escritorios')} size="lg" variant="secondary">Soluções para Escritórios</Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                    className="mt-12 max-w-xl mx-auto"
                >
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-soft border border-neutral-200/60">
                         <h3 className="font-bold text-center text-neutral-800">Já é responsável? Consulte seus débitos.</h3>
                        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Digite seu CPF ou nome completo"
                                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300 transition"
                                />
                            </div>
                            <Button type="submit" isLoading={isSearching} className="flex-shrink-0">
                                {isSearching ? 'Buscando...' : 'Buscar'}
                            </Button>
                        </form>
                        {searchResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-center text-sm"
                            >
                                {searchResult.status === 'no_debt' && (
                                    <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-lg">
                                        <p>{searchResult.message}</p>
                                    </div>
                                )}
                                {searchResult.status === 'has_debt' && (
                                    <div className="bg-yellow-50 text-yellow-900 border border-yellow-200 p-4 rounded-lg">
                                        <p className="font-bold text-lg">{formatCurrency(searchResult.value || 0)} em aberto</p>
                                        <p className="mt-2">{searchResult.message}</p>
                                        <Button onClick={onLogin} className="mt-4">
                                            Ir para o Acordo
                                        </Button>
                                    </div>
                                )}
                                {searchResult.status === 'not_found' && (
                                    <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg">
                                        <p>{searchResult.message}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default Hero;