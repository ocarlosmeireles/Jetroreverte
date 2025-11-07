
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Chat } from '@google/genai';
import { XIcon, SparklesIcon } from './icons';
import Button from './Button';

interface AiChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    systemInstruction: string;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AiChatbot = ({ isOpen, onClose, systemInstruction }: AiChatbotProps): React.ReactElement => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setChat(newChat);
            setMessages([]); // Reset messages when opening
        }
    }, [isOpen, systemInstruction]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMessage: Message = { role: 'model', text: 'Desculpe, ocorreu um erro. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border"
                >
                    <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-primary-500" />
                            <h2 className="text-md font-bold text-neutral-800">Assistente Virtual</h2>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100"><XIcon className="w-5 h-5"/></button>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-800'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] px-3 py-2 rounded-xl bg-neutral-100 text-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-4 border-t flex-shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className="w-full px-4 py-2 border rounded-full shadow-sm focus:ring-2 focus:ring-primary-300"
                            placeholder="Digite sua dúvida..."
                            disabled={isLoading}
                        />
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiChatbot;