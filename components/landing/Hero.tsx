import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';
import { demoGuardians, demoStudents, demoInvoices } from '../../services/demoData';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface HeroProps {
    onRegister: () => void;
    onLogin: () => void;
}

const DebtSearchCard = ({ onLogin }: { onLogin: () => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState<string | Invoice[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDebtSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSearchResult(null);
        
        setTimeout(() => {
            const cleanedSearchTerm = searchTerm.trim().toLowerCase();
            let potentialStudentIds = new Set<string>();
    
            // 1. Search by Guardian CPF
            const cpfToSearch = cleanedSearchTerm.replace(/[.\-]/g, '');
            const guardianByCpf = demoGuardians.find(g => g.cpf?.replace(/[.\-]/g, '') === cpfToSearch);
            if (guardianByCpf) {
                demoStudents.forEach(s => {
                    if (s.guardianId === guardianByCpf.id) {
                        potentialStudentIds.add(s.id);
                    }
                });
            }
    
            // 2. Search by Student Name
            demoStudents.forEach(s => {
                if (s.name.toLowerCase().includes(cleanedSearchTerm)) {
                    potentialStudentIds.add(s.id);
                }
            });
            
            // 3. Search by Guardian Name
            demoGuardians.forEach(g => {
                if (g.name.toLowerCase().includes(cleanedSearchTerm)) {
                    demoStudents.forEach(s => {
                        if (s.guardianId === g.id) {
                            potentialStudentIds.add(s.id);
                        }
                    });
                }
            });
    
            // Now find invoices for all found student IDs
            let foundInvoices: Invoice[] = [];
            if (potentialStudentIds.size > 0) {
                foundInvoices = demoInvoices
                    .filter(i => 
                        potentialStudentIds.has(i.studentId) &&
                        (i.status === InvoiceStatus.VENCIDO || i.status === InvoiceStatus.PENDENTE)
                    )
                    .map(invoice => {
                        const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
                        return {
                            ...invoice,
                            updatedValue: updatedValue,
                        };
                    });
            }
    
            if (foundInvoices.length > 0) {
                setSearchResult(foundInvoices);
            } else {
                setSearchResult("Não existem débitos pendentes para a sua busca.");
            }
            
            setIsLoading(false);
        }, 1500);
    };

    const renderResults = () => {
        if (!searchResult) return null;

        if (typeof searchResult === 'string') {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium text-sm"
                >
                    {searchResult}
                </motion.div>
            );
        }

        if (Array.isArray(searchResult)) {
            const total = searchResult.reduce((sum, inv) => sum + (inv.updatedValue || inv.value), 0);
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-primary-50/50 rounded-lg border border-primary-100 space-y-3"
                >
                    <h4 className="font-bold text-neutral-800">Débitos Encontrados:</h4>
                    <div className="space-y-2">
                        {searchResult.map(inv => (
                            <div key={inv.id} className="text-sm flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-neutral-700">{inv.studentName}</p>
                                    <p className="text-xs text-neutral-500">Vencimento: {formatDate(inv.dueDate)}</p>
                                </div>
                                <p className="font-bold text-red-600">{formatCurrency(inv.updatedValue || inv.value)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-primary-200/50 flex justify-between items-center">
                        <span className="font-bold text-neutral-800">Total:</span>
                        <span className="font-bold text-xl text-red-600">{formatCurrency(total)}</span>
                    </div>
                    <Button onClick={onLogin} className="w-full mt-2">
                        Negociar Agora
                    </Button>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <Card className="!p-6 backdrop-blur-sm bg-white/60 shadow-xl shadow-primary-500/10 border border-neutral-200/50">
            <h3 className="font-bold text-lg text-neutral-800 text-center">Consulte Débitos Escolares</h3>
            <p className="text-center text-sm text-neutral-600 mt-1">Portal exclusivo para pais e responsáveis.</p>

            <form onSubmit={handleDebtSearch} className="space-y-3 mt-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite CPF, nome do aluno ou responsável"
                    className="w-full px-4 py-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-primary-300 transition-all duration-300"
                    required
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>Buscar</Button>
            </form>
            {renderResults()}
        </Card>
    );
};


const Hero = ({ onRegister, onLogin }: HeroProps) => {
    return (
        <section className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-neutral-50 overflow-hidden">
             <div className="absolute inset-0 bg-grid-neutral-200/40 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
            <div className="absolute top-0 left-0 -translate-x-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-60 animate-pulse [animation-delay:2s]"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                    className="relative max-w-lg mx-auto mt-12"
                >
                    <DebtSearchCard onLogin={onLogin} />
                </motion.div>
            </div>
             <style jsx>{`
                .bg-grid-neutral-200\/40 {
                    background-image:
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </section>
    );
}

export default Hero;