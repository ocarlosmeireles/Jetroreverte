
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import SchoolDashboardContent from '../school/SchoolDashboardContent';
import StudentsList from '../school/StudentsList';
import GuardiansList from '../school/GuardiansList';
import AppLayout from '../../components/layout/AppLayout';
import StudentDetail from '../school/StudentDetail';
import GuardianDetail from '../school/GuardianDetail';
import SchoolReports from '../school/SchoolReports';
import InvoicesList from '../school/InvoicesList';
import InvoiceDetail from '../school/InvoiceDetail';
import SchoolBillingPage from '../school/SchoolBillingPage';


interface ViewState {
    view: 'list' | 'detail';
    id: string | null;
}

const SchoolDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('dashboard');
    const [studentViewState, setStudentViewState] = useState<ViewState>({ view: 'list', id: null });
    const [guardianViewState, setGuardianViewState] = useState<ViewState>({ view: 'list', id: null });
    const [invoiceViewState, setInvoiceViewState] = useState<ViewState>({ view: 'list', id: null });
    
    const navItems = NAVIGATION[UserRole.ESCOLA];
    
    // Determine the title based on the view state to show "Detalhes do Aluno", etc.
    let pageTitle = navItems.find(p => p.path === activePage)?.name || 'Dashboard';
    if (activePage === 'alunos' && studentViewState.view === 'detail') pageTitle = 'Detalhes do Aluno';
    if (activePage === 'responsaveis' && guardianViewState.view === 'detail') pageTitle = 'Detalhes do Responsável';
    if (activePage === 'cobrancas' && invoiceViewState.view === 'detail') pageTitle = 'Detalhes da Cobrança';


    const handleSetActivePage = (page: string) => {
        setStudentViewState({ view: 'list', id: null });
        setGuardianViewState({ view: 'list', id: null });
        setInvoiceViewState({ view: 'list', id: null });
        setActivePage(page);
    }

    const handleSelectStudent = (studentId: string) => {
        setActivePage('alunos');
        setStudentViewState({ view: 'detail', id: studentId });
    };

    const handleSelectGuardian = (guardianId: string) => {
        setActivePage('responsaveis');
        setGuardianViewState({ view: 'detail', id: guardianId });
    };

    const handleSelectInvoice = (invoiceId: string) => {
        setActivePage('cobrancas');
        setInvoiceViewState({ view: 'detail', id: invoiceId });
    };

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <SchoolDashboardContent onSelectStudent={handleSelectStudent} />;
            case 'alunos':
                 if (studentViewState.view === 'detail' && studentViewState.id) {
                    return <StudentDetail 
                        studentId={studentViewState.id} 
                        onBack={() => setStudentViewState({ view: 'list', id: null })} 
                    />;
                }
                return <StudentsList onSelectStudent={handleSelectStudent} />;
            case 'responsaveis':
                 if (guardianViewState.view === 'detail' && guardianViewState.id) {
                    return <GuardianDetail 
                        guardianId={guardianViewState.id} 
                        onBack={() => setGuardianViewState({ view: 'list', id: null })}
                        onSelectStudent={handleSelectStudent}
                    />;
                 }
                 return <GuardiansList onSelectGuardian={handleSelectGuardian} />;
            case 'cobrancas':
                 if (invoiceViewState.view === 'detail' && invoiceViewState.id) {
                    return <InvoiceDetail 
                        invoiceId={invoiceViewState.id} 
                        onBack={() => setInvoiceViewState({ view: 'list', id: null })}
                    />;
                 }
                 return <InvoicesList onSelectInvoice={handleSelectInvoice} />;
            case 'relatorios':
                 return <SchoolReports />;
            case 'plano':
                 return <SchoolBillingPage />;
            default:
                return <SchoolDashboardContent onSelectStudent={handleSelectStudent} />;
        }
    };
    
    const animationKey = activePage + (studentViewState.id || '') + (guardianViewState.id || '') + (invoiceViewState.id || '');

    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            pageTitle={pageTitle}
        >
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animationKey}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6 sm:mb-8">{pageTitle}</h1>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default SchoolDashboard;
