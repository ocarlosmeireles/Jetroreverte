
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob, Type } from '@google/genai';
import { encode } from 'js-base64';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, MicrophoneIcon, XIcon, DocumentReportIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { NegotiationCase, LiveNegotiationHistory, CollectionStage, NegotiationChannel } from '../../types';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoNegotiationAttempts, demoLiveNegotiationHistories } from '../../services/demoData';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Modal from '../../components/common/Modal';
import AgreementModal from '../../components/common/AgreementModal';

// ----- Interfaces & Types -----
interface ConversationItem {
    id: string;
    type: 'user' | 'ai_suggestion';
    text: string;
}

interface NegotiationOption {
    title: string;
    description: string;
    installments: number;
    totalValue: number;
}

const channelInfo: Record<NegotiationChannel, { icon: React.ReactNode; label: string }> = {
    [NegotiationChannel.PHONE_CALL]: { icon: <PhoneIcon className="w-4 h-4 text-neutral-500" />, label: 'Ligação' },
    [NegotiationChannel.EMAIL]: { icon: <EnvelopeIcon className="w-4 h-4 text-neutral-500" />, label: 'E-mail' },
    [NegotiationChannel.WHATSAPP]: { icon: <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-neutral-500" />, label: 'WhatsApp' },
    [NegotiationChannel.PETITION_GENERATED]: { icon: <DocumentReportIcon className="w-4 h-4 text-neutral-500" />, label: 'Petição Gerada' }
};


// ----- UI Components -----

const NegotiationControlPanel = ({
    caseData,
    negotiationOptions,
    isLoadingOptions,
    onOpenAgreement,
    selectedOption,
    onSelectOption,
}: {
    caseData: NegotiationCase,
    negotiationOptions: NegotiationOption[],
    isLoadingOptions: boolean,
    onOpenAgreement: () => void,
    selectedOption: NegotiationOption | null,
    onSelectOption: (option: NegotiationOption) => void,
}) => {
    const { invoice, student, guardian, attempts } = caseData;
    // FIX: Destructure only the properties returned by `calculateUpdatedInvoiceValues` and get `originalValue` directly from the `invoice` object to resolve a TypeScript error.
    const { updatedValue, fine, interest } = calculateUpdatedInvoiceValues(invoice);
    const originalValue = invoice.value;

    return (
        <aside className="w-full lg:w-96 flex-shrink-0">
            <div className="h-full flex flex-col gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Contexto do Caso</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-500">Aluno e Responsável</h4>
                            <p className="font-medium text-neutral-800">{student?.name}</p>
                            <p className="text-sm text-neutral-600">{guardian?.name}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-500">Composição da Dívida</h4>
                            <div className="text-sm mt-1 space-y-1 p-3 bg-neutral-50 rounded-lg border">
                                <div className="flex justify-between"><span>Valor Original:</span> <span>{formatCurrency(originalValue)}</span></div>
                                <div className="flex justify-between"><span>Multa:</span> <span>{formatCurrency(fine)}</span></div>
                                <div className="flex justify-between"><span>Juros:</span> <span>{formatCurrency(interest)}</span></div>
                                <div className="flex justify-between font-bold pt-1 border-t mt-1"><span>Total Atualizado:</span> <span className="text-red-600">{formatCurrency(updatedValue)}</span></div>
                            </div>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold text-neutral-500">Histórico de Contato</h4>
                            <div className="space-y-2 mt-2 max-h-24 overflow-y-auto text-xs">
                                {attempts.length > 0 ? attempts.map(attempt => (
                                    <div key={attempt.id} className="flex items-start gap-2">
                                        {channelInfo[attempt.channel]?.icon}
                                        <p className="text-neutral-600">
                                            <span className="font-semibold">{formatDate(attempt.date)}:</span> {attempt.notes}
                                        </p>
                                    </div>
                                )) : <p className="text-neutral-500">Nenhum contato anterior.</p>}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="w-5 h-5 text-primary-500" />
                        <h3 className="text-lg font-bold text-neutral-800">Sugestões da IA (em tempo real)</h3>
                    </div>
                     <div className="space-y-2">
                        {isLoadingOptions && <p className="text-sm text-center text-neutral-500">Analisando conversa...</p>}
                        {negotiationOptions.map((opt, index) => {
                            const isSelected = selectedOption?.title === opt.title;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => onSelectOption(opt)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${isSelected ? 'bg-primary-500 text-white shadow-lg' : 'bg-primary-50/70 border border-primary-100 hover:bg-primary-100'}`}
                                >
                                    <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-primary-800'}`}>{opt.title}</p>
                                    <p className={`text-xs ${isSelected ? 'text-primary-100' : 'text-primary-700'}`}>{opt.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </Card>
                
                 <Card>
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Ações da Negociação</h3>
                    <Button className="w-full" onClick={onOpenAgreement} icon={<DocumentReportIcon />}>
                        {selectedOption ? 'Gerar Acordo (Opção Selecionada)' : 'Gerar Acordo Manual'}
                    </Button>
                </Card>
            </div>
        </aside>
    );
};

const HistoryDetailModal = ({ item, onClose }: { item: LiveNegotiationHistory | null, onClose: () => void }) => {
    if (!item) return null;
    return (
        <Modal isOpen={!!item} onClose={onClose} title="Detalhes da Negociação" size="2xl">
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold">Aluno:</span> {item.studentName}</div>
                    <div><span className="font-semibold">Responsável:</span> {item.guardianName}</div>
                    <div><span className="font-semibold">Escola:</span> {item.schoolName}</div>
                    <div><span className="font-semibold">Data:</span> {formatDate(item.date)}</div>
                </div>
                <div>
                    <h4 className="font-semibold text-neutral-700 mb-2">Resumo da IA</h4>
                    <p className="text-sm p-3 bg-primary-50 border border-primary-100 rounded-lg italic text-primary-800">"{item.finalSuggestion}"</p>
                </div>
                <div>
                    <h4 className="font-semibold text-neutral-700 mb-2">Transcrição Completa</h4>
                    <pre className="text-sm p-3 bg-neutral-100 border rounded-lg whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{item.transcript}</pre>
                </div>
            </div>
            <footer className="p-4 bg-neutral-50 flex justify-end">
                <Button onClick={onClose} variant="secondary">Fechar</Button>
            </footer>
        </Modal>
    );
};

// ----- Main Component -----

const LiveNegotiation = (): React.ReactElement => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'session' | 'history'>('list');
    const [negotiableCases, setNegotiableCases] = useState<NegotiationCase[]>([]);
    const [liveHistories, setLiveHistories] = useState<LiveNegotiationHistory[]>(demoLiveNegotiationHistories);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedCase, setSelectedCase] = useState<NegotiationCase | null>(null);
    const [isSessionStarting, setIsSessionStarting] = useState(false);
    const [permissionError, setPermissionError] = useState('');
    const [conversation, setConversation] = useState<ConversationItem[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<LiveNegotiationHistory | null>(null);
    
    // States for new features
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [negotiationOptions, setNegotiationOptions] = useState<NegotiationOption[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<NegotiationOption | null>(null);

    const sessionRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const fullTranscriptRef = useRef<string>('');
    const conversationEndRef = useRef<HTMLDivElement>(null);

    // --- Data Loading ---
    useEffect(() => {
        if (user?.email === DEMO_USERS.ESCRITORIO.email) {
            const officeSchools = demoSchools.filter(s => s.officeId === user.id);
            const officeSchoolIds = new Set(officeSchools.map(s => s.id));
            const activeInvoices = demoInvoices.filter(i => officeSchoolIds.has(i.schoolId) && i.status === 'VENCIDO');
            
            const cases = activeInvoices.map(invoice => ({
                invoice,
                student: demoStudents.find(s => s.id === invoice.studentId),
                guardian: demoGuardians.find(g => g.id === demoStudents.find(s => s.id === invoice.studentId)?.guardianId),
                school: officeSchools.find(s => s.id === invoice.schoolId),
                attempts: demoNegotiationAttempts.filter(a => a.invoiceId === invoice.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            })).sort((a,b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime());
            
            setNegotiableCases(cases);
        }
    }, [user]);

    const filteredCases = useMemo(() => {
        return negotiableCases.filter(c => 
            c.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.guardian?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [negotiableCases, searchTerm]);

    // --- Session Management ---
    useEffect(() => { conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, isThinking]);
    useEffect(() => { return () => { stopSession(false); }; }, []);

    const stopSession = async (saveHistory = true) => {
        if (saveHistory && selectedCase) {
            const fullTranscript = conversation.filter(c => c.type === 'user').map(c => `Responsável: ${c.text}`).join('\n\n');
            const finalSuggestion = await getFinalSuggestion(fullTranscript);
            const newHistory: LiveNegotiationHistory = {
                id: `live-hist-${Date.now()}`,
                studentId: selectedCase.student!.id,
                studentName: selectedCase.student!.name,
                guardianName: selectedCase.guardian!.name,
                schoolName: selectedCase.school!.name,
                date: new Date().toISOString(),
                transcript: fullTranscript,
                finalSuggestion,
            };
            setLiveHistories(prev => [newHistory, ...prev]);
        }
        if (sessionRef.current) {
            try {
                const session = await sessionRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
            sessionRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
        setView('list');
        setSelectedCase(null);
        setConversation([]);
        setNegotiationOptions([]);
        setSelectedOption(null);
        fullTranscriptRef.current = '';
    };

    const handleStartSession = async (caseData: NegotiationCase) => {
        setSelectedCase(caseData);
        setConversation([]);
        setIsSessionStarting(true);
        fullTranscriptRef.current = '';
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setPermissionError('');

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setView('session');
                        setIsSessionStarting(false);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription?.text) {
                            const text = message.serverContent.inputTranscription.text;
                            setConversation(prev => {
                                const lastItem = prev[prev.length - 1];
                                if (lastItem?.type === 'user' && !message.serverContent?.turnComplete) {
                                    lastItem.text += text;
                                    return [...prev];
                                }
                                return [...prev, { id: `user-${Date.now()}`, type: 'user', text }];
                            });
                        }
                        if (message.serverContent?.turnComplete && message.serverContent?.inputTranscription?.text) {
                            fullTranscriptRef.current += `Responsável: ${message.serverContent.inputTranscription.text}\n`;
                            updateDynamicSuggestions(fullTranscriptRef.current, caseData);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setPermissionError('Erro na sessão. Tente reiniciar.');
                        stopSession(false);
                    },
                    onclose: () => {
                        setView('list');
                        setSelectedCase(null);
                        setIsSessionStarting(false);
                    },
                },
                config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {} },
            });
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                sessionRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: createBlob(inputData) });
                });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);

        } catch (error) {
            console.error('Failed to get user media:', error);
            setPermissionError('É necessário permitir o acesso ao microfone para usar esta funcionalidade.');
            setIsSessionStarting(false);
        }
    };
    
    // --- AI Logic ---
    const createBlob = (data: Float32Array): Blob => {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
        return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    };
    
    const updateDynamicSuggestions = async (transcript: string, caseData: NegotiationCase) => {
        setIsLoadingOptions(true);
        const { updatedValue } = calculateUpdatedInvoiceValues(caseData.invoice);

        const prompt = `Aja como um assistente de negociação. Para uma dívida de ${formatCurrency(updatedValue)}, e com base na transcrição da conversa até agora, crie 3 opções de acordo realistas. Se a conversa indicar dificuldade, foque em parcelamentos. Se indicar cooperação, pode incluir descontos. A transcrição é:\n"${transcript}". Formate a saída como um JSON contendo um array de objetos, onde cada objeto tem "title" (string), "description" (string), "installments" (number), e "totalValue" (number).`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                installments: { type: Type.INTEGER },
                                totalValue: { type: Type.NUMBER },
                            }
                        }
                    }
                }
            });
            setNegotiationOptions(JSON.parse(response.text));
        } catch (error) {
            console.error('Error generating dynamic options:', error);
        } finally {
            setIsLoadingOptions(false);
        }
    };

    const getFinalSuggestion = async (transcript: string) => {
        const prompt = `Aja como um analista de negociação. Analise a transcrição de uma chamada de cobrança e forneça um resumo conciso e uma sugestão de próximo passo. Transcrição: "${transcript}"`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return response.text;
        } catch {
            return "Não foi possível gerar um resumo.";
        }
    };

    const handleSaveAgreement = (agreementData: any) => {
        if (!selectedCase) return;

        const totalAgreementValue = selectedOption ? selectedOption.totalValue : calculateUpdatedInvoiceValues(selectedCase.invoice).updatedValue;
        
        const newAgreement = {
            ...agreementData,
            createdAt: new Date().toISOString(),
            protocolNumber: `AC-${selectedCase.invoice.id.slice(-4)}-${Date.now().toString().slice(-4)}`,
            isApproved: true,
        };

        const updatedCase = {
            ...selectedCase,
            invoice: {
                ...selectedCase.invoice,
                agreement: newAgreement,
                collectionStage: CollectionStage.ACORDO_FEITO,
                // Update the value to reflect the agreement total, if different
                updatedValue: totalAgreementValue, 
            }
        };

        setSelectedCase(updatedCase);
        setNegotiableCases(prev => prev.map(c => c.invoice.id === selectedCase.invoice.id ? updatedCase : c));
        setIsAgreementModalOpen(false);
        setSelectedOption(null);
    };

    // --- Render Logic ---
    if (view === 'session' && selectedCase) {
        return (
             <div className="flex flex-col lg:flex-row gap-6 h-full max-h-[calc(100vh-8rem)]">
                <main className="flex-grow h-full flex flex-col">
                    <Card noPadding className="h-full flex flex-col">
                        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-neutral-800">Co-piloto de Negociação</h3>
                                <div className="flex items-center gap-2 text-sm font-medium bg-red-100 text-red-700 rounded-full px-3 py-1">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                                    Gravando
                                </div>
                            </div>
                            <Button onClick={() => stopSession(true)} variant="danger">Encerrar Sessão</Button>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto bg-neutral-50/30 space-y-4">
                            <AnimatePresence>
                                {conversation.map(item => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                                        {item.type === 'user' ? (
                                            <div className="text-neutral-700 text-sm leading-relaxed p-2">{item.text}</div>
                                        ) : (
                                            <div className="my-4 p-4 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg">
                                                <div className="flex items-start gap-3">
                                                    <SparklesIcon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-primary-800 font-medium">{item.text}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                             {isThinking && <p className="text-sm italic text-neutral-500 text-center">IA está pensando...</p>}
                            <div ref={conversationEndRef} />
                        </div>
                    </Card>
                </main>
                <NegotiationControlPanel 
                    caseData={selectedCase}
                    negotiationOptions={negotiationOptions}
                    isLoadingOptions={isLoadingOptions}
                    onOpenAgreement={() => setIsAgreementModalOpen(true)}
                    selectedOption={selectedOption}
                    onSelectOption={setSelectedOption}
                />
                {selectedCase && (
                    <AgreementModal 
                        isOpen={isAgreementModalOpen} 
                        onClose={() => setIsAgreementModalOpen(false)} 
                        onSave={handleSaveAgreement} 
                        invoice={selectedCase.invoice}
                        initialValues={selectedOption ? { installments: selectedOption.installments, totalValue: selectedOption.totalValue } : undefined}
                    />
                )}
            </div>
        );
    }

    // List & History View
    return (
        <Card noPadding>
            <div className="p-4 sm:p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Co-piloto de Negociação</h2>
                    <div className="flex p-1 bg-neutral-200/70 rounded-full">
                        {['list', 'history'].map(tab => (
                             <button key={tab} onClick={() => setView(tab as any)} className={`relative px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${view === tab ? 'text-white' : 'text-neutral-600'}`}>
                                {view === tab && <motion.span layoutId="tab-bubble" className="absolute inset-0 z-0 bg-primary-600 rounded-full" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                                <span className="relative z-10">{tab === 'list' ? 'Iniciar Sessão' : 'Histórico'}</span>
                            </button>
                        ))}
                    </div>
                </div>
                 {view === 'list' && <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por aluno ou responsável..." className="w-full px-4 py-2 border rounded-full shadow-sm" />}
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {view === 'list' && (
                             <ul className="divide-y divide-neutral-200">
                                {filteredCases.map(c => (
                                    <li key={c.invoice.id} className="p-4 flex justify-between items-center hover:bg-neutral-50">
                                        <div>
                                            <p className="font-semibold text-neutral-800">{c.student?.name}</p>
                                            <p className="text-sm text-neutral-500">{c.school?.name} / Resp.: {c.guardian?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">{formatCurrency(calculateUpdatedInvoiceValues(c.invoice).updatedValue)}</p>
                                            <Button size="sm" className="mt-1" onClick={() => handleStartSession(c)} isLoading={isSessionStarting && selectedCase?.invoice.id === c.invoice.id}>Iniciar Sessão</Button>
                                        </div>
                                    </li>
                                ))}
                                {filteredCases.length === 0 && <p className="p-8 text-center text-neutral-500">Nenhum caso vencido para negociação.</p>}
                                {permissionError && <p className="p-4 text-center text-red-600 bg-red-50">{permissionError}</p>}
                            </ul>
                        )}
                        {view === 'history' && (
                            <ul className="divide-y divide-neutral-200">
                                {liveHistories.map(item => (
                                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-neutral-50 cursor-pointer" onClick={() => setViewingHistoryItem(item)}>
                                        <div>
                                            <p className="font-semibold text-neutral-800">{item.studentName}</p>
                                            <p className="text-sm text-neutral-500">{item.schoolName} / {formatDate(item.date)}</p>
                                        </div>
                                        <Button size="sm" variant="secondary">Ver Detalhes</Button>
                                    </li>
                                ))}
                                {liveHistories.length === 0 && <p className="p-8 text-center text-neutral-500">Nenhum histórico de sessão encontrado.</p>}
                            </ul>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <HistoryDetailModal item={viewingHistoryItem} onClose={() => setViewingHistoryItem(null)} />
        </Card>
    );
};

export default LiveNegotiation;
