import React from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { demoSubscriptions, demoSaasInvoices, demoSchools } from '../../services/demoData';
import { PLANS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

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

const SchoolBillingPage = (): React.ReactElement => {
    const { user } = useAuth();
    const subscription = demoSubscriptions.find(sub => sub.schoolId === user?.schoolId);
    const plan = PLANS.find(p => p.id === subscription?.planId);
    const invoices = demoSaasInvoices.filter(inv => inv.schoolId === user?.schoolId);

    if (!subscription || !plan) {
        return <Card><p>Não foi possível carregar os dados do seu plano.</p></Card>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-800">Meu Plano Atual</h2>
                        <p className="mt-2 text-4xl font-extrabold text-primary-600">{plan.name}</p>
                        <p className="text-neutral-500 mt-1">
                            {subscription.cycle === 'monthly' ? `${formatCurrency(plan.price.monthly)} por mês` : `${formatCurrency(plan.price.yearly)} por ano`}
                        </p>
                        <p className="mt-4 text-sm text-neutral-600">
                            Sua assinatura {subscription.status === 'trialing' ? `está em período de teste e` : ''} renova em <span className="font-semibold">{formatDate(subscription.currentPeriodEnd)}</span>.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button variant="secondary">Mudar de Plano</Button>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Método de Pagamento</h2>
                <div className="bg-neutral-50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center">
                        <img src="https://www.gstatic.com/images/icons/material/system/2x/credit_card_black_24dp.png" alt="Credit Card" className="h-8 mr-4" />
                        <div>
                            <p className="font-semibold">Mastercard terminando em 4444</p>
                            <p className="text-sm text-neutral-500">Expira em 12/2026</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="mt-4 sm:mt-0">Atualizar</Button>
                </div>
            </Card>

            <Card noPadding>
                <div className="p-6">
                    <h2 className="text-xl font-semibold">Histórico de Faturas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
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
                            {invoices.map((invoice) => (
                                <motion.tr key={invoice.id} variants={itemVariants}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(invoice.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">Assinatura Plano {plan.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(invoice.amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {invoice.status === 'paid' ? 
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pago</span> :
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-primary-600 hover:text-primary-900">Baixar PDF</a>
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

export default SchoolBillingPage;