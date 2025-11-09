
import React from 'react';
import { motion, Transition } from 'framer-motion';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Switch = ({ checked, onChange }: SwitchProps): React.ReactElement => {
    const spring: Transition = {
        type: "spring",
        stiffness: 700,
        damping: 30
    };

    return (
        <div
            className={`flex items-center w-12 h-6 p-1 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${checked ? 'bg-primary-600 justify-end' : 'bg-neutral-200 justify-start'}`}
            onClick={() => onChange(!checked)}
        >
            <motion.div
                layout
                transition={spring}
                className="w-4 h-4 bg-white rounded-full shadow"
            />
        </div>
    );
};
