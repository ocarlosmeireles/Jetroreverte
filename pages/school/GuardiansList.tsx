import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Guardian } from '../../types';
import AddGuardianModal from '../../components/school/AddGuardianModal';
import { PlusIcon } from '../../components/common/icons';
import { demoGuardians } from '../../services/demoData';

const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface GuardiansListProps {
    onSelectGuardian: (guardianId: string) => void;
}

const GuardiansList = ({ onSelectGuardian }: GuardiansListProps): React.ReactElement => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = () => {
        const schoolId = user?.schoolId || 'school-01'; // Fallback for demo
        setLoading(true);
        setError(null);
        try {
            setGuardians(demoGuardians.filter(g => g.schoolId === schoolId));
        } catch (err) {
            console.error(err);
            setError("Falha ao carregar os dados. Tente recarregar a página.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveGuardian = async (data: Omit<Guardian, 'id' | 'schoolId'>) => {
        alert("A adição de responsáveis está desabilitada nesta versão sem banco de dados. Os dados são apenas de demonstração.");
        setIsModalOpen(false);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <svg className="animate-spin mx-auto h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-2 text-neutral-600">Carregando responsáveis...</p>
                </div>
            );
        }

        if (error) {
            return <div className="text-center py-12 text-red-600">{error}</div>;
        }

        return (
            <>
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome do Responsável</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Telefone</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <motion.tbody 
                        className="bg-white divide-y divide-neutral-200"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {guardians.map((guardian) => (
                            <motion.tr key={guardian.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{guardian.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{guardian.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{guardian.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onSelectGuardian(guardian.id)} className="text-primary-600 hover:text-primary-900 font-medium">
                                        Ver Detalhes
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden">
                    <motion.div className="divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                        {guardians.map(guardian => (
                            <motion.div key={guardian.id} variants={itemVariants} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-neutral-800">{guardian.name}</p>
                                        <p className="text-sm text-neutral-500 truncate">{guardian.email}</p>
                                        <p className="text-sm text-neutral-500">{guardian.phone}</p>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => onSelectGuardian(guardian.id)}>
                                        Detalhes
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </>
        );
    };

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Responsáveis</h2>
                    <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="sm" className="sm:size-md">Adicionar</Button>
                </div>
                {renderContent()}
            </Card>
            <AddGuardianModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGuardian}
            />
        </>
    );
};

export default GuardiansList;