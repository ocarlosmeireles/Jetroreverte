import React, { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { NegotiationCase, NegotiationChannel, NegotiationAttempt, NegotiationAttemptType, AgreementDetails, CollectionStage, User, Student, Guardian, School } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Button from '../common/Button';
import { XIcon, PhoneIcon, DocumentReportIcon, DocumentPlusIcon, WhatsAppIcon, EnvelopeIcon, SparklesIcon, MicrophoneIcon, CheckCircleIcon, ChatBubbleLeftEllipsisIcon } from '../common/icons';
import Card from '../common/Card';
import AddNegotiationAttemptModal from './AddNegotiationAttemptModal';
import AgreementModal from '../common/AgreementModal';
import PetitionGeneratorModal from '../admin/PetitionGeneratorModal';
import { demoLiveNegotiationHistories } from '../../services/demoData';
import { allDemoUsers } from '../../services/superAdminDemoData';
import { generateAgreementPdf } from '../../utils/agreementPdfGenerator';


const channelInfo: Record<NegotiationChannel, { icon: ReactNode; label: string }> = {
    [NegotiationChannel.PHONE_CALL]: { icon: <PhoneIcon className="w-4 h-4 text-neutral-500" />, label: 'Ligação' },
    [NegotiationChannel.EMAIL]: { icon: <EnvelopeIcon className="w-4 h-4 text-neutral-500" />, label: 'E-mail' },
    [NegotiationChannel.WHATSAPP]: { icon: <WhatsAppIcon className="w-4 h-4 text-neutral-500" />, label: 'WhatsApp' },
    [NegotiationChannel.PETITION_GENERATED]: { icon: <DocumentPlusIcon className="w-4 h-4 text-neutral-500" />, label: 'Petição Gerada' },
    [NegotiationChannel.SMS]: { icon: <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-neutral-500" />, label: 'SMS' }
};

interface AiAnalysis {
    riskProfile: string;
    nextAction: string;
    talkingPoints: string[];
}

interface AgreementOption {
    installments: number;
    totalValue: number;
    description: string;
    recommended: boolean;
}

const DossierModal = ({ caseData, onClose, onUpdateCase }: { caseData: NegotiationCase; onClose: () => void; onUpdateCase: (updatedCase: NegotiationCase) => void; }) => {
    const { user } = useAuth();
    const { invoice, student, guardian, school, attempts } = caseData;
    
    if (!student || !guardian || !school) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                 <div className="bg-white p-6 rounded-lg shadow-xl">
                    <p>Dados do caso incompletos. Não é possível abrir o dossiê.</p>
                    <Button onClick={onClose} className="mt-4">Fechar</Button>
                </div>
            </div>
        )
    }
    
    const { updatedValue, monthsOverdue } = calculateUpdatedInvoiceValues(invoice);
    
    const [modalState, setModalState] = useState<{ type: 'addAttempt' | 'createAgreement' | 'generatePetition' | null }>({ type: null });

    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);

    const [agreementOptions, setAgreementOptions] = useState<AgreementOption[]>([]);
    const [isAgreementLoading, setIsAgreementLoading] = useState(true);
    const [selectedAgreementOption, setSelectedAgreementOption] = useState<{ installments: number; totalValue: number; } | null>(null);
    
    useEffect(() => {
        const generateAiData = async () => {
            setIsAnalysisLoading(true);
            setIsAgreementLoading(true);

            const prompt = `Aja como um analista e negociador de cobrança sênior. Analise os dados deste caso de inadimplência e forneça uma análise e 3 opções de acordo.

Dados do caso:
- Valor da Dívida Atualizado: ${formatCurrency(updatedValue)}
- Meses em atraso: ${monthsOverdue}
- Histórico de contatos: ${attempts.length} contatos realizados.

Responda com um único objeto JSON com duas chaves principais: "analysis" e "agreementOptions".

1.  A chave "analysis" deve conter um objeto com:
    - "riskProfile": string (ex: "Cooperativo com dificuldade", "Resistente ao contato")
    - "nextAction": string (sugestão de próxima ação)
    - "talkingPoints": array de 3 strings com pontos-chave para a conversa.

2.  A chave "agreementOptions" deve conter um array de 3 objetos, onde cada objeto tem:
    - "installments": number (entre 1 e 12)
    - "totalValue": number
    - "description": string (ex: "À vista com desconto")
    - "recommended": boolean (apenas um deve ser true).
`;
            
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                analysis: {
                                    type: Type.OBJECT,
                                    properties: {
                                        riskProfile: { type: Type.STRING },
                                        nextAction: { type: Type.STRING },
                                        talkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["riskProfile", "nextAction", "talkingPoints"]
                                },
                                agreementOptions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            installments: { type: Type.NUMBER },
                                            totalValue: { type: Type.NUMBER },
                                            description: { type: Type.STRING },
                                            recommended: { type: Type.BOOLEAN },
                                        },
                                        required: ["installments", "totalValue", "description", "recommended"]
                                    }
                                }
                            },
                            required: ["analysis", "agreementOptions"]
                        }
                    }
                });
                const result = JSON.parse(response.text);
                setAiAnalysis(result.analysis);
                setAgreementOptions(result.agreementOptions);
            } catch (err) {
                console.error("AI Combined Data Error:", err);
            } finally {
                setIsAnalysisLoading(false);
                setIsAgreementLoading(false);
            }
        };

        generateAiData();
    }, [caseData.invoice.id, updatedValue, monthsOverdue, attempts.length]);

    const handleStartLiveSessionClick = () => {
        const url = `/?liveSession=true&caseId=${caseData.invoice.id}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=1024,height=768');
    };
    
    const handleLogContact = (channel: NegotiationChannel, notes: string) => {
        const newAttempt: NegotiationAttempt = {
            id: `neg-${Date.now()}`, invoiceId: caseData.invoice.id, date: new Date().toISOString(), type: NegotiationAttemptType.ADMINISTRATIVE,
            channel, notes, author: user?.name || 'Advocacia Foco',
        };
        const updatedCase = { ...caseData, attempts: [newAttempt, ...caseData.attempts] };
        onUpdateCase(updatedCase);
        setModalState({ type: null });
    };

    const handleSaveAgreement = (agreementData: Omit<AgreementDetails, 'createdAt' | 'protocolNumber'>) => {
        const newAgreement: AgreementDetails = { 
            ...agreementData, 
            createdAt: new Date().toISOString(),
            protocolNumber: `ACORDO-${invoice.id}-${Date.now()}`,
        };
        const updatedCase = { ...caseData, invoice: { ...caseData.invoice, agreement: newAgreement, collectionStage: CollectionStage.ACORDO_FEITO } };
        onUpdateCase(updatedCase);
        setModalState({ type: null });
    };

    const handleAgreementOptionClick = (option: AgreementOption) => {
        setSelectedAgreementOption({
            installments: option.installments,
            totalValue: option.totalValue,
        });
        setModalState({ type: 'createAgreement' });
    };

    const lawFirm = allDemoUsers.find(u => u.id === school.officeId);

    const handleGeneratePdf = () => {
        if (!invoice.agreement || !student || !guardian || !school || !lawFirm) return;
        generateAgreementPdf(invoice, student, guardian, school, lawFirm);
    };

     const handleOpenWhatsApp = () => {
        if (!guardian?.phone) {
            alert('Número de telefone do responsável não encontrado.');
            return;
        }
        const phoneNumber = `55${guardian.phone.replace(/\D/g, '')}`;
        const url = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        handleLogContact(NegotiationChannel.WHATSAPP, 'Iniciado contato via WhatsApp Web.');
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    className="bg-neutral-50 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col h-full">
                        <header className="p-4 border-b border-neutral-200/80 flex justify-between items-center flex-shrink-0 bg-white/50 backdrop-blur-xl rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h2 className="text-lg font-bold text-neutral-800">Dossiê do Caso</h2>
                                <p className="text-sm text-neutral-500">Aluno: {student?.name}</p>
                            </div>
                            <button onClick={onClose} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-200/60"><XIcon /></button>
                        </header>

                        <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                 {invoice.agreement ? (
                                     <Card>
                                        <h3 className="font-semibold mb-2 text-neutral-700">Acordo Registrado</h3>
                                         <div className={`p-4 rounded-lg border text-sm space-y-2 ${invoice.agreement.isApproved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                             <div className="flex justify-between items-center"><span className="text-neutral-600">Status:</span> <span className={`font-bold ${invoice.agreement.isApproved ? 'text-green-700' : 'text-yellow-700'}`}>{invoice.agreement.isApproved ? 'Aprovado' : 'Aguardando Aprovação do Responsável'}</span></div>
                                             <div className="flex justify-between"><span className="text-neutral-600">Protocolo:</span> <span className="font-bold text-neutral-800 font-mono text-xs">{invoice.agreement.protocolNumber}</span></div>
                                             <div className="flex justify-between"><span className="text-neutral-600">Parcelas:</span> <span className="font-bold text-neutral-800">{invoice.agreement.installments}x de {formatCurrency(invoice.agreement.installmentValue)}</span></div>
                                             {invoice.agreement.isApproved && (
                                                <div className="pt-3 mt-3 border-t">
                                                    <Button onClick={handleGeneratePdf} size="sm" variant="secondary" icon={<DocumentReportIcon />} className="w-full">
                                                        Baixar Termo de Acordo (PDF)
                                                    </Button>
                                                </div>
                                             )}
                                        </div>
                                     </Card>
                                 ) : (
                                    <Card>
                                        <h3 className="font-semibold mb-2 text-neutral-700">Resumo Financeiro</h3>
                                        <div className="space-y-3 text-sm p-4 bg-neutral-100/70 rounded-lg border border-neutral-200/60">
                                            <div className="flex justify-between items-center">
                                                <span className="text-neutral-500">Valor Atualizado da Dívida</span>
                                                <span className="text-2xl font-bold text-red-600">{formatCurrency(updatedValue)}</span>
                                            </div>
                                            <div className="pt-3 border-t border-neutral-200/80 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-500">Valor Original</span>
                                                    <span className="font-medium text-neutral-800">{formatCurrency(invoice.value)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-500">Vencimento Original</span>
                                                    <span className="font-medium text-neutral-800">{formatDate(invoice.dueDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-500">Meses em Atraso</span>
                                                    <span className="font-medium text-neutral-800">{monthsOverdue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                 )}
                                <Card>
                                    <h3 className="font-semibold mb-3 text-neutral-700">Histórico de Contato</h3>
                                     <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                        {attempts.length > 0 ? attempts.map(attempt => (
                                            <div key={attempt.id} className="flex gap-3 text-sm">
                                                <div className="flex-shrink-0 pt-1">{channelInfo[attempt.channel].icon}</div>
                                                <div>
                                                    <p><span className="font-semibold">{channelInfo[attempt.channel].label}</span> <span className="text-neutral-400">em {formatDate(attempt.date)} por {attempt.author}</span></p>
                                                    <p className="text-neutral-600">{attempt.notes}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-sm text-neutral-500">Nenhum contato registrado.</p>}
                                    </div>
                                </Card>
                            </div>
                            {/* Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card>
                                    <div className="flex items-center gap-2 mb-2"><SparklesIcon className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-neutral-700">Análise da IA</h3></div>
                                    {isAnalysisLoading ? <p className="text-sm text-neutral-500">Analisando...</p> : aiAnalysis ? (
                                        <div className="space-y-3 text-sm">
                                            <p><strong>Perfil:</strong> <span className="text-primary-700 font-medium">{aiAnalysis.riskProfile}</span></p>
                                            <p><strong>Ação Sugerida:</strong> {aiAnalysis.nextAction}</p>
                                            <div>
                                                <p><strong>Pontos de Abordagem:</strong></p>
                                                <ul className="list-disc list-inside text-neutral-600 pl-1">
                                                    {aiAnalysis.talkingPoints.map((point, i) => <li key={i}>{point}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : <p className="text-sm text-red-500">Falha na análise.</p>}
                                </Card>
                                 {!invoice.agreement && (
                                <Card>
                                    <div className="flex items-center gap-2 mb-2"><SparklesIcon className="w-5 h-5 text-primary-500" /><h3 className="font-semibold text-neutral-700">Opções de Acordo (IA)</h3></div>
                                    {isAgreementLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-12 bg-neutral-200 rounded-lg animate-pulse"></div>
                                            <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {agreementOptions.map((opt, i) => (
                                                <button key={i} onClick={() => handleAgreementOptionClick(opt)} className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-300 ${opt.recommended ? 'bg-primary-50 border-primary-400 shadow-sm' : 'bg-white border-neutral-200 hover:border-primary-300'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-base text-primary-800">{opt.installments}x de {formatCurrency(opt.totalValue / opt.installments)}</p>
                                                        {opt.recommended && <span className="text-xs font-bold text-primary-700 bg-primary-200 px-2 py-0.5 rounded-full">Recomendado</span>}
                                                    </div>
                                                    <p className="text-xs text-neutral-600">Total: {formatCurrency(opt.totalValue)}</p>
                                                    <p className="text-xs text-neutral-500 italic">{opt.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                                )}
                                <Card>
                                    <h3 className="font-semibold mb-2 text-neutral-700">Contatos do Responsável</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong className="text-neutral-500 w-16 inline-block">Nome:</strong> {guardian?.name}</p>
                                        <p><strong className="text-neutral-500 w-16 inline-block">Telefone:</strong> {guardian?.phone}</p>
                                        <p><strong className="text-neutral-500 w-16 inline-block">Email:</strong> {guardian?.email}</p>
                                    </div>
                                </Card>
                            </div>
                        </main>
                        
                        <footer className="p-3 border-t border-neutral-200/80 bg-white/50 backdrop-blur-xl flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 flex-wrap rounded-b-2xl">
                            <Button size="sm" onClick={handleOpenWhatsApp} icon={<WhatsAppIcon />}>WhatsApp</Button>
                            <Button size="sm" variant="secondary" onClick={() => setModalState({ type: 'addAttempt' })}>Registrar Contato</Button>
                            <Button size="sm" variant="secondary" onClick={() => setModalState({ type: 'createAgreement' })} disabled={!!invoice.agreement}>Criar Acordo</Button>
                            <Button size="sm" variant="secondary" onClick={() => setModalState({ type: 'generatePetition' })}>Gerar Petição</Button>
                            <Button size="sm" variant="primary" onClick={handleStartLiveSessionClick} icon={<MicrophoneIcon />}>Sessão Live (IA)</Button>
                        </footer>
                    </div>
                </motion.div>
            </motion.div>

            {caseData && (
                <>
                    <AddNegotiationAttemptModal isOpen={modalState.type === 'addAttempt'} onClose={() => setModalState({ type: null })} onSave={(data) => handleLogContact(data.channel, data.notes)} />
                    <AgreementModal 
                        isOpen={modalState.type === 'createAgreement'} 
                        onClose={() => { setModalState({ type: null }); setSelectedAgreementOption(null); }} 
                        onSave={handleSaveAgreement} 
                        invoice={{ ...invoice, updatedValue }}
                        initialValues={selectedAgreementOption}
                    />
                    <PetitionGeneratorModal isOpen={modalState.type === 'generatePetition'} onClose={() => setModalState({ type: null })} negotiationCase={{ invoice, student, guardian, school, attempts }} />
                </>
            )}
        </>
    );
};

export default DossierModal;