
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
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

interface DetailViewState {
    type: 'school' | 'invoice' | 'petition' | null;
    id: string | null;
}

const LawFirmDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('dashboard');
    const [detailView, setDetailView] = useState<DetailViewState>({ type: null, id: null });
    
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
        setActivePage('escolas');
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

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboardContent />;
            case 'escolas':
                return <SchoolsList onSelectSchool={handleSelectSchool} selectedSchoolId={detailView.type === 'school' ? detailView.id : null} />;
            case 'negociacoes':
                return <NegotiationsDashboard />;
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
                return <SchoolDetail schoolId={detailView.id} onBack={handleCloseDetail} />;
            case 'invoice':
                return <LawFirmInvoiceDetail invoiceId={detailView.id} onBack={handleCloseDetail} />;
            case 'petition':
                return <PetitionDetail petitionId={detailView.id} onBack={handleCloseDetail} />;
            default:
                return null;
        }
    };
    
    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            pageTitle={pageTitle}
        >
             <motion.div layout className="flex-1 flex overflow-hidden">
                <div className={`flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 ${detailView.id ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
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
                <AnimatePresence>
                {detailView.id && (
                     <motion.div
                        key={detailView.id}
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0 bg-white border-l border-neutral-200/80 overflow-y-auto"
                    >
                         {renderDetailContent()}
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
};

export default LawFirmDashboard;