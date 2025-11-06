import { User, UserRole } from '../types';
import { DEMO_USERS } from '../constants';
import { demoSchools, demoGuardians } from './demoData';

export const allDemoUsers: (User & { status: 'Ativo' | 'Inativo' })[] = [
    // Super Admin
    {
        id: 'user-superadmin-01',
        name: 'Super Admin',
        email: DEMO_USERS.SUPER_ADMIN.email,
        role: UserRole.SUPER_ADMIN,
        status: 'Ativo',
    },
    // Law Firm
    {
        id: 'user-escritorio-01',
        name: 'Dr. Ricardo Borges',
        email: DEMO_USERS.ESCRITORIO.email,
        role: UserRole.ESCRITORIO,
        officeName: 'Jetro Reverte Advocacia',
        status: 'Ativo',
    },
    // School Admins (simulated)
    ...demoSchools.map((school, index) => ({
        id: `user-escola-${index + 1}`,
        name: `Admin ${school.name}`,
        email: `admin@${school.name.toLowerCase().replace(/\s/g, '')}.com`,
        role: UserRole.ESCOLA,
        schoolId: school.id,
        officeName: school.name,
        status: 'Ativo' as 'Ativo' | 'Inativo',
    })),
    // Guardians
    ...demoGuardians.map((guardian, index) => ({
        id: `user-guardian-${index + 1}`,
        name: guardian.name,
        email: guardian.email,
        role: UserRole.RESPONSAVEL,
        schoolId: guardian.schoolId,
        officeName: demoSchools.find(s => s.id === guardian.schoolId)?.name,
        status: 'Ativo' as 'Ativo' | 'Inativo',
    })),
];
