import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { User, UserRole, School } from '../../types';
import { XIcon } from '../common/icons';
import Button from '../common/Button';
import { NAVIGATION } from '../../constants';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User;
    allSchools: School[];
}

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const UserEditModal = ({ isOpen, onClose, onSave, user, allSchools }: UserEditModalProps): React.ReactElement => {
    const [formData, setFormData] = useState<User>(user);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // When a new user is passed in, update the form data
        // Also ensure modulePermissions is an array
        setFormData({ ...user, modulePermissions: user.modulePermissions || NAVIGATION[user.role]?.map(nav => nav.path) || [] });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        // When role changes, reset permissions to all available for the new role
        const defaultPermissions = NAVIGATION[newRole]?.map(nav => nav.path) || [];
        setFormData(prev => ({
            ...prev,
            role: newRole,
            modulePermissions: defaultPermissions,
        }));
    };
    
    const handlePermissionChange = (path: string, isChecked: boolean) => {
        setFormData(prev => {
            const currentPermissions = prev.modulePermissions || [];
            if (isChecked) {
                // Add permission if it's not already there
                return { ...prev, modulePermissions: [...new Set([...currentPermissions, path])] };
            } else {
                // Remove permission
                return { ...prev, modulePermissions: currentPermissions.filter(p => p !== path) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onSave(formData);
            setIsLoading(false);
        }, 500);
    };

    const availableModules = NAVIGATION[formData.role] || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Editar Usuário</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-6">
                            
                            <section>
                                <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">Dados do Usuário</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="form-label">Nome</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Email</label>
                                        <input type="email" value={formData.email} readOnly className="w-full form-input bg-neutral-100 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="form-label">Perfil (Role)</label>
                                        <select name="role" id="role" value={formData.role} onChange={handleRoleChange} className="w-full form-input">
                                            {Object.values(UserRole).map(role => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                    {(formData.role === UserRole.ESCOLA || formData.role === UserRole.RESPONSAVEL) && (
                                        <div>
                                            <label htmlFor="schoolId" className="form-label">Associar à Escola</label>
                                            <select name="schoolId" id="schoolId" value={formData.schoolId || ''} onChange={handleChange} className="w-full form-input">
                                                <option value="">Nenhuma</option>
                                                {allSchools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {availableModules.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-primary-700 mb-4 border-b pb-2">Módulos Acessíveis</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-neutral-50">
                                        {availableModules.map(navItem => (
                                            <label key={navItem.path} className="flex items-center space-x-2 text-sm text-neutral-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.modulePermissions?.includes(navItem.path) ?? false}
                                                    onChange={e => handlePermissionChange(navItem.path, e.target.checked)}
                                                    className="form-checkbox h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                />
                                                <span>{navItem.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            )}
                            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.25rem; } .form-input { border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.65rem 1rem; transition: all 0.2s; background-color: #f8fafc; } .form-input:focus { ring: 2px; border-color: #4f46e5; box-shadow: 0 0 0 2px #c7d2fe; } .form-checkbox { color: #4f46e5; } .form-checkbox:focus { ring: #4f46e5; }`}</style>
                        </form>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" onClick={handleSubmit} isLoading={isLoading}>Salvar Alterações</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserEditModal;
