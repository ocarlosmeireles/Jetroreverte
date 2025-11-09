import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { NegotiationCase, NegotiationChannel } from '../../types';
import { XIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface AiCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData: NegotiationCase;
    channel?: 'whatsapp' | 'email';
    onLogContact: (notes: string, channel: NegotiationChannel) => void;
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

const AiCommunicationModal = ({ isOpen, onClose, caseData, channel, onLogContact }: AiCommunicationModalProps): React.ReactElement => {
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    
    const { invoice, student, guardian, attempts } = caseData;

    useEffect(() => {
        if (isOpen) {
            handleGenerateMessage();
        }
    }, [isOpen, channel, caseData]);

    const handleGenerateMessage = async () => {
        if (!channel) return;
        setIsLoading(true);
        setError('');
        setGeneratedMessage('');
        setIsCopied(false);

        const { updatedValue } = calculateUpdatedInvoiceValues(invoice);
        const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24)));
        
        let tone = "Amigável";
        if (attempts.length > 1 && daysOverdue > 30) tone = "Formal";
        if (attempts.length > 3 && daysOverdue > 60) tone = "Urgente";

        const prompt = `
            Você é um assistente de comunicação para um escritório de advocacia, escrevendo para o responsável financeiro de um aluno.
            O canal de comunicação é ${channel}. O tom deve ser ${tone}.

            **Detalhes:**
            - Aluno: ${student?.name}
            - Responsável: ${guardian?.name}
            - Valor Atualizado: ${formatCurrency(updatedValue)}
            - Vencimento Original: ${formatDate(invoice.dueDate)}
            - Dias em Atraso: ${daysOverdue}

            **Instrução:**
            Gere uma mensagem curta e eficaz. A mensagem deve lembrar o responsável sobre o débito e incentivá-lo a regularizar a situação ou a entrar em contato para negociar. 
            - Para WhatsApp: Seja mais direto e inclua emojis discretos.
            - Para Email: Use uma saudação formal (Prezado(a) ${guardian?.name},) e uma despedida cordial.
            
            Em ambos os casos, não inclua o link de pagamento. O objetivo é iniciar uma conversa.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedMessage(response.text);
        } catch (err) {
            console.error("Error generating AI message:", err);
            setError("Ocorreu um erro ao gerar a mensagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyAndLog = () => {
        if (!channel) return;
        navigator.clipboard.writeText(generatedMessage).then(() => {
            const logChannel = channel === 'whatsapp' ? NegotiationChannel.WHATSAPP : NegotiationChannel.EMAIL;
            onLogContact(`Mensagem de ${channel} com tom ${'Formal'} enviada (gerada por IA).`, logChannel);
            setIsCopied(true);
            setTimeout(onClose, 1500);
        });
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <SparklesIcon className="w-6 h-6 text-primary-500" />
                                <h2 className="text-xl font-bold text-neutral-800">Gerar {channel === 'whatsapp' ? 'WhatsApp' : 'Email'} com IA</h2>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"><XIcon /></button>
                        </header>
                        <div className="p-6 space-y-4">
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Mensagem Sugerida:</label>
                                <div className="bg-neutral-50 rounded-lg p-4 min-h-[200px] text-neutral-800 border border-neutral-200">
                                    {isLoading ? (
                                         <div className="space-y-3 animate-pulse">
                                            <div className="h-3 bg-neutral-300 rounded w-full"></div>
                                            <div className="h-3 bg-neutral-300 rounded w-5/6"></div>
                                            <div className="h-3 bg-neutral-300 rounded w-full"></div>
                                            <div className="h-3 bg-neutral-300 rounded w-3/4"></div>
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-sans text-sm">{generatedMessage}</pre>
                                    )}
                                </div>
                            </div>
                        </div>
                        <footer className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex items-center justify-between">
                             <Button type="button" variant="secondary" onClick={handleGenerateMessage} isLoading={isLoading}>
                                Regenerar
                            </Button>
                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                                <Button type="button" onClick={handleCopyAndLog} disabled={!generatedMessage || isLoading}>
                                    {isCopied ? 'Registrado!' : 'Copiar & Registrar'}
                                </Button>
                            </div>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiCommunicationModal;