import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { Invoice, InvoiceStatus } from '../../types';
import { demoGuardians, demoStudents, demoInvoices } from '../../services/demoData';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircleIcon, UsersIcon } from '../common/icons';


interface HeroProps {
    onRegister: () => void;
    onLogin: () => void;
}

interface SearchResult {
    status: 'found' | 'not_found';
    totalDue?: number;
    guardianName?: string;
}

const Hero = ({ onRegister, onLogin }: HeroProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setSearchResult(null);

        // Simulate API call
        setTimeout(() => {
            const term = searchTerm.trim().toLowerCase();
            const guardian = demoGuardians.find(g => g.cpf === term || g.name.toLowerCase() === term);

            if (!guardian) {
                setSearchResult({ status: 'not_found' });
                setIsLoading(false);
                return;
            }

            const studentIds = demoStudents.filter(s => s.guardianId === guardian.id).map(s => s.id);
            const dueInvoices = demoInvoices.filter(i => studentIds.includes(i.studentId) && i.status !== InvoiceStatus.PAGO);

            if (dueInvoices.length === 0) {
                setSearchResult({ status: 'not_found' });
                setIsLoading(false);
                return;
            }

            const totalDue = dueInvoices.reduce((acc, inv) => {
                if (inv.status === InvoiceStatus.VENCIDO) {
                    return acc + calculateUpdatedInvoiceValues(inv).updatedValue;
                }
                return acc + inv.value;
            }, 0);

            setSearchResult({
                status: 'found',
                totalDue,
                guardianName: guardian.name,
            });

            setIsLoading(false);

        }, 1500);

    };

    return (
        <section className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-gradient-to-b from-white via-primary-50/30 to-white overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight"
                >
                    Transforme a Inadimplência Escolar <br /> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">Receita Previsível</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    className="mt-6 max-w-3xl mx-auto text-lg text-neutral-600"
                >
                    A única plataforma que integra automação por IA, portal de negociação para pais e gestão jurídica completa para otimizar a recuperação de créditos educacionais.
                </motion.p>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    className="mt-10 flex justify-center items-center"
                >
                    <Button onClick={onRegister} size="lg">
                        Comece a Recuperar Créditos Agora
                    </Button>
                </motion.div>
            </div>

            {/* Debt Checker */}
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                className="mt-16 max-w-2xl mx-auto px-4 sm:px-0"
            >
                <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-soft border border-neutral-200/50">
                    <h3 className="font-bold text-center text-neutral-800 text-lg">Consulte seus Débitos</h3>
                    <p className="text-center text-sm text-neutral-600 mt-1">
                        Digite o CPF ou nome completo do responsável financeiro.
                    </p>
                    <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="CPF ou Nome Completo"
                            className="w-full px-5 py-3 border border-neutral-300 bg-white/70 rounded-full shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition"
                        />
                        <Button type="submit" isLoading={isLoading} className="sm:w-auto flex-shrink-0" size="md">
                            Consultar
                        </Button>
                    </form>

                    <AnimatePresence>
                        {searchResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mt-4 text-center overflow-hidden"
                            >
                                {searchResult.status === 'not_found' && (
                                    <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center justify-center gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                        <p className="font-semibold">Nenhum débito encontrado para o documento ou nome informado.</p>
                                    </div>
                                )}
                                {searchResult.status === 'found' && (
                                    <div className="p-4 bg-red-50 text-red-800 rounded-lg space-y-3">
                                        <p className="font-semibold text-red-900">Foram encontrados débitos em aberto para {searchResult.guardianName}:</p>
                                        <p className="text-3xl font-bold text-red-700">{formatCurrency(searchResult.totalDue!)}</p>
                                        <Button onClick={onLogin} variant="danger" icon={<UsersIcon className="w-5 h-5"/>}>
                                            Acessar Portal para Negociar
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
}

export default Hero;
