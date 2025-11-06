
import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Switch from '../../components/common/Switch';
import { PLANS } from '../../constants';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircleIcon } from '../../components/common/icons';

const SaasSettings = (): React.ReactElement => {
    // Local state to manage feature toggles for demonstration
    const [features, setFeatures] = useState({
        aiPetition: true,
        automatedCollection: true,
        paymentGateway: false,
    });
    
    const [announcement, setAnnouncement] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    const handleToggle = (feature: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
        // FIX: The type checker can infer `keyof` to include symbols, which cannot be implicitly
        // converted to strings in template literals. Explicitly converting to a string resolves this.
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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <h2 className="text-xl font-bold text-neutral-800 mb-6">Gerenciamento de Planos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PLANS.map(plan => (
                        <div key={plan.id} className="p-6 border rounded-lg bg-neutral-50">
                            <h3 className="text-lg font-bold text-neutral-800">{plan.name}</h3>
                            <p className="text-3xl font-extrabold text-primary-600 mt-2">{formatCurrency(plan.price.monthly)}<span className="text-base font-medium text-neutral-500">/mês</span></p>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="secondary" className="w-full mt-6">Editar Plano</Button>
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
    );
};

export default SaasSettings;
