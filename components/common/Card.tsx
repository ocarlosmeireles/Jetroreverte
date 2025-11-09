


import React, { ReactNode } from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';

interface CardProps {
    children?: ReactNode;
    className?: string;
    noPadding?: boolean;
    delay?: number;
}

const Card = ({ children, className = '', noPadding = false, delay = 0 }: CardProps): React.ReactElement => {
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
            className={`bg-white rounded-xl shadow-soft border border-neutral-200/60 transition-shadow duration-300 hover:shadow-soft-hover ${!noPadding && 'p-6'} ${className}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
};

export default Card;