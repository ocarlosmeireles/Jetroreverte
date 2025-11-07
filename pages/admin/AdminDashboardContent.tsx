

import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { demoSchools, demoInvoices, demoStudents } from '../../services/demoData';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import { BillingIcon, DollarIcon, DocumentReportIcon } from '../../components/common/icons';
import { DEMO_USERS } from '../../constants';
import { InvoiceStatus } from '../../types';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';

const AdminDashboardContent = (): React.ReactElement => {
    const { user } = useAuth();
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));

    // Scope data based on the logged-in law firm user.
    const {
        totalRecoveredThisMonth,
        commissionThisMonth,
        overdueInvoicesCount,
        commissionChartData,
        recentActivities,
    } = useMemo(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) {
            return {
                totalRecoveredThisMonth: 0,
                commissionThisMonth: 0,
                overdueInvoicesCount: 0,
                commissionChartData: [],
                recentActivities: [],
            };
        }

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const schoolIds = new Set(officeSchools.map(s => s.id));
        const scopedInvoices = demoInvoices.filter(i => schoolIds.has(i.schoolId));

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const paidThisMonthInvoices = scopedInvoices.filter(i => {
            const paymentDate = new Date(i.dueDate); // Assuming dueDate is payment date for paid invoices
            return i.status === InvoiceStatus.PAGO && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });

        const recovered = paidThisMonthInvoices.reduce((sum, inv) => sum + inv.value, 0);
        const commission = recovered * (commissionPercentage / 100);
        const overdueCount = scopedInvoices.filter(i => i.status === InvoiceStatus.VENCIDO).length;
        
        // Chart data
        const monthlyCommission: { [key: string]: { Comissão: number } } = {};
        scopedInvoices.filter(i => i.status === InvoiceStatus.PAGO).forEach(invoice => {
            const date = new Date(invoice.dueDate);
            const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
            const year = date.getFullYear();
            const key = `${month}/${year}`;
            if (!monthlyCommission[key]) monthlyCommission[key] = { Comissão: 0 };
            monthlyCommission[key].Comissão += (invoice.commission ?? invoice.value * (commissionPercentage / 100));
        });
        const chartData = Object.keys(monthlyCommission).map(month => ({
            month: month.charAt(0).toUpperCase() + month.slice(1), ...monthlyCommission[month]
        })).slice(-4);

        // Activity Feed Data
        const recentPaid = paidThisMonthInvoices.slice(0, 2).map(i => ({
            type: 'paid',
            text: `Pagamento de ${formatCurrency(i.value)} recebido de ${i.studentName}.`,
            time: 'Hoje'
        }));
        const recentOverdue = scopedInvoices.filter(i => i.status === InvoiceStatus.VENCIDO).slice(0, 2).map(i => ({
            type: 'overdue',
            text: `Cobrança de ${i.studentName} venceu.`,
            time: '1d atrás'
        }));
        
        const activities = [...recentPaid, ...recentOverdue].slice(0, 3);


        return {
            totalRecoveredThisMonth: recovered,
            commissionThisMonth: commission,
            overdueInvoicesCount: overdueCount,
            commissionChartData: chartData,
            recentActivities: activities,
        };
    }, [user, commissionPercentage]);


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Recuperado (Mês)" value={formatCurrency(totalRecoveredThisMonth)} icon={<DollarIcon />} color="green" delay={0.1} />
                <StatCard title="Comissão Gerada (Mês)" value={formatCurrency(commissionThisMonth)} icon={<BillingIcon />} color="primary" delay={0.2} />
                <StatCard title="Cobranças Vencidas" value={String(overdueInvoicesCount)} icon={<DocumentReportIcon />} color="red" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-card">
                     <Chart data={commissionChartData} title="Comissão Mensal Gerada" barKey="Comissão" xAxisKey="month" />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-card">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Atividade de Cobrança</h3>
                     <ul className="space-y-4">
                        {recentActivities.map((activity, index) => (
                             <li key={index} className="flex items-center text-sm">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 font-bold ${activity.type === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {activity.type === 'paid' ? '$' : '!'}
                                </div>
                                <div>{activity.text}</div>
                                <div className="ml-auto text-neutral-400 text-xs">{activity.time}</div>
                            </li>
                        ))}
                        {recentActivities.length === 0 && <p className="text-neutral-500 text-sm">Nenhuma atividade recente.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;