import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts } from '../../services/demoData';
import { InvoiceStatus, NegotiationCase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

type StatusFilter = 'ALL' | 'ACTIVE' | 'RESOLVED';

interface DebtorsRegistryProps {
    onOpenDossier: (caseData: NegotiationCase) => void;
}

const DebtorsRegistry = ({ onOpenDossier }: DebtorsRegistryProps) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE');
    
    const allDebtorCases = useMemo((): NegotiationCase[] => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) return [];
        
        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        return demoInvoices
            .filter(i => officeSchoolIds.has(i.schoolId))
            .map(invoice => ({
                invoice,
                student: demoStudents.find(s => s.id === invoice.studentId),
                guardian: demoGuardians.find(g => g.id === demoStudents.find(s => s.id === invoice.studentId)?.guardianId),
                school: officeSchools.find(s => s.id === invoice.schoolId),
                attempts: demoNegotiationAttempts.filter(a => a.invoiceId === invoice.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            }))
            .sort((a, b) => new Date(b.invoice.dueDate).getTime() - new Date(a.invoice.dueDate).getTime());
    }, [user]);

    const filteredCases = useMemo(() => {
        return allDebtorCases.filter(c => {
            if (statusFilter === 'ACTIVE' && c.invoice.status === InvoiceStatus.PAGO) return false;
            if (statusFilter === 'RESOLVED' && c.invoice.status !== InvoiceStatus.PAGO) return false;

            const term = searchTerm.toLowerCase();
            if (!term) return true;
            return (
                c.student?.name.toLowerCase().includes(term) ||
                c.guardian?.name.toLowerCase().includes(term) ||
                c.school?.name.toLowerCase().includes(term)
            );
        });
    }, [allDebtorCases, searchTerm, statusFilter]);

    const getStatusChip = (status: InvoiceStatus) => {
        const styles = {
            [InvoiceStatus.PAGO]: 'bg-green-100 text-green-700',
            [InvoiceStatus.VENCIDO]: 'bg-red-100 text-red-700',
            [InvoiceStatus.PENDENTE]: 'bg-yellow-100 text-yellow-700',
        };
        const text = {
            [InvoiceStatus.PAGO]: 'Resolvido',
            [InvoiceStatus.VENCIDO]: 'Ativo (Vencido)',
            [InvoiceStatus.PENDENTE]: 'Ativo (Pendente)',
        }
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text"
                        placeholder="Buscar por escola, aluno, responsável..."
                        className="w-full sm:flex-grow px-4 py-2 border rounded-full bg-white shadow-sm focus:ring-2 focus:ring-primary-300"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                     <select 
                        className="w-full sm:w-auto px-4 py-2 border rounded-full bg-white shadow-sm focus:ring-2 focus:ring-primary-300"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="ACTIVE">Apenas Ativos</option>
                        <option value="RESOLVED">Apenas Resolvidos</option>
                    </select>
                </div>
            </div>
            <div className="flex-grow overflow-auto border rounded-lg bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno / Responsável</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vencimento</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor Atualizado</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        <AnimatePresence>
                            {filteredCases.map((c) => {
                                const { updatedValue } = calculateUpdatedInvoiceValues(c.invoice);
                                return (
                                <motion.tr 
                                    key={c.invoice.id} 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => onOpenDossier(c)}
                                    className='cursor-pointer transition-colors hover:bg-neutral-50/70'
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-neutral-900">{c.student?.name}</div>
                                        <div className="text-xs text-neutral-500">{c.guardian?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{c.school?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatDate(c.invoice.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-neutral-800">{formatCurrency(updatedValue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusChip(c.invoice.status)}</td>
                                </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
                 {filteredCases.length === 0 && (
                    <div className="text-center p-12">
                        <p className="text-neutral-500">Nenhum registro encontrado para os filtros aplicados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebtorsRegistry;
