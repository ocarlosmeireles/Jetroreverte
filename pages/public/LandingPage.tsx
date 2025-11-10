import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import TrustedBy from '../../components/landing/TrustedBy';
import Solutions from '../../components/landing/Solutions';
import Features from '../../components/landing/Features';
import Stats from '../../components/landing/Stats';
import Testimonials from '../../components/landing/Testimonials';
import CTA from '../../components/landing/CTA';
import Footer from '../../components/landing/Footer';
import AuthPortal from '../../components/auth/AuthPortal';
import { XIcon } from '../../components/common/icons';
import HowItWorks from '../../components/landing/HowItWorks';
import WhatsNew from '../../components/landing/WhatsNew';

type AuthView = 'login' | 'register' | null;

const LandingPage = () => {
    const [authView, setAuthView] = useState<AuthView>(null);
    const [landingSections, setLandingSections] = useState<{ id: string, name: string, visible: boolean }[]>([]);

    useEffect(() => {
        try {
            const savedSectionsRaw = localStorage.getItem('landingPageSections');
            const defaultSections = [
                { id: 'trustedBy', name: 'TrustedBy', visible: true },
                { id: 'whatsNew', name: 'WhatsNew', visible: true },
                { id: 'solutions', name: 'Solutions', visible: true },
                { id: 'howItWorks', name: 'HowItWorks', visible: true },
                { id: 'stats', name: 'Stats', visible: true },
                { id: 'features', name: 'Features', visible: true },
                { id: 'testimonials', name: 'Testimonials', visible: true },
                { id: 'cta', name: 'CTA', visible: true },
            ];
            
            if (savedSectionsRaw) {
                const savedSections = JSON.parse(savedSectionsRaw);
                // Basic validation to ensure it's a valid array
                if (Array.isArray(savedSections) && savedSections.length > 0) {
                     setLandingSections(savedSections);
                } else {
                    setLandingSections(defaultSections);
                }
            } else {
                setLandingSections(defaultSections);
            }
        } catch (error) {
            console.error("Failed to parse landing sections from localStorage:", error);
            // Fallback to default if parsing fails
            const defaultSections = [
                { id: 'trustedBy', name: 'TrustedBy', visible: true },
                { id: 'whatsNew', name: 'WhatsNew', visible: true },
                { id: 'solutions', name: 'Solutions', visible: true },
                { id: 'howItWorks', name: 'HowItWorks', visible: true },
                { id: 'stats', name: 'Stats', visible: true },
                { id: 'features', name: 'Features', visible: true },
                { id: 'testimonials', name: 'Testimonials', visible: true },
                { id: 'cta', name: 'CTA', visible: true },
            ];
            setLandingSections(defaultSections);
        }
    }, []);
    
    const sectionMap: { [key: string]: React.ComponentType<any> } = {
        trustedBy: TrustedBy,
        whatsNew: WhatsNew,
        solutions: Solutions,
        howItWorks: HowItWorks,
        features: Features,
        stats: Stats,
        testimonials: Testimonials,
        cta: () => <CTA onRegister={() => setAuthView('register')} />,
    };

    return (
        <div className="bg-neutral-50">
            <Header onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />
            <main>
                <Hero onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />
                
                {landingSections.map(section => {
                    const Component = sectionMap[section.id];
                    return section.visible && Component ? <Component key={section.id} /> : null;
                })}

            </main>
            <Footer />

            <AnimatePresence>
                {authView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-neutral-50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                           <AuthPortal initialView={authView} />
                           <button 
                                onClick={() => setAuthView(null)} 
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
                                aria-label="Close authentication"
                           >
                               <XIcon className="w-6 h-6 text-neutral-700" />
                           </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;