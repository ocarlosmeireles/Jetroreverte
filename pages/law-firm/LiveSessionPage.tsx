import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type } from '@google/genai';
import { NegotiationCase, NegotiationChannel, NegotiationAttemptType, NegotiationAttempt } from '../../types';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoLiveNegotiationHistories, demoNegotiationAttempts } from '../../services/demoData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { PhoneIcon, SparklesIcon, UserCircleIcon, AcademicCapIcon } from '../../components/common/icons';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

// #region Audio Utility Functions
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// #endregion

interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

type TranscriptItem = { type: 'user' | 'model' | 'suggestion', content: string };
type AgreementOption = { title: string; description: string };

const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return <span className="font-mono text-lg">{mins}:{secs}</span>;
};


const LiveSessionPage = ({ caseId }: { caseId: string }) => {
    const caseData = useMemo(() => {
        const invoice = demoInvoices.find(i => i.id === caseId);
        if (!invoice) return null;
        const student = demoStudents.find(s => s.id === invoice.studentId);
        const guardian = demoGuardians.find(g => g.id === student?.guardianId);
        const school = demoSchools.find(s => s.id === invoice.schoolId);
        const attempts = demoNegotiationAttempts.filter(a => a.invoiceId === invoice.id);

        if (!student || !guardian || !school) return null;
        const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
        return { invoice: {...invoice, updatedValue}, student, guardian, school, attempts };
    }, [caseId]);

    const [sessionStatus, setSessionStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });
    const [negotiationOptions, setNegotiationOptions] = useState<AgreementOption[]>([]);
    const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript, currentTurn]);

    const handleLogContactInPage = (channel: NegotiationChannel, notes: string) => {
        if (!caseData) return;
        const newAttempt: NegotiationAttempt = {
            id: `neg-${Date.now()}`,
            invoiceId: caseData.invoice.id,
            date: new Date().toISOString(),
            type: NegotiationAttemptType.ADMINISTRATIVE,
            channel,
            notes,
            author: 'Advocacia Foco',
        };
        demoNegotiationAttempts.unshift(newAttempt);
    };

    const stopSession = async (saveHistory = true) => {
        // ... (session cleanup logic remains the same)
        if (sessionPromiseRef.current) {
            try { const session = await sessionPromiseRef.current; session.close(); } catch (e) { console.error("Error closing session:", e); }
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null;
        if (audioContextRef.current?.state !== 'closed') { audioContextRef.current.close(); } audioContextRef.current = null;
        sourcesRef.current.forEach(source => source.stop()); sourcesRef.current.clear();
        if (outputAudioContextRef.current?.state !== 'closed') { outputAudioContextRef.current.close(); } outputAudioContextRef.current = null;

        if (saveHistory && caseData) {
            const transcriptText = transcript.map(t => `${t.type}: ${t.content}`).join('\n');
            const finalSuggestion = "Resumo da Sessão Live IA.";
            demoLiveNegotiationHistories.unshift({
                id: `live-hist-${Date.now()}`, studentId: caseData.student.id, studentName: caseData.student.name, guardianName: caseData.guardian.name,
                schoolName: caseData.school.name, date: new Date().toISOString(), transcript: transcriptText, finalSuggestion,
            });
            handleLogContactInPage(NegotiationChannel.PHONE_CALL, `Sessão Live IA realizada. Transcrição salva no histórico.`);
        }
        setSessionStatus('idle');
    };

    const generateNegotiationOptions = async () => {
        if (!caseData) return;
        setIsGeneratingOptions(true);

        const currentTranscript = [...transcript, { type: 'user', content: currentTurn.user }, { type: 'model', content: currentTurn.model }].filter(t => t.content.trim() !== '').map(t => `${t.type === 'user' ? 'Advogado' : 'Responsável'}: ${t.content}`).join('\n');

        const prompt = `Baseado na conversa a seguir sobre uma dívida de ${formatCurrency(caseData.invoice.updatedValue)}, gere 2 ou 3 opções de acordo criativas.
Conversa:
---
${currentTranscript || 'A conversa ainda não começou.'}
---
Responda com um objeto JSON contendo um array 'options', onde cada objeto tem 'title' (ex: "3x de R$ 150,00") e 'description' (ex: "Parcelamento com pequena entrada").`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: { options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } } }
                    }
                }
            });
            const result = JSON.parse(response.text);
            setNegotiationOptions(result.options || []);
        } catch (error) {
            console.error("Error generating negotiation options:", error);
        } finally {
            setIsGeneratingOptions(false);
        }
    };
    
    const startSession = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !caseData) return setSessionStatus('error');
        setSessionStatus('connecting');

        try {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const systemInstruction = `Você é um co-piloto de negociação para um advogado. Ouça a conversa e, quando o responsável (model) falar algo relevante, forneça sugestões curtas e úteis para o advogado em formato de texto. Os dados da dívida são: Aluno ${caseData.student?.name}, Responsável ${caseData.guardian?.name}, Dívida ${formatCurrency(caseData.invoice.updatedValue)}. Foque em táticas de negociação, empatia e opções de acordo.`;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionStatus('active');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
                            const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromiseRef.current?.then((s) => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.serverContent?.inputTranscription) setCurrentTurn(p => ({ ...p, user: p.user + (msg.serverContent.inputTranscription.text || '') }));
                        if (msg.serverContent?.outputTranscription) setCurrentTurn(p => ({ ...p, model: p.model + (msg.serverContent.outputTranscription.text || '') }));
                        
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        
                        if (msg.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }

                        const suggestionText = msg.serverContent?.modelTurn?.parts.map(p => p.text).filter(Boolean).join(' ');
                        if (suggestionText) {
                            setTranscript(prev => [...prev, { type: 'suggestion', content: suggestionText }]);
                        }
                        if (msg.serverContent?.turnComplete) {
                            const newEntries: TranscriptItem[] = [];
                            if (currentTurn.user.trim()) newEntries.push({ type: 'user', content: currentTurn.user.trim() });
                            if (currentTurn.model.trim()) newEntries.push({ type: 'model', content: currentTurn.model.trim() });
                            if (newEntries.length > 0) setTranscript(prev => [...prev, ...newEntries]);
                            setCurrentTurn({ user: '', model: '' });
                        }
                    },
                    onerror: (e: ErrorEvent) => { console.error('Live Error:', e); setSessionStatus('error'); },
                    onclose: () => { if (sessionStatus !== 'idle') setSessionStatus('idle'); },
                },
                config: {
                    responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    inputAudioTranscription: {}, outputAudioTranscription: {}, systemInstruction,
                },
            });
            await sessionPromiseRef.current;
        } catch (error) {
            console.error('Failed to start session:', error);
            setSessionStatus('error');
        }
    };
    
    useEffect(() => {
        startSession();
        return () => { stopSession(false); };
    }, []);

    // FIX: Replaced incorrect NodeJS.Timeout type with idiomatic React useEffect cleanup.
    // The interval is now created and cleared only when the session is active,
    // letting TypeScript infer the correct browser-based timer ID type.
    useEffect(() => {
        if (sessionStatus === 'active') {
            generateNegotiationOptions(); // First call
            const intervalId = setInterval(generateNegotiationOptions, 40000);
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [sessionStatus, transcript]);

    if (!caseData) return <div className="h-screen w-screen flex items-center justify-center bg-neutral-900 text-white"><p>Erro: Dados do caso não encontrados.</p></div>;

    return (
        <div className="flex flex-col h-screen bg-neutral-900 text-white font-sans antialiased">
            <header className="p-4 border-b border-neutral-700/50 flex justify-between items-center flex-shrink-0 bg-neutral-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="relative"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div></div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-100">Sessão Live IA</h2>
                        <p className="text-sm text-neutral-400">Negociação com: {caseData.guardian?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Timer />
                    <Button onClick={() => { stopSession(true); window.close(); }} variant="danger" size="sm">Encerrar e Salvar</Button>
                </div>
            </header>

            <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
                {/* Coluna Esquerda: Dossiê */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                        <h4 className="text-sm font-bold text-neutral-300 mb-2">Dossiê do Caso</h4>
                        <div className="space-y-3 text-sm text-neutral-400">
                            <div className="flex items-center gap-3"><AcademicCapIcon className="w-5 h-5 flex-shrink-0 text-neutral-500"/><p><strong>Aluno:</strong> {caseData.student.name}</p></div>
                            <div className="flex items-center gap-3"><UserCircleIcon className="w-5 h-5 flex-shrink-0 text-neutral-500"/><p><strong>Responsável:</strong> {caseData.guardian.name}</p></div>
                            <div className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 flex-shrink-0 text-neutral-500"/><p><strong>Contato:</strong> {caseData.guardian.phone}</p></div>
                        </div>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                        <h4 className="text-sm font-bold text-neutral-300 mb-2">Detalhes da Dívida</h4>
                        <div className="space-y-2 text-sm text-neutral-400">
                            <div className="flex justify-between items-center"><span>Valor Original:</span><span className="font-medium text-neutral-200">{formatCurrency(caseData.invoice.value)}</span></div>
                            <div className="flex justify-between items-center"><span>Vencimento:</span><span className="font-medium text-neutral-200">{formatDate(caseData.invoice.dueDate)}</span></div>
                            <div className="flex justify-between items-center pt-2 border-t border-neutral-700/50"><span className="font-bold">Valor Atualizado:</span><span className="font-bold text-xl text-red-400">{formatCurrency(caseData.invoice.updatedValue)}</span></div>
                        </div>
                    </div>
                     <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                        <h4 className="text-sm font-bold text-neutral-300 mb-2">Histórico de Contatos ({caseData.attempts.length})</h4>
                         <div className="space-y-2 text-xs text-neutral-400 max-h-40 overflow-y-auto">
                            {caseData.attempts.map(a => <p key={a.id}>{formatDate(a.date)}: {a.notes}</p>)}
                         </div>
                    </div>
                </div>

                {/* Coluna Central: Transcrição */}
                <div className="lg:col-span-2 flex flex-col bg-black/30 rounded-lg">
                    <h3 className="font-semibold p-4 border-b border-neutral-700/50 flex-shrink-0">Sessão de Negociação</h3>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {sessionStatus === 'connecting' && <p className="text-yellow-400 animate-pulse text-center">Conectando...</p>}
                        {transcript.map((item, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                {item.type === 'user' && <div className="flex justify-end"><div className="bg-blue-600 rounded-lg rounded-br-none p-3 max-w-[80%]"><p>{item.content}</p></div></div>}
                                {item.type === 'model' && <div className="flex justify-start"><div className="bg-neutral-700 rounded-lg rounded-bl-none p-3 max-w-[80%]"><p>{item.content}</p></div></div>}
                                {item.type === 'suggestion' && (
                                    <div className="flex justify-center my-3"><div className="p-3 text-sm bg-yellow-900/50 border border-yellow-700/50 rounded-lg max-w-[90%] flex items-start gap-2 text-yellow-200"><SparklesIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" /><span>{item.content}</span></div></div>
                                )}
                            </motion.div>
                        ))}
                        {currentTurn.user && <div className="flex justify-end opacity-60"><div className="bg-blue-600 rounded-lg rounded-br-none p-3 max-w-[80%]"><p>{currentTurn.user}</p></div></div>}
                        {currentTurn.model && <div className="flex justify-start opacity-60"><div className="bg-neutral-700 rounded-lg rounded-bl-none p-3 max-w-[80%]"><p>{currentTurn.model}</p></div></div>}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>

                {/* Coluna Direita: Opções de Acordo */}
                <div className="lg:col-span-1 flex flex-col bg-black/30 rounded-lg">
                    <h3 className="font-semibold p-4 border-b border-neutral-700/50 flex-shrink-0">Opções de Acordo (IA)</h3>
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {isGeneratingOptions && <div className="text-sm text-neutral-400 animate-pulse">Gerando novas opções...</div>}
                        {negotiationOptions.map((opt, index) => (
                            <motion.div key={index} initial={{ opacity: 0, x:10 }} animate={{ opacity: 1, x:0 }} className="bg-primary-900/40 border border-primary-700/80 rounded-lg p-3 cursor-pointer hover:border-primary-500">
                                <p className="font-bold text-primary-200">{opt.title}</p>
                                <p className="text-xs text-primary-300">{opt.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveSessionPage;
