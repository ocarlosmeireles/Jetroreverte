
import React, { useState, useMemo, ReactNode } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { School, User, InvoiceStatus } from '../../types';
import { XIcon, DocumentReportIcon } from '../common/icons';
import Button from '../common/Button';
import { demoInvoices, demoNegotiationAttempts } from '../../services/demoData';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Because we're using a CDN, jsPDF is available on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}
const { jsPDF } = window.jspdf;


interface SchoolReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    school: School;
    user: User;
}

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const SchoolReportModal = ({ isOpen, onClose, school, user }: SchoolReportModalProps): React.ReactElement => {
    const [isGenerating, setIsGenerating] = useState(false);

    const reportData = useMemo(() => {
        const schoolInvoices = demoInvoices.filter(i => i.schoolId === school.id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recoveredLast30Days = schoolInvoices
            .filter(i => i.status === InvoiceStatus.PAGO && new Date(i.dueDate) > thirtyDaysAgo)
            .reduce((sum, i) => sum + i.value, 0);

        const totalOverdue = schoolInvoices
            .filter(i => i.status === InvoiceStatus.VENCIDO)
            .reduce((sum, i) => sum + i.value, 0);
        
        const activeNegotiations = schoolInvoices.filter(i => i.collectionStage === 'EM_NEGOCIACAO').length;
        
        const recentActivities = demoNegotiationAttempts
            .filter(a => schoolInvoices.some(i => i.id === a.invoiceId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
            
        return { recoveredLast30Days, totalOverdue, activeNegotiations, recentActivities };
    }, [school.id]);

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            let y = margin;
    
            // Header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Relatório de Cobranças', margin, y);
            y += 8;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`${school.name} - ${formatDate(new Date().toISOString())}`, margin, y);
            y += 15;

            // Summary
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo dos Últimos 30 Dias', margin, y);
            y += 8;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Valor Recuperado: ${formatCurrency(reportData.recoveredLast30Days)}`, margin, y);
            y += 7;
            doc.text(`Total em Aberto (Vencido): ${formatCurrency(reportData.totalOverdue)}`, margin, y);
            y += 7;
            doc.text(`Negociações Ativas: ${reportData.activeNegotiations}`, margin, y);
            y += 15;

            // Recent Activities
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Últimas Ações de Cobrança', margin, y);
            y += 8;
            doc.setFontSize(10);
            reportData.recentActivities.forEach(activity => {
                const studentName = demoInvoices.find(i => i.id === activity.invoiceId)?.studentName || 'N/A';
                const activityText = `[${formatDate(activity.date)}] Aluno ${studentName}: ${activity.notes}`;
                const lines = doc.splitTextToSize(activityText, pageWidth - margin * 2);
                doc.text(lines, margin, y);
                y += (lines.length * 5) + 3;
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(
                    `Relatório gerado por ${user.officeName}`,
                    margin,
                    doc.internal.pageSize.height - 10
                );
            }

            doc.save(`Relatorio_${school.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao gerar o PDF.");
        } finally {
            setIsGenerating(false);
            onClose();
        }
    };
    

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Gerar Relatório</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="overflow-y-auto flex-grow p-6 space-y-4">
                            <p className="text-sm text-neutral-600">
                                Você está prestes a gerar um relatório em PDF para a <strong>{school.name}</strong>. Revise os dados abaixo.
                            </p>
                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-neutral-500">Recuperado (30d):</span> <span className="font-semibold text-green-600">{formatCurrency(reportData.recoveredLast30Days)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-neutral-500">Total Vencido:</span> <span className="font-semibold text-red-600">{formatCurrency(reportData.totalOverdue)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-neutral-500">Negociações Ativas:</span> <span className="font-semibold text-blue-600">{reportData.activeNegotiations}</span></div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-700 mb-2">Atividades Recentes Incluídas:</h4>
                                <ul className="text-xs text-neutral-500 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                                    {reportData.recentActivities.map(act => <li key={act.id} className="truncate">{act.notes}</li>)}
                                </ul>
                            </div>
                        </div>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="button" onClick={handleGeneratePdf} isLoading={isGenerating} icon={<DocumentReportIcon className="w-5 h-5"/>}>
                                Gerar PDF
                            </Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SchoolReportModal;