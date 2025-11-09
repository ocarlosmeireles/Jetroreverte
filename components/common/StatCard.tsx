import React, { ReactNode } from 'react';
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

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 260, damping: 20, delay }
        },
    };

    return (
        <motion.div
            className="bg-white p-4 rounded-xl shadow-soft border border-neutral-200/60 flex items-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            <div className={`p-3 rounded-full ${colorClasses[color].bg}`}>
                {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorClasses[color].iconText}` })}
            </div>
            <div className="ml-4">
                <p className="text-sm text-neutral-500">{title}</p>
                <p className="text-2xl font-bold text-neutral-800">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;