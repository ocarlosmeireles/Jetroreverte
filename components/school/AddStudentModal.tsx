

import React, { useState, useEffect } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Guardian, Invoice, InvoiceStatus } from '../../types';
import { XIcon, SparklesIcon } from '../common/icons';
import Button from '../common/Button';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    existingGuardians: Guardian[];
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

const initialFormData = {
    // Section 1: Student
    studentName: '',
    studentClass: '',
    studentCode: '',
    // Section 2: Guardian
    guardianType: 'new',
    guardianId: '',
    guardianName: '',
    guardianCpf: '',
    guardianRg: '',
    guardianAddress: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelationship: '',
    // Section 3: Debt
    invoiceDescription: '',
    invoiceValue: '',
    updatedInvoiceValue: '',
    overdueInstallments: '1',
    invoiceDueDate: '',
    lastPaymentDate: '',
    originalPaymentMethod: '',
    schoolContactHistory: '',
};

const AddStudentModal = ({ isOpen, onClose, onSave, existingGuardians }: AddStudentModalProps): React.ReactElement => {
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);
    const [filledByAI, setFilledByAI] = useState<Set<string>>(new Set());


    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...initialFormData,
                guardianId: existingGuardians.length > 0 ? existingGuardians[0].id : '',
            });
            setFilledByAI(new Set());
            setFileSelected(false);
        }
    }, [isOpen, existingGuardians]);

    useEffect(() => {
        if (formData.invoiceValue && formData.invoiceDueDate) {
            // FIX: Added missing 'studentName' property to satisfy the Invoice type for calculation.
            const tempInvoiceForCalc: Invoice = {
                id: '', studentId: '', schoolId: '',
                studentName: '',
                value: parseFloat(formData.invoiceValue),
                dueDate: formData.invoiceDueDate,
                status: InvoiceStatus.VENCIDO, // Assume overdue for calculation purposes
            };

            const { updatedValue, monthsOverdue } = calculateUpdatedInvoiceValues(tempInvoiceForCalc);

            // Update state only if values have changed to prevent re-render loops
            if (String(updatedValue.toFixed(2)) !== formData.updatedInvoiceValue || String(monthsOverdue) !== formData.overdueInstallments) {
                setFormData(prev => ({
                    ...prev,
                    updatedInvoiceValue: String(updatedValue.toFixed(2)),
                    overdueInstallments: String(monthsOverdue),
                }));
            }
        }
    }, [formData.invoiceValue, formData.invoiceDueDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onSave(formData);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleAnalyzeDocument = () => {
        setIsAnalyzing(true);
        setFilledByAI(new Set());

        setTimeout(() => {
            const mockExtractedData = {
                ...initialFormData,
                studentName: 'Juliana Martins (Extraído)',
                studentClass: '8º Ano B',
                studentCode: '2024-00182',
                guardianType: 'new',
                guardianName: 'Ricardo Martins',
                guardianCpf: '333.444.555-66',
                guardianAddress: 'Rua das Palmeiras, 789, Apto 101, São Paulo, SP',
                guardianPhone: '(11) 98765-1234',
                guardianEmail: 'ricardo.martins.demo@email.com',
                guardianRelationship: 'Pai',
                invoiceDescription: 'Mensalidade de Julho/2024',
                invoiceValue: '850.00',
                invoiceDueDate: '2024-07-10',
            };
            setFormData(mockExtractedData);
            setFilledByAI(new Set(Object.keys(mockExtractedData).filter(key => mockExtractedData[key as keyof typeof mockExtractedData])));
            setIsAnalyzing(false);
        }, 2500);
    };
    
    const isFormValid = () => {
        if (!formData.studentName || !formData.studentClass) return false;
        if (formData.guardianType === 'new') {
            if (!formData.guardianName || !formData.guardianCpf || !formData.guardianAddress || !formData.guardianPhone || !formData.guardianEmail) return false;
        } else {
            if (!formData.guardianId) return false;
        }
        if (!formData.invoiceValue || !formData.invoiceDueDate) return false;
        return true;
    };
    
    const FileInput = ({ label, name }: { label: string, name: string }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-neutral-700">{label}</label>
            <div className="mt-1 flex items-center">
                 <input id={name} name={name} type="file" className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
        </div>
    );
    
    // FIX: Wrapped SparklesIcon in a span with a title to fix prop error, and made children optional.
    const AILabel = ({ fieldName, children }: { fieldName: string, children?: React.ReactNode }) => (
        <label className="form-label flex items-center gap-1">
             {filledByAI.has(fieldName) && <span title="Preenchido pela IA"><SparklesIcon className="w-3 h-3 text-primary-500" /></span>}
             {children}
        </label>
    );

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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Cadastrar Aluno Inadimplente</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-8">
                            
                            {/* AI Section */}
                            <section className="p-4 bg-primary-50/50 rounded-lg border-2 border-dashed border-primary-200 text-center">
                                 <div className="flex items-center justify-center gap-2 mb-2">
                                    <SparklesIcon className="w-6 h-6 text-primary-500" />
                                    <h3 className="text-lg font-bold text-primary-800">Preencher com IA</h3>
                                </div>
                                <p className="text-sm text-neutral-600 mb-4">Anexe a ficha cadastral, contrato ou boleto do aluno para preencher o formulário automaticamente.</p>
                                <div className="flex justify-center items-center gap-4">
                                     <input id="ai-file-upload" type="file" className="hidden" onChange={(e) => setFileSelected(e.target.files && e.target.files.length > 0)} />
                                     <label htmlFor="ai-file-upload" className="cursor-pointer bg-white border border-primary-300 text-primary-700 font-semibold py-2 px-4 rounded-full hover:bg-primary-100 transition-colors text-sm">
                                        {fileSelected ? "Arquivo Selecionado" : "Escolher Arquivo"}
                                     </label>
                                    <Button type="button" onClick={handleAnalyzeDocument} isLoading={isAnalyzing} disabled={!fileSelected || isAnalyzing}>
                                        {isAnalyzing ? 'Analisando...' : 'Analisar Documento'}
                                    </Button>
                                </div>
                            </section>

                            {/* 1. Student Info */}
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">1. Identificação do Aluno</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <AILabel fieldName="studentName">Nome completo *</AILabel>
                                        <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <AILabel fieldName="studentClass">Série/Turma *</AILabel>
                                        <input type="text" name="studentClass" id="studentClass" value={formData.studentClass} onChange={handleChange} className="w-full form-input" required />
                                    </div>
                                    <div>
                                        <AILabel fieldName="studentCode">Código ou matrícula interna</AILabel>
                                        <input type="text" name="studentCode" id="studentCode" value={formData.studentCode} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                </div>
                            </section>

                            {/* 2. Guardian Info */}
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">2. Dados do Responsável Financeiro</h3>
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center"><input type="radio" name="guardianType" value="new" checked={formData.guardianType === 'new'} onChange={handleChange} className="form-radio" /><span className="ml-2 text-sm">Novo Responsável</span></label>
                                    <label className="flex items-center"><input type="radio" name="guardianType" value="existing" checked={formData.guardianType === 'existing'} onChange={handleChange} className="form-radio" disabled={existingGuardians.length === 0} /><span className="ml-2 text-sm">Responsável Existente</span></label>
                                </div>
                                <AnimatePresence mode="wait">
                                    {formData.guardianType === 'new' ? (
                                        <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 <div><AILabel fieldName="guardianName">Nome completo *</AILabel><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="w-full form-input" required /></div>
                                                 <div><AILabel fieldName="guardianCpf">CPF *</AILabel><input type="text" name="guardianCpf" value={formData.guardianCpf} onChange={handleChange} className="w-full form-input" required /></div>
                                                 <div><AILabel fieldName="guardianRg">RG (opcional)</AILabel><input type="text" name="guardianRg" value={formData.guardianRg} onChange={handleChange} className="w-full form-input" /></div>
                                                 <div><AILabel fieldName="guardianRelationship">Parentesco</AILabel><input type="text" name="guardianRelationship" placeholder="Pai, Mãe, Tutor, etc." value={formData.guardianRelationship} onChange={handleChange} className="w-full form-input" /></div>
                                            </div>
                                            <div><AILabel fieldName="guardianAddress">Endereço completo *</AILabel><input type="text" name="guardianAddress" value={formData.guardianAddress} onChange={handleChange} className="w-full form-input" required /></div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 <div><AILabel fieldName="guardianPhone">Telefone (Celular) *</AILabel><input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className="w-full form-input" required /></div>
                                                 <div><AILabel fieldName="guardianEmail">E-mail *</AILabel><input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} className="w-full form-input" required /></div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="existing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <label className="form-label">Selecione o responsável</label>
                                            <select name="guardianId" value={formData.guardianId} onChange={handleChange} className="w-full form-input" required>
                                                {existingGuardians.map(g => <option key={g.id} value={g.id}>{g.name} (CPF: {g.cpf})</option>)}
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>
                            
                            {/* 3. Debt Info */}
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">3. Dados Financeiros do Débito</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><AILabel fieldName="invoiceDescription">Mês/Ano ou descrição da dívida</AILabel><input type="text" name="invoiceDescription" placeholder="Ex: Mensalidade de Agosto/2024" value={formData.invoiceDescription} onChange={handleChange} className="w-full form-input" /></div>
                                    <div><AILabel fieldName="invoiceDueDate">Data de Vencimento Original *</AILabel><input type="date" name="invoiceDueDate" value={formData.invoiceDueDate} onChange={handleChange} className="w-full form-input" required /></div>
                                    <div><AILabel fieldName="invoiceValue">Valor Original (R$) *</AILabel><input type="number" step="0.01" name="invoiceValue" value={formData.invoiceValue} onChange={handleChange} className="w-full form-input" required /></div>
                                    <div><AILabel fieldName="updatedInvoiceValue">Valor Atualizado (com juros/multa)</AILabel><input type="number" step="0.01" name="updatedInvoiceValue" value={formData.updatedInvoiceValue} onChange={handleChange} className="w-full form-input" /></div>
                                    <div><AILabel fieldName="overdueInstallments">Nº de parcelas em atraso</AILabel><input type="number" name="overdueInstallments" value={formData.overdueInstallments} onChange={handleChange} className="w-full form-input" /></div>
                                    <div><AILabel fieldName="lastPaymentDate">Data do último pagamento</AILabel><input type="date" name="lastPaymentDate" value={formData.lastPaymentDate} onChange={handleChange} className="w-full form-input" /></div>
                                    <div><AILabel fieldName="originalPaymentMethod">Método de pagamento original</AILabel><input type="text" name="originalPaymentMethod" placeholder="Boleto, Cartão, etc." value={formData.originalPaymentMethod} onChange={handleChange} className="w-full form-input" /></div>
                                </div>
                                <div className="mt-4"><AILabel fieldName="schoolContactHistory">Histórico de contato (feito pela escola)</AILabel><textarea name="schoolContactHistory" rows={3} value={formData.schoolContactHistory} onChange={handleChange} className="w-full form-input" placeholder="Ex: Ligação em 10/07, sem sucesso. E-mail enviado em 12/07." /></div>
                            </section>
                            
                             {/* 4. Documentation */}
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">4. Documentação de Suporte (Opcional)</h3>
                                <div className="space-y-4 bg-neutral-50 p-4 rounded-lg">
                                    <FileInput label="Contrato de prestação de serviços" name="contractFile" />
                                    <FileInput label="Política de cobrança e multa" name="policyFile" />
                                    <FileInput label="Comprovantes dos boletos não pagos" name="unpaidBillsFile" />
                                </div>
                            </section>

                             <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; } .form-radio { color: #4f46e5; } .form-radio:focus { ring: #4f46e5; }`}</style>
                        </form>

                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading} disabled={!isFormValid() || isLoading}>Salvar Cadastro</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddStudentModal;