import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { demoInvoices, demoNegotiationAttempts, demoStudents } from '../../services/demoData';
import { InvoiceStatus, NegotiationAttempt } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
};

const SchoolNegotiations = (): React.ReactElement => {
    const { user } = useAuth();

    const negotiationCases = useMemo(() => {
        if (!user?.schoolId) return [];

        // Find invoices for the school that are in negotiation or have an agreement
        const schoolInvoices = demoInvoices.filter(i =>
            i.schoolId === user.schoolId &&
            (i.collectionStage === 'EM_NEGOCIACAO' || i.collectionStage === 'ACORDO_FEITO')
        );

        return schoolInvoices.map(invoice => {
            const attempts = demoNegotiationAttempts
                .filter(a => a.invoiceId === invoice.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                invoice,
                student: demoStudents.find(s => s.id === invoice.studentId),
                lastAttempt: attempts[0]
            };
        }).sort((a,b) => new Date(b.invoice.dueDate).getTime() - new Date(a.invoice.dueDate).getTime());
    }, [user]);

    const getStatusInfo = (invoice: typeof demoInvoices[0]) => {
        if (invoice.agreement?.isApproved) {
            return { text: 'Acordo Aprovado', color: 'bg-green-100 text-green-700' };
        }
        if (invoice.agreement) {
            return { text: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-700' };
        }
        if (invoice.collectionStage === 'EM_NEGOCIACAO') {
            return { text: 'Em Negociação', color: 'bg-blue-100 text-blue-700' };
        }
        return { text: 'N/A', color: 'bg-gray-100 text-gray-700' };
    };

    return (
        <Card noPadding>
            <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-neutral-800">Acompanhamento de Negociações</h2>
                <p className="text-sm text-neutral-500 mt-1">Veja o status das negociações conduzidas pelo escritório.</p>
            </div>
            {negotiationCases.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor do Débito</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Última Atividade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {negotiationCases.map(({ invoice, student, lastAttempt }) => {
                                const status = getStatusInfo(invoice);
                                return (
                                <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{student?.name || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(invoice.value)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {lastAttempt ? `${formatDate(lastAttempt.date)} (${getRelativeTime(lastAttempt.date)})` : 'N/A'}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-12">
                    <p className="text-neutral-500">Nenhuma negociação ativa no momento.</p>
                </div>
            )}
        </Card>
    );
};

export default SchoolNegotiations;