

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { demoSchools, demoSubscriptions, demoSaasInvoices } from '../../services/demoData';
import { allDemoUsers } from '../../services/superAdminDemoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import Card from '../../components/common/Card';
import { SchoolIcon, DollarIcon, UsersIcon, BillingIcon } from '../../components/common/icons';
import { PlanId } from '../../types';

const PlatformOverview = (): React.ReactElement => {
    const { 
        totalUsers, 
        totalSchools, 
        activeSubscriptions, 
        mrr,
        arr,
        arpu,
        planDistribution
    } = useMemo(() => {
        const users = allDemoUsers.length;
        const schools = demoSchools.length;
        const activeSubs = demoSubscriptions.filter(s => s.status === 'active' || s.status === 'trialing');
        
        const monthlyRecurringRevenue = demoSaasInvoices
            .filter(inv => inv.status === 'paid' && new Date(inv.createdAt).getMonth() === new Date().getMonth() - 1)
            .reduce((sum, inv) => sum + inv.amount, 0);

        const annualRecurringRevenue = monthlyRecurringRevenue * 12;
        const averageRevenuePerUser = activeSubs.length > 0 ? monthlyRecurringRevenue / activeSubs.length : 0;

        const basicCount = activeSubs.filter(s => s.planId === PlanId.BASIC).length;
        const proCount = activeSubs.filter(s => s.planId === PlanId.PRO).length;
        
        const distribution = [
            { name: 'Básico', value: basicCount },
            { name: 'Pro', value: proCount },
        ];

        return {
            totalUsers: users,
            totalSchools: schools,
            activeSubscriptions: activeSubs.length,
            mrr: monthlyRecurringRevenue,
            arr: annualRecurringRevenue,
            arpu: averageRevenuePerUser,
            planDistribution: distribution,
        }
    }, []);
    
    const COLORS = ['#8884d8', '#82ca9d'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="MRR (Mês Anterior)" value={formatCurrency(mrr)} icon={<DollarIcon />} color="primary" delay={0.1} />
                <StatCard title="ARR (Anualizado)" value={formatCurrency(arr)} icon={<DollarIcon />} color="primary" delay={0.2} />
                <StatCard title="ARPU (Mês Anterior)" value={formatCurrency(arpu)} icon={<UsersIcon />} color="secondary" delay={0.3} />
                <StatCard title="Assinaturas Ativas" value={String(activeSubscriptions)} icon={<BillingIcon />} color="green" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card delay={0.5} className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Assinaturas por Plano</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={planDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    // FIX: The 'percent' prop can be undefined. Using nullish coalescing operator (??) to provide a fallback.
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {planDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} escolas`, 'Quantidade']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card delay={0.6} className="lg:col-span-2">
                     <h3 className="text-lg font-semibold text-neutral-800 mb-4">Crescimento de Clientes</h3>
                     <ul className="space-y-3">
                        {demoSchools.slice(0, 4).map((school, index) => (
                             <li key={school.id} className="flex items-center text-sm p-2 rounded-lg hover:bg-neutral-50">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                                    <SchoolIcon className="w-5 h-5" />
                                </div>
                                <div><span className="font-semibold">{school.name}</span> se cadastrou.</div>
                                <div className="ml-auto text-neutral-400 text-xs flex-shrink-0">{index + 1} sem atrás</div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default PlatformOverview;
