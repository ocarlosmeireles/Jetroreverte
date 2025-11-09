import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusIcon } from '../../components/common/icons';
import AddStudentModal from '../../components/school/AddStudentModal';
import { Student, Guardian } from '../../types';
import { demoStudents, demoGuardians } from '../../services/demoData';

const listVariants: Variants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.05 } },
  hidden: { opacity: 0 },
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

interface StudentsListProps {
    onSelectStudent: (studentId: string) => void;
}

const StudentsList = ({ onSelectStudent }: StudentsListProps): React.ReactElement => {
    const { user } = useAuth();
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = () => {
        const schoolId = user?.schoolId || 'school-01'; // Fallback for demo
        setLoading(true);
        setError(null);
        try {
            setStudents(demoStudents.filter(s => s.schoolId === schoolId));
            setGuardians(demoGuardians.filter(g => g.schoolId === schoolId));
        } catch (err) {
            console.error(err);
            setError("Falha ao carregar os dados. Tente recarregar a página.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSaveStudent = (data: any) => {
        alert("A adição de alunos está desabilitada nesta versão sem banco de dados. Os dados são apenas de demonstração.");
        setIsAddStudentModalOpen(false);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <svg className="animate-spin mx-auto h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-2 text-neutral-600">Carregando alunos...</p>
                </div>
            );
        }

        if (error) {
            return <div className="text-center py-12 text-red-600">{error}</div>;
        }

        return (
            <>
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-neutral-200 hidden md:table">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome do Aluno</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Turma</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Responsável</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody className="bg-white divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                        {students.map((student) => (
                            <motion.tr key={student.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{student.class}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{student.guardianName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button
                                        onClick={() => onSelectStudent(student.id)}
                                        className="text-primary-600 hover:text-primary-900 font-medium"
                                    >
                                        Detalhes
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden">
                    <motion.div className="divide-y divide-neutral-200" variants={listVariants} initial="hidden" animate="visible">
                        {students.map(student => (
                            <motion.div key={student.id} variants={itemVariants} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-neutral-800">{student.name}</p>
                                        <p className="text-sm text-neutral-500">Turma: {student.class}</p>
                                        <p className="text-sm text-neutral-500">Responsável: {student.guardianName}</p>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => onSelectStudent(student.id)}>
                                        Detalhes
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </>
        );
    };

    return (
        <>
            <Card noPadding>
                <div className="p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Alunos Inadimplentes</h2>
                    <Button onClick={() => setIsAddStudentModalOpen(true)} icon={<PlusIcon />} size="sm" className="sm:size-md">Adicionar</Button>
                </div>
                {renderContent()}
            </Card>
            <AddStudentModal
                isOpen={isAddStudentModalOpen}
                onClose={() => setIsAddStudentModalOpen(false)}
                onSave={handleSaveStudent}
                existingGuardians={guardians}
            />
        </>
    );
};

export default StudentsList;