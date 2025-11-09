

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { DEMO_USERS } from '../../constants';
import { XIcon } from '../common/icons';

interface LoginModalProps {
    onClose: () => void;
    onSwitchToReset: () => void;
    onSwitchToRegister: () => void;
}

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
};

const LoginModal = ({ onClose, onSwitchToReset, onSwitchToRegister }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(email, password);
            if (!user) {
                 setError('Credenciais inválidas. Verifique e tente novamente.');
            } else {
                onClose(); // Close modal on successful login
            }
        } catch (err: any) {
             const friendlyMessage = err.code === 'auth/invalid-credential' 
                ? 'Credenciais inválidas. Verifique e tente novamente.'
                : 'Ocorreu um erro ao