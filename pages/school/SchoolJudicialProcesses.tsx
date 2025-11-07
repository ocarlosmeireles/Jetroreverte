import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { demoJudicialProcesses, demoInvoices, demoPetitions } from '../../services/demoData';
import { JudicialProcessStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';

const SchoolJudicialProcesses = (): React.ReactElement => {
    const { user } = useAuth();

    const judicialProcesses = useMemo(() => {
        if (!user?.schoolId) return [];
        
        const schoolInvoices = demoInvoices.filter(i => i.schoolId === user.schoolId);
        const schoolInvoiceIds = new Set(schoolInvoices.map(i => i.id));
        
        const schoolPetitionIds = new Set(demoPetitions
            .filter(p => schoolInvoiceIds.has(p.invoiceId))
            .map(p => p.id)
        );

        return demoJudicialProcesses.filter(p => schoolPetitionIds.has(p.petitionId));
    }, [user]);
    
    const getStatusChip = (status: JudicialProcessStatus) => {
        const styles: { [key in JudicialProcessStatus]: string } = {
            [JudicialProcessStatus.PROTOCOLADO]: 'bg-blue-100 text-blue-700',
            [JudicialProcessStatus.AGUARDANDO_CITACAO]: 'bg-yellow-100 text-yellow-700',
            [JudicialProcessStatus.CONTESTACAO]: 'bg-orange-100 text-orange-700',
            [JudicialProcessStatus.SENTENCA]: 'bg-green-100 text-green-700',
            [JudicialProcessStatus.RECURSO]: 'bg-purple-100 text-purple-700',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <Card noPadding>
            <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-neutral-800">Acompanhamento de Processos Judiciais</h2>
                <p className="text-sm text-neutral-500 mt-1">Visualize o status dos processos conduzidos pelo escritório.</p>
            </div>
            {judicialProcesses.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nº do Processo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Última Atualização</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {judicialProcesses.map(process => (
                                <tr key={process.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{process.studentName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">{process.processNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusChip(process.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {formatDate(process.lastUpdate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <div className="text-center p-12">
                    <p className="text-neutral-500">Nenhum processo judicial em andamento.</p>
                </div>
            )}
        </Card>
    );
};

export default SchoolJudicialProcesses;
