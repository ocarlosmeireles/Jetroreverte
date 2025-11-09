


import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { demoPetitions, demoInvoices, demoSchools } from '../../services/demoData';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import { DocumentPlusIcon, DocumentReportIcon, SparklesIcon, XIcon, CheckCircleIcon } from '../../components/common/icons';
import { Petition } from '../../types';
import Button from '../../components/common/Button';
import { generatePetitionPdf } from '../../utils/pdfGenerator';
// FIX: Import 'Card' component to resolve 'Cannot find name' error.
import Card from '../../components/common/Card';

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const PetitionEditorModal = ({ petition, onClose, user }: { petition: Petition; onClose: () => void; user: any }) => {
    const [content, setContent] = useState(petition.content);
    const [isSaved, setIsSaved] = useState(false);
    const [driveSaveMessage, setDriveSaveMessage] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    const handleSave = () => {
        // In a real app, this would save to the database.
        const petitionIndex = demoPetitions.findIndex(p => p.id === petition.id);
        if (petitionIndex > -1) {
            demoPetitions[petitionIndex].content = content;
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleExport = () => {
        if (user && petition) {
            const petitionToExport: Petition = { ...petition, content };
            generatePetitionPdf(petitionToExport, user);
            if (localStorage.getItem('driveConnected') === 'true') {
                setDriveSaveMessage('Cópia salva no Google Drive!');
                setTimeout(() => setDriveSaveMessage(''), 4000);
            }
        }
    };
    
    const handleRefine = async (refinementType: string) => {
        setIsRefining(true);
        const prompt = `Aja como um advogado sênior revisando um documento. O texto a seguir é uma petição. ${refinementType} o texto a seguir, mantendo a estrutura e o contexto jurídico:\n\n---\n${content}\n---`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setContent(response.text);
        } catch (error) {
            console.error("Error refining text:", error);
            alert("Ocorreu um erro ao refinar o texto.");
        } finally {
            setIsRefining(false);
        }
    };

    const refinementOptions = [
        { label: 'Tornar mais formal', prompt: 'Reescreva o texto em um tom mais formal e tradicionalmente jurídico' },
        { label: 'Tornar mais assertivo', prompt: 'Reescreva o texto com um tom mais assertivo e incisivo' },
        { label: 'Simplificar linguagem', prompt: 'Reescreva o texto usando uma linguagem mais simples e direta, evitando jargões jurídicos excessivos' },
    ];

    return (
        <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="bg-neutral-100 rounded-2xl shadow-2xl w-full h-full flex flex-col"
                variants={modalVariants}
            >
                <header className="p-4 border-b border-neutral-200/80 flex justify-between items-center flex-shrink-0 bg-white/50 backdrop-blur-xl rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-800">Editor de Petição</h2>
                        <p className="text-sm text-neutral-500">Caso: {petition.studentName} vs. {petition.guardianName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-200/60">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0">
                    {/* Editor */}
                    <div className="flex-1 flex flex-col">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full p-6 border border-neutral-300/80 rounded-xl shadow-inner focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white resize-none text-sm font-mono leading-relaxed"
                        />
                    </div>

                    {/* AI Tools */}
                    <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-4">
                        <div className="p-4 border border-neutral-200/80 rounded-xl bg-white h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-5 h-5 text-primary-500" />
                                <h3 className="font-semibold text-neutral-800">Refinar com IA</h3>
                            </div>
                            <div className="space-y-2">
                                {refinementOptions.map(opt => (
                                     <Button key={opt.label} variant="secondary" className="w-full !justify-start" onClick={() => handleRefine(opt.prompt)} isLoading={isRefining}>
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                            {isRefining && <p className="text-xs text-center mt-2 text-neutral-500 animate-pulse">A IA está reescrevendo o texto...</p>}
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-neutral-200/80 flex-shrink-0 bg-white/50 backdrop-blur-xl rounded-b-2xl flex items-center justify-end gap-3">
                    <AnimatePresence>
                        {isSaved && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-sm text-green-600"><CheckCircleIcon className="w-4 h-4" /> Salvo</motion.div>}
                        {driveSaveMessage && <p className="text-sm text-green-600">{driveSaveMessage}</p>}
                    </AnimatePresence>
                    <div className="flex-grow"></div>
                    <Button variant="secondary" onClick={handleSave}>Salvar Alterações</Button>
                    <Button onClick={handleExport} icon={<DocumentReportIcon className="w-5 h-5" />}>Exportar PDF</Button>
                </footer>
            </motion.div>
        </motion.div>
    );
};


const PetitionList = (): React.ReactElement => {
    const { user } = useAuth();
    const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
    
    const petitions = useMemo(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) return [];

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));

        return demoPetitions.filter(p => {
            const invoice = demoInvoices.find(i => i.id === p.invoiceId);
            return invoice && officeSchoolIds.has(invoice.schoolId);
        });
    }, [user]);

    const getStatusChip = (status: 'draft' | 'filed') => {
        const styles = {
            draft: 'bg-yellow-100 text-yellow-800',
            filed: 'bg-green-100 text-green-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status === 'draft' ? 'Rascunho' : 'Protocolado'}</span>;
    };

    if (!user) return <p>Usuário não encontrado.</p>;

    return (
        <>
            {petitions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {petitions.map((petition, index) => (
                        <motion.div
                            key={petition.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                           <Card noPadding className="h-full flex flex-col">
                                <button 
                                    onClick={() => setSelectedPetition(petition)}
                                    className="w-full text-left p-4 flex-grow hover:bg-neutral-50 rounded-t-xl"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-neutral-800">{petition.studentName}</h3>
                                        {getStatusChip(petition.status)}
                                    </div>
                                    <p className="text-sm text-neutral-600">{petition.schoolName}</p>
                                    <p className="text-xs text-neutral-400 mt-2">Gerado em: {formatDate(petition.generatedAt)}</p>
                                </button>
                                <div className="p-3 border-t bg-neutral-50/50 rounded-b-xl">
                                    <Button size="sm" variant="secondary" className="w-full" onClick={() => setSelectedPetition(petition)}>
                                        Visualizar e Editar
                                    </Button>
                                </div>
                           </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <DocumentPlusIcon className="w-12 h-12 mx-auto text-neutral-300" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-700">Nenhuma petição gerada</h3>
                    <p className="mt-1 text-sm text-neutral-500">Gere petições automaticamente na tela de 'Gestão de Cobranças' para casos em preparação judicial.</p>
                </Card>
            )}

            <AnimatePresence>
                {selectedPetition && user && (
                    <PetitionEditorModal
                        petition={selectedPetition}
                        onClose={() => setSelectedPetition(null)}
                        user={user}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default PetitionList;