import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode } from 'js-base64';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, ChatBubbleLeftEllipsisIcon } from '../../components/common/icons';

const LiveNegotiation = (): React.ReactElement => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [permissionError, setPermissionError] = useState('');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    
    const sessionRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const turnTranscriptRef = useRef('');

    useEffect(() => {
        return () => {
            // Cleanup on component unmount
            stopSession();
        };
    }, []);

    const stopSession = async () => {
        if (sessionRef.current) {
            const session = await sessionRef.current;
            session.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsSessionActive(false);
    };

    const startSession = async () => {
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
                        setIsSessionActive(true);
                        setSuggestions(['Sessão iniciada. Comece a falar para transcrever e receber sugestões.']);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setCurrentTranscript(prev => prev + text);
                            turnTranscriptRef.current += text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullTurn = turnTranscriptRef.current;
                            if (fullTurn.trim()) {
                                getNegotiationAdvice(fullTurn);
                            }
                            turnTranscriptRef.current = '';
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setSuggestions(prev => [...prev, 'Erro na sessão. Tente reiniciar.']);
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed');
                        setIsSessionActive(false);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);

        } catch (error) {
            console.error('Failed to get user media:', error);
            setPermissionError('É necessário permitir o acesso ao microfone para usar esta funcionalidade.');
        }
    };
    
    function createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }
    
    const getNegotiationAdvice = async (text: string) => {
        setIsThinking(true);
        const prompt = `Como um assistente de negociação sênior, ouça o que o advogado acabou de dizer e forneça um insight ou próxima etapa. Frase do advogado: "${text}". Seja conciso e direto.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setSuggestions(prev => [...prev, response.text]);
        } catch (error) {
            console.error('Error getting advice:', error);
            setSuggestions(prev => [...prev, 'Não foi possível gerar uma sugestão no momento.']);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card noPadding className="h-[calc(100vh-10rem)] flex flex-col">
                        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="text-lg font-bold text-neutral-800">Transcrição da Chamada</h3>
                            {!isSessionActive ? (
                                <Button onClick={startSession} icon={<ChatBubbleLeftEllipsisIcon />}>Iniciar Sessão</Button>
                            ) : (
                                <Button onClick={stopSession} variant="danger">Encerrar Sessão</Button>
                            )}
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto bg-neutral-50/50">
                            {permissionError && <p className="text-red-600">{permissionError}</p>}
                            <p className="whitespace-pre-wrap">{currentTranscript}</p>
                            {isSessionActive && !currentTranscript && <p className="text-neutral-400">Aguardando áudio...</p>}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card noPadding className="h-[calc(100vh-10rem)] flex flex-col">
                         <header className="p-4 border-b flex items-center gap-2 flex-shrink-0">
                             <SparklesIcon className="w-6 h-6 text-primary-500" />
                            <h3 className="text-lg font-bold text-neutral-800">Sugestões da IA</h3>
                        </header>
                         <div className="flex-grow p-4 overflow-y-auto space-y-3">
                            <AnimatePresence>
                            {suggestions.map((s, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-primary-50 border border-primary-200/60 rounded-lg text-sm text-primary-800"
                                >
                                    {s}
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            {isThinking && <p className="text-sm italic text-neutral-500">Analisando e gerando sugestão...</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LiveNegotiation;