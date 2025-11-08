import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { demoSchools, demoStudents, demoInvoices } from '../../services/demoData';
import { InvoiceStatus } from '../../types';
import Button from '../../components/common/Button';
import { XIcon, DollarIcon, UsersIcon, BillingIcon, SparklesIcon, DocumentReportIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import SchoolReportModal from '../../components/law-firm/SchoolReportModal';
import { useAuth } from '../../hooks/useAuth';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface SchoolDetailProps {
    schoolId: string;
    onBack: () => void;
}

const HealthScoreCircle = ({ score }: { score: number | undefined }) => {
    if (score === undefined) return null;
  
    const circumference = 2 * Math.PI * 42; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;
    const color = score > 75 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';
  
    return (
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-neutral-200/70"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <motion.circle
            className={color}
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{
                strokeDasharray: circumference,
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%'
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neutral-800">{score}</span>
          <span className="text-xs text-neutral-500 -mt-1">/ 100</span>
        </div>
      </div>
    );
};

const SchoolDetail = ({ schoolId, onBack }: SchoolDetailProps): React.ReactElement => {
    const { user } = useAuth();
    const school = demoSchools.find(s => s.id === schoolId);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
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

    const defaulterStudentsCount = new Set(
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
        <>
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

                <div className="mb-6 p-4 bg-gradient-to-br from-primary-50/50 to-white rounded-xl border border-primary-200/50 flex items-center gap-4">
                    <HealthScoreCircle score={school.healthScore} />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-primary-500" />
                            <h3 className="text-md font-bold text-primary-800">Análise de IA</h3>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1 italic">"{school.healthSummary || 'Análise indisponível.'}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-green-50 border border-green-200/80 rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-green-700">Total Recuperado</p>
                        <p className="text-lg font-bold text-green-800 mt-1">{formatCurrency(totalRecovered)}</p>
                     </div>
                     <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-blue-700">Comissão Gerada</p>
                        <p className="text-lg font-bold text-blue-800 mt-1">{formatCurrency(totalCommission)}</p>
                     </div>
                </div>
                
                <div className="mb-6">
                    <Button onClick={() => setIsReportModalOpen(true)} className="w-full" variant="secondary" icon={<DocumentReportIcon className="w-5 h-5"/>}>
                        Gerar Relatório para Escola
                    </Button>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden border border-neutral-200/80 rounded-xl">
                    <div className="p-4 border-b border-neutral-200/80">
                        <h3 className="text-base font-semibold text-neutral-800">Histórico de Cobranças ({invoicesForSchool.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {invoicesForSchool.length > 0 ? (
                            <table className="min-w-full">
                                <thead className="bg-neutral-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                    {invoicesForSchool.map(invoice => {
                                        const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                        return (
                                            <tr key={invoice.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-neutral-900">{invoice.studentName}</div>
                                                    <div className="text-xs text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">{formatCurrency(displayValue)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-12 text-center text-neutral-500">
                                Nenhuma cobrança encontrada.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {user && (
                 <SchoolReportModal 
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    school={school}
                    user={user}
                />
            )}
        </>
    );
};

export default SchoolDetail;