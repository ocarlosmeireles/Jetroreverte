
import React from 'react';
import { demoGuardians, demoStudents, demoInvoices } from '../../services/demoData';
import { Guardian, Student, Invoice, InvoiceStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, EnvelopeIcon } from '../../components/common/icons';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

interface GuardianDetailProps {
    guardianId: string;
    onBack: () => void;
    onSelectStudent: (studentId: string) => void;
}

const GuardianDetail = ({ guardianId, onBack, onSelectStudent }: GuardianDetailProps): React.ReactElement => {
    const { sendPasswordResetEmail } = useAuth();
    const guardian = demoGuardians.find(g => g.id === guardianId);
    const students = demoStudents.filter(s => s.guardianId === guardianId);
    const studentIds = students.map(s => s.id);
    const invoices = demoInvoices.filter(i => studentIds.includes(i.studentId));

    if (!guardian) {
        return (
            <Card>
                <p>Responsável não encontrado.</p>
                <Button onClick={onBack} className="mt-4">Voltar</Button>
            </Card>
        );
    }
    
    const totalDue = invoices.filter(i => i.status !== InvoiceStatus.PAGO).reduce((acc, i) => acc + i.value, 0);
    const totalPaid = invoices.filter(i => i.status === InvoiceStatus.PAGO).reduce((acc, i) => acc + i.value, 0);

    const handleSendInvite = async () => {
        if (!guardian.email) {
            alert("Este responsável não possui um e-mail cadastrado.");
            return;
        }
        try {
            // This Firebase function sends a "password reset" email. If the user doesn't exist in Auth,
            // it effectively acts as a "set your password" link, which is perfect for our invite flow.
            await sendPasswordResetEmail(guardian.email);
            alert(`Um e-mail de convite foi enviado para ${guardian.email}. O responsável poderá criar sua senha e acessar o portal.`);
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Button onClick={onBack} variant="secondary" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                    Voltar para a lista
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-xl font-bold text-neutral-800">{guardian.name}</h3>
                        <p className="text-neutral-600 mt-2 break-all">{guardian.email}</p>
                        <p className="text-neutral-600">{guardian.phone}</p>
                        {guardian.cpf && <p className="text-sm text-neutral-500 mt-1">CPF: {guardian.cpf}</p>}
                        <div className="mt-4 pt-4 border-t">
                            <Button
                                onClick={handleSendInvite}
                                variant="primary"
                                className="w-full"
                                icon={<EnvelopeIcon className="w-5 h-5"/>}
                            >
                                Enviar Convite de Acesso
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Resumo Financeiro</h3>
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Total Pago:</span>
                                <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-600">Total em Aberto:</span>
                                <span className="font-bold text-red-600">{formatCurrency(totalDue)}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Alunos Vinculados ({students.length})</h2>
                        <ul className="divide-y divide-neutral-200">
                           {students.map(student => (
                               <li key={student.id} className="py-3 flex justify-between items-center">
                                   <div>
                                       <p className="font-medium text-neutral-800">{student.name}</p>
                                       <p className="text-sm text-neutral-500">Turma: {student.class}</p>
                                   </div>
                                   <Button size="sm" variant="secondary" onClick={() => onSelectStudent(student.id)}>
                                       Ver Detalhes
                                   </Button>
                               </li>
                           ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default GuardianDetail;