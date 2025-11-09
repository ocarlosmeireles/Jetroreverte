

import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SparklesIcon, XIcon, EllipsisVerticalIcon, TrashIcon, PencilIcon, UsersIcon, DollarIcon, PlusIcon, MegaphoneIcon, DocumentChartBarIcon, BriefcaseIcon, WrenchScrewdriverIcon, CheckCircleIcon, HeartIcon } from '../../components/common/icons';
import { Lead, LeadStatus, Campaign } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LeadModal from '../../components/law-firm/LeadModal';
import { demoCampaigns, demoSchools } from '../../services/demoData';
import CampaignModal from '../../components/law-firm/CampaignModal';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI, Type } from '@google/genai';


// --- DADOS MOCK ---
const initialLeads: Lead[] = [
    { id: 'lead-1', officeId: 'user-escritorio-01', schoolName: 'Colégio Alfa', contactName: 'Mariana Silva', contactEmail: 'mariana.s@colegioalfa.com', potentialValue: 15000, lastContactDate: '2024-07-28T10:00:00Z', status: LeadStatus.PROSPECT, notes: 'Primeiro contato a ser feito.' },
    { id: 'lead-2', officeId: 'user-escritorio-01', schoolName: 'Escola Beta Gênesis', contactName: 'Roberto Costa', contactEmail: 'roberto@betagenesis.com', potentialValue: 22000, lastContactDate: '2024-07-25T14:00:00Z', status: LeadStatus.INITIAL_CONTACT, notes: 'Enviado email de apresentação.', campaignId: 'camp-02' },
    { id: 'lead-3', officeId: 'user-escritorio-01', schoolName: 'Instituto Delta', contactName: 'Fernanda Lima', contactEmail: 'fernanda.lima@institutodelta.org', potentialValue: 18000, lastContactDate: '2024-07-20T11:00:00Z', status: LeadStatus.NEGOTIATION, notes: 'Reunião agendada para 05/08.', campaignId: 'camp-02' },
    { id: 'lead-4', officeId: 'user-escritorio-01', schoolName: 'Centro Educacional Gama', contactName: 'Carlos Andrade', contactEmail: 'carlos@cegama.edu.br', potentialValue: 25000, lastContactDate: '2024-07-15T09:00:00Z', status: LeadStatus.CLOSED_WON, notes: 'Contrato assinado.', campaignId: 'camp-01' },
    { id: 'lead-5', officeId: 'user-escritorio-01', schoolName: 'Escola Ômega', contactName: 'Juliana Paes', contactEmail: 'juliana@escolaomega.com', potentialValue: 12000, lastContactDate: '2024-07-18T16:00:00Z', status: LeadStatus.CLOSED_LOST, notes: 'Optaram por solução interna.', campaignId: 'camp-01' },
    { id: 'lead-6', officeId: 'user-escritorio-01', schoolName: 'Escola Zeus', contactName: 'Pedro Ramos', contactEmail: 'pedro@zeus.com', potentialValue: 31000, lastContactDate: '2024-08-01T10:00:00Z', status: LeadStatus.PROSPECT, notes: 'Indicação, contato quente.', campaignId: 'camp-02' },
];

// --- NOVOS COMPONENTES DO HUB ---

const MarketingDashboard = ({ leads, campaigns, onNavigate }: { leads: Lead[], campaigns: Campaign[], onNavigate: (view: string) => void }) => {
    const totalLeads = leads.length;
    const potentialValue = leads.filter(l => l.status !== LeadStatus.CLOSED_LOST && l.status !== LeadStatus.CLOSED_WON).reduce((sum, lead) => sum + lead.potentialValue, 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'Ativa').length;
    
    const wonLeads = leads.filter(l => l.status === LeadStatus.CLOSED_WON);
    const lostLeads = leads.filter(l => l.status === LeadStatus.CLOSED_LOST);
    const closedLeadsCount = wonLeads.length + lostLeads.length;
    const conversionRate = closedLeadsCount > 0 ? (wonLeads.length / closedLeadsCount) * 100 : 0;
    
    const recentLeads = [...leads].sort((a,b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime()).slice(0, 4);

    const monthlyLeadsData = React.useMemo(() => {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const leadsByMonth: { [key: string]: number } = {};
        
        leads.forEach(lead => {
            const date = new Date(lead.lastContactDate);
            const monthKey = `${monthNames[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
            leadsByMonth[monthKey] = (leadsByMonth[monthKey] || 0) + 1;
        });

        // Ensure we have entries for the last 6 months even if there are no leads
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
            if (!leadsByMonth[key]) {
                leadsByMonth[key] = 0;
            }
        }

        return Object.entries(leadsByMonth)
            .map(([month, count]) => ({ month, "Novos Leads": count }))
            .sort((a,b) => {
                const [m1, y1] = a.month.split('/');
                const [m2, y2] = b.month.split('/');
                if (y1 !== y2) return parseInt(y1) - parseInt(y2);
                return monthNames.indexOf(m1) - monthNames.indexOf(m2);
            })
            .slice(-6); // Take last 6 months of data
    }, [leads]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Leads Ativos" value={String(totalLeads - closedLeadsCount)} icon={<UsersIcon />} color="primary" delay={0.1} />
                <StatCard title="Valor em Pipeline" value={formatCurrency(potentialValue)} icon={<DollarIcon />} color="secondary" delay={0.2} />
                <StatCard title="Campanhas Ativas" value={String(activeCampaigns)} icon={<MegaphoneIcon />} color="green" delay={0.3} />
                <StatCard title="Taxa de Conversão" value={`${conversionRate.toFixed(1)}%`} icon={<CheckCircleIcon />} color="primary" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Novos Leads por Mês (Últimos 6 meses)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyLeadsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} />
                                <Line type="monotone" dataKey="Novos Leads" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Leads Recentes</h3>
                    <div className="space-y-3">
                        {recentLeads.map(lead => (
                            <div key={lead.id} className="p-3 rounded-lg bg-neutral-50/70 border border-neutral-200/60 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm text-neutral-800">{lead.schoolName}</p>
                                    <p className="text-xs text-neutral-500">{lead.status}</p>
                                </div>
                                <p className="font-bold text-sm text-primary-700">{formatCurrency(lead.potentialValue)}</p>
                            </div>
                        ))}
                         <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => onNavigate('pipeline')}>Ver Pipeline Completo</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

const PersonaCard = ({ data }: { data: any }) => (
    <Card className="mt-6 animate-fade-in">
        <h3 className="text-2xl font-bold text-primary-700">{data.personaName}</h3>
        <p className="text-neutral-600 mt-2 italic">{data.profile}</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-red-700 mb-2">Dores e Desafios</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                    {Array.isArray(data.challenges) && data.challenges.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-green-700 mb-2">Objetivos Principais</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                    {Array.isArray(data.goals) && data.goals.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
            </div>
        </div>
        <div className="mt-6">
            <h4 className="font-semibold text-blue-700 mb-2">Como Nossa Solução Ajuda</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                {Array.isArray(data.howWeHelp) && data.howWeHelp.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
        </div>
         <div className="mt-6">
            <h4 className="font-semibold text-neutral-700 mb-2">Canais de Comunicação Sugeridos</h4>
            <div className="flex gap-2 flex-wrap">
                {Array.isArray(data.communicationChannels) && data.communicationChannels.map((item: string, i: number) => <span key={i} className="text-xs font-medium bg-neutral-200 text-neutral-700 px-2 py-1 rounded-full">{item}</span>)}
            </div>
        </div>
    </Card>
);

const PersonaGenerator = ({ onPersonaGenerated }: { onPersonaGenerated: (persona: any) => void }) => {
    const [description, setDescription] = useState('escolas de ensino médio particulares em São Paulo com alta inadimplência e gestão familiar');
    const [persona, setPersona] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        setError('');
        setPersona(null);

        const prompt = `Aja como um especialista em marketing B2B para o setor educacional. Crie uma persona detalhada para um cliente de um escritório de advocacia que vende uma plataforma de cobrança, baseado na descrição: "${description}". Gere um JSON com: "personaName", "profile" (parágrafo), "challenges" (array de 3 strings), "goals" (array de 3 strings), "howWeHelp" (array de 3 strings), "communicationChannels" (array de 2 strings).`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            personaName: { type: Type.STRING },
                            profile: { type: Type.STRING },
                            challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                            howWeHelp: { type: Type.ARRAY, items: { type: Type.STRING } },
                            communicationChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            });
            const generatedPersona = JSON.parse(response.text);
            setPersona(generatedPersona);
            onPersonaGenerated(generatedPersona);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar persona. Verifique a chave da API e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <UsersIcon className="w-6 h-6 text-primary-500" />
                    <h3 className="text-lg font-semibold text-neutral-800">Gerador de Personas com IA</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-4">Descreva o perfil de escola que você quer atrair para criar uma persona detalhada, guiando sua estratégia de marketing e vendas.</p>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: escolas de ensino fundamental em Curitiba, com dificuldade em negociar com pais..."
                />
                <Button onClick={handleGenerate} isLoading={isLoading} disabled={!description.trim()} className="mt-4 w-full" icon={<SparklesIcon />}>
                    Gerar Persona
                </Button>
            </Card>

            {isLoading && <p className="text-center text-neutral-600">Criando persona, por favor aguarde...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}
            {persona && <PersonaCard data={persona} />}
        </div>
    );
};

// --- FERRAMENTAS DE CONTEÚDO (EXISTENTES, AGRUPADAS) ---

const AiContentGenerator = () => {
    // ... (código existente sem alterações)
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

        const prompt = `Aja como um especialista em marketing para um escritório de advocacia que oferece uma plataforma de cobrança educacional. Crie um(a) "${contentType}" com tom "${tone}", focando na dor: "${painPoint}". O texto deve ser conciso e persuasivo para um diretor de escola.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
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

    const labelClass = "block text-sm font-medium text-neutral-700 mb-1";
    const selectClass = "w-full p-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white";

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Gerador de Conteúdo Rápido</h3>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className={labelClass}>Tipo</label>
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
                        <textarea readOnly value={isLoading ? "Gerando..." : generatedContent} className="w-full h-48 p-3 border rounded-lg bg-neutral-50" />
                        <Button onClick={handleCopy} variant="secondary" size="sm" className="mt-2" disabled={!generatedContent}>Copiar</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ProposalGenerator = () => {
    // ... (código existente sem alterações)
    return (
        <Card>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Gerador de Proposta Comercial</h3>
            <p className="text-sm text-neutral-600 mb-4">Crie um rascunho de proposta para escolas em potencial.</p>
            <Button disabled>Em breve</Button>
        </Card>
    );
};

const ContentTools = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AiContentGenerator />
        <ProposalGenerator />
    </div>
);

// --- PIPELINE DE LEADS (CRM - COM DRAG & DROP) ---
interface LeadCardProps {
    lead: Lead;
    onEdit: (lead: Lead) => void;
    onDelete: (id: string) => void;
}

const LeadCard = ({ lead, onEdit, onDelete }: LeadCardProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <Reorder.Item
            value={lead}
            id={lead.id}
            className="bg-white p-3 rounded-lg border border-neutral-200/80 shadow-sm cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-neutral-800">{lead.schoolName}</h4>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(p => !p)} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100"><EllipsisVerticalIcon className="w-4 h-4" /></button>
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border z-10 text-sm py-1">
                                <button onClick={() => { onEdit(lead); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-neutral-100"><PencilIcon className="w-4 h-4"/> Editar</button>
                                <button onClick={() => { onDelete(lead.id); setMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4"/> Excluir</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1"><UsersIcon className="w-3 h-3"/> {lead.contactName}</p>
            <div className="flex justify-between items-end mt-2 pt-2 border-t">
                <p className="text-xs text-neutral-500">Contato: {formatDate(lead.lastContactDate)}</p>
                <p className="font-bold text-primary-700">{formatCurrency(lead.potentialValue)}</p>
            </div>
        </Reorder.Item>
    );
};

const LeadPipeline = ({ leads, setLeads, campaigns }: { leads: Lead[], setLeads: React.Dispatch<React.SetStateAction<Lead[]>>, campaigns: Campaign[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const columns: { title: LeadStatus, leads: Lead[] }[] = Object.values(LeadStatus).map(status => ({
        title: status,
        leads: leads.filter(lead => lead.status === status),
    }));

    const handleSaveLead = (leadData: Omit<Lead, 'id' | 'status' | 'officeId'>, id?: string) => {
        if (id) {
            // Edit
            setLeads(prev => prev.map(l => l.id === id ? { ...l, ...leadData } : l));
        } else {
            // Create
            const newLead: Lead = {
                id: `lead-${Date.now()}`,
                officeId: 'user-escritorio-01',
                status: LeadStatus.PROSPECT,
                ...leadData,
            };
            setLeads(prev => [newLead, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteLead = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este lead?")) {
            setLeads(prev => prev.filter(l => l.id !== id));
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        setIsDragging(false);
        const point = { x: info.point.x, y: info.point.y };
        const draggedElement = document.getElementById(event.target.id);
        if (!draggedElement) return;

        const leadId = draggedElement.id;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        for (const status of Object.values(LeadStatus)) {
            const columnEl = document.getElementById(`column-${status}`);
            if (columnEl) {
                const rect = columnEl.getBoundingClientRect();
                if (point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom) {
                    if (lead.status !== status) {
                        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status, lastContactDate: new Date().toISOString() } : l));
                    }
                    break;
                }
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-neutral-800">Pipeline de Vendas (CRM)</h3>
                <Button onClick={() => { setEditingLead(null); setIsModalOpen(true); }} size="sm" icon={<PlusIcon />}>Novo Lead</Button>
            </div>
            <div className="flex-grow overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 min-h-full">
                    {columns.map(column => (
                        <div key={column.title} id={`column-${column.title}`} className="w-72 flex-shrink-0 bg-neutral-100/70 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-neutral-700 mb-3 px-1">{column.title} ({column.leads.length})</h4>
                             <Reorder.Group
                                as="div"
                                axis="y"
                                values={column.leads}
                                onReorder={(newOrder) => {
                                    const otherLeads = leads.filter(l => l.status !== column.title);
                                    setLeads([...otherLeads, ...newOrder]);
                                }}
                                className="space-y-3 min-h-[100px]"
                            >
                                {column.leads.map(lead => (
                                    <LeadCard 
                                        key={lead.id} 
                                        lead={lead} 
                                        onEdit={l => { setEditingLead(l); setIsModalOpen(true); }}
                                        onDelete={handleDeleteLead}
                                    />
                                ))}
                            </Reorder.Group>
                        </div>
                    ))}
                </div>
            </div>
            <LeadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveLead}
                lead={editingLead}
                campaigns={campaigns}
            />
        </div>
    );
};

const Campaigns = ({ campaigns, setCampaigns, personas }: { campaigns: Campaign[], setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>, personas: any[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const handleSaveCampaign = (campaignData: any, id?: string) => {
        if (id) { // Edit
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campaignData } : c));
        } else { // Create
            const newCampaign: Campaign = {
                id: `camp-${Date.now()}`,
                officeId: 'user-escritorio-01',
                status: 'Planejada',
                leadsGenerated: 0,
                ...campaignData,
            };
            setCampaigns(prev => [newCampaign, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteCampaign = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
        }
    };
    
    return (
        <div>
            <CampaignsList 
                campaigns={campaigns}
                onAdd={() => { setEditingCampaign(null); setIsModalOpen(true); }}
                onEdit={(c) => { setEditingCampaign(c); setIsModalOpen(true); }}
                onDelete={handleDeleteCampaign}
            />
            <CampaignModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCampaign}
                personas={personas}
                campaign={editingCampaign}
            />
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---

const MarketingHub = (): React.ReactElement => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    // FIX: Changed initial state from boolean to an empty array to fix iterator error.
    const [personas, setPersonas] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            // Simulate fetching data scoped to the user's law firm
            const officeId = 'user-escritorio-01'; // Hardcoded for demo
            setLeads(initialLeads.filter(l => l.officeId === officeId));
            setCampaigns(demoCampaigns.filter(c => c.officeId === officeId));
        }
    }, [user]);

    const handlePersonaGenerated = (newPersona: any) => {
        setPersonas(prev => [...prev, newPersona]);
    };

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: <DocumentChartBarIcon /> },
        { id: 'pipeline', name: 'Pipeline (CRM)', icon: <BriefcaseIcon /> },
        { id: 'campaigns', name: 'Campanhas', icon: <MegaphoneIcon /> },
        { id: 'personas', name: 'Gerador de Personas', icon: <UsersIcon /> },
        { id: 'content', name: 'Ferramentas de Conteúdo', icon: <WrenchScrewdriverIcon /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <MarketingDashboard leads={leads} campaigns={campaigns} onNavigate={setActiveTab} />;
            case 'pipeline':
                return <LeadPipeline leads={leads} setLeads={setLeads} campaigns={campaigns} />;
            case 'campaigns':
                return <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} personas={personas} />;
            case 'personas':
                return <PersonaGenerator onPersonaGenerated={handlePersonaGenerated} />;
            case 'content':
                return <ContentTools />;
            default:
                return <MarketingDashboard leads={leads} campaigns={campaigns} onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b border-neutral-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`
                            }
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow pt-6 min-h-0">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                       {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketingHub;
