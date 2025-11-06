

import React from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import { demoSchools, demoSubscriptions } from '../../services/demoData';
import { formatDate } from '../../utils/formatters';
import { PlanId } from '../../types';

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


const SchoolsList = (): React.ReactElement => {
    
    const getSubscriptionStatus = (schoolId: string) => {
        const sub = demoSubscriptions.find(s => s.schoolId === schoolId);
        if (!sub) return { text: 'Sem Assinatura', color: 'bg-gray-200 text-gray-700' };
        
        switch(sub.status) {
            case 'active': return { text: `Ativo (${sub.planId === PlanId.PRO ? 'Pro' : 'Básico'})`, color: 'bg-green-100 text-green-700' };
            case 'trialing': return { text: `Trial (encerra ${formatDate(sub.trialEnd)})`, color: 'bg-yellow-100 text-yellow-700' };
            case 'past_due': return { text: 'Pagamento Pendente', color: 'bg-red-100 text-red-700' };
            case 'canceled': return { text: 'Cancelado', color: 'bg-gray-200 text-gray-700' };
            default: return { text: 'Inativo', color: 'bg-gray-200 text-gray-700' };
        }
    };
    
    return (
        <Card noPadding>
            <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800">Lista de Escolas</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">CNPJ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status da Assinatura</th>
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
                        {demoSchools.map((school) => {
                             const status = getSubscriptionStatus(school.id);
                             return (
                                <motion.tr key={school.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{school.name}</div>
                                        <div className="text-sm text-neutral-500">{school.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{school.cnpj}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{school.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-primary-600 hover:text-primary-900">Gerenciar</a>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </motion.tbody>
                </table>
            </div>
        </Card>
    );
};

export default SchoolsList;