
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Campaign } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, PencilIcon, TrashIcon } from '../common/icons';
import CampaignModal from './CampaignModal';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CampaignsListProps {
    campaigns: Campaign[];
    onAdd: () => void;
    onEdit: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
}

const getStatusChip = (status: Campaign['status']) => {
    const styles: Record<Campaign['status'], string> = {
        'Ativa': 'bg-green-100 text-green-700',
        'Concluída': 'bg-blue-100 text-blue-700',
        'Planejada': 'bg-yellow-100 text-yellow-700'
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const CampaignsList = ({ campaigns, onAdd, onEdit, onDelete }: CampaignsListProps) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-neutral-800">Campanhas de Marketing</h3>
                <Button onClick={onAdd} size="sm" icon={<PlusIcon />}>Nova Campanha</Button>
            </div>

            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                         <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="flex flex-col h-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-neutral-800">{campaign.name}</h4>
                                        <p className="text-xs text-neutral-500 mt-1">Início: {formatDate(campaign.startDate)}</p>
                                    </div>
                                    {getStatusChip(campaign.status)}
                                </div>
                                <p className="text-sm text-neutral-600 mt-3 flex-grow">
                                    <strong>Alvo:</strong> {campaign.target}
                                </p>
                                <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-neutral-500">Leads</p>
                                        <p className="font-bold text-lg text-neutral-800">{campaign.leadsGenerated}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Conversão</p>
                                        <p className="font-bold text-lg text-neutral-800">{campaign.conversionRate?.toFixed(1) ?? 0}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Valor Gerado</p>
                                        <p className="font-bold text-lg text-green-700">{formatCurrency(campaign.valueGenerated ?? 0)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-end gap-2">
                                    <Button size="sm" variant="secondary" icon={<PencilIcon className="w-4 h-4" />} onClick={() => onEdit(campaign)}>Editar</Button>
                                    <Button size="sm" variant="secondary" icon={<TrashIcon className="w-4 h-4" />} onClick={() => onDelete(campaign.id)} className="!text-red-600 hover:!bg-red-50">Excluir</Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-neutral-500">Nenhuma campanha cadastrada ainda.</p>
                    <Button onClick={onAdd} className="mt-4">Criar Primeira Campanha</Button>
                </div>
            )}
        </div>
    );
};

export default CampaignsList;