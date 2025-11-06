
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { demoInvoices, demoStudents } from '../../services/demoData';
import { InvoiceStatus } from '../../types';
import { formatCurrency, formatCurrencyInteger } from '../../utils/formatters';
import { DollarIcon, UsersIcon } from '../../components/common/icons';

const SchoolReports = (): React.ReactElement => {
    const { user } = useAuth();
    
    // Filter data for the current school
    const studentsInSchool = demoStudents.filter(s => s.schoolId === user?.schoolId);
    const studentIdsInSchool = studentsInSchool.map(s => s.id);
    const invoicesForSchool = demoInvoices.filter(i => studentIdsInSchool.includes(i.studentId));

    // --- Data Calculations ---
    const paidInvoices = invoicesForSchool.filter(i => i.status === InvoiceStatus.PAGO);
    const overdueInvoices = invoicesForSchool.filter(i => i.status === InvoiceStatus.VENCIDO);

    const totalRecovered = paidInvoices.reduce((sum, inv) => sum + inv.value, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.value, 0);
    const overdueStudentsCount = new Set(overdueInvoices.map(i => i.studentId)).size;

    // Monthly data for recovery chart
    const monthlyData: { [key: string]: { Arrecadado: number } } = {};
    paidInvoices.forEach(invoice => {
        const month = new Date(invoice.dueDate).toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        const year = new Date(invoice.dueDate).getFullYear();
        const key = `${month}/${year}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { Arrecadado: 0 };
        }
        monthlyData[key].Arrecadado += invoice.value;
    });

    const recoveryChartData = Object.keys(monthlyData).map(month => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        ...monthlyData[month]
    })).slice(-6); // Last 6 months

    // Top overdue students data
    const defaulterPerformance: { [key: string]: number } = {};
    overdueInvoices.forEach(invoice => {
        if (!defaulterPerformance[invoice.studentId]) {
            defaulterPerformance[invoice.studentId] = 0;
        }
        defaulterPerformance[invoice.studentId] += invoice.value;
    });

    const defaulterChartData = Object.keys(defaulterPerformance)
        .map(studentId => ({
            name: demoStudents.find(s => s.id === studentId)?.name || 'Desconhecido',
            Valor: defaulterPerformance[studentId]
        }))
        .sort((a, b) => b.Valor - a.Valor)
        .slice(0, 5); // Top 5

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Valor Total Vencido" value={formatCurrency(totalOverdue)} icon={<DollarIcon />} color="red" delay={0.1} />
                <StatCard title="Total Recuperado" value={formatCurrency(totalRecovered)} icon={<DollarIcon />} color="green" delay={0.2} />
                <StatCard title="Alunos Inadimplentes" value={String(overdueStudentsCount)} icon={<UsersIcon />} color="primary" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card delay={0.4} className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Arrecadação Mensal (Valores Recuperados)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={recoveryChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrencyInteger(value as number)} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(209, 250, 229, 0.5)' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                                    formatter={(value: number) => [formatCurrency(value), "Valor Arrecadado"]}
                                />
                                <Bar dataKey="Arrecadado" fill="#22c55e" name="Valor Arrecadado" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.5} className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Top 5 Alunos com Débitos Vencidos</h3>
                    <div style={{ width: '100%', height: 300 }}>
                         <ResponsiveContainer>
                            <BarChart data={defaulterChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrencyInteger(value as number)} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#64748b', fontSize: 12, width: 110 }} interval={0} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(254, 226, 226, 0.5)' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                                    formatter={(value: number) => [formatCurrency(value), "Valor Vencido"]}
                                />
                                <Bar dataKey="Valor" fill="#ef4444" name="Valor Vencido" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SchoolReports;
