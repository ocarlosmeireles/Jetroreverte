
import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Switch from '../../components/common/Switch';
import { PLANS } from '../../constants';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircleIcon } from '../../components/common/icons';
import { Plan } from '../../types';
import PlanEditModal from '../../components/super-admin/PlanEditModal';

const SaasSettings = (): React.ReactElement => {
    const [plans, setPlans] = useState<Plan[]>(PLANS);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const [features, setFeatures] = useState({
        aiPetition: true,
        automatedCollection: true,
        paymentGateway: false,
    });
    
    const [announcement, setAnnouncement] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    const handleToggle = (feature: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
        console.log(`Toggled ${String(feature)} to ${!features[feature]}`);
    };
    
    const handlePublish = () => {
        if (!announcement) return;
        setIsPublished(true);
        console.log("Publishing announcement:", announcement);
        setTimeout(() => {
            setIsPublished(false);
            setAnnouncement('');
        }, 3000);
    };

    const handleSavePlan = (updatedPlan: Plan) => {
        setPlans(currentPlans => currentPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        setEditingPlan(null);
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <h2 className="text-xl font-bold text-neutral-800 mb-6">Gerenciamento de Planos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="p-6 border-2 rounded-xl bg-neutral-50 flex flex-col">
                                <h3 className="text-lg font-bold text-neutral-800">{plan.name}</h3>
                                <p className="text-3xl font-extrabold text-primary-600 mt-2">{formatCurrency(plan.price.monthly)}<span className="text-base font-medium text-neutral-500">/mês</span></p>
                                <p className="text-sm font-medium text-neutral-600 mt-2">
                                    Limite: <span className="font-bold">{plan.studentLimit ? `${plan.studentLimit} alunos` : 'Ilimitado'}</span>
                                </p>
                                <ul className="mt-4 space-y-2 text-sm text-neutral-600 flex-grow">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start">
                                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="secondary" className="w-full mt-6" onClick={() => setEditingPlan(plan)}>Editar Plano</Button>
                            </div>
                        ))}
                    </div>
                </Card>
    
                <Card>
                    <h2 className="text-xl font-bold text-neutral-800 mb-6">Módulos da Plataforma (Feature Toggles)</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-neutral-800">Geração de Petições com IA</h3>
                                <p className="text-sm text-neutral-500">Permite que escritórios gerem petições iniciais automaticamente.</p>
                            </div>
                            <Switch checked={features.aiPetition} onChange={() => handleToggle('aiPetition')} />
                        </div>
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-neutral-800">Régua de Cobrança Automatizada</h3>
                                <p className="text-sm text-neutral-500">Habilita o envio automático de lembretes e notificações de cobrança.</p>
                            </div>
                            <Switch checked={features.automatedCollection} onChange={() => handleToggle('automatedCollection')} />
                        </div>
                         <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-neutral-800">Integração com Gateway de Pagamento</h3>
                                <p className="text-sm text-neutral-500">Permite que responsáveis paguem diretamente pela plataforma (Módulo Pro).</p>
                            </div>
                            <Switch checked={features.paymentGateway} onChange={() => handleToggle('paymentGateway')} />
                        </div>
                    </div>
                </Card>
                
                <Card>
                    <h2 className="text-xl font-bold text-neutral-800 mb-4">Anúncios Globais</h2>
                    <p className="text-sm text-neutral-600 mb-4">Envie uma mensagem que aparecerá como um banner para todos os usuários logados.</p>
                     <textarea 
                        value={announcement}
                        onChange={e => setAnnouncement(e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Ex: A plataforma estará em manutenção no próximo domingo das 02:00 às 03:00."
                    />
                    <div className="mt-4 flex items-center gap-4">
                        <Button onClick={handlePublish} disabled={!announcement || isPublished}>
                            {isPublished ? 'Publicado!' : 'Publicar Anúncio'}
                        </Button>
                         {isPublished && <p className="text-sm text-green-600 animate-fade-in">O anúncio está ativo.</p>}
                    </div>
                </Card>
            </div>
            {editingPlan && (
                <PlanEditModal
                    isOpen={!!editingPlan}
                    onClose={() => setEditingPlan(null)}
                    onSave={handleSavePlan}
                    plan={editingPlan}
                />
            )}
        </>
    );
};

export default SaasSettings;
