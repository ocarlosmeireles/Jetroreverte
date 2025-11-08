import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

const easeOutCubic = (t: number): number => (--t) * t * t + 1;

export const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        let animationFrameId: number;

        const animateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);
            
            const easedPercentage = easeOutCubic(percentage);
            const currentValue = easedPercentage * end;
            
            setCount(Math.floor(currentValue));

            if (percentage < 1) {
                animationFrameId = requestAnimationFrame(animateCount);
            } else {
                // Garante que o valor final seja exato
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animateCount);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isInView, end, duration]);

    return <span ref={ref}>{count.toLocaleString('pt-BR')}</span>;
};
