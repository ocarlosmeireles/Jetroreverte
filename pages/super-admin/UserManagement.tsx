import React, { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Card from '../../components/common/Card';
import { allDemoUsers } from '../../services/superAdminDemoData';
import { UserRole } from '../../types';
import Button from '../../components/common/Button';

const listVariants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.05 } },
  hidden: { opacity: 0 },
};

const itemVariants: Variants = {
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hidden: { opacity: 0, y: 20 },
};

const UserManagement = (): React.ReactElement => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

    const filteredUsers = useMemo(() => {
        return allDemoUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [searchTerm, roleFilter]);

    const getRoleChip = (role: UserRole) => {
        const styles = {
            [UserRole.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
            [UserRole.ESCRITORIO]: 'bg-blue-100 text-blue-800',
            [UserRole.ESCOLA]: 'bg-green-100 text-green-800',
            [UserRole.RESPONSAVEL]: 'bg-yellow-100 text-yellow-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[role]}`}>{role.replace('_', ' ')}</span>;
    };
    
    return (
        <Card noPadding>
            <div className="p-4 sm:p-6 border-b border-neutral-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/2 lg:w-1/3 px-4 py-2 border border-neutral-300 rounded-full shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                        className="w-full sm:w-auto px-4 py-2 border border-neutral-300 rounded-full shadow-sm focus:ring-primary-500 focus:border-primary-500 transition bg-white"
                    >
                        <option value="ALL">Todos os Perfis</option>
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Perfil</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Escola / Escritório</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <motion.tbody 
                        className="bg-white divide-y divide-neutral-200"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredUsers.map((user) => (
                            <motion.tr key={user.id} variants={itemVariants} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                                    <div className="text-sm text-neutral-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRoleChip(user.role)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.officeName || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => alert(`Editando usuário: ${user.name}`)}>Editar</Button>
                                    <Button size="sm" variant="danger" onClick={() => alert(`Desativando usuário: ${user.name}`)}>Desativar</Button>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-neutral-500">
                        Nenhum usuário encontrado.
                    </div>
                )}
            </div>
        </Card>
    );
};

export default UserManagement;
