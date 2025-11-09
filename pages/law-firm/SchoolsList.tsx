

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { demoInvoices, demoStudents } from '../../services/demoData';
import { InvoiceStatus, School } from '../../types';
import { PlusIcon, SchoolIcon } from '../../components/common/icons';
import AddSchoolModal from '../../components/law-firm/AddSchoolModal';
import { formatCurrency } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Card from '../../components/common/Card';

const HealthScoreIndicator = ({ score }: { score?: number }) => {
    if (score === undefined) {
        return <div className="text-sm text-neutral-400">-</div>;
    }

    const getHealthColor = () => {
        if (score > 75) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 bg-neutral-200 rounded-full h-1.5">
                <motion.div 
                    className={`h-1.5 rounded-full ${getHealthColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <span className="font-semibold text-sm text-neutral-700 w-8 text-right">{score}</span>
        </div>
    );
};


interface SchoolsListProps {
    schools: School[];
    onSelectSchool: (schoolId: string) => void;
    selectedSchoolId: string | null;
}

const SchoolsList = ({ schools, onSelectSchool, selectedSchoolId }: SchoolsListProps): React.ReactElement => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const enrichedSchools = useMemo(() => {
        return schools.map(school => {
            const schoolStudents = demoStudents.filter(s => s.schoolId === school.id);
            const schoolStudentIds = new Set(schoolStudents.map(s => s.id));
            const schoolInvoices = demoInvoices.filter(i => schoolStudentIds.has(i.studentId));

            const overdueInvoices = schoolInvoices.filter(i => i.status === InvoiceStatus.VENCIDO);
            const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + calculateUpdatedInvoiceValues(inv).updatedValue, 0);
            
            const defaulterStudentsCount = new Set(overdueInvoices.map(i => i.studentId)).size;
            
            const totalRecovered = schoolInvoices.filter(i => i.status === InvoiceStatus.PAGO).reduce((sum, inv) => sum + inv.value, 0);

            return {
                ...school,
                totalOverdue,
                defaulterStudentsCount,
                totalRecovered
            };
        });
    }, [schools]);

    const handleSaveSchool = (data: any) => {
        alert("A adição de escolas está desabilitada nesta versão sem banco de dados.");
        setIsModalOpen(false);
    };
    
    const listVariants = {
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {},
    };

    const itemVariants = {
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 10 },
    };

    const renderContent = () => {
        if (enrichedSchools.length === 0) {
            return (
                 <div className="text-center py-12 px-6">
                    <SchoolIcon className="w-12 h-12 mx-auto text-neutral-300" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-700">Nenhuma escola cadastrada</h3>
                    <p className="mt-1 text-sm text-neutral-500">Adicione sua primeira escola para começar a gerenciar as cobranças.</p>
                    <div className="mt-6">
                        <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />}>
                            Adicionar Escola
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Saúde (IA)</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Alunos Inadimp.</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor Vencido</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Recuperado</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <motion.tbody 
                        className="bg-white divide-y divide-neutral-200"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {enrichedSchools.map((school) => (
                            <motion.tr 
                                key={school.id} 
                                variants={itemVariants} 
                                onClick={() => onSelectSchool(school.id)}
                                className={`transition-colors cursor-pointer ${selectedSchoolId === school.id ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-neutral-900">{school.name}</div>
                                    <div className="text-xs text-neutral-500">{school.cnpj}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <HealthScoreIndicator score={school.healthScore} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-neutral-800">{school.defaulterStudentsCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">{formatCurrency(school.totalOverdue)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">{formatCurrency(school.totalRecovered)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <span className="text-primary-600 hover:text-primary-900">
                                        Detalhes
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 invisible">Escolas Clientes</h2>
                <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="md">Nova Escola</Button>
            </div>
            
            <Card noPadding>
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