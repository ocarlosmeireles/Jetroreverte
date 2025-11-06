import React, { useState, useEffect } from 'react';
import { demoPetitions } from '../../services/demoData';
import { Petition, User } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { XIcon, DocumentReportIcon } from '../../components/common/icons';
import { generatePetitionPdf } from '../../utils/pdfGenerator';
import { useAuth } from '../../hooks/useAuth';

interface PetitionDetailProps {
    petitionId: string;
    onBack: () => void;
}

const PetitionDetail = ({ petitionId, onBack }: PetitionDetailProps): React.ReactElement => {
    const { user } = useAuth();
    const petitionData = demoPetitions.find(p => p.id === petitionId);
    
    const [petition, setPetition] = useState<Petition | null>(petitionData || null);
    const [content, setContent] = useState(petitionData?.content || '');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const foundPetition = demoPetitions.find(p => p.id === petitionId);
        setPetition(foundPetition || null);
        setContent(foundPetition?.content || '');
    }, [petitionId]);

    if (!petition) {
        return (
            <div className="p-6">
                <Card><p>Petição não encontrada.</p></Card>
            </div>
        );
    }
    
    const handleSave = () => {
        // In a real app, this would save to the database.
        // Here we just update the local state for demo purposes.
        console.log("Saving changes for petition:", petition.id);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleExport = () => {
        if (user) {
            // Create a temporary petition object with the latest content
            const petitionToExport: Petition = { ...petition, content };
            generatePetitionPdf(petitionToExport, user);
        } else {
            alert("Não foi possível exportar: dados do usuário não encontrados.");
        }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-neutral-100">
            <header className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-neutral-800">Editar Petição</h2>
                    <p className="text-sm text-neutral-500">Caso: {petition.studentName}</p>
                </div>
                <button onClick={onBack} className="p-2 -mr-2 rounded-full text-neutral-500 hover:bg-neutral-200">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 flex flex-col min-h-0">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 p-4 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition bg-white resize-none"
                    placeholder="Conteúdo da petição..."
                />
            </div>

            <footer className="mt-6 flex items-center justify-end gap-3">
                {isSaved && <p className="text-sm text-green-600 animate-fade-in">Alterações salvas!</p>}
                <Button variant="secondary" onClick={handleSave}>Salvar Alterações</Button>
                <Button onClick={handleExport} icon={<DocumentReportIcon className="w-5 h-5" />}>
                    Exportar PDF
                </Button>
            </footer>
        </div>
    );
};

export default PetitionDetail;
