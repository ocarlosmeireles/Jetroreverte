

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';
import Button from '../../components/common/Button';
import { UsersIcon, DollarIcon } from '../../components/common/icons';
import { InvoiceStatus, Student, Guardian, Invoice, CollectionStage } from '../../types';
import AddStudentModal from '../../components/school/AddStudentModal';
import AddInvoiceModal from '../../components/school/AddInvoiceModal';
import { demoStudents, demoGuardians, demoInvoices } from '../../services/demoData';


interface SchoolDashboardContentProps {
    onSelectStudent: (studentId: string) => void;
}

const ShimmerPlaceholder = (props: {style?: React.CSSProperties}) => (
    <div className="animate-shimmer rounded-lg bg-neutral-200" style={{
        backgroundImage: 'linear-gradient(to right, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
        backgroundSize: '2000px 100%',
        ...props.style
    }}></div>
);

const DashboardLoadingSkeleton = () => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <ShimmerPlaceholder style={{ height: '92px' }} />
            <ShimmerPlaceholder style={{ height: '92px' }} />
            <ShimmerPlaceholder style={{ height: '92px' }} />
            <ShimmerPlaceholder style={{ height: '92px' }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <ShimmerPlaceholder style={{ height: '380px' }} />
            </div>
             <div className="lg:col-span-2">
                <ShimmerPlaceholder style={{ height: '220px' }} />
            </div>
        </div>
        <div className="mt-6">
            <ShimmerPlaceholder style={{ height: '300px' }} />
        </div>
    </div>
);


const SchoolDashboardContent = ({ onSelectStudent }: SchoolDashboardContentProps): React.ReactElement => {
    const { user } = useAuth();
    const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
    const [isAddInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
    
    const [students, setStudents] = useState<Student[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({ totalAlunos: 0, paidThisMonth: 0, pending: 0, overdue: 0 });
    const [revenueData, setRevenueData] = useState<{ month: string, Arrecadado: number }[]>([]);
    const [overdueStudents, setOverdueStudents] = useState<(Invoice & { studentName?: string })[]>([]);

    const fetchData = () => {
        const schoolId = user?.schoolId || 'school-01'; // Fallback for demo purposes
        setLoading(true);
        setError(null);
        setTimeout(() => {
            try {
                const studentsList = demoStudents.filter(s => s.schoolId === schoolId);
                setStudents(studentsList);

                const guardiansList = demoGuardians.filter(g => g.schoolId === schoolId);
                setGuardians(guardiansList);

                const invoicesList = demoInvoices.filter(i => i.schoolId === schoolId);
                setInvoices(invoicesList);

                // Calculate stats
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const paidThisMonth = invoicesList
                    .filter(i => {
                        if (i.status !== InvoiceStatus.PAGO) return false;
                        const paymentDate = new Date(i.dueDate); // Assuming dueDate is payment date for paid invoices
                        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, inv) => sum + inv.value, 0);
                
                const pending = invoicesList.filter(i => i.status === InvoiceStatus.PENDENTE).reduce((sum, inv) => sum + inv.value, 0);
                const overdue = invoicesList.filter(i => i.status === InvoiceStatus.VENCIDO).reduce((sum, inv) => sum + inv.value, 0);
                setStats({ totalAlunos: studentsList.length, paidThisMonth, pending, overdue });

                // Calculate revenue data for chart
                const monthlyRevenue: { [key: string]: { Arrecadado: number } } = {};
                invoicesList.filter(i => i.status === InvoiceStatus.PAGO).forEach(invoice => {
                    const date = new Date(invoice.dueDate);
                    const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                    const year = date.getFullYear();
                    const key = `${month}/${year}`;
                    if (!monthlyRevenue[key]) monthlyRevenue[key] = { Arrecadado: 0 };
                    monthlyRevenue[key].Arrecadado += invoice.value;
                });
                const chartData = Object.keys(monthlyRevenue).map(month => ({
                    month: month.charAt(0).toUpperCase() + month.slice(1), ...monthlyRevenue[month]
                })).slice(-4);
                setRevenueData(chartData);
                
                // Get overdue students
                const topOverdueStudents = invoicesList
                    .filter(i => i.status === InvoiceStatus.VENCIDO)
                    .map(i => ({ ...i, studentName: studentsList.find(s => s.id === i.studentId)?.name || 'N/A' }))
                    .slice(0, 5);
                setOverdueStudents(topOverdueStudents);

            } catch (err) {
                console.error(err);
                setError("Falha ao carregar os dados do dashboard. Tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        }, 1000); // Simulate network delay for skeleton
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveStudent = (data: any) => {
        const schoolId = user?.schoolId || 'school-01';
        try {
            let guardianId = data.guardianId;
            let guardianName = guardians.find(g => g.id === guardianId)?.name;

            if (data.guardianType === 'new') {
                guardianId = `resp-${Date.now()}`;
                guardianName = data.guardianName;
                const newGuardian: Guardian = {
                    id: guardianId,
                    name: data.guardianName, email: data.guardianEmail, phone: data.guardianPhone,
                    cpf: data.guardianCpf, rg: data.guardianRg, address: data.guardianAddress,
                    relationship: data.guardianRelationship, schoolId: schoolId,
                };
                setGuardians(g => [...g, newGuardian]);
            }

            const studentId = `stud-${Date.now()}`;
            const newStudent: Student = {
                id: studentId,
                name: data.studentName, class: data.studentClass, registrationCode: data.studentCode,
                guardianId: guardianId, schoolId: schoolId, guardianName: guardianName,
            };
            setStudents(s => [...s, newStudent]);

            const newInvoice: Invoice = {
                id: `inv-${Date.now()}`,
                studentId, studentName: data.studentName, schoolId: schoolId,
                value: parseFloat(data.invoiceValue),
                updatedValue: parseFloat(data.updatedInvoiceValue) || parseFloat(data.invoiceValue),
                dueDate: data.invoiceDueDate, status: InvoiceStatus.VENCIDO, notes: data.invoiceDescription,
                overdueInstallments: parseInt(data.overdueInstallments), lastPaymentDate: data.lastPaymentDate,
                originalPaymentMethod: data.originalPaymentMethod, schoolContactHistory: data.schoolContactHistory,
            };
            setInvoices(i => [...i, newInvoice]);

            setAddStudentModalOpen(false);
            fetchData(); // Refresh stats
            alert("Aluno e débito inicial registrados (apenas para esta sessão).");
        } catch (err) {
            console.error("Error saving student:", err);
            alert("Ocorreu um erro ao salvar o aluno.");
        }
    };

    const handleSaveInvoice = (data: any) => {
        const schoolId = user?.schoolId || 'school-01';
        try {
            const student = students.find(s => s.id === data.studentId);
            const newInvoice: Invoice = {
                id: `inv-${Date.now()}`,
                studentId: data.studentId,
                studentName: student?.name || 'N/A',
                schoolId: schoolId,
                value: parseFloat(data.invoiceValue),
                dueDate: data.invoiceDueDate,
                status: InvoiceStatus.PENDENTE,
                notes: data.invoiceDescription,
                collectionStage: CollectionStage.AGUARDANDO_CONTATO,
            };
            setInvoices(i => [...i, newInvoice]);

            setAddInvoiceModalOpen(false);
            fetchData();
            alert("Nova cobrança registrada (apenas para esta sessão).");
        } catch (err) {
            console.error("Error saving invoice:", err);
            alert("Ocorreu um erro ao salvar a cobrança.");
        }
    };

    if (loading) {
        return <DashboardLoadingSkeleton />;
    }
    
    if (error) {
        return <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Alunos" value={String(stats.totalAlunos)} icon={<UsersIcon />} color="primary" delay={0.1} />
                <StatCard title="Pago (este mês)" value={formatCurrency(stats.paidThisMonth)} icon={<DollarIcon />} color="green" delay={0.2} />
                <StatCard title="Pendente" value={formatCurrency(stats.pending)} icon={<DollarIcon />} color="secondary" delay={0.3} />
                <StatCard title="Vencido" value={formatCurrency(stats.overdue)} icon={<DollarIcon />} color="red" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-card">
                     <Chart data={revenueData} title="Arrecadação Mensal" barKey="Arrecadado" xAxisKey="month" />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-card">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Ações Rápidas</h3>
                    <div className="space-y-3">
                        <Button variant="primary" className="w-full" onClick={() => setAddInvoiceModalOpen(true)}>Gerar Nova Cobrança</Button>
                        <Button variant="secondary" className="w-full" onClick={() => setAddStudentModalOpen(true)}>Cadastrar Aluno Inadimplente</Button>
                        <Button variant="secondary" className="w-full" disabled title="Funcionalidade em desenvolvimento">Exportar Relatório Mensal</Button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-card">
                 <div className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-800">Alunos com Débitos Vencidos</h3>
                 </div>
                {overdueStudents.length > 0 ? (
                    <ul className="divide-y divide-neutral-200">
                        {overdueStudents.map(invoice => (
                            <li key={invoice.id} className="px-6 py-3 flex justify-between items-center hover:bg-neutral-50/70">
                                <div>
                                    <p className="font-medium text-neutral-800">{invoice.studentName}</p>
                                    <p className="text-sm text-red-600">{formatCurrency(invoice.value)} - Vencido em {formatDate(invoice.dueDate)}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onSelectStudent(invoice.studentId)}>Ver Aluno</Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-neutral-500 py-4 px-6">Nenhum aluno com débito vencido no momento. Bom trabalho!</p>
                )}
            </div>

            <AddStudentModal
                isOpen={isAddStudentModalOpen}
                onClose={() => setAddStudentModalOpen(false)}
                onSave={handleSaveStudent}
                existingGuardians={guardians}
            />

            <AddInvoiceModal
                isOpen={isAddInvoiceModalOpen}
                onClose={() => setAddInvoiceModalOpen(false)}
                onSave={handleSaveInvoice}
                existingStudents={students}
            />
        </div>
    );
};

export default SchoolDashboardContent;