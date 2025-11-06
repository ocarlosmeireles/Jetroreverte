import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import { demoInvoices, demoSchools, demoStudents } from '../../services/demoData';
import { InvoiceStatus } from '../../types';
import { formatCurrency, formatCurrencyInteger } from '../../utils/formatters';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import { DollarIcon, CheckCircleIcon } from '../../components/common/icons';

const ConsolidatedReports = (): React.ReactElement => {
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));

    // --- Data Calculations ---
    const paidInvoices = demoInvoices.filter(i => i.status === InvoiceStatus.PAGO);
    const overdueInvoices = demoInvoices.filter(i => i.status === InvoiceStatus.VENCIDO);

    const totalRecovered = paidInvoices.reduce((sum, inv) => sum + inv.value, 0);
    const totalCommission = totalRecovered * (commissionPercentage / 100);
    const recoveryRate = paidInvoices.length > 0 ? (paidInvoices.length / (paidInvoices.length + overdueInvoices.length)) * 100 : 0;

    // Monthly data
    const monthlyData: { [key: string]: { Recuperado: number, Comissão: number } } = {};
    paidInvoices.forEach(invoice => {
        const month = new Date(invoice.dueDate).toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        const year = new Date(invoice.dueDate).getFullYear();
        const key = `${month}/${year}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { Recuperado: 0, Comissão: 0 };
        }
        monthlyData[key].Recuperado += invoice.value;
        monthlyData[key].Comissão += invoice.value * (commissionPercentage / 100);
    });

    const chartData = Object.keys(monthlyData).map(month => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        ...monthlyData[month]
    })).slice(-6); // Last 6 months

    // School performance data
    const schoolPerformance: { [key: string]: number } = {};
    paidInvoices.forEach(invoice => {
        const student = demoStudents.find(s => s.id === invoice.studentId);
        if (student) {
            const schoolId = student.schoolId;
            if (!schoolPerformance[schoolId]) {
                schoolPerformance[schoolId] = 0;
            }
            schoolPerformance[schoolId] += invoice.value;
        }
    });

    const schoolChartData = Object.keys(schoolPerformance)
        .map(schoolId => ({
            name: demoSchools.find(s => s.id === schoolId)?.name || 'Desconhecida',
            Valor: schoolPerformance[schoolId]
        }))
        .sort((a, b) => b.Valor - a.Valor)
        .slice(0, 5); // Top 5

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Recuperado (Geral)" value={formatCurrency(totalRecovered)} icon={<DollarIcon />} color="green" delay={0.1} />
                <StatCard title="Comissão Total Gerada" value={formatCurrency(totalCommission)} icon={<DollarIcon />} color="primary" delay={0.2} />
                <StatCard title="Taxa de Recuperação" value={`${recoveryRate.toFixed(1)}%`} icon={<CheckCircleIcon />} color="secondary" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card delay={0.4} className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recuperado vs. Comissão (Mensal)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrencyInteger(value as number)} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(224, 231, 255, 0.5)' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                                    formatter={(value: number, name) => [formatCurrency(value), name]}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                <Bar dataKey="Recuperado" fill="#22c55e" name="Valor Recuperado" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Comissão" fill="#4f46e5" name="Comissão Gerada" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.5} className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Top 5 Escolas por Valor Recuperado</h3>
                    <div style={{ width: '100%', height: 300 }}>
                         <ResponsiveContainer>
                            <BarChart data={schoolChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrencyInteger(value as number)} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#64748b', fontSize: 12, width: 110 }} interval={0} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(224, 231, 255, 0.5)' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
                                    formatter={(value: number) => [formatCurrency(value), "Valor Recuperado"]}
                                />
                                <Bar dataKey="Valor" fill="#0891b2" name="Valor Recuperado" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ConsolidatedReports;
