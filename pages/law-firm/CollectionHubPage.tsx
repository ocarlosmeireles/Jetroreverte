
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CollectionWorkspace from './CollectionWorkspace';
import DebtorsRegistry from './DebtorsRegistry';
import { NegotiationCase } from '../../types';
import DossierModal from '../../components/law-firm/DossierModal';

type View = 'workspace' | 'registry';

const CollectionHubPage = () => {
    const [activeView, setActiveView] = useState<View>('workspace');
    const [selectedCase, setSelectedCase] = useState<NegotiationCase | null>(null);

    const tabs: { id: View, name: string }[] = [
        { id: 'workspace', name: 'Workspace IA' },
        { id: 'registry', name: 'Cadastro Geral' },
    ];
    
    const handleUpdateCase = (updatedCase: NegotiationCase) => {
        // This is a mock update for the demo. A real app would have a centralized state.
        if (selectedCase && selectedCase.invoice.id === updatedCase.invoice.id) {
            setSelectedCase(updatedCase);
        }
    };


    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-shrink-0 border-b border-neutral-200">
                <div className="flex space-x-8">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            className={`relative py-4 px-1 text-sm font-medium transition-colors ${
                                activeView === tab.id ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            {tab.name}
                            {activeView === tab.id && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                                    layoutId="underline"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-grow min-h-0 pt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeView === 'workspace' ? <CollectionWorkspace onOpenDossier={setSelectedCase} /> : <DebtorsRegistry onOpenDossier={setSelectedCase} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedCase && (
                    <DossierModal
                        caseData={selectedCase}
                        onClose={() => setSelectedCase(null)}
                        onUpdateCase={handleUpdateCase}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollectionHubPage;
