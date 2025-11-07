
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { demoSubscriptions, demoSaasInvoices, demoInvoices } from '../../services/demoData';
import { PLANS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceStatus } from '../../types';

const SchoolBillingPage = (): React.ReactElement => {
    const { user } = useAuth();
    const subscription = demoSubscriptions.find(sub => sub.schoolId === user?.schoolId);
    const plan = PLANS.find(p => p.id === subscription?.planId);

    const { delinquentStudentCount, invoices } = useMemo(() => {
        if (!user) return { delinquentStudentCount: 0, invoices: [] };
        
        const schoolInvoices = demoInvoices.filter(inv => inv.schoolId === user.schoolId);
        
        const uniqueDelinquentStudents = new Set(
            schoolInvoices.filter(i => i.status !== InvoiceStatus.PAGO).map(i => i.studentId)
        ).size;
        
        const saasInvoices = demoSaasInvoices.filter(inv => inv.schoolId === user.schoolId);

        return { delinquentStudentCount: uniqueDelinquentStudents, invoices: saasInvoices };

    }, [user]);

    if (!subscription || !plan) {
        return <Card><p>Não foi possível carregar os dados do seu plano.</p></Card>;
    }
    
    const usagePercentage = plan.studentLimit ? (delinquentStudentCount / plan.studentLimit) * 100 : 0;

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
                        <Button variant="secondary">Ver Opções de Planos</Button>
                    </div>
                </div>
                {plan.studentLimit && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-neutral-700">Uso do Plano</h3>
                        <p className="text-sm text-neutral-500 mt-1">Alunos inadimplentes gerenciados</p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-full bg-neutral-200 rounded-full h-2.5">
                                <motion.div 
                                    className="bg-primary-600 h-2.5 rounded-full" 
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${usagePercentage}%`}}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="font-semibold text-neutral-700 text-sm whitespace-nowrap">
                                {delinquentStudentCount} / {plan.studentLimit}
                            </span>
                        </div>
                    </div>
                )}
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
                        >
                            {invoices.map((invoice, index) => (
                                <motion.tr 
                                    key={invoice.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
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
