

import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { Invoice, Student, Guardian } from '../../types';
import { XIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface EmailCommunicationModalProps {
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

const EmailCommunicationModal = ({ isOpen, onClose, invoice, student, guardian }: EmailCommunicationModalProps): React.ReactElement => {
    const [tone, setTone] = useState<Tone>('Amigável');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if(isOpen) {
            setSubject('');
            setBody('');
            setError('');
            setTone('Amigável');
        }
    }, [isOpen]);

    const handleGenerateContent = async () => {
        setIsGenerating(true);
        setError('');

        const prompt = `
            Você é um assistente de comunicação para o departamento de cobranças de uma escola, escrevendo um email para o responsável financeiro de um aluno.

            O tom do email deve ser: ${tone}.

            **Detalhes da Dívida:**
            - Aluno: ${student.name}
            - Responsável: ${guardian.name}
            - Valor: ${formatCurrency(invoice.value)}
            - Vencimento Original: ${formatDate(invoice.dueDate)}
            - Descrição: ${invoice.notes || 'Mensalidade Escolar'}

            **Instrução:**
            Gere um JSON contendo um 'subject' (assunto) e um 'body' (corpo) para um email de cobrança.
            - O assunto deve ser claro e conciso. Ex: "Lembrete de Pagamento: Mensalidade Escolar - ${student.name}".
            - O corpo do email deve ser profissional, iniciar com uma saudação (Ex: "Prezado(a) ${guardian.name},"), explicar o motivo do contato, mencionar os detalhes da dívida e incluir o link para pagamento. Finalize cordialmente.

            Link para Pagamento: ${invoice.paymentLink || `https://pagamento.demo/pay/${invoice.id}`}
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            body: { type: Type.STRING }
                        }
                    }
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            setSubject(jsonResponse.subject || '');
            setBody(jsonResponse.body || '');

        } catch (err) {
            console.error("Error generating AI email:", err);
            setError("Ocorreu um erro ao gerar o email. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSendEmail = () => {
        if (!subject || !body) {
            setError('Assunto e mensagem são obrigatórios.');
            return;
        }
        setIsSending(true);
        // Simulate sending email
        setTimeout(() => {
            alert(`Email enviado com sucesso para ${guardian.email}! (Simulação)`);
            setIsSending(false);
            onClose();
        }, 1000);
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Enviar Email de Cobrança</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="overflow-y-auto flex-grow p-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Para</label>
                                <input type="email" value={guardian.email} readOnly className="w-full form-input bg-neutral-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">Assunto</label>
                                <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full form-input" />
                            </div>
                             <div>
                                <label htmlFor="body" className="block text-sm font-medium text-neutral-700 mb-1">Mensagem</label>
                                <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full form-input" />
                            </div>

                            <div className="p-4 bg-primary-50/50 rounded-lg border border-primary-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <SparklesIcon className="w-5 h-5 text-primary-500" />
                                    <h3 className="font-semibold text-primary-800">Gerar conteúdo com IA</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        {(['Amigável', 'Formal', 'Urgente'] as Tone[]).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTone(t)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${tone === t ? 'bg-primary-600 text-white' : 'bg-white hover:bg-neutral-100 border'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <Button onClick={handleGenerateContent} isLoading={isGenerating} size="sm" variant="secondary">
                                        Gerar Assunto e Mensagem
                                    </Button>
                                </div>
                            </div>
                            
                            {error && <p className="text-sm text-red-600">{error}</p>}
                             <style>{`.form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; }`}</style>
                        </div>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="button" onClick={handleSendEmail} isLoading={isSending} disabled={!subject || !body}>Enviar Email</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailCommunicationModal;