



import React from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { demoInvoices, demoSchools, demoStudents } from '../../services/demoData';
import { DollarIcon } from '../../components/common/icons';
import { InvoiceStatus } from '../../types';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';

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

// FIX: Explicitly type itemVariants with the Variants type.
const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface FinancialsDashboardProps {
    onSelectSchool: (schoolId: string) => void;
}

const FinancialsDashboard = ({ onSelectSchool }: FinancialsDashboardProps): React.ReactElement => {
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));

    const recoveredThisMonth = demoInvoices.filter(i => i.status === InvoiceStatus.PAGO && new Date(i.dueDate).getMonth() === new Date().getMonth()).reduce((sum, inv) => sum + inv.value, 0);
    const commissionThisMonth = recoveredThisMonth * (commissionPercentage / 100);
    const totalRecovered = demoInvoices.filter(i => i.status === InvoiceStatus.PAGO).reduce((sum, inv) => sum + inv.value, 0);

    const successfulCollections = demoInvoices
        .filter(i => i.status === InvoiceStatus.PAGO)
        .map(invoice => {
            const student = demoStudents.find(s => s.id === invoice.studentId);
            const school = demoSchools.find(s => s.id === student?.schoolId);
            const commission = invoice.value * (commissionPercentage / 100);
            return {
                ...invoice,
                schoolName: school?.name || 'N/A',
                schoolId: school?.id,
                commission,
            };
        });
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Total Recuperado (Mês)" value={formatCurrency(recoveredThisMonth)} icon={<DollarIcon />} color="green" delay={0.1} />
                <StatCard title="Comissão (Mês)" value={formatCurrency(commissionThisMonth)} icon={<DollarIcon />} color="primary" delay={0.2} />
                <StatCard title="Total Recuperado (Geral)" value={formatCurrency(totalRecovered)} icon={<DollarIcon />} color="secondary" delay={0.3} />
            </div>
            
            <Card noPadding>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-neutral-800">Histórico de Cobranças Pagas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data Pgto.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor Pago</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Comissão</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            className="bg-white divide-y divide-neutral-200"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {successfulCollections.map((collection) => (
                                <motion.tr key={collection.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(collection.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{collection.schoolName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{collection.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(collection.value)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">{formatCurrency(collection.commission || 0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {collection.schoolId && (
                                            <button onClick={() => onSelectSchool(collection.schoolId!)} className="text-primary-600 hover:text-primary-900 font-medium">
                                                Ver Detalhes
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinancialsDashboard;