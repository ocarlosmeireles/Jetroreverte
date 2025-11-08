import React from 'react';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import Solutions from '../../components/landing/Solutions';
import Features from '../../components/landing/Features';
import Testimonials from '../../components/landing/Testimonials';
import Footer from '../../components/landing/Footer';
import HowItWorks from '../../components/landing/HowItWorks';
import CTA from '../../components/landing/CTA';
import TrustedBy from '../../components/landing/TrustedBy';
import Stats from '../../components/landing/Stats';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const LandingPage = ({ onLogin, onRegister }: LandingPageProps): React.ReactElement => {
    return (
        <div className="bg-white">
            <Header onLogin={onLogin} onRegister={onRegister} />

            <main>
                <Hero onRegister={onRegister} onLogin={onLogin} />
                <TrustedBy />
                <Solutions />
                <HowItWorks />
                <Stats />
                <Features />
                <Testimonials />
                <CTA onRegister={onRegister} />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;