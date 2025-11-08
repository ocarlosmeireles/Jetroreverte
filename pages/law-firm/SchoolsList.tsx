import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { demoInvoices, demoStudents } from '../../services/demoData';
import { InvoiceStatus, School } from '../../types';
import { PlusIcon, SchoolIcon, DollarIcon, UsersIcon } from '../../components/common/icons';
import AddSchoolModal from '../../components/law-firm/AddSchoolModal';
import { formatCurrency } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface SchoolCardProps {
    school: any;
    onSelectSchool: (id: string) => void;
    isSelected: boolean;
    key?: React.Key;
}

const SchoolCard = ({ school, onSelectSchool, isSelected }: SchoolCardProps) => {
    
    const getHealthIndicator = (score?: number) => {
        if (score === undefined) return 'bg-gray-400';
        if (score > 75) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <motion.div
            layout
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
            }}
            onClick={() => onSelectSchool(school.id)}
            className={`cursor-pointer rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'bg-primary-50 border-primary-400 shadow-lg shadow-primary-500/10' : 'bg-white border-transparent shadow-soft hover:shadow-soft-hover hover:-translate-y-1'}`}
        >
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-neutral-800 text-lg pr-4">{school.name}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className={`w-3 h-3 rounded-full ${getHealthIndicator(school.healthScore)}`}></div>
                        <span className="text-sm font-semibold text-neutral-700">{school.healthScore}/100</span>
                    </div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Health Score (IA)</p>
            </div>
            <div className="px-5 pb-5 mt-2 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <DollarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Valor Vencido</p>
                        <p className="font-semibold text-neutral-800">{formatCurrency(school.totalOverdue)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Alunos Inadimplentes</p>
                        <p className="font-semibold text-neutral-800">{school.defaulterStudentsCount}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <DollarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">Total Recuperado</p>
                        <p className="font-semibold text-neutral-800">{formatCurrency(school.totalRecovered)}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


interface SchoolsListProps {
    schools: School[];
    onSelectSchool: (schoolId: string) => void;
    selectedSchoolId: string | null;
}

const SchoolsList = ({ schools, onSelectSchool, selectedSchoolId }: SchoolsListProps): React.ReactElement => {
    const { user } = useAuth();
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
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
                initial="hidden"
                animate="visible"
            >
                {enrichedSchools.map(school => (
                    <SchoolCard
                        key={school.id}
                        school={school}
                        onSelectSchool={onSelectSchool}
                        isSelected={selectedSchoolId === school.id}
                    />
                ))}
            </motion.div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                 {/* This h2 is hidden but keeps the layout consistent with other pages that have visible titles here */}
                <h2 className="text-xl font-semibold text-neutral-800 invisible">Escolas Clientes</h2>
                <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="md">Nova Escola</Button>
            </div>
            
            {renderContent()}

            <AddSchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchool}
            />
        </>
    );
};

export default SchoolsList;
