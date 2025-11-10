import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { School, User, InvoiceStatus, Student } from '../../types';
import { XIcon, DocumentReportIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { demoInvoices, demoNegotiationAttempts, demoStudents } from '../../services/demoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

// Because we're using a CDN, jsPDF is available on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}

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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState('');

    const reportData = useMemo(() => {
        if (!isOpen) return null;

        const schoolInvoices = demoInvoices.filter(i => i.schoolId === school.id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recoveredLast30Days = schoolInvoices
            .filter(i => i.status === InvoiceStatus.PAGO && new Date(i.dueDate) > thirtyDaysAgo)
            .reduce((sum, i) => sum + i.value, 0);
        
        const overdueInvoices = schoolInvoices.filter(i => i.status === InvoiceStatus.VENCIDO);
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + calculateUpdatedInvoiceValues(i).updatedValue, 0);
        const activeNegotiations = schoolInvoices.filter(i => i.collectionStage === 'EM_NEGOCIACAO').length;

        const recoveryRate = (recoveredLast30Days > 0 || totalOverdue > 0) ? (recoveredLast30Days / (recoveredLast30Days + totalOverdue)) * 100 : 0;
        
        const topDebtors = overdueInvoices.map(invoice => ({
            name: demoStudents.find(s => s.id === invoice.studentId)?.name || 'N/A',
            value: calculateUpdatedInvoiceValues(invoice).updatedValue,
        })).sort((a,b) => b.value - a.value).slice(0, 5);

        const recentActivities = demoNegotiationAttempts
            .filter(a => schoolInvoices.some(i => i.id === a.invoiceId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
            
        return { recoveredLast30Days, totalOverdue, activeNegotiations, recentActivities, topDebtors, recoveryRate };
    }, [school.id, isOpen]);

    useEffect(() => {
        if (isOpen && reportData) {
            const generateAiAnalysis = async () => {
                setIsAnalyzing(true);
                setAnalysis('');
                setError('');

                const prompt = `Aja como um consultor sênior de cobrança para um escritório de advocacia. Analise os seguintes dados de performance para a escola cliente "${school.name}".
- **KPIs:**
  - Valor Total Recuperado (últimos 30 dias): ${formatCurrency(reportData.recoveredLast30Days)}
  - Valor Total Vencido (em aberto): ${formatCurrency(reportData.totalOverdue)}
  - Negociações Ativas: ${reportData.activeNegotiations}
  - Taxa de Recuperação (Recuperado / (Recuperado + Vencido)): ${reportData.recoveryRate.toFixed(1)}%
- **Top 5 Alunos com Maiores Débitos:**
  ${reportData.topDebtors.map(d => `- ${d.name}: ${formatCurrency(d.value)}`).join('\n')}
- **Últimas Ações de Cobrança:**
  ${reportData.recentActivities.map(a => `- ${formatDate(a.date)}: ${a.notes}`).join('\n')}

**Sua Tarefa:**
Elabore uma "Análise Estratégica" em 3 parágrafos concisos. O texto deve:
1.  **Diagnóstico Geral:** Começar com um resumo da saúde financeira da carteira da escola, destacando o balanço entre valores recuperados e em aberto.
2.  **Pontos de Atenção:** Identificar os principais riscos ou gargalos. Mencione se o valor em aberto é preocupante ou se há concentração de dívida em poucos alunos.
3.  **Recomendações Estratégicas:** Fornecer 2 ou 3 sugestões de ações claras e práticas (Ex: "Focar nos 3 maiores devedores com uma proposta de acordo agressiva", "Iniciar a preparação judicial para casos sem resposta há mais de 60 dias").

O tom deve ser profissional, direto e focado em resultados.`;
                
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
                    setAnalysis(response.text);
                } catch (err) {
                    console.error("Error generating AI analysis:", err);
                    setError('Falha ao gerar análise de IA. Verifique a chave da API.');
                } finally {
                    setIsAnalyzing(false);
                }
            };
            generateAiAnalysis();
        }
    }, [isOpen, reportData, school.name]);


    const handleGeneratePdf = () => {
        if (!reportData) return;
        if (typeof window.jspdf === 'undefined') {
            alert("A biblioteca para gerar PDF não foi carregada. Tente recarregar a página.");
            console.error("jsPDF is not available on window object.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        let y = 0;

        // --- PDF Helper Functions ---
        const drawHeader = () => {
            y = margin;
            if (user.officeLogoUrl) {
                try { doc.addImage(user.officeLogoUrl, 'PNG', margin, y, 30, 15); } catch (e) { console.error("PDF logo error:", e); }
            }
            doc.setFontSize(10); doc.setTextColor(100);
            doc.text(user.officeName || '', pageWidth - margin, y + 5, { align: 'right' });
            doc.text(user.officeAddress || '', pageWidth - margin, y + 10, { align: 'right' });
            y += 25;
            doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
            doc.text('Relatório de Performance de Cobranças', margin, y);
            y += 7;
            doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            doc.text(`${school.name} - Período: Últimos 30 dias`, margin, y);
            y += 10;
            doc.setDrawColor(220); doc.setLineWidth(0.5); doc.line(margin, y, pageWidth - margin, y); y += 10;
        };

        const drawStatCards = () => {
            const stats = [
                { title: 'Recuperado (30d)', value: formatCurrency(reportData.recoveredLast30Days), color: '#16a34a' },
                { title: 'Total Vencido', value: formatCurrency(reportData.totalOverdue), color: '#dc2626' },
                { title: 'Negociações Ativas', value: String(reportData.activeNegotiations), color: '#2563eb' }
            ];
            const cardWidth = (pageWidth - margin * 2 - 10) / 3;
            const cardHeight = 25;
            stats.forEach((stat, i) => {
                const x = margin + i * (cardWidth + 5);
                doc.setFillColor(248, 250, 252);
                doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
                doc.setFontSize(9); doc.setTextColor(100); doc.text(stat.title, x + 5, y + 7);
                doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(stat.color); doc.text(stat.value, x + 5, y + 17);
            });
            y += cardHeight + 10;
        };

        const drawSection = (title: string, body: () => void) => {
            if (y > doc.internal.pageSize.height - 40) { doc.addPage(); drawHeader(); }
            doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
            doc.text(title, margin, y); y += 8;
            body();
            y += 10;
        };
        
        const drawChart = () => {
            const chartData = reportData.topDebtors.slice().reverse(); // Reverse for bottom-up drawing
            const chartX = margin + 30, chartY = y, chartWidth = pageWidth - margin * 2 - 35, chartHeight = 50;
            const maxVal = Math.max(...chartData.map(d => d.value), 1);
            
            doc.setDrawColor(200); doc.setLineWidth(0.2);
            doc.line(chartX, chartY, chartX, chartY + chartHeight + 2); // Y-axis
            doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X-axis

            chartData.forEach((item, i) => {
                const barHeight = (item.value / maxVal) * chartHeight;
                const barWidth = 15;
                const barX = chartX + 10 + (i * (chartWidth / chartData.length));
                doc.setFillColor(42, 93, 138);
                doc.rect(barX, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
                doc.setFontSize(7); doc.setTextColor(100);
                const nameParts = item.name.split(' ');
                const label = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` : nameParts[0];
                doc.text(label, barX + barWidth/2, chartY + chartHeight + 5, { align: 'center' });
            });
            y += chartHeight + 15;
        };

        const drawTable = (headers: string[], data: string[][]) => {
            const rowHeight = 7;
            const colWidths = [70, 20, 90]; // Manual widths
            // Draw header
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setFillColor(243, 244, 246);
            let currentX = margin;
            headers.forEach((header, i) => {
                doc.rect(currentX, y, colWidths[i], rowHeight, 'F');
                doc.text(header, currentX + 2, y + 5);
                currentX += colWidths[i];
            });
            y += rowHeight;

            // Draw rows
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            data.forEach((row) => {
                currentX = margin;
                doc.setDrawColor(229, 231, 235);
                row.forEach((cell, i) => {
                    doc.rect(currentX, y, colWidths[i], rowHeight, 'D');
                    const textLines = doc.splitTextToSize(cell, colWidths[i] - 4);
                    doc.text(textLines, currentX + 2, y + 4.5);
                    currentX += colWidths[i];
                });
                y += rowHeight;
            });
        };

        // --- Assemble PDF ---
        drawHeader();
        drawStatCards();
        drawSection('Análise Estratégica (IA)', () => {
            doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
            doc.setFillColor(249, 250, 251);
            const lines = doc.splitTextToSize(analysis || "Análise indisponível.", pageWidth - margin * 2 - 10);
            doc.roundedRect(margin, y, pageWidth - margin * 2, lines.length * 5 + 10, 3, 3, 'F');
            doc.text(lines, margin + 5, y + 8);
            y += lines.length * 5 + 10;
        });
        drawSection('Top 5 Maiores Débitos', drawChart);

        const activityData = reportData.recentActivities.map(act => [
            formatDate(act.date),
            demoInvoices.find(i => i.id === act.invoiceId)?.studentName || 'N/A',
            act.notes
        ]);
        drawSection('Atividades Recentes', () => drawTable(['Data', 'Aluno', 'Anotação'], activityData));

        doc.save(`Relatorio_${school.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Visualização do Relatório</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
                        </header>
                        <div className="overflow-y-auto flex-grow p-6 space-y-4">
                            {isAnalyzing && (
                                <div className="text-center p-8">
                                    <SparklesIcon className="w-12 h-12 text-primary-400 mx-auto animate-pulse" />
                                    <p className="mt-4 text-neutral-600">Nossa IA está analisando os dados para gerar insights estratégicos... Por favor, aguarde.</p>
                                </div>
                            )}
                            {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}
                            {!isAnalyzing && reportData && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-xs text-green-700">Recuperado (30d)</p><p className="text-xl font-bold text-green-800">{formatCurrency(reportData.recoveredLast30Days)}</p></div>
                                        <div className="p-4 bg-red-50 rounded-lg text-center"><p className="text-xs text-red-700">Total Vencido</p><p className="text-xl font-bold text-red-800">{formatCurrency(reportData.totalOverdue)}</p></div>
                                        <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-xs text-blue-700">Negociações Ativas</p><p className="text-xl font-bold text-blue-800">{reportData.activeNegotiations}</p></div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-700 mb-2">Análise Estratégica da IA</h4>
                                        <pre className="text-sm p-3 bg-neutral-100 border rounded-lg whitespace-pre-wrap font-sans">{analysis}</pre>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neutral-700 mb-2">Top 5 Devedores</h4>
                                        <ul className="text-sm space-y-1">
                                            {reportData.topDebtors.map(d => <li key={d.name} className="flex justify-between p-1 bg-neutral-50 rounded"><span>{d.name}</span> <span className="font-semibold">{formatCurrency(d.value)}</span></li>)}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="button" onClick={handleGeneratePdf} isLoading={isAnalyzing} disabled={!analysis} icon={<DocumentReportIcon />}>
                                Gerar e Baixar PDF
                            </Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SchoolReportModal;