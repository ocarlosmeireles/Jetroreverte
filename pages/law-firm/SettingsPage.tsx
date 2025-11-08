
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DEFAULT_COMMISSION_PERCENTAGE } from '../../constants';
import { CameraIcon, UserCircleIcon, SparklesIcon, GoogleDriveIcon, CheckCircleIcon } from '../../components/common/icons';
import { User } from '../../types';
import { db } from '../../services/firebase';
import { writeBatch, doc } from 'firebase/firestore';
import {
    demoSchools,
    demoGuardians,
    demoStudents,
    demoInvoices,
    demoSubscriptions,
    demoSaasInvoices,
    demoNotifications,
    demoNegotiationAttempts,
    demoPetitions
} from '../../services/demoData';


const SettingsPage = (): React.ReactElement => {
    const { user, updateUserContext } = useAuth();
    
    const [profile, setProfile] = useState({
        name: '',
        officeName: '',
        officeAddress: '',
        officePhone: '',
        oabNumber: '',
    });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [officeLogo, setOfficeLogo] = useState<string | null>(null);

    const [commission, setCommission] = useState<string>(() => {
        const saved = localStorage.getItem('commissionPercentage');
        return saved || String(DEFAULT_COMMISSION_PERCENTAGE);
    });
    
    const [isDriveConnected, setIsDriveConnected] = useState(localStorage.getItem('driveConnected') === 'true');

    const [isProfileSaved, setIsProfileSaved] = useState(false);
    const [isCommissionSaved, setIsCommissionSaved] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState('');

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                officeName: user.officeName || '',
                officeAddress: user.officeAddress || '',
                officePhone: user.officePhone || '',
                oabNumber: user.oabNumber || '',
            });
            setProfilePicture(user.profilePictureUrl || null);
            setOfficeLogo(user.officeLogoUrl || null);
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'profile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setOfficeLogo(reader.result as string);
                } else {
                    setProfilePicture(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        const dataToUpdate: Partial<User> = {
            ...profile,
            officeLogoUrl: officeLogo,
            profilePictureUrl: profilePicture,
        };

        await updateUserContext(dataToUpdate);
        setIsProfileSaved(true);
        setTimeout(() => setIsProfileSaved(false), 4000);
    };

    const handleSaveCommission = () => {
        localStorage.setItem('commissionPercentage', commission);
        setIsCommissionSaved(true);
        setTimeout(() => setIsCommissionSaved(false), 3000);
    };

    const handleDriveConnect = () => {
        // In a real app, this would trigger the OAuth flow.
        // For this demo, we'll just simulate the connection.
        localStorage.setItem('driveConnected', 'true');
        setIsDriveConnected(true);
    };

    const handleDriveDisconnect = () => {
        localStorage.removeItem('driveConnected');
        setIsDriveConnected(false);
    };

    const handleSeedDatabase = async () => {
        if (!window.confirm("Isso irá sobrescrever os dados existentes nas coleções de demonstração com os dados do arquivo 'demoData.ts'. Deseja continuar?")) {
            return;
        }
        
        setIsSeeding(true);
        setSeedMessage('Iniciando o processo...');
        
        try {
            const batch = writeBatch(db);
    
            setSeedMessage('Adicionando escolas...');
            demoSchools.forEach(item => {
                const docRef = doc(db, "schools", item.id);
                batch.set(docRef, item);
            });
    
            setSeedMessage('Adicionando responsáveis...');
            demoGuardians.forEach(item => {
                const docRef = doc(db, "guardians", item.id);
                batch.set(docRef, item);
            });
    
            setSeedMessage('Adicionando alunos...');
            demoStudents.forEach(item => {
                const docRef = doc(db, "students", item.id);
                batch.set(docRef, item);
            });
    
            setSeedMessage('Adicionando cobranças...');
            demoInvoices.forEach(item => {
                const docRef = doc(db, "invoices", item.id);
                batch.set(docRef, item);
            });
    
            setSeedMessage('Adicionando assinaturas SaaS...');
            demoSubscriptions.forEach(item => {
                const docRef = doc(db, "subscriptions", item.id);
                batch.set(docRef, item);
            });
            
            setSeedMessage('Adicionando faturas SaaS...');
            demoSaasInvoices.forEach(item => {
                const docRef = doc(db, "saasInvoices", item.id);
                batch.set(docRef, item);
            });
            
            setSeedMessage('Adicionando notificações...');
            demoNotifications.forEach(item => {
                const docRef = doc(db, "notifications", item.id);
                batch.set(docRef, item);
            });
            
            setSeedMessage('Adicionando tentativas de negociação...');
            demoNegotiationAttempts.forEach(item => {
                const docRef = doc(db, "negotiationAttempts", item.id);
                batch.set(docRef, item);
            });
            
            setSeedMessage('Adicionando petições...');
            demoPetitions.forEach(item => {
                const docRef = doc(db, "petitions", item.id);
                batch.set(docRef, item);
            });
    
            setSeedMessage('Enviando dados para o Firebase...');
            await batch.commit();
    
            setSeedMessage('Banco de dados populado com sucesso!');
            alert('Banco de dados populado com sucesso! Recarregue a página para ver os dados atualizados.');
    
        } catch (error: any) {
            console.error("Error seeding database:", error);
            setSeedMessage(`Erro ao popular o banco: ${error.message}`);
            alert(`Ocorreu um erro: ${error.message}. Verifique o console e a configuração do seu Firebase em 'services/firebase.ts'.`);
        } finally {
            setIsSeeding(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition bg-neutral-50";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-6">Perfil do Escritório</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Image Uploads */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="text-center">
                            <label className="text-sm font-medium text-neutral-700 block mb-2">Sua Foto</label>
                            <div className="relative w-32 h-32 mx-auto">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Foto do perfil" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                                ) : (
                                    <UserCircleIcon className="w-32 h-32 text-neutral-300" />
                                )}
                                <label htmlFor="profilePictureInput" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-neutral-100 transition-colors">
                                    <CameraIcon className="w-5 h-5 text-neutral-600" />
                                    <input id="profilePictureInput" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                                </label>
                            </div>
                        </div>
                         <div className="text-center">
                            <label className="text-sm font-medium text-neutral-700 block mb-2">Logo do Escritório</label>
                            <div className="relative w-48 h-24 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                                {officeLogo ? (
                                    <img src={officeLogo} alt="Logo do escritório" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-neutral-400 text-sm">Seu Logo</span>
                                )}
                                <label htmlFor="officeLogoInput" className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-neutral-100 transition-colors">
                                    <CameraIcon className="w-5 h-5 text-neutral-600" />
                                    <input id="officeLogoInput" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="form-label">Nome do Escritório</label>
                            <input type="text" name="officeName" value={profile.officeName} onChange={handleProfileChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="form-label">Seu Nome</label>
                            <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className={inputStyle} />
                        </div>
                         <div>
                            <label className="form-label">Email</label>
                            <input type="email" value={user?.email || ''} readOnly className={`${inputStyle} bg-neutral-200/50 cursor-not-allowed`} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="form-label">Endereço do Escritório</label>
                            <input type="text" name="officeAddress" value={profile.officeAddress} onChange={handleProfileChange} className={inputStyle} />
                        </div>
                         <div>
                            <label className="form-label">Telefone</label>
                            <input type="tel" name="officePhone" value={profile.officePhone} onChange={handleProfileChange} className={inputStyle} />
                        </div>
                        <div>
                            <label className="form-label">Nº OAB</label>
                            <input type="text" name="oabNumber" value={profile.oabNumber} onChange={handleProfileChange} className={inputStyle} />
                        </div>
                    </div>
                </div>
                 <div className="mt-6 pt-6 border-t flex items-center gap-4">
                    <Button onClick={handleSaveProfile}>Salvar Perfil</Button>
                    {isProfileSaved && (
                        <p className="text-sm text-green-600 animate-fade-in">
                            Perfil atualizado.
                        </p>
                    )}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Configuração de Comissão</h2>
                <div className="max-w-xs">
                    <label htmlFor="commission" className="form-label">Percentual de Comissão (%)</label>
                    <div className="relative">
                        <input type="number" id="commission" value={commission} onChange={(e) => setCommission(e.target.value)} className="w-full pl-4 pr-12 py-2 border border-neutral-300 rounded-full shadow-sm focus:ring-primary-500 focus:border-primary-500 transition" placeholder="Ex: 10" min="0" max="100" step="0.1" />
                         <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-neutral-500 sm:text-sm">%</span></div>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                    <Button onClick={handleSaveCommission} disabled={!commission}>Salvar Comissão</Button>
                    {isCommissionSaved && <p className="text-sm text-green-600 animate-fade-in">Configuração salva com sucesso!</p>}
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Integrações</h2>
                <div className="bg-neutral-50 p-4 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GoogleDriveIcon className="w-8 h-8"/>
                        <div>
                            <h3 className="font-semibold text-neutral-800">Google Drive</h3>
                            <p className="text-sm text-neutral-500">Salve cópias de documentos gerados (petições, acordos) automaticamente.</p>
                        </div>
                    </div>
                    {isDriveConnected ? (
                        <div className="text-right">
                             <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                <CheckCircleIcon className="w-5 h-5"/>
                                <span>Conectado</span>
                            </div>
                            <button onClick={handleDriveDisconnect} className="text-xs text-red-500 hover:underline mt-1">Desconectar</button>
                        </div>
                    ) : (
                        <Button onClick={handleDriveConnect}>Conectar</Button>
                    )}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-4">Ações de Desenvolvimento</h2>
                <div className="flex items-center gap-4">
                    <Button onClick={handleSeedDatabase} isLoading={isSeeding} variant="secondary" icon={<SparklesIcon/>}>
                        {isSeeding ? 'Processando...' : 'Popular com Dados de Exemplo'}
                    </Button>
                </div>
                 {seedMessage && (
                    <p className={`text-sm mt-4 animate-fade-in ${seedMessage.includes('sucesso') ? 'text-green-600' : seedMessage.includes('Erro') ? 'text-red-600' : 'text-neutral-600'}`}>
                        {seedMessage}
                    </p>
                )}
            </Card>
            <style>{`.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }`}</style>
        </div>
    );
};

export default SettingsPage;