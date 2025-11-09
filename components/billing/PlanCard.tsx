

import React from 'react';
import { motion } from 'framer-motion';
import { Plan } from '../../types';
import Button from '../common/Button';
import { CheckCircleIcon } from '../common/icons';

interface PlanCardProps {
    plan: Plan;
    isFeatured?: boolean;
}

const PlanCard = ({ plan, isFeatured = false }: PlanCardProps): React.ReactElement => {
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={cardVariants}
            className={`rounded-3xl border ${isFeatured ? 'border-primary-500 shadow-2xl shadow-primary-500/20 bg-white' : 'border-neutral-200 bg-white'} p-8 flex flex-col`}
        >
            {isFeatured && (
                <div className="text-center">
                    <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full uppercase mb-4">Mais Popular</span>
                </div>
            )}
            <h3 className="text-2xl font-bold text-neutral-800 text-center">{plan.name}</h3>
            <p className="text-neutral-500 text-center mt-2 h-10">{plan.id === 'pro' ? 'Para escolas que buscam crescimento.' : 'Ideal para escolas começando a se organizar.'}</p>
            <div className="mt-6 text-center">
                <span className="text-5xl font-extrabold text-neutral-900">R${plan.price.monthly}</span>
                <span className="text-lg font-medium text-neutral-500">/mês</span>
            </div>
            <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-neutral-600">{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-8">
                 <Button variant={isFeatured ? 'primary' : 'secondary'} className="w-full" size="lg">
                    Começar com o plano {plan.name}
                </Button>
            </div>
        </motion.div>
    );
};

export default PlanCard;