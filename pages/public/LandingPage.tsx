
import React from 'react';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import Solutions from '../../components/landing/Solutions';
import Features from '../../components/landing/Features';
import Testimonials from '../../components/landing/Testimonials';
import Footer from '../../components/landing/Footer';
import HowItWorks from '../../components/landing/HowItWorks';
import CTA from '../../components/landing/CTA';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const LandingPage = ({ onLogin, onRegister }: LandingPageProps): React.ReactElement => {
    return (
        <div className="bg-white">
            <Header onLogin={onLogin} onRegister={onRegister} />

            <main>
                <Hero onRegister={onRegister} />
                <Solutions />
                <HowItWorks />
                <Features />
                <Testimonials />
                <CTA onRegister={onRegister} />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
