import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';

interface PagePlaceholderProps {
    icon: React.ReactNode;
    title: string;
    message: string;
}

const PagePlaceholder = ({ icon, title, message }: PagePlaceholderProps): React.ReactElement => {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <Card className="max-w-md w-full text-center p-8">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    {icon}
                </motion.div>
                <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
                <p className="mt-2 text-neutral-600">
                    {message}
                </p>
            </Card>
        </div>
    );
};

export default PagePlaceholder;