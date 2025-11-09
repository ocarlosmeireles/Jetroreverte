

import React, { useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { Invoice, Student, Guardian, School, NegotiationAttempt, NegotiationAttemptType } from '../../types';
import { XIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface PetitionGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    negotiationCase: {
        invoice: Invoice;
        student: Student | undefined;
        guardian: Guardian | undefined;
        school: School | undefined;
        attempts: NegotiationAttempt[];
    };
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

const PetitionGeneratorModal = ({ isOpen, onClose, negotiationCase }: PetitionGeneratorModalProps): React.ReactElement => {
    const [generatedPetition, setGeneratedPetition] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { invoice, student, guardian, school, attempts } = negotiationCase;
    const { updatedValue } = calculateUpdatedInvoiceValues(invoice);

    const handleGeneratePetition = async () => {
        if (!student || !guardian || !school) {
            setError("Dados do caso incompletos para gerar a petição.");
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedPetition('');

        const historySummary = attempts.map(a => 
            `- Em ${formatDate(a.date)}: Tentativa de contato via ${a.channel}. Status: ${a.type === NegotiationAttemptType.ADMINISTRATIVE ? 'Administrativo' : 'Judicial'}. Anotações: ${a.notes}`
        ).join('\n');

        const prompt = `
            **CONTEXTO:**
            Você é um assistente jurídico especialista em direito civil e educacional no Brasil. Sua tarefa é redigir o rascunho de uma petição inicial para uma ação de cobrança de mensalidades escolares para o escritório "Advocacia Foco".

            **DADOS DO CLIENTE (ESCOLA CREDORA):**
            - Nome: ${school.name}
            - CNPJ: ${school.cnpj}
            - Endereço: ${school.address}

            **DADOS DO DEVEDOR (RESPONSÁVEL FINANCEIRO):**
            - Nome: ${guardian.name}
            - CPF: ${guardian.cpf || 'Não informado'}
            - Endereço: ${guardian.address || 'Não informado'}

            **DADOS DO ALUNO VINCULADO AO CONTRATO:**
            - Nome: ${student.name}

            **DADOS DA DÍVIDA:**
            - Descrição: ${invoice.notes || `Mensalidade escolar referente ao aluno ${student.name}`}
            - Valor Original: ${formatCurrency(invoice.value)}
            - Data de Vencimento: ${formatDate(invoice.dueDate)}
            - Valor Atualizado (com juros e multa): ${formatCurrency(updatedValue)}

            **HISTÓRICO DE TENTATIVAS DE COBRANÇA EXTRAJUDICIAL:**
            ${historySummary}

            **TAREFA:**
            Elabore uma petição inicial de ação de cobrança completa, seguindo a estrutura jurídica adequada (Endereçamento ao Juizado Especial Cível da comarca correspondente, qualificação completa das partes, nome da ação, fatos, fundamentos jurídicos, pedidos e valor da causa). 
            A petição deve ser formal, clara e pronta para ser protocolada após revisão de um advogado. 
            Na seção "DOS FATOS", narre a relação contratual, o inadimplemento e mencione que as tentativas de cobrança amigável restaram infrutíferas, citando o histórico fornecido.
            Nos "PEDIDOS", solicite a citação do réu e a condenação ao pagamento do valor principal atualizado de ${formatCurrency(updatedValue)}, acrescido de juros e correção monetária até a data do efetivo pagamento.
            O valor da causa deve ser o valor atualizado: ${formatCurrency(updatedValue)}.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setGeneratedPetition(response.text);
        } catch (err) {
            console.error("Error generating AI petition:", err);
            setError("Ocorreu um erro ao gerar a petição. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedPetition).then(() => {
            alert('Petição copiada para a área de transferência!');
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
                        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <SparklesIcon className="w-6 h-6 text-primary-500" />
                                <h2 className="text-xl font-bold text-neutral-800">Gerador de Petição com IA</h2>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        
                        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Context Column */}
                            <div className="md:col-span-1 space-y-4">
                               <h3 className="font-semibold text-neutral-700">Contexto do Caso</h3>
                               <div className="text-xs p-3 bg-neutral-50 rounded-lg border space-y-2">
                                   <p><strong>Escola:</strong> {school?.name}</p>
                                   <p><strong>Responsável:</strong> {guardian?.name}</p>
                                   <p><strong>Aluno:</strong> {student?.name}</p>
                                   <p><strong>Dívida:</strong> {formatCurrency(updatedValue)}</p>
                                   <p><strong>Vencimento:</strong> {formatDate(invoice.dueDate)}</p>
                               </div>
                                <Button onClick={handleGeneratePetition} isLoading={isLoading} className="w-full">
                                    {isLoading ? 'Gerando Petição...' : 'Gerar Rascunho com IA'}
                                </Button>
                                {error && <p className="text-sm text-red-600">{error}</p>}
                            </div>

                            {/* Petition Column */}
                            <div className="md:col-span-2">
                                 <label htmlFor="petition" className="block text-sm font-medium text-neutral-700 mb-2">Rascunho da Petição</label>
                                 <textarea 
                                    id="petition" 
                                    readOnly 
                                    value={isLoading ? "Aguarde, a IA está elaborando o documento..." : generatedPetition}
                                    className="w-full h-full min-h-[400px] p-3 border border-neutral-300 rounded-md bg-neutral-50 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
                                 />
                            </div>
                        </div>

                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
                            <Button type="button" onClick={handleCopyToClipboard} disabled={!generatedPetition || isLoading}>Copiar Texto</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PetitionGeneratorModal;
