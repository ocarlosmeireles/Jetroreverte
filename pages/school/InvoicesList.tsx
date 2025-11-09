import React, { useState } from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { demoInvoices, demoStudents } from '../../services/demoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceStatus, Invoice, CollectionStage } from '../../types';
import AddInvoiceModal from '../../components/school/AddInvoiceModal';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import { PlusIcon } from '../../components/common/icons';

const listVariants: Variants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  hidden: {
    opacity: 0,
  },
};

// FIX: Explicitly type itemVariants with the Variants type.
const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
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


interface InvoicesListProps {
    onSelectInvoice: (invoiceId: string) => void;
}

const InvoicesList = ({ onSelectInvoice }: InvoicesListProps): React.ReactElement => {
    const [invoices, setInvoices] = useState<Invoice[]>(() => demoInvoices);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get students from the correct school to populate the modal
    const studentsForModal = demoStudents.filter(s => s.schoolId === 'school-01');

    const handleSaveInvoice = (data: any) => {
        const student = studentsForModal.find(s => s.id === data.studentId);
        // FIX: Added the required 'schoolId' property to the new invoice object.
        if (!student) {
            alert('Aluno não encontrado!');
            return;
        }
        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            studentId: data.studentId,
            schoolId: student.schoolId,
            studentName: student?.name || 'N/A',
            value: parseFloat(data.invoiceValue),
            dueDate: data.invoiceDueDate,
            status: InvoiceStatus.PENDENTE,
            notes: data.invoiceDescription,
            paymentLink: '#',
            collectionStage: CollectionStage.AGUARDANDO_CONTATO,
        };
        setInvoices(prev => [newInvoice, ...prev].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        setIsModalOpen(false);
        alert('Nova cobrança registrada com sucesso!');
    };

    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Recuperado</span>;
            case InvoiceStatus.PENDENTE: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Aberto</span>;
            case InvoiceStatus.VENCIDO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Vencido</span>;
        }
    };

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Histórico de Cobranças</h2>
                    <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} size="sm">Novo Débito</Button>
                </div>
                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vencimento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status da Cobrança</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            className="bg-white divide-y divide-neutral-200"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {invoices.map((invoice) => {
                                const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                return (
                                <motion.tr key={invoice.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{invoice.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(displayValue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(invoice.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                      {invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => onSelectInvoice(invoice.id)} className="text-primary-600 hover:text-primary-900 font-medium">
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </motion.tr>
                            )})}
                        </motion.tbody>
                    </table>
                     {/* Mobile Cards */}
                    <div className="md:hidden">
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-neutral-200">
                            {invoices.map(invoice => {
                                const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                return (
                                <motion.div key={invoice.id} variants={itemVariants} className="p-4 hover:bg-neutral-50" onClick={() => onSelectInvoice(invoice.id)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-neutral-800">{invoice.studentName}</p>
                                            <p className="text-sm text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</p>
                                        </div>
                                        {getStatusChip(invoice.status)}
                                    </div>
                                    <div className="flex justify-between items-end mt-2 pt-2 border-t">
                                        <p className="text-sm text-neutral-600">{invoice.collectionStage ? collectionStageLabels[invoice.collectionStage] : 'N/A'}</p>
                                        <p className="font-bold text-neutral-800">{formatCurrency(displayValue)}</p>
                                    </div>
                                </motion.div>
                            )})}
                        </motion.div>
                    </div>
                </div>
            </Card>
            <AddInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInvoice}
                existingStudents={studentsForModal}
            />
        </>
    );
};

export default InvoicesList;