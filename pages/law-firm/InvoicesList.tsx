
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import { demoInvoices, demoStudents, demoSchools } from '../../services/demoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceStatus, Invoice, CollectionStage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

const listVariants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.05 } },
  hidden: { opacity: 0 },
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

const collectionStageLabels: Record<CollectionStage, string> = {
    [CollectionStage.AGUARDANDO_CONTATO]: 'Aguardando Contato',
    [CollectionStage.EM_NEGOCIACAO]: 'Em Negociação',
    [CollectionStage.ACORDO_FEITO]: 'Acordo Feito',
    [CollectionStage.PAGAMENTO_RECUSADO]: 'Pagamento Recusado',
};

interface InvoicesListProps {
    onSelectInvoice: (invoiceId: string) => void;
    selectedInvoiceId: string | null;
}

const LawFirmInvoicesList = ({ onSelectInvoice, selectedInvoiceId }: InvoicesListProps): React.ReactElement => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<(Invoice & { schoolName?: string })[]>([]);

    useEffect(() => {
        if (!user) {
            setInvoices([]);
            return;
        }

        // Only show data for the demo user; new users see an empty list.
        if (user.email === DEMO_USERS.ESCRITORIO.email) {
            const officeSchools = demoSchools.filter(s => s.officeId === user.id);
            const officeSchoolIds = new Set(officeSchools.map(s => s.id));

            const scopedInvoices = demoInvoices
                .filter(inv => officeSchoolIds.has(inv.schoolId))
                .map(inv => {
                    const student = demoStudents.find(s => s.id === inv.studentId);
                    const school = officeSchools.find(s => s.id === student?.schoolId);
                    return { ...inv, schoolName: school?.name || 'N/A' };
                });
            setInvoices(scopedInvoices);
        } else {
            setInvoices([]);
        }
    }, [user]);


    const handleStageChange = (invoiceId: string, newStage: CollectionStage) => {
        setInvoices(prevInvoices => 
            prevInvoices.map(inv => 
                inv.id === invoiceId ? { ...inv, collectionStage: newStage } : inv
            )
        );
    };
    
    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Recuperado</span>;
            case InvoiceStatus.PENDENTE: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Aberto</span>;
            case InvoiceStatus.VENCIDO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Vencido</span>;
        }
    };
    
    const getRiskChip = (score: number | undefined) => {
        if (score === undefined) return <span className="text-neutral-400">-</span>;

        if (score > 70) {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">Alto ({score}%)</span>;
        }
        if (score > 30) {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">Médio ({score}%)</span>;
        }
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">Baixo ({score}%)</span>;
    };

    return (
        <Card noPadding>
            <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Histórico Geral de Cobranças</h2>
                 <p className="text-sm text-neutral-500 mt-1">Visualize e gerencie o status de todas as cobranças de todas as escolas.</p>
            </div>
            
            {/* Desktop Table */}
            <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                <thead className="bg-neutral-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Risco (IA)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Etapa da Cobrança</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <motion.tbody 
                    className="bg-white divide-y divide-neutral-200"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {invoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map((invoice) => {
                         const isSelected = selectedInvoiceId === invoice.id;
                         const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
                         const displayValue = invoice.status === InvoiceStatus.VENCIDO ? updatedValue : invoice.value;
                         return (
                            <motion.tr 
                                key={invoice.id} 
                                variants={itemVariants} 
                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                onClick={() => onSelectInvoice(invoice.id)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{invoice.schoolName}</div>
                                    <div className="text-xs text-neutral-500">{formatDate(invoice.dueDate)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{invoice.studentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(displayValue)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRiskChip(invoice.riskScore)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {invoice.status !== InvoiceStatus.PAGO && invoice.collectionStage ? (
                                        <select
                                            value={invoice.collectionStage}
                                            onChange={(e) => handleStageChange(invoice.id, e.target.value as CollectionStage)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full p-1.5 border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm bg-white hover:bg-neutral-50"
                                        >
                                            {Object.values(CollectionStage).map(stage => (
                                                <option key={stage} value={stage}>{collectionStageLabels[stage]}</option>
                                            ))}
                                        </select>
                                    ) : (invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : getStatusChip(invoice.status))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <span className="text-primary-600 hover:text-primary-900 font-medium">
                                        Ver Detalhes
                                    </span>
                                </td>
                            </motion.tr>
                        )
                    })}
                </motion.tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden">
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-neutral-200">
                    {invoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map((invoice) => {
                        const isSelected = selectedInvoiceId === invoice.id;
                        const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
                        const displayValue = invoice.status === InvoiceStatus.VENCIDO ? updatedValue : invoice.value;
                        return (
                            <motion.div
                                key={invoice.id}
                                variants={itemVariants}
                                className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                                onClick={() => onSelectInvoice(invoice.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-neutral-900">{invoice.schoolName}</div>
                                        <div className="text-sm text-neutral-500">{invoice.studentName}</div>
                                    </div>
                                    {getStatusChip(invoice.status)}
                                </div>
                                <div className="text-sm space-y-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Valor:</span>
                                        <span className="font-medium text-neutral-800">{formatCurrency(displayValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Risco (IA):</span>
                                        {getRiskChip(invoice.riskScore)}
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-xs text-neutral-500 block mb-1">Etapa da Cobrança</label>
                                        {invoice.status !== InvoiceStatus.PAGO && invoice.collectionStage ? (
                                            <select
                                                value={invoice.collectionStage}
                                                onChange={(e) => handleStageChange(invoice.id, e.target.value as CollectionStage)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full p-1.5 border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm bg-white hover:bg-neutral-50"
                                            >
                                                {Object.values(CollectionStage).map(stage => (
                                                    <option key={stage} value={stage}>{collectionStageLabels[stage]}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="font-medium text-sm">{invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </Card>
    );
};

export default LawFirmInvoicesList;
