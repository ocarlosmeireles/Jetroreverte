

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Invoice, NotificationType, Student, Guardian, School, User } from '../../types';
import { demoInvoices, demoNotifications, demoStudents, demoGuardians, demoSchools } from '../../services/demoData';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import { INSTALLMENT_RATES } from '../../constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, ChatBubbleLeftEllipsisIcon, DocumentReportIcon } from '../../components/common/icons';
import AiChatbot from '../../components/common/AiChatbot';
import { generateAgreementPdf } from '../../utils/agreementPdfGenerator';
import { allDemoUsers } from '../../services/superAdminDemoData';

interface NegotiationPortalProps {
    invoiceId: string;
    onBack: () => void;
}

const BudgetSimulator = ({ installmentValue }: { installmentValue: number }) => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');

    const remaining = useMemo(() => {
        const numericIncome = parseFloat(income) || 0;
        const numericExpenses = parseFloat(expenses) || 0;
        if (numericIncome === 0) return null;
        return numericIncome - numericExpenses - installmentValue;
    }, [income, expenses, installmentValue]);

    return (
        <Card>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Simulador de Orçamento Mensal</h3>
            <p className="text-sm text-neutral-600 mb-4">Veja como a parcela do acordo se encaixa no seu orçamento.</p>
            <div className="space-y-4">
                <div>
                    <label className="form-label">Sua Renda Mensal (R$)</label>
                    <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full form-input" placeholder="Ex: 3500.00" />
                </div>
                <div>
                    <label className="form-label">Outras Despesas Mensais (R$)</label>
                    <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className="w-full form-input" placeholder="Ex: 2000.00" />
                </div>
                <div className="p-4 bg-primary-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Parcela do Acordo:</span>
                        <span className="font-bold text-neutral-800">-{formatCurrency(installmentValue)}</span>
                    </div>
                </div>
                {remaining !== null && (
                    <div className={`text-center p-4 rounded-lg font-bold text-lg ${remaining >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        Saldo Restante Estimado: {formatCurrency(remaining)}
                    </div>
                )}
            </div>
        </Card>
    );
};


const NegotiationPortal = ({ invoiceId, onBack }: NegotiationPortalProps): React.ReactElement => {
    const { user } = useAuth();
    
    const { invoice, student, guardian, school } = useMemo(() => {
        const inv = demoInvoices.find(i => i.id === invoiceId);
        if (!inv) return { invoice: null, student: null, guardian: null, school: null };

        const std = demoStudents.find(s => s.id === inv.studentId);
        const guard = demoGuardians.find(g => g.id === std?.guardianId);
        const sch = demoSchools.find(s => s.id === std?.schoolId);
        return { invoice: inv, student: std, guardian: guard, school: sch };
    }, [invoiceId]);
    
    const [installments, setInstallments] = useState(2);
    const [entryValue, setEntryValue] = useState('');
    const [proposalInstallments, setProposalInstallments] = useState('2');
    const [proposalSent, setProposalSent] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const { updatedValue } = useMemo(() => {
        if (!invoice) return { updatedValue: 0 };
        return calculateUpdatedInvoiceValues(invoice);
    }, [invoice]);

    const { installmentValue, totalWithInterest } = useMemo(() => {
        if (installments === 1) {
            return { installmentValue: updatedValue, totalWithInterest: updatedValue };
        }
        const rate = INSTALLMENT_RATES[installments as keyof typeof INSTALLMENT_RATES] || 0;
        const total = updatedValue * (1 + rate);
        return { installmentValue: total / installments, totalWithInterest: total };
    }, [installments, updatedValue]);
    
    if (!invoice || !student || !guardian || !school) {
        return <Card><p>Cobrança não encontrada.</p><Button onClick={onBack} className="mt-4">Voltar</Button></Card>;
    }

    const handleSendProposal = (e: React.FormEvent) => {
        e.preventDefault();
        demoNotifications.unshift({
            id: `notif-${Date.now()}`,
            userId: 'user-escritorio-01',
            type: NotificationType.NEGOTIATION_REQUESTED,
            title: 'Nova Contraproposta Recebida',
            message: `O resp. ${user?.name} enviou uma proposta de R$ ${entryValue} + ${proposalInstallments}x para a dívida do aluno ${invoice.studentName}.`,
            link: 'negociacoes',
            read: false,
            createdAt: new Date().toISOString(),
        });
        setProposalSent(true);
    };

     const handleDownloadAgreement = () => {
        const lawFirm = allDemoUsers.find(u => u.id === school?.officeId);
        if (invoice && student && guardian && school && lawFirm) {
            generateAgreementPdf(invoice, student, guardian, school, lawFirm);
        } else {
            alert("Não foi possível gerar o PDF. Dados do escritório ou do acordo estão incompletos.");
        }
    };
    
    const chatSystemInstruction = `Você é um assistente financeiro amigável e compreensivo da plataforma Jetro Reverte. Seu objetivo é ajudar o responsável financeiro a entender o débito pendente e a explorar soluções de forma clara e sem julgamentos. Você pode explicar como juros são calculados, detalhar a dívida atual e explicar as opções disponíveis no portal (simulador de parcelas, formulário de proposta). Você não tem autorização para negociar valores diretamente, mas deve ser sempre solidário e guiá-lo para usar as ferramentas da plataforma a fim de encontrar uma resolução. A dívida atual é de ${formatCurrency(updatedValue)}.`;

    const hasPendingAgreement = invoice.agreement && !invoice.agreement.isApproved;
    const hasApprovedAgreement = invoice.agreement && invoice.agreement.isApproved;

    return (
        <div className="space-y-6">
            <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon />}>Voltar para Meus Débitos</Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {hasApprovedAgreement ? (
                        <Card>
                            <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-bold text-green-800 text-xl">Acordo Aprovado!</h4>
                                <p className="text-sm text-green-700 mt-2">
                                    Seu acordo de ${invoice.agreement!.installments}x de ${formatCurrency(invoice.agreement!.installmentValue)} foi confirmado.
                                    A primeira parcela vence em ${formatDate(invoice.agreement!.firstDueDate)}.
                                </p>
                                <Button onClick={handleDownloadAgreement} className="mt-6" icon={<DocumentReportIcon />}>Baixar Termo de Acordo (PDF)</Button>
                            </div>
                        </Card>
                    ) : hasPendingAgreement ? (
                        <Card>
                             <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h4 className="font-bold text-yellow-800 text-xl">Aguardando Aprovação</h4>
                                <p className="text-sm text-yellow-700 mt-2">Sua proposta de acordo foi enviada e está aguardando a análise do escritório. Você será notificado sobre a aprovação.</p>
                            </div>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <h3 className="text-xl font-bold text-neutral-800 mb-2">Simular Parcelamento</h3>
                                <p className="text-sm text-neutral-600 mb-4">Arraste a barra para ver as opções de parcelamento do valor total de <span className="font-bold">{formatCurrency(updatedValue)}</span>.</p>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="2" max="12" value={installments} onChange={e => setInstallments(Number(e.target.value))} className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                                    <span className="font-bold text-lg text-neutral-700 w-12 text-center">{installments}x</span>
                                </div>
                                <div className="text-center mt-4 p-4 bg-primary-50 rounded-lg">
                                    <p className="text-2xl font-semibold text-neutral-800">
                                        {installments} parcelas de <span className="text-primary-600">{formatCurrency(installmentValue)}</span>
                                    </p>
                                    <p className="text-sm text-neutral-500 mt-1">Total com juros: {formatCurrency(totalWithInterest)}</p>
                                </div>
                                <Button className="w-full mt-4">Aceitar e Gerar Acordo</Button>
                            </Card>

                            <Card>
                                <h3 className="text-xl font-bold text-neutral-800 mb-2">Ou faça sua proposta</h3>
                                <p className="text-sm text-neutral-600 mb-4">Se as opções acima não se encaixam, envie uma contraproposta para análise.</p>
                                {proposalSent ? (
                                    <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <h4 className="font-bold text-yellow-800">Proposta Enviada!</h4>
                                        <p className="text-sm text-yellow-700 mt-2">Sua proposta foi enviada para análise e está aguardando aprovação do escritório. Você será notificado em breve.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendProposal} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="form-label">Valor de Entrada (R$)</label>
                                                <input type="number" value={entryValue} onChange={e => setEntryValue(e.target.value)} className="w-full form-input" placeholder="Opcional" />
                                            </div>
                                            <div>
                                                <label className="form-label">Nº de Parcelas *</label>
                                                <input type="number" value={proposalInstallments} onChange={e => setProposalInstallments(e.target.value)} className="w-full form-input" min="2" max="24" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full">Enviar Proposta para Análise</Button>
                                    </form>
                                )}
                            </Card>
                        </>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-neutral-800 mb-3">Resumo do Débito</h3>
                         <div className="space-y-2 text-sm p-4 bg-neutral-50 rounded-lg border">
                            <div className="flex justify-between"><span className="text-neutral-500">Aluno:</span> <span className="font-medium text-neutral-800">{invoice.studentName}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500">Descrição:</span> <span className="font-medium text-neutral-800">{invoice.notes}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500">Vencimento:</span> <span className="font-medium text-neutral-800">{formatDate(invoice.dueDate)}</span></div>
                            <div className="flex justify-between pt-2 border-t mt-2"><span className="text-neutral-500">Valor Atualizado:</span> <span className="font-bold text-red-600">{formatCurrency(updatedValue)}</span></div>
                        </div>
                    </Card>
                    <BudgetSimulator installmentValue={installmentValue} />
                </div>
            </div>

            <div className="fixed bottom-6 right-6">
                <Button onClick={() => setIsChatOpen(true)} className="rounded-full !p-4 shadow-lg" aria-label="Abrir chat de ajuda">
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8"/>
                </Button>
            </div>

            <AiChatbot 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                systemInstruction={chatSystemInstruction}
            />
             <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
        </div>
    );
};

export default NegotiationPortal;