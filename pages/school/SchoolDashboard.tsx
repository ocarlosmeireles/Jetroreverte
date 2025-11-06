import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import SchoolDashboardContent from '../school/SchoolDashboardContent';
import StudentsList from '../school/StudentsList';
import InvoicesList from '../school/InvoicesList';
import GuardiansList from '../school/GuardiansList';
import PagePlaceholder from '../common/PagePlaceholder';
import { DocumentReportIcon } from '../../components/common/icons';
import AppLayout from '../../components/layout/AppLayout';
import StudentDetail from './StudentDetail';
import GuardianDetail from './GuardianDetail';
import InvoiceDetail from './InvoiceDetail';


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
    const pageTitle = navItems.find(p => p.path === activePage)?.name || 'Dashboard';

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
                // FIX: Pass onSelectGuardian prop to GuardiansList.
                 return <GuardiansList onSelectGuardian={handleSelectGuardian} />;
            case 'cobrancas':
                 if (invoiceViewState.view === 'detail' && invoiceViewState.id) {
                    return <InvoiceDetail 
                        invoiceId={invoiceViewState.id} 
                        onBack={() => setInvoiceViewState({ view: 'list', id: null })}
                    />;
                 }
                // FIX: Pass onSelectInvoice prop to InvoicesList.
                 return <InvoicesList onSelectInvoice={handleSelectInvoice} />;
            case 'relatorios':
                 return <PagePlaceholder 
                             icon={<DocumentReportIcon className="w-16 h-16 text-primary-300" />}
                             title="Relatórios da Escola"
                             message="Visualize inadimplência, valores recuperados e outros insights importantes para a gestão da sua escola. Em breve!"
                         />;
            default:
                return <SchoolDashboardContent onSelectStudent={handleSelectStudent} />;
        }
    };

    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            pageTitle={pageTitle}
        >
            {/* FIX: Wrapped content in a div to provide consistent padding and scrolling. */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage + (studentViewState.id || '') + (guardianViewState.id || '') + (invoiceViewState.id || '')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default SchoolDashboard;