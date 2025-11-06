

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
            // For the demo user, show all demo schools regardless of officeId match
            setSchools(demoSchools);
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


    const getCollectionStatus = (schoolId: string) => {
        const studentsOfSchool = demoStudents.filter(s => s.schoolId === schoolId).map(s => s.id);
        const schoolInvoices = demoInvoices.filter(inv => studentsOfSchool.includes(inv.studentId));

        const overdueCount = schoolInvoices.filter(i => i.status === InvoiceStatus.VENCIDO).length;

        if (overdueCount > 0) {
            return { text: `${overdueCount} cobrança(s) vencida(s)`, color: 'bg-red-100 text-red-700' };
        }
        
        const pendingCount = schoolInvoices.filter(i => i.status === InvoiceStatus.PENDENTE).length;
        if (pendingCount > 0) {
            return { text: `${pendingCount} cobrança(s) em aberto`, color: 'bg-yellow-100 text-yellow-700' };
        }

        return { text: 'Em dia', color: 'bg-green-100 text-green-700' };
    };
    
    const getSubscriptionStatus = (schoolId: string) => {
        const sub = demoSubscriptions.find(s => s.schoolId === schoolId);
        if (!sub) return { text: 'Sem Assinatura', color: 'bg-neutral-200 text-neutral-700' };
        
        switch(sub.status) {
            case 'active': return { text: `Ativo (${sub.planId === PlanId.PRO ? 'Pro' : 'Básico'})`, color: 'bg-green-100 text-green-700' };
            case 'trialing': return { text: `Trial até ${formatDate(sub.trialEnd)}`, color: 'bg-yellow-100 text-yellow-700' };
            case 'past_due': return { text: 'Pagamento Pendente', color: 'bg-red-100 text-red-700' };
            case 'canceled': return { text: 'Cancelado', color: 'bg-neutral-200 text-neutral-700' };
            default: return { text: 'Inativo', color: 'bg-neutral-200 text-neutral-700' };
        }
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
                    <p className="mt-1 text-sm text-neutral-500">Adicione sua primeira escola ou popule com dados de exemplo para começar.</p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />}>
                            Adicionar Escola
                        </Button>
                        <Button onClick={handleSeedData} variant="secondary" icon={<SparklesIcon />} isLoading={isSeeding}>
                            {isSeeding ? 'Populando...' : 'Popular com Dados de Exemplo'}
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <>
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                    {/* ... table header ... */}
                    <motion.tbody 
                        className="bg-white divide-y divide-neutral-200"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {schools.map((school) => {
                            const collectionStatus = getCollectionStatus(school.id);
                            const subscriptionStatus = getSubscriptionStatus(school.id);
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
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscriptionStatus.color}`}>
                                            {subscriptionStatus.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${collectionStatus.color}`}>
                                            {collectionStatus.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{school.phone}</td>
                                </motion.tr>
                            )
                        })}
                    </motion.tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden">
                    <motion.div variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-neutral-200">
                        {schools.map(school => {
                            const collectionStatus = getCollectionStatus(school.id);
                            const subscriptionStatus = getSubscriptionStatus(school.id);
                            const isSelected = selectedSchoolId === school.id;
                            return (
                                <motion.div 
                                    key={school.id} 
                                    variants={itemVariants} 
                                    onClick={() => onSelectSchool(school.id)}
                                    className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-neutral-800">{school.name}</div>
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${collectionStatus.color}`}>{collectionStatus.text}</span>
                                    </div>
                                    <div className="text-sm text-neutral-500 mt-2 space-y-1">
                                        <p><strong>CNPJ:</strong> {school.cnpj}</p>
                                        <p><strong>Assinatura:</strong> <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${subscriptionStatus.color}`}>{subscriptionStatus.text}</span></p>
                                        <p><strong>Contato:</strong> {school.phone}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
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
                {renderContent()}
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