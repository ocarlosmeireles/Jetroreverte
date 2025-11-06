

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
        primary: { iconText: 'text-primary-600', bg: 'bg-primary-100', glow: 'hover:shadow-glow-primary' },
        secondary: { iconText: 'text-secondary-600', bg: 'bg-secondary-100', glow: 'hover:shadow-glow-secondary' },
        red: { iconText: 'text-red-600', bg: 'bg-red-100', glow: 'hover:shadow-glow-red' },
        green: { iconText: 'text-green-600', bg: 'bg-green-100', glow: 'hover:shadow-glow-green' },
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
            className={`relative p-6 rounded-2xl overflow-hidden bg-white border border-neutral-200/80 shadow-soft transition-all duration-300 ${colorClasses[color].glow}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.2 } }}
        >
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-500">{title}</p>
                    <p className="text-3xl font-bold mt-1 text-neutral-800">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color].bg} ${colorClasses[color].iconText}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;