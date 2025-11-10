import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { NegotiationCase, NegotiationChannel, NegotiationAttemptType, NegotiationAttempt } from '../../types';
import { demoInvoices, demoStudents, demoGuardians, demoSchools, demoLiveNegotiationHistories, demoNegotiationAttempts } from '../../services/demoData';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { PhoneIcon, SparklesIcon } from '../../components/common/icons';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

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


interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

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
    const [liveTranscript, setLiveTranscript] = useState<{ speaker: string, text: string }[]>([]);
    const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
    const [currentInputText, setCurrentInputText] = useState('');
    const [currentOutputText, setCurrentOutputText] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [liveTranscript, currentInputText, currentOutputText]);

    const handleLogContactInPage = (channel: NegotiationChannel, notes: string) => {
        if (!caseData) return;
        const newAttempt: NegotiationAttempt = {
            id: `neg-${Date.now()}`,
            invoiceId: caseData.invoice.id,
            date: new Date().toISOString(),
            type: NegotiationAttemptType.ADMINISTRATIVE,
            channel,
            notes,
            author: 'Advocacia Foco', // Fallback since no user context
        };
        demoNegotiationAttempts.unshift(newAttempt);
    };

    const stopSession = async (saveHistory = true) => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
        }
        audioContextRef.current = null;
        
        if (sourcesRef.current) {
            for (const source of sourcesRef.current.values()) {
                source.stop();
            }
            sourcesRef.current.clear();
        }

        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(e => console.error("Error closing Output AudioContext:", e));
        }
        outputAudioContextRef.current = null;


        if (saveHistory && caseData) {
            const transcriptText = [...liveTranscript, { speaker: 'Advogado', text: currentInputText }, { speaker: 'Responsável', text: currentOutputText }]
                .filter(t => t.text.trim())
                .map(t => `${t.speaker}: ${t.text}`).join('\n');
            const finalSuggestion = liveSuggestions.join(' | ');
            demoLiveNegotiationHistories.unshift({
                id: `live-hist-${Date.now()}`,
                studentId: caseData.student.id,
                studentName: caseData.student.name,
                guardianName: caseData.guardian.name,
                schoolName: caseData.school.name,
                date: new Date().toISOString(),
                transcript: transcriptText,
                finalSuggestion,
            });
            handleLogContactInPage(NegotiationChannel.PHONE_CALL, `Sessão Live IA realizada. Transcrição e sugestões salvas no histórico.`);
        }
        setSessionStatus('idle');
    };

    const handleStartSession = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !caseData) {
            alert("Seu navegador não suporta a captura de áudio ou os dados do caso estão faltando.");
            return;
        }
        setSessionStatus('connecting');
        setLiveTranscript([]);
        setLiveSuggestions([]);

        try {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputNodeRef.current = outputAudioContextRef.current.createGain();
            outputNodeRef.current.connect(outputAudioContextRef.current.destination);
            nextStartTimeRef.current = 0;
            sourcesRef.current.clear();
        } catch (e) {
            console.error("Failed to create output audio context:", e);
            setSessionStatus('error');
            return;
        }


        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `Você é um co-piloto de negociação para um advogado. Você ouvirá o áudio da conversa e deve fornecer sugestões em tempo real. Os dados da dívida são: Aluno ${caseData.student?.name}, Responsável ${caseData.guardian?.name}, Dívida ${formatCurrency(caseData.invoice.updatedValue)}. Forneça transcrição para ambos os lados (o advogado é o 'user', o devedor é o 'model') e sugestões curtas e úteis para o advogado.`;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionStatus('active');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setCurrentInputText(prev => prev + (message.serverContent.inputTranscription.text || ''));
                        }
                        if (message.serverContent?.outputTranscription) {
                            setCurrentOutputText(prev => prev + (message.serverContent.outputTranscription.text || ''));
                        }
                        
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        const outputAudioContext = outputAudioContextRef.current;
                        const outputNode = outputNodeRef.current;
                        
                        if (base64EncodedAudioString && outputAudioContext && outputNode) {
                            let nextStartTime = nextStartTimeRef.current;
                            nextStartTime = Math.max(
                                nextStartTime,
                                outputAudioContext.currentTime,
                            );
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64EncodedAudioString),
                                outputAudioContext,
                                24000,
                                1,
                            );

                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });
                            
                            source.start(nextStartTime);
                            nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }

                        if (message.serverContent?.modelTurn) {
                            const modelText = message.serverContent.modelTurn.parts.map(part => part.text).filter(Boolean).join(' ');
                            if (modelText) {
                                setLiveSuggestions(prev => [...prev, modelText].slice(-3));
                            }
                        }
                        if (message.serverContent?.turnComplete) {
                            setLiveTranscript(prev => {
                                const newEntries = [...prev];
                                if (currentInputText.trim()) newEntries.push({ speaker: 'Advogado', text: currentInputText.trim() });
                                if (currentOutputText.trim()) newEntries.push({ speaker: 'Responsável', text: currentOutputText.trim() });
                                return newEntries;
                            });
                            setCurrentInputText('');
                            setCurrentOutputText('');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live Session Error:', e);
                        setSessionStatus('error');
                    },
                    onclose: () => {
                        console.log('Live Session Closed');
                        if (sessionStatus !== 'idle') setSessionStatus('idle');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
            });
            await sessionPromiseRef.current;
        } catch (error) {
            console.error('Failed to start audio session:', error);
            alert("Não foi possível iniciar a sessão de áudio. Verifique as permissões do microfone.");
            setSessionStatus('error');
        }
    };
    
    useEffect(() => {
        handleStartSession();
        return () => {
            stopSession(false);
        };
    }, []);
    
    const handleEndAndSave = () => {
        stopSession(true);
        window.close();
    };

    if (!caseData) {
        return <div className="h-screen w-screen flex items-center justify-center bg-neutral-800 text-white"><p>Erro: Dados do caso não encontrados.</p></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-800 text-white font-sans">
            <header className="p-4 border-b border-neutral-700 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <PhoneIcon className="w-6 h-6 text-green-400" />
                        <div className="absolute top-0 right-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Sessão Live com IA Ativa</h2>
                        <p className="text-sm text-neutral-300">Negociando com: {caseData.guardian?.name}</p>
                    </div>
                </div>
                <Button onClick={handleEndAndSave} variant="danger" size="sm">Encerrar e Salvar</Button>
            </header>
            <main className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-hidden">
                <div className="col-span-2 flex flex-col bg-black/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex-shrink-0">Transcrição em Tempo Real</h3>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {sessionStatus === 'connecting' && <p className="text-yellow-400 animate-pulse">Conectando e ativando microfone...</p>}
                        {sessionStatus === 'error' && <p className="text-red-400">Erro de conexão. Por favor, encerre e tente novamente.</p>}
                        {liveTranscript.map((item, index) => (
                            <div key={`final-${index}`}>
                                <p className={`font-bold text-sm ${item.speaker === 'Advogado' ? 'text-blue-300' : 'text-green-300'}`}>{item.speaker}</p>
                                <p className="text-neutral-200 whitespace-pre-wrap">{item.text}</p>
                            </div>
                        ))}
                        {currentInputText && (
                            <div className="opacity-70">
                                <p className="font-bold text-sm text-blue-300">Advogado</p>
                                <p className="text-neutral-200 whitespace-pre-wrap">{currentInputText}</p>
                            </div>
                        )}
                        {currentOutputText && (
                            <div className="opacity-70">
                                <p className="font-bold text-sm text-green-300">Responsável</p>
                                <p className="text-neutral-200 whitespace-pre-wrap">{currentOutputText}</p>
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>
                <div className="col-span-1 flex flex-col bg-black/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex-shrink-0 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-300"/> Sugestões da IA</h3>
                    <div className="flex-grow overflow-y-auto space-y-3">
                        {liveSuggestions.length === 0 && sessionStatus === 'active' && <p className="text-sm text-neutral-400 animate-pulse">Aguardando pontos para sugerir...</p>}
                        {liveSuggestions.map((sug, index) => (
                            <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-2 bg-primary-900/50 border border-primary-700 rounded-md text-sm text-primary-200">
                                {sug}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveSessionPage;