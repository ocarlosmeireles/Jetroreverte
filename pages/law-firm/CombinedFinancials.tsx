import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { demoSaasInvoices, demoSchools, demoInvoices, demoStudents } from '../../services/demoData';
import { DollarIcon } from '../../components/common/icons';
import { InvoiceStatus, Invoice } from '../../types';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_USERS } from '../../constants';

const listVariants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.05 } },
  hidden: { opacity: 0 },
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface CombinedFinancialsProps {
    onSelectSchool: (schoolId: string) => void;
}

const CombinedFinancials = ({ onSelectSchool }: CombinedFinancialsProps): React.ReactElement => {
    const { user } = useAuth();
    
    // --- Scoped Data ---
    const { scopedInvoices } = useMemo(() => {
        if (!user || user.email !== DEMO_USERS.ESCRITORIO.email) {
            return { scopedInvoices: [] };
        }

        const officeSchools = demoSchools.filter(s => s.officeId === user.id);
        const officeSchoolIds = new Set(officeSchools.map(s => s.id));
        const invoices = demoInvoices.filter(i => officeSchoolIds.has(i.schoolId));

        return { scopedInvoices: invoices };
    }, [user]);

    const EditableCommissionCell = ({ value, onSave }: { value: number; onSave: (newValue: number) => void }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [currentValue, setCurrentValue] = useState(String(value.toFixed(2)));
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, [isEditing]);
        
        const handleSave = () => {
            const numericValue = parseFloat(currentValue);
            if (!isNaN(numericValue)) {
                onSave(numericValue);
            }
            setIsEditing(false);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSave();
            } else if (e.key === 'Escape') {
                setCurrentValue(String(value.toFixed(2)));
                setIsEditing(false);
            }
        };

        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-24 px-2 py-1 border border-primary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm text-right"
                    step="0.01"
                />
            );
        }

        return (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer font-semibold text-green-700 hover:bg-green-50 p-1 rounded-md transition-colors w-24 text-right">
                {formatCurrency(value)}
            </div>
        );
    };

    // --- Law Firm Commission Financials Data ---
    const commissionPercentage = parseFloat(localStorage.getItem('commissionPercentage') || String(DEFAULT_COMMISSION_PERCENTAGE));
    
    const [successfulCollections, setSuccessfulCollections] = useState<(Invoice & { schoolName?: string, schoolId?: string, commission: number })[]>([]);
    
    useEffect(() => {
        const collections = scopedInvoices
            .filter(i => i.status === InvoiceStatus.PAGO)
            .map(invoice => {
                const student = demoStudents.find(s => s.id === invoice.studentId);
                const school = demoSchools.find(s => s.id === student?.schoolId);
                const commission = invoice.commission ?? invoice.value * (commissionPercentage / 100);
                return {
                    ...invoice,
                    schoolName: school?.name || 'N/A',
                    schoolId: school?.id,
                    commission,
                };
            });
        setSuccessfulCollections(collections);
    }, [scopedInvoices, commissionPercentage]);
    
    const handleUpdateCommission = (invoiceId: string, newCommission: number) => {
        setSuccessfulCollections(prevCollections =>
            prevCollections.map(c =>
                c.id === invoiceId ? { ...c, commission: newCommission } : c
            )
        );
    };

    const recoveredThisMonth = successfulCollections
        .filter(i => new Date(i.dueDate).getMonth() === new Date().getMonth())
        .reduce((sum, inv) => sum + inv.value, 0);
        
    const commissionThisMonth = successfulCollections
        .filter(i => new Date(i.dueDate).getMonth() === new Date().getMonth())
        .reduce((sum, inv) => sum + inv.commission, 0);
        
    const totalRecovered = successfulCollections.reduce((sum, inv) => sum + inv.value, 0);

    return (
        <div className="space-y-8">
            <section>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total Recuperado (Mês)" value={formatCurrency(recoveredThisMonth)} icon={<DollarIcon />} color="green" delay={0.1} />
                    <StatCard title="Comissão (Mês)" value={formatCurrency(commissionThisMonth)} icon={<DollarIcon />} color="primary" delay={0.2} />
                    <StatCard title="Total Recuperado (Geral)" value={formatCurrency(totalRecovered)} icon={<DollarIcon />} color="secondary" delay={0.3} />
                </div>
                <Card noPadding>
                    <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-neutral-800">Histórico de Cobranças Pagas</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                           <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data Pgto.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aluno</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor Pago</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Comissão</th>
                            </tr>
                        </thead>
                        <motion.tbody className="bg-white divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                           {successfulCollections.map((collection) => (
                                <motion.tr key={collection.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(collection.dueDate)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{collection.schoolName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{collection.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 text-right">{formatCurrency(collection.value)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex justify-end">
                                            <EditableCommissionCell
                                                value={collection.commission}
                                                onSave={(newValue) => handleUpdateCommission(collection.id, newValue)}
                                            />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                        </table>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default CombinedFinancials;