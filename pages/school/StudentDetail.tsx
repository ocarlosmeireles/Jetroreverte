import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { demoStudents, demoGuardians, demoInvoices } from '../../services/demoData';
import { Student, Guardian, Invoice, InvoiceStatus, CollectionStage } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, PlusIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AddInvoiceModal from '../../components/school/AddInvoiceModal';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface StudentDetailProps {
    studentId: string;
    onBack: () => void;
}

const listVariants = {
  visible: { transition: { staggerChildren: 0.05 } },
  hidden: {},
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 20 },
};

// FIX: Added missing PREPARACAO_JUDICIAL key to satisfy the Record<CollectionStage, string> type.
const collectionStageLabels: Record<CollectionStage, string> = {
    [CollectionStage.AGUARDANDO_CONTATO]: 'Aguardando Contato',
    [CollectionStage.EM_NEGOCIACAO]: 'Em Negociação',
    [CollectionStage.ACORDO_FEITO]: 'Acordo Feito',
    [CollectionStage.PREPARACAO_JUDICIAL]: 'Preparação Judicial',
    [CollectionStage.PAGAMENTO_RECUSADO]: 'Pagamento Recusado',
};

const StudentDetail = ({ studentId, onBack }: StudentDetailProps): React.ReactElement => {
    const student = demoStudents.find(s => s.id === studentId);
    const guardian = demoGuardians.find(g => g.id === student?.guardianId);
    const [invoices, setInvoices] = useState<Invoice[]>(() => demoInvoices.filter(i => i.studentId === studentId));
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!student || !guardian) {
        return (
            <Card>
                <p>Aluno não encontrado.</p>
                <Button onClick={onBack} className="mt-4">Voltar</Button>
            </Card>
        );
    }
    
    const handleSaveInvoice = (data: any) => {
        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            studentId: student.id,
            schoolId: student.schoolId,
            studentName: student.name,
            value: parseFloat(data.invoiceValue),
            dueDate: data.invoiceDueDate,
            status: InvoiceStatus.PENDENTE, // New invoices are pending
            notes: data.invoiceDescription,
            paymentLink: '#',
            collectionStage: CollectionStage.AGUARDANDO_CONTATO,
        };
        setInvoices(prev => [newInvoice, ...prev].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        setIsModalOpen(false);
    };

    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pago</span>;
            case InvoiceStatus.PENDENTE: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>;
            case InvoiceStatus.VENCIDO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Vencido</span>;
        }
    };

    return (
        <>
        <div>
            <div className="mb-6">
                <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                    Voltar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-neutral-800">{student.name}</h3>
                        <p className="text-neutral-600">Turma: {student.class}</p>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Responsável Financeiro</h3>
                        <p className="font-medium text-neutral-700">{guardian.name}</p>
                        <p className="text-sm text-neutral-500">{guardian.email}</p>
                        <p className="text-sm text-neutral-500">{guardian.phone}</p>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card noPadding>
                        <div className="p-4 sm:p-6 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Histórico de Débitos</h2>
                            <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="sm">Nova Cobrança</Button>
                        </div>
                        {invoices.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vencimento</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status da Cobrança</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-neutral-200">
                                        {invoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map((invoice) => {
                                            const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                            return (
                                                <tr key={invoice.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{invoice.notes || 'Mensalidade'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(invoice.dueDate)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(displayValue)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                                    {invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : 'N/A'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {/* Mobile Cards */}
                                <div className="md:hidden">
                                    <motion.div className="divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                                        {invoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(invoice => {
                                            const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                            return (
                                                <motion.div key={invoice.id} variants={itemVariants} className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-semibold text-neutral-800">{invoice.notes || 'Mensalidade'}</p>
                                                            <p className="text-sm text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</p>
                                                        </div>
                                                        {getStatusChip(invoice.status)}
                                                    </div>
                                                    <div className="text-sm flex justify-between mt-2 pt-2 border-t border-neutral-100">
                                                        <span className="text-neutral-500">Valor:</span>
                                                        <span className="font-medium text-neutral-800">{formatCurrency(displayValue)}</span>
                                                    </div>
                                                    <div className="text-sm flex justify-between mt-1">
                                                        <span className="text-neutral-500">Cobrança:</span>
                                                        <span className="font-medium text-neutral-800">{invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : 'N/A'}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                            </>
                        ) : (
                            <p className="p-6 text-center text-neutral-500">Nenhum débito encontrado para este aluno.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
        <AddInvoiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveInvoice}
            existingStudents={[student]}
            preselectedStudentId={student.id}
        />
        </>
    );
};

export default StudentDetail;