


import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { demoJudicialProcesses } from '../../services/demoData';
import { JudicialProcess, JudicialProcessStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { BriefcaseIcon } from '../../components/common/icons';
import ProcessDetailPanel from '../../components/law-firm/ProcessDetailPanel';


const columns: { id: JudicialProcessStatus; title: string }[] = [
    { id: JudicialProcessStatus.PROTOCOLADO, title: 'Protocolado' },
    { id: JudicialProcessStatus.AGUARDANDO_CITACAO, title: 'Aguardando Citação' },
    { id: JudicialProcessStatus.CONTESTACAO, title: 'Contestação' },
    { id: JudicialProcessStatus.SENTENCA, title: 'Sentença' },
    { id: JudicialProcessStatus.RECURSO, title: 'Recurso' },
];

interface ProcessCardProps {
    process: JudicialProcess;
    onClick: () => void;
    // FIX: Add key to props to allow usage in a list map, resolving a TypeScript error.
    key?: React.Key;
}

const ProcessCard = ({ process, onClick }: ProcessCardProps) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm mb-3 cursor-pointer hover:bg-neutral-50/70 transition-colors"
    >
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                 <BriefcaseIcon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-neutral-800">{process.studentName}</h4>
                <p className="text-xs text-neutral-500">{process.schoolName}</p>
                <p className="text-xs text-neutral-400 font-mono mt-1">{process.processNumber}</p>
                <p className="text-xs text-neutral-500 mt-2">Última att: {formatDate(process.lastUpdate)}</p>
            </div>
        </div>
    </motion.div>
);

const JudicialProcessDashboard = (): React.ReactElement => {
    const { user } = useAuth();
    const [selectedProcess, setSelectedProcess] = useState<JudicialProcess | null>(null);
    
    const processes = useMemo(() => {
        if (!user) return [];
        return demoJudicialProcesses.filter(p => p.officeId === user.id);
    }, [user]);

    return (
        <div className="flex h-full">
            <div className="flex-1 flex overflow-x-auto py-4 space-x-4">
                {columns.map(column => {
                    const columnProcesses = processes.filter(p => p.status === column.id);
                    return (
                        <div key={column.id} className="w-72 md:w-80 flex-shrink-0">
                            <h4 className="font-semibold text-sm text-neutral-700 mb-3 px-2 flex justify-between items-center">
                                <span>{column.title}</span>
                                <span className="text-xs text-neutral-400 bg-neutral-200/70 rounded-full px-2 py-0.5">{columnProcesses.length}</span>
                            </h4>
                            <div className="space-y-2 h-full bg-neutral-100/60 p-2 rounded-lg min-h-[200px]">
                                <AnimatePresence>
                                    {columnProcesses.map(process => (
                                        <ProcessCard key={process.id} process={process} onClick={() => setSelectedProcess(process)} />
                                    ))}
                                </AnimatePresence>
                                 {columnProcesses.length === 0 && <div className="text-center pt-10 text-xs text-neutral-400">Nenhum processo nesta fase.</div>}
                            </div>
                        </div>
                    )
                })}
            </div>

            <AnimatePresence>
                {selectedProcess && (
                    // FIX: Renamed `process` prop to `judicialProcess` to avoid variable shadowing in the child component.
                    <ProcessDetailPanel
                        judicialProcess={selectedProcess}
                        onClose={() => setSelectedProcess(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default JudicialProcessDashboard;