import React, { useState, useRef, useEffect, ReactNode } from 'react';
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
// FIX: Imported 'GoogleGenAI' and 'Type' to resolve 'Cannot find name' errors.
import { GoogleGenAI, Type } from '@google/genai';


// --- DADOS MOCK ---
const initialLeads: Lead[] = [
    { id: 'lead-1', officeId: 'user-escritorio-01', schoolName: 'Colégio Alfa', contactName: 'Mariana Silva', contactEmail: 'mariana.s@colegioalfa.com', potentialValue: 15000, lastContactDate: '2024-07-28T10:00:00Z', status: LeadStatus.PROSPECT, notes: 'Primeiro contato a ser feito.' },
    { id: 'lead-2', officeId: 'user-escritorio-01', schoolName: 'Escola Beta Gênesis', contactName: 'Roberto Costa', contactEmail: 'roberto@betagenesis.com', potentialValue: 22000, lastContactDate: '2024-07-25T14:00:00Z', status: LeadStatus.INITIAL_CONTACT, notes: 'Enviado email de apresentação.' },
    { id: 'lead-3', officeId: 'user-escritorio-01', schoolName: 'Instituto Delta', contactName: 'Fernanda Lima', contactEmail: 'fernanda.lima@institutodelta.org', potentialValue: 18000, lastContactDate: '2024-07-20T11:00:00Z', status: LeadStatus.NEGOTIATION, notes: 'Reunião agendada para 05/08.' },
    { id: 'lead-4', officeId: 'user-escritorio-01', schoolName: 'Centro Educacional Gama', contactName: 'Carlos Andrade', contactEmail: 'carlos@cegama.edu.br', potentialValue: 25000, lastContactDate: '2024-07-15T09:00:00Z', status: LeadStatus.CLOSED_WON, notes: 'Contrato assinado.' },
    { id: 'lead-5', officeId: 'user-escritorio-01', schoolName: 'Escola Ômega', contactName: 'Juliana Paes', contactEmail: 'juliana@escolaomega.com', potentialValue: 12000, lastContactDate: '2024-07-18T16:00:00Z', status: LeadStatus.CLOSED_LOST, notes: 'Optaram por solução interna.' },
    { id: 'lead-6', officeId: 'user-escritorio-01', schoolName: 'Escola Zeus', contactName: 'Pedro Ramos', contactEmail: 'pedro@zeus.com', potentialValue: 31000, lastContactDate: '2024-08-01T10:00:00Z', status: LeadStatus.PROSPECT, notes: 'Indicação, contato quente.' },
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
                                <Line type="monotone" dataKey="Novos Leads" stroke="#2A5D8A" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
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
// FIX: Added an optional `key` prop to the props interface to resolve a TypeScript error when mapping over a list of components.
interface LeadCardProps {
    lead: Lead;
    onEdit: (lead: Lead) => void;
    onDelete: (id: string) => void;
    key?: React.Key;
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

const LeadPipeline = ({ leads, setLeads }: { leads: Lead[], setLeads: React.Dispatch<React.SetStateAction<Lead[]>>}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const { user } = useAuth();
    
    const columns = Object.values(LeadStatus);

    const handleSaveLead = (leadData: Omit<Lead, 'id' | 'status' | 'officeId'>, id?: string) => {
        if (!user) return;
        if (id) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, ...leadData } : l));
        } else {
            const newLead: Lead = { id: `lead-${Date.now()}`, officeId: user.id, ...leadData, status: LeadStatus.PROSPECT };
            setLeads(prev => [newLead, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleEditLead = (lead: Lead) => { setEditingLead(lead); setIsModalOpen(true); };
    const handleDeleteLead = (id: string) => { if (window.confirm('Excluir este lead?')) setLeads(prev => prev.filter(l => l.id !== id)); };
    
    const handleDragEnd = (status: LeadStatus, newLeadsInColumn: Lead[]) => {
        const otherLeads = leads.filter(l => l.status !== status);
        const updatedLeadsInColumn = newLeadsInColumn.map(l => ({ ...l, status }));
        setLeads([...otherLeads, ...updatedLeadsInColumn]);
    };

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center border-b">
                    <h3 className="text-lg font-semibold text-neutral-800">Pipeline de Leads (CRM)</h3>
                    <Button onClick={() => { setEditingLead(null); setIsModalOpen(true); }} size="sm" icon={<PlusIcon />}>Novo Lead</Button>
                </div>
                <div className="flex overflow-x-auto p-4 space-x-4 bg-neutral-50/70">
                    {columns.map(status => {
                        const colLeads = leads.filter(l => l.status === status);
                        const totalValue = colLeads.reduce((sum, l) => sum + l.potentialValue, 0);
                        return (
                            <div key={status} className="w-72 flex-shrink-0">
                                <div className="font-semibold text-sm text-neutral-700 mb-3 px-2 flex justify-between items-center">
                                    <span>{status}</span>
                                    <span className="text-xs text-neutral-400 bg-neutral-200/70 rounded-full px-2 py-0.5">{colLeads.length}</span>
                                </div>
                                <Reorder.Group
                                    axis="y"
                                    values={colLeads}
                                    onReorder={(newOrder) => handleDragEnd(status, newOrder)}
                                    className="p-2 rounded-lg bg-neutral-100/80 min-h-[300px] space-y-2"
                                >
                                    <div className="text-center py-1 mb-2 border-b border-dashed">
                                        <p className="text-xs text-neutral-500">Valor Potencial</p>
                                        <p className="font-bold text-primary-800">{formatCurrency(totalValue)}</p>
                                    </div>
                                    {colLeads.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} onEdit={handleEditLead} onDelete={handleDeleteLead} />
                                    ))}
                                </Reorder.Group>
                            </div>
                        );
                    })}
                </div>
            </Card>
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLead} lead={editingLead} />
        </>
    );
};

// --- CAMPANHAS (COM INTEGRAÇÃO DE PERSONA) ---
const CampaignsDashboard = ({ campaigns, setCampaigns, personas }: { campaigns: Campaign[], setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>, personas: any[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const { user } = useAuth();
    
    const getStatusChip = (status: Campaign['status']) => {
        const styles = { 'Ativa': 'bg-green-100 text-green-700', 'Concluída': 'bg-blue-100 text-blue-700', 'Planejada': 'bg-yellow-100 text-yellow-700' };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    const handleSaveCampaign = (data: Omit<Campaign, 'id' | 'status' | 'leadsGenerated' | 'officeId' | 'conversionRate' | 'valueGenerated'>, id?: string) => {
        if (!user) return;
        if (id) {
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
        } else {
            const newCampaign: Campaign = { id: `camp-${Date.now()}`, officeId: user.id, ...data, status: 'Planejada', leadsGenerated: 0 };
            setCampaigns(prev => [newCampaign, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteCampaign = (id: string) => { if (window.confirm('Excluir esta campanha?')) setCampaigns(prev => prev.filter(c => c.id !== id)); };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-neutral-800">Campanhas de Marketing</h3>
                <Button onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }} size="sm" icon={<PlusIcon />}>Nova Campanha</Button>
            </div>
            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="flex flex-col h-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-neutral-800">{c.name}</h4>
                                        <p className="text-xs text-neutral-500 mt-1">Início: {formatDate(c.startDate)}</p>
                                    </div>
                                    {getStatusChip(c.status)}
                                </div>
                                <p className="text-sm text-neutral-600 mt-3 flex-grow">
                                    <strong>Alvo:</strong> {(c as any).personaName || c.target}
                                </p>
                                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                                    <div><p className="text-xs text-neutral-500">Leads</p><p className="font-bold text-lg">{c.leadsGenerated}</p></div>
                                    <div><p className="text-xs text-neutral-500">Conversão</p><p className="font-bold text-lg">{c.conversionRate?.toFixed(1) ?? 0}%</p></div>
                                    <div><p className="text-xs text-neutral-500">Valor</p><p className="font-bold text-lg text-green-700">{formatCurrency(c.valueGenerated ?? 0)}</p></div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                                    <Button size="sm" variant="secondary" icon={<PencilIcon className="w-4 h-4"/>} onClick={() => { setEditingCampaign(c); setIsModalOpen(true); }}>Editar</Button>
                                    <Button size="sm" variant="secondary" icon={<TrashIcon className="w-4 h-4"/>} onClick={() => handleDeleteCampaign(c.id)} className="!text-red-600 hover:!bg-red-50">Excluir</Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg"><p className="text-neutral-500">Nenhuma campanha cadastrada.</p><Button onClick={() => setIsModalOpen(true)} className="mt-4">Criar Primeira Campanha</Button></div>
            )}
             <CampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCampaign} personas={personas} campaign={editingCampaign} />
        </>
    );
};

// --- NOVO MÓDULO: SUCESSO DO CLIENTE ---
const ClientSuccessDashboard = () => {
    const { user } = useAuth();
    const schools = demoSchools.filter(s => s.officeId === user?.id);
    const [suggestions, setSuggestions] = useState<Record<string, string>>({});
    const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

    const handleGenerateSuggestion = async (school: any) => {
        setLoadingSuggestion(school.id);
        const prompt = `Aja como um consultor de Customer Success para um escritório de advocacia. A escola cliente "${school.name}" tem um Health Score de ${school.healthScore}/100. Com base nesse score, gere uma sugestão de ação de engajamento concisa e acionável. Se o score for baixo (< 50), sugira uma ação de retenção (ex: reunião de alinhamento). Se for médio (50-75), uma ação de otimização (ex: apresentar novo recurso). Se for alto (> 75), uma ação de expansão (ex: pedir depoimento, sugerir upsell).`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSuggestions(prev => ({ ...prev, [school.id]: response.text }));
        } catch (err) {
            console.error(err);
            setSuggestions(prev => ({ ...prev, [school.id]: 'Erro ao gerar sugestão.' }));
        } finally {
            setLoadingSuggestion(null);
        }
    };

    const getHealthColor = (score: number) => {
        if (score > 75) return 'text-green-600';
        if (score > 40) return 'text-yellow-600';
        return 'text-red-600';
    }

    return (
        <Card>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Saúde dos Clientes</h3>
            <div className="space-y-4">
                {schools.map(school => (
                    <div key={school.id} className="p-4 border rounded-lg bg-neutral-50/70">
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <h4 className="font-bold text-neutral-800">{school.name}</h4>
                            <div className="text-right mt-2 sm:mt-0">
                                <p className={`text-2xl font-bold ${getHealthColor(school.healthScore!)}`}>{school.healthScore}<span className="text-lg text-neutral-400">/100</span></p>
                                <p className="text-xs text-neutral-500">Health Score (IA)</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            {suggestions[school.id] ? (
                                <p className="text-sm italic text-primary-700">"{suggestions[school.id]}"</p>
                            ) : (
                                <Button size="sm" variant="secondary" icon={<SparklesIcon />} onClick={() => handleGenerateSuggestion(school)} isLoading={loadingSuggestion === school.id}>
                                    Gerar Sugestão de Engajamento
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};


// --- COMPONENTE PRINCIPAL DO HUB ---

const MarketingHub = (): React.ReactElement => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [leads, setLeads] = useState<Lead[]>(() => initialLeads.filter(l => l.officeId === user?.id));
    const [campaigns, setCampaigns] = useState<Campaign[]>(() => demoCampaigns.filter(c => c.officeId === user?.id));
    const [personas, setPersonas] = useState<any[]>([]);
    
    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <DocumentChartBarIcon className="w-5 h-5" /> },
        { id: 'pipeline', name: 'Pipeline (CRM)', icon: <BriefcaseIcon className="w-5 h-5" /> },
        { id: 'campaigns', name: 'Campanhas', icon: <MegaphoneIcon className="w-5 h-5" /> },
        { id: 'personas', name: 'Personas (IA)', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'success', name: 'Sucesso do Cliente', icon: <HeartIcon className="w-5 h-5" /> },
        { id: 'tools', name: 'Ferramentas', icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch(activeView) {
            case 'dashboard': return <MarketingDashboard leads={leads} campaigns={campaigns} onNavigate={setActiveView} />;
            case 'pipeline': return <LeadPipeline leads={leads} setLeads={setLeads} />;
            case 'campaigns': return <CampaignsDashboard campaigns={campaigns} setCampaigns={setCampaigns} personas={personas} />;
            case 'personas': return <PersonaGenerator onPersonaGenerated={(p) => setPersonas(prev => [...prev, p])}/>;
            case 'success': return <ClientSuccessDashboard />;
            case 'tools': return <ContentTools />;
            default: return null;
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <nav className="w-full lg:w-64 flex-shrink-0">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Menu de Marketing</h2>
                <ul className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible -mx-4 px-4 lg:mx-0 lg:px-0 space-x-1.5 lg:space-x-0 lg:space-y-1.5 pb-2 lg:pb-0">
                    {navItems.map(item => (
                        <li key={item.id} className="flex-shrink-0">
                            <button
                                onClick={() => setActiveView(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    activeView === item.id 
                                    ? 'bg-primary-50 text-primary-700 font-semibold' 
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeView} 
                        initial={{ y: 10, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: -10, opacity: 0 }} 
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketingHub;