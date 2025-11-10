import React from 'react';

const Logo = ({ className }: { className?: string }) => (
    <div className={`flex items-center ${className}`}>
        <span className="text-2xl font-extrabold tracking-tight text-primary-600">
            Jetro<span className="text-secondary-500"> Reverte</span>
        </span>
    </div>
);

export default Logo;
