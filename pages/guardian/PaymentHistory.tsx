
import React from 'react';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import { demoInvoices, demoStudents, demoGuardians, demoSchools } from '../../services/demoData';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Invoice, InvoiceStatus } from '../../types';

const listVariants = {
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

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};


const PaymentHistory = (): React.ReactElement => {
    const { user } = useAuth();
    // In a real app, you would fetch students associated with the guardian's email/ID
    const myStudents = demoStudents.filter(s => s.guardianId === user?.id);
    const myStudentIds = myStudents.map(s => s.id);
    const invoices = demoInvoices.filter(inv => myStudentIds.includes(inv.studentId) && inv.status === InvoiceStatus.PAGO);

    const handleViewReceipt = (invoice: Invoice) => {
        const student = demoStudents.find(s => s.id === invoice.studentId);
        const guardian = demoGuardians.find(g => g.id === student?.guardianId);
        const school = demoSchools.find(s => s.id === student?.schoolId);

        if (!student || !guardian || !school) {
            alert("Não foi possível gerar o recibo. Dados incompletos.");
            return;
        }

        const receiptHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Recibo de Pagamento - ${invoice.id}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style> body { font-family: sans-serif; } </style>
            </head>
            <body class="bg-gray-100 p-10">
                <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Recibo de Pagamento</h1>
                    <p class="text-gray-500 mb-6">ID da Cobrança: ${invoice.id}</p>
                    
                    <div class="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                        <div>
                            <h2 class="text-sm font-semibold text-gray-500 uppercase">PAGO PARA</h2>
                            <p class="text-gray-800 font-medium">${school.name}</p>
                        </div>
                        <div>
                            <h2 class="text-sm font-semibold text-gray-500 uppercase">PAGO POR</h2>
                            <p class="text-gray-800 font-medium">${guardian.name}</p>
                            <p class="text-gray-600 text-sm">${guardian.email}</p>
                        </div>
                    </div>
                    
                    <h2 class="text-sm font-semibold text-gray-500 uppercase mb-2">DETALHES DO PAGAMENTO</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center"><span class="text-gray-600">Aluno:</span><span class="font-medium text-gray-800">${student.name}</span></div>
                        <div class="flex justify-between items-center"><span class="text-gray-600">Descrição:</span><span class="font-medium text-gray-800">${invoice.notes || 'Mensalidade'}</span></div>
                        <div class="flex justify-between items-center"><span class="text-gray-600">Data de Pagamento:</span><span class="font-medium text-gray-800">${formatDate(invoice.dueDate)}</span></div>
                    </div>
                    
                    <div class="mt-6 pt-4 border-t-2 border-dashed">
                        <div class="flex justify-between items-center text-xl font-bold">
                            <span class="text-gray-600">TOTAL PAGO:</span>
                            <span class="text-green-600">${formatCurrency(invoice.value)}</span>
                        </div>
                    </div>

                    <div class="mt-8 text-center text-sm text-gray-400">
                        <p>Este é um recibo gerado por computador e não requer assinatura.</p>
                        <p>Jetro Reverte - Plataforma de Cobrança Educacional</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
            receiptWindow.document.write(receiptHtml);
            receiptWindow.document.close();
        } else {
            alert('Não foi possível abrir a janela de recibo. Verifique se o seu navegador está bloqueando pop-ups.');
        }
    };

    return (
        <Card noPadding>
            <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-neutral-800">Histórico de Pagamentos</h2>
            </div>
            {invoices.length > 0 ? (
                <>
                    {/* Desktop Table */}
                    <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data do Pagamento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <motion.tbody 
                            className="bg-white divide-y divide-neutral-200"
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {invoices.map((invoice) => (
                                <motion.tr key={invoice.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{invoice.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(invoice.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(invoice.value)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleViewReceipt(invoice)} className="text-primary-600 hover:text-primary-900">Ver Recibo</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        <motion.div className="divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                            {invoices.map(invoice => (
                                <motion.div key={invoice.id} variants={itemVariants} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-neutral-800">{invoice.studentName}</p>
                                            <p className="text-sm text-neutral-500">Pago em: {formatDate(invoice.dueDate)}</p>
                                        </div>
                                        <p className="font-semibold text-green-700">{formatCurrency(invoice.value)}</p>
                                    </div>
                                    <div className="text-right mt-2">
                                        <button onClick={() => handleViewReceipt(invoice)} className="text-sm font-medium text-primary-600 hover:text-primary-900">Ver Recibo</button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </>
            ) : (
                <div className="p-6 text-center text-neutral-600">
                    Nenhum pagamento registrado no histórico.
                </div>
            )}
        </Card>
    );
};

export default PaymentHistory;