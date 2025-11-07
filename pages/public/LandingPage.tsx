
import React from 'react';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import Solutions from '../../components/landing/Solutions';
import Features from '../../components/landing/Features';
import Testimonials from '../../components/landing/Testimonials';
import Footer from '../../components/landing/Footer';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const LandingPage = ({ onLogin, onRegister }: LandingPageProps): React.ReactElement => {
    return (
        <div className="bg-white">
            <Header onLogin={onLogin} onRegister={onRegister} />

            <main>
                <Hero onLogin={onLogin} onRegister={onRegister} />
                <Solutions />
                <Features />
                <Testimonials />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
