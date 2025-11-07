

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, XIcon, EllipsisVerticalIcon, TrashIcon, PencilIcon, UsersIcon, EnvelopeIcon, DollarIcon, PlusIcon, MegaphoneIcon } from '../../components/common/icons';
import { Lead, LeadStatus, Campaign } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LeadModal from '../../components/law-firm/LeadModal';
import { demoCampaigns } from '../../services/demoData';
import CampaignModal from '../../components/law-firm/CampaignModal';

const AiContentGenerator = () => {
    const [contentType, setContentType] = useState('Email de Prospecção');
    const [painPoint, setPainPoint] = useState('Inadimplência alta');
    const [tone, setTone] = useState('Profissional');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedContent('');

        const prompt = `
            Aja como um especialista em marketing para um escritório de advocacia que oferece uma plataforma de cobrança educacional.
            Sua tarefa é criar um(a) "${contentType}" com um tom "${tone}".
            O texto deve focar em resolver a seguinte dor da escola cliente: "${painPoint}".
            O objetivo é captar o interesse do diretor ou gestor financeiro da escola, mostrando como nossa solução pode ajudá-los.
            O texto deve ser conciso, profissional e persuasivo.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setGeneratedContent(response.text);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar conteúdo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        alert('Conteúdo copiado!');
    };

    const formRowClass = "grid grid-cols-1 sm:grid-cols-3 gap-4 items-end";
    const labelClass = "block text-sm font-medium text-neutral-700 mb-1";
    const selectClass = "w-full p-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white";

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Gerador de Conteúdo com IA</h3>
            </div>
            <div className="space-y-4">
                <div className={formRowClass}>
                    <div>
                        <label className={labelClass}>Tipo de Conteúdo</label>
                        <select className={selectClass} value={contentType} onChange={e => setContentType(e.target.value)}>
                            <option>Email de Prospecção</option>
                            <option>Post para LinkedIn</option>
                            <option>Script de Ligação</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Ponto de Dor</label>
                        <select className={selectClass} value={painPoint} onChange={e => setPainPoint(e.target.value)}>
                            <option>Inadimplência alta</option>
                            <option>Equipe sobrecarregada</option>
                            <option>Relacionamento com pais</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Tom</label>
                        <select className={selectClass} value={tone} onChange={e => setTone(e.target.value)}>
                            <option>Profissional</option>
                            <option>Urgente</option>
                            <option>Educativo</option>
                        </select>
                    </div>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">Gerar Conteúdo</Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {(isLoading || generatedContent) && (
                     <div className="mt-4">
                        <textarea
                            readOnly
                            value={isLoading ? "Gerando, por favor aguarde..." : generatedContent}
                            className="w-full h-48 p-3 border border-neutral-200 rounded-lg bg-neutral-50"
                        />
                        <Button onClick={handleCopy} variant="secondary" size="sm" className="mt-2" disabled={!generatedContent}>Copiar Texto</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ProposalGenerator = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        setProposal('');

        const prompt = `
            Elabore um modelo de proposta comercial detalhada para o "Escritório de Advocacia Jetro Reverte", que oferece uma plataforma de software para gestão e recuperação de créditos educacionais para escolas particulares.

            A proposta deve conter as seguintes seções bem definidas:
            1.  **Introdução:** Apresente o escritório e o propósito da proposta.
            2.  **O Desafio da Inadimplência Escolar:** Descreva as dores que as escolas enfrentam (impacto no fluxo de caixa, desgaste da equipe, dano no relacionamento com os pais).
            3.  **Nossa Solução: A Plataforma Jetro Reverte:** Apresente a solução como uma combinação de tecnologia (software) e expertise jurídica. Destaque os benefícios: automação, centralização, portal para os pais, e redução da inadimplência.
            4.  **Como Funciona:** Um passo a passo simples (Ex: Cadastro da escola > Importação de débitos > Automação da cobrança > Ação jurídica como último recurso).
            5.  **Planos e Investimento:** Crie dois planos fictícios, "Plano Essencial" e "Plano Pro", com preços e features diferentes. Inclua também a comissão sobre o valor recuperado.
            6.  **Próximos Passos:** Indique como a escola pode contratar o serviço.
        `;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setProposal(response.text);
        } catch (err) {
            console.error(err);
            setProposal('Erro ao gerar proposta. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Gerador de Proposta Comercial</h3>
                <p className="text-sm text-neutral-600 mb-4">Crie um rascunho completo de uma proposta comercial para enviar a escolas em potencial.</p>
                <Button onClick={handleGenerate}>Gerar Proposta com IA</Button>
            </Card>
            <AnimatePresence>
                {isModalOpen && <ProposalModal proposal={proposal} isLoading={isLoading} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

const ProposalModal = ({ proposal, isLoading, onClose }: { proposal: string, isLoading: boolean, onClose: () => void }) => {
    
    const handleCopy = () => {
        navigator.clipboard.writeText(proposal);
        alert('Proposta copiada!');
    };

    return (
         <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Rascunho da Proposta Comercial</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100"><XIcon /></button>
                </header>
                <div className="overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center">Carregando...</div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm font-sans bg-neutral-50 p-4 rounded-lg border">{proposal}</pre>
                    )}
                </div>
                <footer className="p-6 border-t bg-neutral-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                    <Button onClick={handleCopy} disabled={isLoading}>Copiar Texto</Button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

// --- New Lead Pipeline ---

const initialLeads: Lead[] = [
    { id: 'lead-1', schoolName: 'Colégio Alfa', contactName: 'Mariana Silva', contactEmail: 'mariana.s@colegioalfa.com', potentialValue: 1500, lastContactDate: '2024-07-28T10:00:00Z', status: LeadStatus.PROSPECT, notes: 'Primeiro contato a ser feito.' },
    { id: 'lead-2', schoolName: 'Escola Beta Gênesis', contactName: 'Roberto Costa', contactEmail: 'roberto@betagenesis.com', potentialValue: 2000, lastContactDate: '2024-07-25T14:00:00Z', status: LeadStatus.INITIAL_CONTACT, notes: 'Enviado email de apresentação.' },
    { id: 'lead-3', schoolName: 'Instituto Delta', contactName: 'Fernanda Lima', contactEmail: 'fernanda.lima@institutodelta.org', potentialValue: 1800, lastContactDate: '2024-07-20T11:00:00Z', status: LeadStatus.NEGOTIATION, notes: 'Reunião agendada para 05/08.' },
    { id: 'lead-4', schoolName: 'Centro Educacional Gama', contactName: 'Carlos Andrade', contactEmail: 'carlos@cegama.edu.br', potentialValue: 2500, lastContactDate: '2024-07-15T09:00:00Z', status: LeadStatus.CLOSED_WON, notes: 'Contrato assinado.' },
    { id: 'lead-5', schoolName: 'Escola Ômega', contactName: 'Juliana Paes', contactEmail: 'juliana@escolaomega.com', potentialValue: 1200, lastContactDate: '2024-07-18T16:00:00Z', status: LeadStatus.CLOSED_LOST, notes: 'Optaram por solução interna.' },
];

interface LeadCardProps {
    key?: React.Key;
    lead: Lead;
    onMove: (id: string, status: LeadStatus) => void;
    onEdit: (lead: Lead) => void;
    onDelete: (id: string) => void;
}

const LeadCard = ({ lead, onMove, onEdit, onDelete }: LeadCardProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-white p-3 rounded-lg border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-neutral-800">{lead.schoolName}</h4>
                <div className="relative">
                    <button onClick={() => setMenuOpen(prev => !prev)} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div ref={menuRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border z-10 text-sm">
                                <p className="px-3 py-2 text-xs text-neutral-400 border-b">Mover para</p>
                                {Object.values(LeadStatus).map(status => (
                                    <button key={status} onClick={() => { onMove(lead.id, status); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-neutral-100 disabled:text-neutral-300 disabled:cursor-not-allowed" disabled={lead.status === status}>{status}</button>
                                ))}
                                <div className="border-t my-1"></div>
                                <button onClick={() => { onEdit(lead); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-neutral-100"><PencilIcon className="w-4 h-4"/> Editar</button>
                                <button onClick={() => { onDelete(lead.id); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4"/> Excluir</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><UsersIcon className="w-3 h-3"/> {lead.contactName}</p>
            <div className="flex justify-between items-end mt-2">
                <p className="text-xs text-neutral-500">Último contato: <br/>{formatDate(lead.lastContactDate)}</p>
                <p className="font-bold text-primary-700">{formatCurrency(lead.potentialValue)}</p>
            </div>
        </motion.div>
    );
};

const LeadPipeline = () => {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const columns: { status: LeadStatus; title: string; color: string }[] = [
        { status: LeadStatus.PROSPECT, title: 'Prospect', color: 'bg-gray-200' },
        { status: LeadStatus.INITIAL_CONTACT, title: 'Contato Inicial', color: 'bg-blue-200' },
        { status: LeadStatus.NEGOTIATION, title: 'Negociação', color: 'bg-yellow-200' },
        { status: LeadStatus.CLOSED_WON, title: 'Fechado (Ganho)', color: 'bg-green-200' },
        { status: LeadStatus.CLOSED_LOST, title: 'Fechado (Perdido)', color: 'bg-red-200' },
    ];
    
    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };
    
    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };
    
    const handleDeleteLead = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir este lead?')) {
            setLeads(prev => prev.filter(lead => lead.id !== id));
        }
    };
    
    const handleMoveLead = (id: string, newStatus: LeadStatus) => {
        setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus, lastContactDate: new Date().toISOString() } : lead));
    };

    const handleSaveLead = (leadData: Omit<Lead, 'id' | 'status'>, id?: string) => {
        if (id) { // Editing
            setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...leadData } : lead));
        } else { // Creating
            const newLead: Lead = {
                id: `lead-${Date.now()}`,
                ...leadData,
                status: LeadStatus.PROSPECT
            };
            setLeads(prev => [newLead, ...prev]);
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-800">Pipeline de Leads</h3>
                    <Button onClick={handleAddLead} size="sm" icon={<PlusIcon />}>Adicionar Lead</Button>
                </div>
                <div className="flex overflow-x-auto p-4 space-x-4 bg-neutral-50/70">
                    {columns.map(column => {
                        const columnLeads = leads.filter(lead => lead.status === column.status);
                        return (
                            <div key={column.status} className="w-64 flex-shrink-0">
                                <h4 className="flex items-center gap-2 font-semibold text-sm text-neutral-700 mb-3 px-2">
                                    <span className={`w-2 h-2 rounded-full ${column.color}`}></span>
                                    {column.title}
                                    <span className="text-xs text-neutral-400 bg-neutral-200 rounded-full px-1.5 py-0.5">{columnLeads.length}</span>
                                </h4>
                                <div className="space-y-2 h-full">
                                    <AnimatePresence>
                                        {columnLeads.map(lead => (
                                            <LeadCard key={lead.id} lead={lead} onMove={handleMoveLead} onEdit={handleEditLead} onDelete={handleDeleteLead} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
             <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveLead}
                lead={editingLead}
            />
        </>
    );
};

const CampaignsSection = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

    const getStatusChip = (status: Campaign['status']) => {
        const styles = {
            'Ativa': 'bg-green-100 text-green-700',
            'Concluída': 'bg-blue-100 text-blue-700',
            'Planejada': 'bg-yellow-100 text-yellow-700'
        }
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    const handleSaveCampaign = (campaignData: Omit<Campaign, 'id' | 'status' | 'leadsGenerated'>) => {
        const newCampaign: Campaign = {
            id: `camp-${Date.now()}`,
            ...campaignData,
            status: 'Planejada',
            leadsGenerated: 0,
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        setIsCampaignModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-neutral-800">Campanhas de Marketing</h3>
                    <Button size="sm" icon={<PlusIcon />} onClick={() => setIsCampaignModalOpen(true)}>Nova Campanha</Button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campanha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Público-Alvo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Leads Gerados</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {campaigns.map(campaign => (
                                <tr key={campaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{campaign.name}</div>
                                        <div className="text-sm text-neutral-500">Início: {formatDate(campaign.startDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(campaign.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{campaign.target}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-800">{campaign.leadsGenerated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AiContentGenerator />
                <ProposalGenerator />
            </div>

            <CampaignModal 
                isOpen={isCampaignModalOpen}
                onClose={() => setIsCampaignModalOpen(false)}
                onSave={handleSaveCampaign}
            />
        </div>
    );
};


const MarketingHub = (): React.ReactElement => {
    const [activeTab, setActiveTab] = useState('pipeline');
    
    const tabs = [
        { id: 'pipeline', name: 'Pipeline de Leads' },
        { id: 'campaigns', name: 'Ferramentas & Campanhas' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <div className="border-b border-neutral-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'pipeline' && <LeadPipeline />}
                    {activeTab === 'campaigns' && <CampaignsSection />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default MarketingHub;
