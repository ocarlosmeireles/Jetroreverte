import React from 'react';
import { demoSchools, demoStudents, demoInvoices } from '../../services/demoData';
import { InvoiceStatus } from '../../types';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import { XIcon, DollarIcon, UsersIcon, BillingIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';

interface SchoolDetailProps {
    schoolId: string;
    onBack: () => void;
}

const SchoolDetail = ({ schoolId, onBack }: SchoolDetailProps): React.ReactElement => {
    const school = demoSchools.find(s => s.id === schoolId);
    
    if (!school) {
        return (
            <div className="p-6">
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <p>Escola não encontrada.</p>
                    <Button onClick={onBack} className="mt-4">Fechar</Button>
                </div>
            </div>
        );
    }
    
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));

    const studentsInSchool = demoStudents.filter(s => s.schoolId === schoolId);
    const studentIdsInSchool = studentsInSchool.map(s => s.id);
    const invoicesForSchool = demoInvoices.filter(i => studentIdsInSchool.includes(i.studentId));

    const totalRecovered = invoicesForSchool
        .filter(i => i.status === InvoiceStatus.PAGO)
        .reduce((acc, i) => acc + i.value, 0);
        
    const totalCommission = totalRecovered * (commissionPercentage / 100);

    const defaulterStudents = new Set(
        invoicesForSchool.filter(i => i.status !== InvoiceStatus.PAGO).map(i => i.studentId)
    ).size;

    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">Recuperado</span>;
            case InvoiceStatus.PENDENTE: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">Em Cobrança</span>;
            case InvoiceStatus.VENCIDO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">Vencido</span>;
        }
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-white">
            <header className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-neutral-800">{school.name}</h2>
                    <p className="text-sm text-neutral-500">{school.cnpj}</p>
                </div>
                <button onClick={onBack} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-100">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="space-y-4 mb-6">
                <StatCard title="Total Recuperado" value={formatCurrency(totalRecovered)} icon={<BillingIcon />} color="green" />
                <StatCard title="Comissão Gerada" value={formatCurrency(totalCommission)} icon={<DollarIcon />} color="primary" />
                <StatCard title="Alunos Inadimplentes" value={String(defaulterStudents)} icon={<UsersIcon />} color="red" />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden border border-neutral-200/80 rounded-xl">
                <div className="p-4 sm:p-6 border-b border-neutral-200/80">
                    <h3 className="text-lg font-semibold text-neutral-800">Histórico de Cobranças</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {invoicesForSchool.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <table className="min-w-full hidden md:table">
                                <thead className="bg-neutral-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                    {invoicesForSchool.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-neutral-900">{invoice.studentName}</div>
                                                <div className="text-xs text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatCurrency(invoice.value)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-neutral-200">
                                {invoicesForSchool.map(invoice => (
                                    <div key={invoice.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-neutral-900">{invoice.studentName}</div>
                                                <div className="text-sm text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(invoice.value)}</div>
                                                {getStatusChip(invoice.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="px-6 py-12 text-center text-neutral-500">
                            Nenhuma cobrança encontrada para esta escola.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchoolDetail;