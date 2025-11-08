import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
    const logos = [
        "Colégio Alfa",
        "Grupo Educacional Beta",
        "Instituto Ômega",
        "Advocacia & Consultoria Reis",
        "Gama Advocacia",
    ];

    return (
        <div className="bg-white py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-center text-base font-semibold text-neutral-500 tracking-wider">
                        COM A CONFIANÇA DE INSTITUIÇÕES E ESCRITÓRIOS EM TODO O PAÍS
                    </h2>
                    <div className="mt-8 flow-root">
                         <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 lg:gap-x-16">
                            {logos.map((name, i) => (
                                <span key={name} className="text-lg font-semibold text-neutral-400 grayscale hover:grayscale-0 transition duration-300">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TrustedBy;