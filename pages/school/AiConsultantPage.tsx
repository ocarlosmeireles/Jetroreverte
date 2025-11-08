
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Chat } from '@google/genai';
import { SparklesIcon } from '../../components/common/icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AiConsultantPage = (): React.ReactElement => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const systemInstruction = "Você é um consultor financeiro especialista para instituições de ensino privadas, agindo como um parceiro estratégico. Seu nome é 'Consul'. Seu objetivo é fornecer insights acionáveis baseados em dados financeiros escolares agregados e anônimos. Você pode ajudar a analisar tendências de inadimplência, sugerir melhorias para políticas financeiras, redigir comunicados para os pais sobre pagamentos e identificar oportunidades para melhorar a saúde financeira da escola. Seu tom deve ser profissional, encorajador e orientado a dados. Não forneça aconselhamento jurídico.";
    
    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });
        setChat(newChat);
        setMessages([
            { role: 'model', text: 'Olá! Sou o Consul, seu assistente estratégico. Como posso ajudar a saúde financeira da sua escola hoje?' }
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: messageText });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMessage: Message = { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const promptStarters = [
        "Analisar o perfil dos meus inadimplentes.",
        "Sugerir uma nova política de bolsas de estudo.",
        "Criar um comunicado sobre reajuste de mensalidade.",
        "Quais as melhores práticas para negociar com os pais?",
    ];

    return (
        <Card noPadding className="h-[calc(100vh-10rem)] flex flex-col">
            <header className="p-4 border-b flex items-center gap-2 flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-lg font-bold text-neutral-800">Seu Consultor Estratégico de IA</h2>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-lg' : 'bg-neutral-100 text-neutral-800 rounded-bl-lg'}`}>
                            <pre className="text-sm whitespace-pre-wrap font-sans">{msg.text}</pre>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-neutral-100 text-neutral-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                {messages.length === 1 && !isLoading && (
                    <div className="pt-4">
                         <h4 className="text-sm font-semibold text-neutral-600 mb-2">Experimente perguntar:</h4>
                         <div className="flex flex-wrap gap-2">
                             {promptStarters.map(prompt => (
                                <button key={prompt} onClick={() => handleSend(prompt)} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors">
                                    {prompt}
                                </button>
                             ))}
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-4 border-t flex-shrink-0 bg-white rounded-b-xl">
                 <div className="relative">
                     <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="w-full pl-4 pr-24 py-3 border border-neutral-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary-300"
                        placeholder="Faça uma pergunta sobre a gestão financeira..."
                        disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full !py-2">
                            Enviar
                        </Button>
                    </div>
                 </div>
            </form>
        </Card>
    );
};

export default AiConsultantPage;
