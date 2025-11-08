

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole, School } from '../../types';
import AdminDashboardContent from '../admin/AdminDashboardContent';
import SchoolsList from '../law-firm/SchoolsList';
import AppLayout from '../../components/layout/AppLayout';
import SchoolDetail from '../law-firm/SchoolDetail';
import SettingsPage from '../law-firm/SettingsPage';
import NegotiationsDashboard from '../law-firm/NegotiationsDashboard';
import ConsolidatedReports from '../law-firm/ConsolidatedReports';
import LawFirmInvoicesList from '../law-firm/InvoicesList';
import LawFirmInvoiceDetail from '../law-firm/InvoiceDetail';
import CombinedFinancials from '../law-firm/CombinedFinancials';
import PetitionList from '../law-firm/PetitionList';
import PetitionDetail from '../law-firm/PetitionDetail';
import MarketingHub from '../law-firm/MarketingHub';
import JudicialProcessDashboard from '../law-firm/JudicialProcessDashboard';
import { demoSchools } from '../../services/demoData';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';
import LiveNegotiation from '../law-firm/LiveNegotiation';


interface DetailViewState {
    type: 'school' | 'invoice' | 'petition' | null;
    id: string | null;
}

const LawFirmDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [detailView, setDetailView] = useState<DetailViewState>({ type: null, id: null });
    const [schools, setSchools] = useState<School[]>(() => {
        if (user?.email === DEMO_USERS.ESCRITORIO.email) {
            // Make sure to filter based on the correct user ID for the demo
            return demoSchools.filter(school => school.officeId === 'user-escritorio-01');
        }
        return [];
    });
    
    const navItems = NAVIGATION[UserRole.ESCRITORIO];
    
    let pageTitle = navItems.find(p => p.path === activePage)?.name || 'Dashboard';
    if (detailView.id) {
        if (detailView.type === 'school') pageTitle = 'Detalhes da Escola';
        if (detailView.type === 'invoice') pageTitle = 'Detalhes da Cobrança';
        if (detailView.type === 'petition') pageTitle = 'Detalhes da Petição';
    }

    const handleSetActivePage = (page: string) => {
        setDetailView({ type: null, id: null });
        setActivePage(page);
    };

    const handleSelectSchool = (schoolId: string) => {
        setDetailView({ type: 'school', id: schoolId });
    };

    const handleSelectInvoice = (invoiceId: string) => {
        setActivePage('cobrancas');
        setDetailView({ type: 'invoice', id: invoiceId });
    };

    const handleSelectPetition = (petitionId: string) => {
        setActivePage('peticoes');
        setDetailView({ type: 'petition', id: petitionId });
    };

    const handleCloseDetail = () => {
        setDetailView({ type: null, id: null });
    };

    const handleDeleteSchool = (schoolId: string) => {
        if (window.confirm("Tem certeza de que deseja excluir esta escola? Todos os dados relacionados (alunos, cobranças) também serão removidos. Esta ação não pode ser desfeita.")) {
            setSchools(prevSchools => prevSchools.filter(s => s.id !== schoolId));
            handleCloseDetail(); // Close the panel after deletion
        }
    };


    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboardContent />;
            case 'escolas':
                return <SchoolsList schools={schools} onSelectSchool={handleSelectSchool} selectedSchoolId={detailView.type === 'school' ? detailView.id : null} />;
            case 'negociacoes':
                return <NegotiationsDashboard />;
            case 'live-negociacao':
                return <LiveNegotiation />;
            case 'cobrancas':
                 return <LawFirmInvoicesList onSelectInvoice={handleSelectInvoice} selectedInvoiceId={detailView.type === 'invoice' ? detailView.id : null} />;
            case 'peticoes':
                return <PetitionList onSelectPetition={handleSelectPetition} selectedPetitionId={detailView.type === 'petition' ? detailView.id : null} />;
            case 'processos':
                return <JudicialProcessDashboard />;
            case 'marketing':
                return <MarketingHub />;
            case 'financeiro':
                return <CombinedFinancials onSelectSchool={handleSelectSchool} />;
            case 'relatorios':
                return <ConsolidatedReports />;
            case 'configuracoes':
                return <SettingsPage />;
            default:
                return <AdminDashboardContent />;
        }
    };

    const renderDetailContent = () => {
        if (!detailView.id) return null;
        switch (detailView.type) {
            case 'school':
                return <SchoolDetail schoolId={detailView.id} onBack={handleCloseDetail} onDelete={handleDeleteSchool} />;
            case 'invoice':
                return <LawFirmInvoiceDetail invoiceId={detailView.id} onBack={handleCloseDetail} />;
            case 'petition':
                return <PetitionDetail petitionId={detailView.id} onBack={handleCloseDetail} />;
            default:
                return null;
        }
    };
    
    const pageKey = activePage;
    const transition = { type: 'spring', stiffness: 500, damping: 35, mass: 0.8 };

    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            pageTitle={pageTitle}
        >
             <div className="relative flex-1 flex flex-col overflow-hidden">
                <motion.div
                    animate={{ 
                        scale: detailView.id ? 0.95 : 1,
                        borderRadius: detailView.id ? '1.5rem' : '0rem'
                    }}
                    transition={transition}
                    className="flex-1 flex flex-col overflow-hidden bg-neutral-50 will-change-transform origin-center"
                >
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pageKey}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="w-full"
                            >
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6 sm:mb-8">{pageTitle}</h1>
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {detailView.id && (
                        <div className="absolute inset-0 z-30">
                            {/* Backdrop */}
                            <motion.div
                                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={handleCloseDetail}
                            />
                            {/* Modal Container */}
                            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                                <motion.div
                                    key={detailView.id}
                                    layout
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={transition}
                                    className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                                >
                                    {renderDetailContent()}
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default LawFirmDashboard;