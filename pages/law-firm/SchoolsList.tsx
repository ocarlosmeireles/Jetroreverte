

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { demoInvoices, demoStudents, demoSubscriptions, demoSchools } from '../../services/demoData';
import { InvoiceStatus, School, PlanId } from '../../types';
import { PlusIcon, SchoolIcon, SparklesIcon } from '../../components/common/icons';
import AddSchoolModal from '../../components/law-firm/AddSchoolModal';
import { formatDate } from '../../utils/formatters';
import { DEMO_USERS } from '../../constants';

const listVariants = {
  visible: { transition: { staggerChildren: 0.05 } },
  hidden: {},
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface SchoolsListProps {
    onSelectSchool: (schoolId: string) => void;
    selectedSchoolId: string | null;
}

const SchoolsList = ({ onSelectSchool, selectedSchoolId }: SchoolsListProps): React.ReactElement => {
    const { user } = useAuth();
    const [schools, setSchools] = useState<School[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchData = () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // If the user is the specific demo law firm user, show their associated demo schools.
            // For any other user (e.g., a newly registered one), show an empty list.
            if (user.email === DEMO_USERS.ESCRITORIO.email) {
                const userSchools = demoSchools.filter(school => school.officeId === user.id);
                setSchools(userSchools);
            } else {
                // In a real app, this would be a Firestore query. For now, show a blank slate.
                setSchools([]);
            }
        } catch (error) {
            console.error("Error fetching schools:", error);
            alert("Não foi possível carregar as escolas.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveSchool = (data: any) => {
        alert("A adição de escolas está desabilitada nesta versão sem banco de dados.");
        setIsModalOpen(false);
    };

    const getHealthIndicator = (score?: number) => {
        if (score === undefined) return 'bg-gray-400';
        if (score > 75) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleSeedData = () => {
        alert("A funcionalidade de popular o banco de dados foi removida junto com o Firebase.");
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="p-12 text-center text-neutral-500">Carregando escolas...</div>;
        }

        if (schools.length === 0) {
            return (
                <div className="text-center py-12 px-6">
                    <SchoolIcon className="w-12 h-12 mx-auto text-neutral-300" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-700">Nenhuma escola cadastrada</h3>
                    <p className="mt-1 text-sm text-neutral-500">Adicione sua primeira escola para começar a gerenciar as cobranças.</p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />}>
                            Adicionar Escola
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <>
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Saúde do Cliente</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contato</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <motion.tbody 
                        className="bg-white divide-y divide-neutral-200"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {schools.map((school) => {
                            const isSelected = selectedSchoolId === school.id;
                            return (
                                <motion.tr 
                                    key={school.id} 
                                    variants={itemVariants} 
                                    onClick={() => onSelectSchool(school.id)}
                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{school.name}</div>
                                        <div className="text-sm text-neutral-500">{school.cnpj}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getHealthIndicator(school.healthScore)}`}></div>
                                            <span className="text-sm font-semibold text-neutral-700">{school.healthScore}/100</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{school.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <span className="text-primary-600 hover:text-primary-900 font-medium">Ver Detalhes</span>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </motion.tbody>
                </table>
            </>
        );
    }

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Escolas Clientes</h2>
                    <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="sm" className="sm:size-md">Nova Escola</Button>
                </div>
                <div className="overflow-x-auto">
                    {renderContent()}
                </div>
            </Card>
            <AddSchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchool}
            />
        </>
    );
};

export default SchoolsList;