


import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './components/auth/Login';
import LawFirmDashboard from './pages/dashboards/LawFirmDashboard';
import SchoolDashboard from './pages/dashboards/SchoolDashboard';
import GuardianDashboard from './pages/dashboards/GuardianDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import { UserRole } from './types';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = (): React.ReactElement => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Main />
      </ErrorBoundary>
    </AuthProvider>
  );
};

// This component now just renders the Login page as firebase-based flows are removed.
const AuthFlow = (): React.ReactElement => {
    return <Login />;
};

const DashboardRouter = (): React.ReactElement => {
    const { user } = useAuth();

    if (!user) {
        return <div>Usuário não encontrado.</div>;
    }

    switch (user.role) {
        case UserRole.ESCRITORIO:
            return <LawFirmDashboard />;
        case UserRole.ESCOLA:
            return <SchoolDashboard />;
        case UserRole.RESPONSAVEL:
            return <GuardianDashboard />;
        case UserRole.SUPER_ADMIN:
            return <SuperAdminDashboard />;
        default:
            // Could also redirect to login or show an error page
            return <div>Dashboard não disponível para este perfil.</div>;
    }
}


const Main = (): React.ReactElement => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-100 text-neutral-800">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-16 h-16 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"
                />
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 text-lg text-neutral-600"
                >
                    Carregando...
                </motion.p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {!user ? (
                <AuthFlow />
            ) : (
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="w-full h-full"
                >
                    <DashboardRouter />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default App;
