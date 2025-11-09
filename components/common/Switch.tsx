

import React from 'react';
// FIX: Import Transition type from framer-motion
import { motion, Transition } from 'framer-motion';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

const Switch = ({ checked, onChange, label }: SwitchProps): React.ReactElement => {
    // FIX: Add Transition type to resolve framer-motion type error.
    const spring: Transition = {
        type: "spring",
        stiffness: 700,
        damping: 30
    };

    return (
        <label className="flex items-center cursor-pointer">
            <div
                className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-600' : 'bg-neutral-300'}`}
                onClick={() => onChange(!checked)}
            >
                <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    layout
                    transition={spring}
                    style={{ x: checked ? '100%' : '0%' }}
                />
            </div>
            {label && <span className="ml-3 text-sm font-medium text-neutral-700">{label}</span>}
        </label>
    );
};

export default Switch;