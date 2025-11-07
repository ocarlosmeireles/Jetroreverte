

import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { demoSchools, demoSubscriptions, demoSaasInvoices } from '../../services/demoData';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import { SchoolIcon, DollarIcon, BillingIcon } from '../../components/common/icons';
import { DEMO_USERS } from '../../constants';

const AdminDashboardContent = (): React.ReactElement => {
    const { user } = useAuth();

    // Scope data based on the logged-in law firm user.
    const { scopedSchools, scopedSubscriptions, scopedSaasInvoices } = useMemo(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) {
            // For new users or non-demo users, show 0 stats.
            return { scopedSchools: [], scopedSubscriptions: [], scopedSaasInvoices: [] };
        }

        // For the demo user, filter data based on their ID.
        const schools = demoSchools.filter(s => s.officeId === user.id);
        const schoolIds = new Set(schools.map(s => s.id));
        const subscriptions = demoSubscriptions.filter(s => schoolIds.has(s.schoolId));
        const saasInvoices = demoSaasInvoices.filter(i => schoolIds.has(i.schoolId));

        return { scopedSchools: schools, scopedSubscriptions: subscriptions, scopedSaasInvoices: saasInvoices };
    }, [user]);

    const totalSchools = scopedSchools.length;
    const activeSubscriptions = scopedSubscriptions.filter(s => s.status === 'active' || s.status === 'trialing').length;
    const mrr = scopedSaasInvoices
        .filter(inv => inv.status === 'paid' && new Date(inv.createdAt).getMonth() === new Date().getMonth() -1)
        .reduce((sum, inv) => sum + inv.amount, 0);

    const revenueData = [
        { month: 'Abr', Receita: 2500 },
        { month: 'Mai', Receita: 2800 },
        { month: 'Jun', Receita: 3200 },
        { month: 'Jul', Receita: 3100 },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Escolas" value={String(totalSchools)} icon={<SchoolIcon />} color="primary" delay={0.1} />
                <StatCard title="Assinaturas Ativas" value={String(activeSubscriptions)} icon={<BillingIcon />} color="green" delay={0.2} />
                <StatCard title="MRR (Mês Anterior)" value={formatCurrency(mrr)} icon={<DollarIcon />} color="secondary" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-card">
                     <Chart data={revenueData} title="Receita Mensal (SaaS)" barKey="Receita" xAxisKey="month" />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-card">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Atividade Recente</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center text-sm">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">+</div>
                            <div><span className="font-semibold">Colégio Saber Viver</span> iniciou um trial.</div>
                            <div className="ml-auto text-neutral-400 text-xs">2h atrás</div>
                        </li>
                        <li className="flex items-center text-sm">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">$</div>
                            <div>Pagamento de <span className="font-semibold">R$149,00</span> recebido de <span className="font-semibold">Escola Aprender Mais</span>.</div>
                            <div className="ml-auto text-neutral-400 text-xs">1d atrás</div>
                        </li>
                         <li className="flex items-center text-sm">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">!</div>
                            <div>Falha no pagamento da <span className="font-semibold">Instituto Crescer</span>.</div>
                            <div className="ml-auto text-neutral-400 text-xs">2d atrás</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;