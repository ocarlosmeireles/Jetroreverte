

import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { demoSchools, demoStudents, demoInvoices } from '../../services/demoData';
import { InvoiceStatus, School, CollectionRuler, CollectionStep } from '../../types';
import Button from '../../components/common/Button';
import { XIcon, DollarIcon, UsersIcon, BillingIcon, SparklesIcon, DocumentReportIcon, TrashIcon, WrenchScrewdriverIcon, WhatsAppIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon, DocumentTextIcon } from '../../components/common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import SchoolReportModal from '../../components/law-firm/SchoolReportModal';
import { useAuth } from '../../hooks/useAuth';
import { calculateUpdatedInvoiceValues } from '../../utils/calculations';
import Card from '../../components/common/Card';

interface SchoolDetailProps {
    schoolId: string;
    onBack: () => void;
    onDelete: (schoolId: string) => void;
    onSelectInvoice: (invoiceId: string) => void;
}

const HealthScoreCircle = ({ score }: { score: number | undefined }) => {
    if (score === undefined) return null;
  
    const circumference = 2 * Math.PI * 42; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;
    const color = score > 75 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';
  
    return (
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-neutral-200/70"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <motion.circle
            className={color}
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{
                strokeDasharray: circumference,
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%'
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neutral-800">{score}</span>
          <span className="text-xs text-neutral-500 -mt-1">/ 100</span>
        </div>
      </div>
    );
};

const channelIcons: Record<string, ReactNode> = {
    'WhatsApp': <WhatsAppIcon className="w-5 h-5 text-green-500" />,
    'Email': <EnvelopeIcon className="w-5 h-5 text-blue-500" />,
    'Ligação': <PhoneIcon className="w-5 h-5 text-red-500" />,
    'SMS': <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-500" />,
    'Petição': <DocumentTextIcon className="w-5 h-5 text-neutral-600" />,
};

const RulerColumn = ({ title, steps, color }: { title: string; steps: CollectionStep[]; color: string }) => (
    <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/70 h-full">
        <h4 className={`text-md font-bold text-center mb-6 ${color}`}>{title}</h4>
        <div className="relative pl-6">
             <div className="absolute top-2 bottom-2 left-3 w-1 bg-neutral-200 rounded-full" />
             {steps.sort((a, b) => a.day - b.day).map(step => (
                <div key={step.day} className="relative mb-6 pl-4">
                     <div className="absolute -left-[1.3rem] top-1.5 w-6 h-6 bg-white border-2 border-neutral-300 rounded-full z-10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full"/>
                     </div>
                    <p className="text-xs font-bold text-neutral-500 -mt-1">DIA {step.day}</p>
                    <div className="flex items-start gap-2 mt-1">
                        <span className="flex-shrink-0 pt-0.5">{channelIcons[step.channel] || <div className="w-5 h-5"/>}</span>
                        <p className="text-sm text-neutral-700">{step.action}</p>
                    </div>
                </div>
             ))}
        </div>
    </div>
);


const SchoolDetail = ({ schoolId, onBack, onDelete, onSelectInvoice }: SchoolDetailProps): React.ReactElement => {
    const { user } = useAuth();
    const initialSchool = demoSchools.find(s => s.id === schoolId);
    
    const [schoolData, setSchoolData] = useState<School | undefined>(initialSchool);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isGeneratingRuler, setIsGeneratingRuler] = useState(false);
    const [rulerError, setRulerError] = useState('');
    const [isSavingRuler, setIsSavingRuler] = useState(false);
    
    if (!schoolData) {
        return (
            <div className="p-6">
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <p>Escola não encontrada.</p>
                    <Button onClick={onBack} className="mt-4">Fechar</Button>
                </div>
            </div>
        );
    }
    
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));

    const studentsInSchool = demoStudents.filter(s => s.schoolId === schoolId);
    const studentIdsInSchool = studentsInSchool.map(s => s.id);
    const invoicesForSchool = demoInvoices.filter(i => studentIdsInSchool.includes(i.studentId));

    const totalRecovered = invoicesForSchool
        .filter(i => i.status === InvoiceStatus.PAGO)
        .reduce((acc, i) => acc + i.value, 0);
        
    const totalCommission = totalRecovered * (commissionPercentage / 100);

    const getStatusChip = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAGO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">Recuperado</span>;
            case InvoiceStatus.PENDENTE: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">Em Cobrança</span>;
            case InvoiceStatus.VENCIDO: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">Vencido</span>;
        }
    };

    const handleGenerateRuler = async () => {
        setIsGeneratingRuler(true);
        setRulerError('');
    
        const prompt = `Aja como um especialista em automação de cobrança para o setor educacional. Crie uma "régua de cobrança" personalizada para o '${schoolData.name}'. A régua deve ter 3 níveis de risco: 'lowRisk', 'mediumRisk', e 'highRisk'. O processo de cobrança interno atual da escola é: "${schoolData.internalCollectionProcess || 'Não informado'}". Para cada nível de risco, defina uma série de etapas de contato. Cada etapa deve ser um objeto com 'day' (número de dias após o vencimento), 'action' (descrição da ação, ex: 'Lembrete amigável'), e 'channel' (pode ser 'WhatsApp', 'Email', 'Ligação', ou 'SMS'). Crie entre 3 a 5 etapas para cada nível de risco. A régua para 'highRisk' deve ser mais agressiva e rápida que a 'lowRisk'. O resultado deve ser um objeto JSON válido.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                lowRisk: {
                    type: Type.ARRAY,
                    description: "Etapas para devedores de baixo risco (risk score < 40).",
                    items: {
                        type: Type.OBJECT,
                        properties: { day: { type: Type.NUMBER }, action: { type: Type.STRING }, channel: { type: Type.STRING } },
                        required: ["day", "action", "channel"]
                    }
                },
                mediumRisk: {
                    type: Type.ARRAY,
                    description: "Etapas para devedores de risco médio (risk score 40-75).",
                    items: {
                        type: Type.OBJECT,
                        properties: { day: { type: Type.NUMBER }, action: { type: Type.STRING }, channel: { type: Type.STRING } },
                        required: ["day", "action", "channel"]
                    }
                },
                highRisk: {
                    type: Type.ARRAY,
                    description: "Etapas para devedores de alto risco (risk score > 75).",
                    items: {
                        type: Type.OBJECT,
                        properties: { day: { type: Type.NUMBER }, action: { type: Type.STRING }, channel: { type: Type.STRING } },
                        required: ["day", "action", "channel"]
                    }
                }
            },
            required: ["lowRisk", "mediumRisk", "highRisk"]
        };

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema: schema }
            });

            const ruler = JSON.parse(response.text) as CollectionRuler;
            setSchoolData(prev => prev ? { ...prev, collectionRuler: ruler } : undefined);
        } catch (e) {
            console.error(e);
            setRulerError('Não foi possível gerar a régua de cobrança. Verifique as configurações e tente novamente.');
        } finally {
            setIsGeneratingRuler(false);
        }
    };

    const handleSaveRuler = () => {
        setIsSavingRuler(true);
        setTimeout(() => {
            setIsSavingRuler(false);
            alert('Régua de cobrança salva e ativada para esta escola!');
        }, 1000);
    };


    return (
        <>
            <div className="px-4 sm:px-6 pb-6 flex-1 flex flex-col min-h-0">
                <header className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-xl font-bold text-neutral-800">{schoolData.name}</h2>
                        <p className="text-sm text-neutral-500">{schoolData.cnpj}</p>
                    </div>
                    <button onClick={onBack} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-100">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    <div className="p-4 bg-gradient-to-br from-primary-50/50 to-white rounded-xl border border-primary-200/50 flex items-center gap-4">
                        <HealthScoreCircle score={schoolData.healthScore} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-primary-500" />
                                <h3 className="text-md font-bold text-primary-800">Análise de IA</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1 italic">"{schoolData.healthSummary || 'Análise indisponível.'}"</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-200/80 rounded-lg p-3 text-center">
                            <p className="text-xs font-medium text-green-700">Total Recuperado</p>
                            <p className="text-lg font-bold text-green-800 mt-1">{formatCurrency(totalRecovered)}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200/80 rounded-lg p-3 text-center">
                            <p className="text-xs font-medium text-blue-700">Comissão Gerada</p>
                            <p className="text-lg font-bold text-blue-800 mt-1">{formatCurrency(totalCommission)}</p>
                        </div>
                    </div>
                    
                    <Card>
                        <h3 className="text-lg font-bold text-neutral-800">Detalhes da Escola</h3>
                        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div className="sm:col-span-2"><dt className="font-semibold text-neutral-600">Endereço</dt><dd className="text-neutral-800">{schoolData.address}</dd></div>
                            <div><dt className="font-semibold text-neutral-600">Telefone</dt><dd className="text-neutral-800">{schoolData.phone}</dd></div>
                            <div><dt className="font-semibold text-neutral-600">Total de Alunos</dt><dd className="text-neutral-800">{schoolData.totalStudents}</dd></div>
                            <div className="sm:col-span-2 pt-2 mt-2 border-t"><dt className="font-semibold text-neutral-600">Contato Financeiro</dt><dd className="text-neutral-800">{schoolData.financialContactName} ({schoolData.financialContactEmail})</dd></div>
                            <div className="sm:col-span-2"><dt className="font-semibold text-neutral-600">Representante Legal</dt><dd className="text-neutral-800">{schoolData.legalRepresentativeName} (CPF: {schoolData.legalRepresentativeCpf})</dd></div>
                            <div className="sm:col-span-2 pt-2 mt-2 border-t"><dt className="font-semibold text-neutral-600">Processo Interno de Cobrança</dt><dd className="text-neutral-800 italic">"{schoolData.internalCollectionProcess || 'Não informado'}"</dd></div>
                        </dl>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-primary-500" />
                            <h3 className="text-lg font-bold text-neutral-800">Régua de Cobrança Personalizada</h3>
                        </div>

                        {isGeneratingRuler ? (
                            <div className="text-center p-8">
                                <SparklesIcon className="w-10 h-10 text-primary-400 mx-auto animate-pulse" />
                                <p className="mt-3 text-neutral-600">Criando uma estratégia de cobrança otimizada...</p>
                            </div>
                        ) : rulerError ? (
                            <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
                                <p>{rulerError}</p>
                                <Button onClick={handleGenerateRuler} size="sm" variant="secondary" className="mt-3">Tentar Novamente</Button>
                            </div>
                        ) : schoolData.collectionRuler ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <RulerColumn title="Baixo Risco" steps={schoolData.collectionRuler.lowRisk} color="text-green-600" />
                                    <RulerColumn title="Médio Risco" steps={schoolData.collectionRuler.mediumRisk} color="text-yellow-600" />
                                    <RulerColumn title="Alto Risco" steps={schoolData.collectionRuler.highRisk} color="text-red-600" />
                                </div>
                                <div className="flex justify-end items-center gap-3 pt-4 border-t">
                                    <Button onClick={handleGenerateRuler} variant="secondary">Gerar Novamente</Button>
                                    <Button onClick={handleSaveRuler} isLoading={isSavingRuler}>Salvar e Ativar</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-neutral-50/70 rounded-lg border-2 border-dashed">
                                <p className="text-sm text-neutral-600 mb-4">Esta escola ainda não possui uma régua de cobrança personalizada. Utilize a IA para criar uma estratégia otimizada.</p>
                                <Button onClick={handleGenerateRuler} icon={<SparklesIcon />} isLoading={isGeneratingRuler}>
                                    Gerar Régua com IA
                                </Button>
                            </div>
                        )}
                    </Card>

                    <div className="mb-6">
                        <Button onClick={() => setIsReportModalOpen(true)} className="w-full" variant="secondary" icon={<DocumentReportIcon className="w-5 h-5"/>}>
                            Gerar Relatório para Escola
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden border border-neutral-200/80 rounded-xl">
                        <div className="p-4 border-b border-neutral-200/80">
                            <h3 className="text-base font-semibold text-neutral-800">Histórico de Cobranças ({invoicesForSchool.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {invoicesForSchool.length > 0 ? (
                                <table className="min-w-full">
                                    <thead className="bg-neutral-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 bg-white">
                                        {invoicesForSchool.map(invoice => {
                                            const { updatedValue: displayValue } = calculateUpdatedInvoiceValues(invoice);
                                            return (
                                                <tr key={invoice.id} onClick={() => onSelectInvoice(invoice.id)} className="hover:bg-primary-50/50 transition-colors cursor-pointer">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-neutral-900">{invoice.studentName}</div>
                                                        <div className="text-xs text-neutral-500">Vence em: {formatDate(invoice.dueDate)}</div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">{formatCurrency(displayValue)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-12 text-center text-neutral-500">
                                    Nenhuma cobrança encontrada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="mt-auto pt-6 border-t border-neutral-200/80">
                    <Button
                        onClick={() => onDelete(schoolData.id)}
                        variant="secondary"
                        className="w-full !text-red-600 hover:!bg-red-50 hover:!border-red-200"
                        icon={<TrashIcon className="w-5 h-5" />}
                    >
                        Excluir Escola
                    </Button>
                </div>
            </div>
            {user && (
                 <SchoolReportModal 
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    school={schoolData}
                    user={user}
                />
            )}
        </>
    );
};

export default SchoolDetail;