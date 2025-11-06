import React from 'react';
import { demoSchools, demoSubscriptions, demoSaasInvoices } from '../../services/demoData';
import { allDemoUsers } from '../../services/superAdminDemoData';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import Card from '../../components/common/Card';
import { SchoolIcon, DollarIcon, UsersIcon, BillingIcon } from '../../components/common/icons';

const PlatformOverview = (): React.ReactElement => {
    const totalUsers = allDemoUsers.length;
    const totalSchools = demoSchools.length;
    const activeSubscriptions = demoSubscriptions.filter(s => s.status === 'active' || s.status === 'trialing').length;
    
    // Simulate MRR from SaaS invoices for the last month
    const mrr = demoSaasInvoices
        .filter(inv => inv.status === 'paid' && new Date(inv.createdAt).getMonth() === new Date().getMonth() - 1)
        .reduce((sum, inv) => sum + inv.amount, 0);

    // Simulate revenue data for the chart
    const revenueData = [
        { month: 'Mar', Receita: 2100 },
        { month: 'Abr', Receita: 2500 },
        { month: 'Mai', Receita: 2800 },
        { month: 'Jun', Receita: 3200 },
        { month: 'Jul', Receita: 3100 },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total de Usuários" value={String(totalUsers)} icon={<UsersIcon />} color="primary" delay={0.1} />
                <StatCard title="Total de Escolas" value={String(totalSchools)} icon={<SchoolIcon />} color="secondary" delay={0.2} />
                <StatCard title="Assinaturas Ativas" value={String(activeSubscriptions)} icon={<BillingIcon />} color="green" delay={0.3} />
                <StatCard title="MRR (Mês Anterior)" value={formatCurrency(mrr)} icon={<DollarIcon />} color="primary" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3">
                     <Chart data={revenueData} title="Crescimento da Receita Mensal (SaaS)" barKey="Receita" xAxisKey="month" delay={0.5} />
                </div>
                <div className="lg:col-span-2">
                    <Card delay={0.6}>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Atividade Recente na Plataforma</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">+</div>
                                <div><span className="font-semibold">Colégio Saber Viver</span> iniciou um trial no plano Básico.</div>
                                <div className="ml-auto text-neutral-400 text-xs flex-shrink-0">2h atrás</div>
                            </li>
                             <li className="flex items-center text-sm">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">$</div>
                                <div>Pagamento de <span className="font-semibold">R$149,00</span> recebido de <span className="font-semibold">Escola Aprender Mais</span>.</div>
                                <div className="ml-auto text-neutral-400 text-xs flex-shrink-0">1d atrás</div>
                            </li>
                             <li className="flex items-center text-sm">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0 font-bold">!</div>
                                <div>Falha no pagamento da assinatura do <span className="font-semibold">Instituto Crescer</span>.</div>
                                <div className="ml-auto text-neutral-400 text-xs flex-shrink-0">2d atrás</div>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlatformOverview;
