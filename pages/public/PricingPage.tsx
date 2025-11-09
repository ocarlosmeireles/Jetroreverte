import React from 'react';
import { motion, Variants } from 'framer-motion';
import { PLANS } from '../../constants';
import PlanCard from '../../components/billing/PlanCard';
import { ArrowLeftIcon } from '../../components/common/icons';

interface PricingPageProps {
    onBackToLogin: () => void;
}

const PricingPage = ({ onBackToLogin }: PricingPageProps): React.ReactElement => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    // FIX: Explicitly type itemVariants with the Variants type.
    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <motion.div
            className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto">
                 <motion.div variants={itemVariants} className="mb-12">
                    <button onClick={onBackToLogin} className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para o login
                    </button>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                    <h1 className="text-xl font-extrabold tracking-tight text-neutral-800">Jetro Reverte</h1>
                    <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl mt-4">
                        Planos que se adaptam à sua escola
                    </h2>
                    <p className="mt-4 text-xl text-neutral-600 max-w-2xl mx-auto">
                        Escolha o plano ideal para automatizar suas cobranças e focar no que realmente importa: a educação.
                    </p>
                </motion.div>

                <motion.div className="mt-16 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none" variants={containerVariants}>
                    {PLANS.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} isFeatured={plan.id === 'pro'} />
                    ))}
                </motion.div>
                
                <motion.div variants={itemVariants} className="mt-16 text-center">
                     <h3 className="text-2xl font-bold text-neutral-800">Precisa de mais?</h3>
                     <p className="mt-2 text-neutral-600">
                        Oferecemos planos Enterprise com funcionalidades personalizadas. <a href="#" className="font-semibold text-primary-600 hover:text-primary-800">Fale conosco</a>.
                    </p>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default PricingPage;