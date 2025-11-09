


import React, { ReactNode } from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    color: 'primary' | 'secondary' | 'red' | 'green';
    delay?: number;
}

const StatCard = ({ title, value, icon, color, delay = 0 }: StatCardProps): React.ReactElement => {
    const colorClasses = {
        primary: { iconText: 'text-primary-600', bg: 'bg-primary-50' },
        secondary: { iconText: 'text-secondary-600', bg: 'bg-secondary-100' },
        red: { iconText: 'text-red-600', bg: 'bg-red-50' },
        green: { iconText: 'text-green-600', bg: 'bg-green-50' },
    };
    
    // FIX: Explicitly type cardVariants with the Variants type.
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay
            }
        },
    };

    return (
        <motion.div
            className="bg-white p-5 rounded-xl shadow-soft border border-neutral-200/60 transition-all duration-300 hover:shadow-soft-hover hover:-translate-y-1"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
             <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-600 truncate">{title}</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900 truncate">{value}</p>
                </div>
                <div className={`flex-shrink-0 p-3 rounded-full ${colorClasses[color].bg}`}>
                    {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorClasses[color].iconText}` })}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;