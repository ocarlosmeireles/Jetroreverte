import React, { useState, useEffect, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import { demoPetitions, demoInvoices, demoSchools } from '../../services/demoData';
import { formatDate } from '../../utils/formatters';
import { Petition } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';

const listVariants = {
  visible: { transition: { staggerChildren: 0.05 } },
  hidden: {},
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface PetitionListProps {
    onSelectPetition: (petitionId: string) => void;
    selectedPetitionId: string | null;
}

const PetitionList = ({ onSelectPetition, selectedPetitionId }: PetitionListProps): React.ReactElement => {
    const { user } = useAuth();

    const petitions = useMemo(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) {
            return [];
        }

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        return demoPetitions.filter(p => {
            const invoice = demoInvoices.find(i => i.id === p.invoiceId);
            return invoice && officeSchoolIds.has(invoice.schoolId);
        });
    }, [user]);
    
    const getStatusChip = (status: 'draft' | 'filed') => {
        switch (status) {
            case 'draft': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Rascunho</span>;
            case 'filed': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Protocolado</span>;
        }
    };

    return (
        <Card noPadding>
            <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Histórico de Petições Geradas</h2>
                 <p className="text-sm text-neutral-500 mt-1">Visualize, edite e exporte as petições geradas pela IA.</p>
            </div>
            
            {/* Desktop Table */}
            <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                <thead className="bg-neutral-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Caso (Aluno)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data de Geração</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <motion.tbody 
                    className="bg-white divide-y divide-neutral-200"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {petitions.map((petition) => {
                         const isSelected = selectedPetitionId === petition.id;
                         return (
                            <motion.tr 
                                key={petition.id} 
                                variants={itemVariants} 
                                onClick={() => onSelectPetition(petition.id)}
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{petition.studentName}</div>
                                    <div className="text-xs text-neutral-500">Resp.: {petition.guardianName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{petition.schoolName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(petition.generatedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(petition.status)}</td>
                            </motion.tr>
                        )
                    })}
                </motion.tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden">
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-neutral-200">
                    {petitions.map((petition) => {
                        const isSelected = selectedPetitionId === petition.id;
                        return (
                            <motion.div 
                                key={petition.id} 
                                variants={itemVariants} 
                                onClick={() => onSelectPetition(petition.id)}
                                className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-neutral-900">{petition.studentName}</div>
                                        <div className="text-sm text-neutral-500">{petition.schoolName}</div>
                                    </div>
                                    {getStatusChip(petition.status)}
                                </div>
                                <div className="text-sm text-neutral-500 mt-2">
                                    Gerado em: {formatDate(petition.generatedAt)}
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </Card>
    );
};

export default PetitionList;