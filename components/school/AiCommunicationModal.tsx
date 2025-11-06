

import React, { useState } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { Invoice, Student, Guardian } from '../../types';
import { XIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AiCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    student: Student;
    guardian: Guardian;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// FIX: Explicitly type modalVariants with the Variants type.
const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

type Tone = 'Amigável' | 'Formal' | 'Urgente';

const AiCommunicationModal = ({ isOpen, onClose, invoice, student, guardian }: AiCommunicationModalProps): React.ReactElement => {
    const [tone, setTone] = useState<Tone>('Amigável');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const calculateDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate).getTime();
        const now = new Date().getTime();
        const diff = now - due;
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };

    const handleGenerateMessage = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedMessage('');

        const prompt = `
            Você é um assistente de comunicação para o departamento de cobranças de uma escola, escrevendo para o responsável financeiro de um aluno.

            O tom da mensagem deve ser: ${tone}.

            **Detalhes da Dívida:**
            - Aluno: ${student.name}
            - Responsável: ${guardian.name}
            - Valor: ${formatCurrency(invoice.value)}
            - Vencimento Original: ${formatDate(invoice.dueDate)}
            - Dias em Atraso: ${calculateDaysOverdue(invoice.dueDate)}

            **Instrução:**
            Gere uma mensagem curta e eficaz para ser enviada via WhatsApp. A mensagem deve lembrar o responsável sobre o pagamento pendente e incentivá-lo a regularizar a situação. Inclua o link para pagamento no final da mensagem. Não adicione saudações como "Prezado(a) ${guardian.name}" ou "Atenciosamente". Foque em uma comunicação direta, clara e humana.

            Link para Pagamento: ${invoice.paymentLink || `https://pagamento.demo/pay/${invoice.id}`}
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setGeneratedMessage(response.text);
        } catch (err) {
            console.error("Error generating AI message:", err);
            setError("Ocorreu um erro ao gerar a mensagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedMessage).then(() => {
            alert('Mensagem copiada para a área de transferência!');
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
                                <h2 className="text-xl font-bold text-neutral-800">Gerar Mensagem para WhatsApp</h2>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">1. Selecione o tom da mensagem</label>
                                <div className="flex gap-2">
                                    {(['Amigável', 'Formal', 'Urgente'] as Tone[]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${tone === t ? 'bg-primary-600 text-white' : 'bg-neutral-200 hover:bg-neutral-300'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">2. Gere a mensagem</label>
                                <Button onClick={handleGenerateMessage} isLoading={isLoading} className="w-full">
                                    {isLoading ? 'Gerando...' : 'Gerar Mensagem'}
                                </Button>
                            </div>
                            
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            
                            {(generatedMessage || isLoading) && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">3. Revise e utilize</label>
                                    <div className="bg-neutral-50 rounded-lg p-4 min-h-[150px] text-neutral-800 border border-neutral-200">
                                        {isLoading ? (
                                             <div className="space-y-3 animate-pulse">
                                                <div className="h-3 bg-neutral-300 rounded w-full"></div>
                                                <div className="h-3 bg-neutral-300 rounded w-5/6"></div>
                                                <div className="h-3 bg-neutral-300 rounded w-full"></div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{generatedMessage}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <footer className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
                            <Button type="button" onClick={handleCopyToClipboard} disabled={!generatedMessage || isLoading}>Copiar Mensagem</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiCommunicationModal;