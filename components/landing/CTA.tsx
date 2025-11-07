
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

interface CTAProps {
    onRegister: () => void;
}

const CTA = ({ onRegister }: CTAProps) => {
    return (
        <section className="py-20 sm:py-28 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, amount: 0.5 }} 
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                        Pronto para revolucionar sua cobrança educacional?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">
                        Junte-se às escolas e escritórios que já estão transformando a inadimplência em eficiência e receita.
                    </p>
                    <div className="mt-10 flex justify-center">
                        <Button onClick={onRegister} size="lg">
                            Crie sua conta e comece agora
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default CTA;
