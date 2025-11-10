import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import LandingPage from './pages/public/LandingPage';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import LawFirmDashboard from './pages/dashboards/LawFirmDashboard';
import SchoolDashboard from './pages/dashboards/SchoolDashboard';
import GuardianDashboard from './pages/dashboards/GuardianDashboard';
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

const Main = (): React.ReactElement => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-neutral-100 text-neutral-800">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
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

    const renderDashboard = () => {
        if (!user) return null;
        switch (user.role) {
            case UserRole.SUPER_ADMIN:
                return <SuperAdminDashboard />;
            case UserRole.ESCRITORIO:
                return <LawFirmDashboard />;
            case UserRole.ESCOLA:
                return <SchoolDashboard />;
            case UserRole.RESPONSAVEL:
                return <GuardianDashboard />;
            default:
                return <LandingPage />;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!user ? (
                <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <LandingPage />
                </motion.div>
            ) : (
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="w-full h-full"
                >
                    {renderDashboard()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default App;