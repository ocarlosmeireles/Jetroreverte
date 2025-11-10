import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNotifications } from '../../services/demoData';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Invoice, InvoiceStatus, CollectionStage, NotificationType } from '../../types';
import PaymentModal from '../../components/guardian/PaymentModal';
import NegotiationIntentModal from '../../components/guardian/NegotiationIntentModal';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import { ChatBubbleLeftEllipsisIcon } from '../../components/common/icons';
import AiChatbot from '../../components/common/AiChatbot';


const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  hidden: {
    opacity: 0,
  },
};

type InvoiceWithCalculations = Invoice & ReturnType<typeof calculateUpdatedInvoiceValues>;

interface GuardianFinancialsProps {
    onStartNegotiation: (invoiceId: string) => void;
}

const FinancialHealthScore = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 55; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle className="text-neutral-200/70" strokeWidth="10" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60" />
          <motion.circle
            className={color}
            strokeWidth="10" strokeLinecap="round" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-neutral-800">{score}</span>
          <span className="text-xs text-neutral-500 -mt-1">/ 100</span>
        </div>
      </div>
    );
};

const Achievements = ({ score }: { score: number }) => {
    const achievements = [
        { name: "Parceiro da Educação", description: "Manteve todos os pagamentos em dia no último semestre.", earned: score > 90 },
        { name: "Bom Planejador", description: "Realizou pagamentos antes do vencimento.", earned: score > 70 },
        { name: "Compromisso em Dia", description: "Quitou um débito que estava vencido.", earned: true }, // Assuming they had a debt before
    ];
    return (
        <div>
            <h3 className="font-bold text-neutral-700 mb-2">Suas Conquistas</h3>
            <div className="flex gap-4">
                {achievements.filter(a => a.earned).map(ach => (
                     <div key={ach.name} className={`p-3 text-center rounded-lg border-2 ${ach.earned ? 'border-secondary-400 bg-secondary-50' : 'border-neutral-200 bg-neutral-100 opacity-60'}`} title={ach.description}>
                        <span className="text-2xl">{ach.earned ? '🏆' : '🔒'}</span>
                        <p className={`text-xs font-semibold ${ach.earned ? 'text-secondary-800' : 'text-neutral-500'}`}>{ach.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GuardianFinancials = ({ onStartNegotiation }: GuardianFinancialsProps): React.ReactElement => {
    const { user } = useAuth();
    // In a real app, you would fetch students associated with the guardian's email/ID
    const myStudents = demoStudents.filter(s => s.guardianId === user?.id);
    const myStudentIds = myStudents.map(s => s.id);
    const [invoices, setInvoices] = useState(() => demoInvoices.filter(inv => myStudentIds.includes(inv.studentId)));
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceWithCalculations | null>(null);
    const [intentModalInvoice, setIntentModalInvoice] = useState<InvoiceWithCalculations | null>(null);
    const [negotiationRequestedId, setNegotiationRequestedId] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const invoicesWithCalculations = useMemo((): InvoiceWithCalculations[] => {
        return invoices.map(inv => ({
            ...inv,
            ...calculateUpdatedInvoiceValues(inv)
        }));
    }, [invoices]);
    
    const financialHealthScore = useMemo(() => {
        const totalInvoices = invoices.length;
        if (totalInvoices === 0) return 100;
        const paidCount = invoices.filter(i => i.status === InvoiceStatus.PAGO).length;
        return Math.round((paidCount / totalInvoices) * 100);
    }, [invoices]);

    const handleRequestNegotiation = (invoiceId: string) => {
        const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
        if (!invoiceToUpdate) return;
        
        // Update invoice state to reflect negotiation status
        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId 
            ? { ...inv, collectionStage: CollectionStage.EM_NEGOCIACAO } 
            : inv
        ));

        // Create notification for law firm
        const student = demoStudents.find(s => s.id === invoiceToUpdate.studentId);
        const guardian = demoGuardians.find(g => g.id === student?.guardianId);
        
        const newNotification = {
            id: `notif-${Date.now()}`,
            userId: 'user-escritorio-01', // Target law firm
            type: NotificationType.NEGOTIATION_REQUESTED,
            title: 'Solicitação de Negociação',
            message: `O resp. ${guardian?.name} (aluno ${student?.name}) solicitou uma negociação.`,
            link: 'negociacoes',
            read: false,
            createdAt: new Date().toISOString(),
        };
        demoNotifications.unshift(newNotification); // Add to the beginning for visibility in demo

        // UI feedback
        setIntentModalInvoice(null);
        setNegotiationRequestedId(invoiceId);
        onStartNegotiation(invoiceId); // Open the new negotiation portal
    };

    const handleConfirmPayment = (invoice: InvoiceWithCalculations) => {
        setIntentModalInvoice(null);
        setSelectedInvoiceForPayment(invoice);
    };

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

    const getStatusInfo = (invoice: InvoiceWithCalculations): { chip: React.ReactElement, action: React.ReactElement } => {
        if (negotiationRequestedId === invoice.id || invoice.collectionStage === CollectionStage.EM_NEGOCIACAO || invoice.agreement) {
            return {
                chip: <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Negociação em Andamento</span>,
                action: <Button size="sm" onClick={() => onStartNegotiation(invoice.id)}>Ver Portal</Button>
            };
        }

        switch (invoice.status) {
            case InvoiceStatus.PAGO:
                return {
                    chip: <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pago</span>,
                    action: <button onClick={() => handleViewReceipt(invoice)} className="text-sm text-primary-600 hover:underline">Ver Recibo</button>
                };
            case InvoiceStatus.PENDENTE:
                return {
                    chip: <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendente</span>,
                    action: <Button size="sm" onClick={() => handleConfirmPayment(invoice)}>Pagar Agora</Button>
                };
            case InvoiceStatus.VENCIDO:
                return {
                    chip: <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Vencido</span>,
                    action: <Button size="sm" variant="danger" onClick={() => setIntentModalInvoice(invoice)}>Pagar ou Negociar</Button>
                };
        }
    };
    
     const chatSystemInstruction = `Você é um assistente financeiro amigável e compreensivo da plataforma Jetro Reverte, chamado 'Fin'. Seu objetivo é ajudar o responsável financeiro a se planejar para as despesas escolares e entender sua "Saúde Financeira". Você NÃO pode negociar ou alterar valores de dívidas. Você DEVE explicar como o score é calculado (proporção de pagamentos em dia), dar dicas de planejamento financeiro, e guiar o usuário a usar as ferramentas da plataforma (como o portal de negociação) caso ele queira discutir valores. Seja sempre solidário e educacional. A dívida atual em aberto é de ${formatCurrency(invoices.filter(i => i.status !== InvoiceStatus.PAGO).reduce((acc, i) => acc + (i.updatedValue || i.value), 0))}.`;

    return (
        <>
            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <FinancialHealthScore score={financialHealthScore} />
                    <div className="flex-1 text-center sm:text-left">
                         <h3 className="text-2xl font-bold text-neutral-800">Olá, {user?.name}!</h3>
                         <p className="text-neutral-600 mt-1">Este é o seu portal de saúde financeira. Manter os pagamentos em dia fortalece a parceria com a escola.</p>
                    </div>
                    <Achievements score={financialHealthScore} />
                </div>
            </Card>

            <h3 className="text-xl font-bold text-neutral-800 mb-4">Situação Atual</h3>
            <motion.div 
                className="space-y-6"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {invoicesWithCalculations.length > 0 ? invoicesWithCalculations.map((invoice, index) => {
                    const { chip, action } = getStatusInfo(invoice);
                    const displayValue = invoice.updatedValue;
                    return (
                        <Card key={invoice.id} delay={index * 0.05}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-800">Débito Escolar - {invoice.studentName}</h3>
                                    <p className="text-sm text-neutral-500 mt-1">Vencimento em: {formatDate(invoice.dueDate)}</p>
                                    <div className="mt-2">{chip}</div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                    <p className="text-2xl font-bold text-neutral-800">{formatCurrency(displayValue)}</p>
                                    {action}
                                </div>
                            </div>
                        </Card>
                    );
                }) : (
                    <Card>
                        <p className="text-center text-neutral-600">Nenhum débito encontrado. Parabéns por manter tudo em dia!</p>
                    </Card>
                )}
            </motion.div>

            {intentModalInvoice && (
                <NegotiationIntentModal
                    isOpen={!!intentModalInvoice}
                    onClose={() => setIntentModalInvoice(null)}
                    invoice={intentModalInvoice}
                    onConfirmPayment={() => handleConfirmPayment(intentModalInvoice)}
                    onRequestNegotiation={() => handleRequestNegotiation(intentModalInvoice.id)}
                />
            )}

            {selectedInvoiceForPayment && (
                <PaymentModal
                    isOpen={!!selectedInvoiceForPayment}
                    onClose={() => setSelectedInvoiceForPayment(null)}
                    invoice={{...selectedInvoiceForPayment, value: selectedInvoiceForPayment.updatedValue}}
                />
            )}

             <div className="fixed bottom-6 right-6">
                <Button onClick={() => setIsChatOpen(true)} className="rounded-full !p-4 shadow-lg" aria-label="Abrir chat de ajuda">
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6"/>
                </Button>
            </div>
            
            <AiChatbot
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                systemInstruction={chatSystemInstruction}
            />
        </>
    );
};

export default GuardianFinancials;
