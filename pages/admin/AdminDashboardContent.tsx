
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { demoSchools, demoInvoices } from '../../services/demoData';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import { BillingIcon, DollarIcon, DocumentReportIcon, SparklesIcon } from '../../components/common/icons';
import { DEMO_USERS } from '../../constants';
import { InvoiceStatus } from '../../types';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { GoogleGenAI } from '@google/genai';

const AiStrategyBriefing = ({ stats, chartData }: { stats: any, chartData: any[] }) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateBriefing = async () => {
        setIsLoading(true);
        setError('');
        setBriefing('');

        const prompt = `
            Aja como um consultor de negócios sênior para um escritório de advocacia especializado em cobrança educacional.
            Analise os seguintes KPIs de performance do último mês e gere um "Briefing Estratégico Semanal" conciso.

            **Dados de Performance:**
            - Total Recuperado no Mês: ${formatCurrency(stats.totalRecoveredThisMonth)}
            - Comissão Gerada no Mês: ${formatCurrency(stats.commissionThisMonth)}
            - Quantidade de Cobranças Vencidas Atualmente: ${stats.overdueInvoicesCount}
            - Performance de Comissão nos Últimos Meses: ${chartData.map(d => `${d.month}: ${formatCurrency(d.Comissão)}`).join('; ')}

            **Sua Tarefa:**
            Elabore um resumo em 2 ou 3 parágrafos curtos. O texto deve:
            1.  Começar com uma saudação e um resumo positivo da performance (Ex: "Excelente trabalho na recuperação este mês...").
            2.  Apontar o principal ponto de atenção ou risco com base nos dados (Ex: "O número de cobranças vencidas ainda é um ponto a ser observado...").
            3.  Fornecer 1 ou 2 sugestões de ações estratégicas para a próxima semana (Ex: "Sugestão: Focar em uma campanha de negociação para os casos mais antigos..." ou "Oportunidade: Analisar o perfil das escolas com maior comissão para replicar o sucesso.").
            O tom deve ser profissional, encorajador e direto ao ponto.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setBriefing(response.text);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar o briefing. Verifique a chave da API e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Consultor Estratégico de IA</h3>
            </div>
            {!briefing && !isLoading && !error && (
                <>
                    <p className="text-sm text-neutral-600 mb-4">Receba uma análise inteligente da performance da sua carteira e sugestões de ações para a semana.</p>
                    <Button onClick={handleGenerateBriefing} isLoading={isLoading}>Gerar Análise Estratégica</Button>
                </>
            )}
             {isLoading && <p className="text-sm text-neutral-600">Analisando dados e gerando insights...</p>}
             {error && <p className="text-sm text-red-600">{error}</p>}
             {briefing && (
                <div>
                    <pre className="whitespace-pre-wrap text-sm font-sans bg-primary-50/50 p-4 rounded-lg border border-primary-100 text-neutral-700">{briefing}</pre>
                    <Button onClick={handleGenerateBriefing} isLoading={isLoading} variant="secondary" size="sm" className="mt-4">Gerar Nova Análise</Button>
                </div>
            )}
        </Card>
    );
};


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
                <div className="lg:col-span-3">
                    <Chart data={commissionChartData} title="Comissão Gerada por Mês" barKey="Comissão" xAxisKey="month" delay={0.4} />
                </div>
                <div className="lg:col-span-2">
                    <AiStrategyBriefing stats={{ totalRecoveredThisMonth, commissionThisMonth, overdueInvoicesCount }} chartData={commissionChartData} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;
