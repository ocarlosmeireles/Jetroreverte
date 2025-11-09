



import React from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { demoSaasInvoices, demoSchools } from '../../services/demoData';
import { DollarIcon, UsersIcon } from '../../components/common/icons';

const listVariants: Variants = {
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

const SaasFinancialDashboard = (): React.ReactElement => {
    const mrr = 12540; // Simulated
    const churnRate = 2.1; // Simulated
    const activeSubs = 84; // Simulated
    
    const getSchoolName = (schoolId: string) => demoSchools.find(s => s.id === schoolId)?.name || 'N/A';
    
    const getStatusChip = (status: 'paid' | 'open' | 'void') => {
        switch(status) {
            case 'paid': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pago</span>;
            case 'open': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Aberto</span>;
            case 'void': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Anulada</span>;
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="MRR (Receita Recorrente Mensal)" value={formatCurrency(mrr)} icon={<DollarIcon />} color="primary" delay={0.1} />
                <StatCard title="Taxa de Cancelamento" value={`${churnRate}%`} icon={<UsersIcon />} color="red" delay={0.2} />
                <StatCard title="Assinaturas Ativas" value={String(activeSubs)} icon={<UsersIcon />} color="green" delay={0.3} />
            </div>
            
            <Card noPadding>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-neutral-800">Faturas Recentes (SaaS)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fatura ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vencimento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            className="bg-white divide-y divide-neutral-200"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {demoSaasInvoices.map((invoice) => (
                                <motion.tr key={invoice.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-500">{invoice.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{getSchoolName(invoice.schoolId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(invoice.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(invoice.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900">Ver PDF</a>
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

export default SaasFinancialDashboard;