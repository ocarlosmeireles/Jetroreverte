import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';

interface HeroProps {
    onRegister: () => void;
    onLogin: () => void;
}

const DebtSearchCard = () => {
    const [searchType, setSearchType] = useState<'cpf' | 'nome'>('cpf');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState('');

    const handleDebtSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchResult(`Busca por "${searchTerm}" realizada. Em um ambiente real, os resultados seriam exibidos aqui.`);
        setTimeout(() => setSearchResult(''), 5000);
    };

    return (
        <Card className="!p-6 backdrop-blur-sm bg-white/60">
            <h3 className="font-bold text-lg text-neutral-800 text-center">Consulte seus Débitos</h3>
            <p className="text-center text-sm text-neutral-600 mt-1">Portal exclusivo para pais e responsáveis.</p>
            
            <div className="flex justify-center p-1 bg-neutral-100 rounded-full my-4">
                <button onClick={() => setSearchType('cpf')} className={`w-full py-1.5 text-sm font-semibold rounded-full transition-colors ${searchType === 'cpf' ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-500'}`}>Por CPF</button>
                <button onClick={() => setSearchType('nome')} className={`w-full py-1.5 text-sm font-semibold rounded-full transition-colors ${searchType === 'nome' ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-500'}`}>Por Nome do Aluno</button>
            </div>

            <form onSubmit={handleDebtSearch} className="space-y-3">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchType === 'cpf' ? 'Digite o CPF do responsável' : 'Digite o nome completo do aluno'}
                    className="w-full px-4 py-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-primary-300"
                    required
                />
                <Button type="submit" className="w-full">Buscar</Button>
            </form>
            {searchResult && <p className="text-xs text-center text-neutral-500 mt-2 animate-fade-in">{searchResult}</p>}
        </Card>
    );
};


const Hero = ({ onRegister }: HeroProps) => {
    return (
        <section className="relative pt-24 pb-28 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-48 bg-white overflow-hidden">
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative text-center lg:text-left">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight"
                    >
                        Simplifique a Gestão Financeira <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">Educacional</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-neutral-600"
                    >
                        Nossa plataforma une escolas e escritórios em um ecossistema inteligente que previne a inadimplência e automatiza a recuperação de créditos com IA.
                    </motion.p>
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4"
                    >
                        <Button onClick={onRegister} size="lg">
                            Criar Conta para Escritório
                        </Button>
                         <Button onClick={onRegister} size="lg" variant="secondary">
                            Sou uma Escola
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                    className="relative flex items-center justify-center"
                >
                    <DebtSearchCard />
                </motion.div>
            </div>
        </section>
    );
}

export default Hero;