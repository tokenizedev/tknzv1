import { Code, Terminal } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LoaderProps {
    isSidebar?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ isSidebar = false }) => {
    const [dots, setDots] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        // Start the dots animation
        const interval = setInterval(() => {
            setDots(prev => (prev + 1) % 4);
        }, 350);
        
        // Trigger the appearance animation
        setIsVisible(true);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Placeholder fixed header to match App component */}
            <header className="fixed top-0 left-0 right-0 z-20 nav-placeholder nav-animated nav-glow">
                <div className="border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm">
                    <div className="flex items-center h-14">
                        {/* Empty placeholder matching the layout of the actual header */}
                        <div className="px-5 flex-none">
                            <h1 className="leaderboard-title text-2xl tracking-widest opacity-0">TKNZ</h1>
                        </div>
                        <div className="ml-auto flex h-full">
                            <div className="border-l border-r border-cyber-green/20 px-4 flex items-center opacity-0"></div>
                            <div className="flex h-full opacity-0"></div>
                        </div>
                    </div>
                </div>
                {/* Empty wallet drawer placeholder to reserve space */}
                <div className="h-0 overflow-hidden border-b border-cyber-green/20 bg-cyber-black/80 backdrop-blur-md opacity-0"></div>
            </header>
            
            <main className="overflow-auto px-4 relative" style={{ height: '100%' }}>
                {/* Main loading container */}
                <div 
                    className={`flex flex-col items-center justify-center h-full relative overflow-hidden opacity-0 ${isVisible ? 'animate-fade-scale-in' : ''}`}
                >
                    {/* Grid overlay for cyberpunk effect */}
                    <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(60,1fr)] opacity-20 pointer-events-none">
                        {Array.from({ length: 60 }).map((_, rowIndex) => (
                            React.createElement(
                                React.Fragment, 
                                { key: `row-${rowIndex}` },
                                Array.from({ length: 40 }).map((_, colIndex) => (
                                    <div key={`${rowIndex}-${colIndex}`} className="border-[0.5px] border-cyber-green/10"></div>
                                ))
                            )
                        ))}
                    </div>
                    
                    {/* Main loading container */}
                    <div className="relative z-10 flex flex-col items-center gap-6 opacity-0 animate-fade-in-delayed">
                        {/* Logo */}
                        <div className="text-cyber-green font-bold text-4xl font-terminal tracking-widest mb-2">TKNZ</div>
                        
                        {/* Animated loading ring */}
                        <div className="relative">
                            <div className="w-24 h-24 border-2 border-cyber-purple/50 rounded-full animate-spin-slow relative flex items-center justify-center">
                                <div className="w-20 h-20 border-2 border-cyber-green/70 rounded-full animate-spin-reverse-slow"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyber-purple rounded-full"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyber-green rounded-full"></div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyber-pink rounded-full"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyber-purple rounded-full"></div>
                            </div>
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Terminal className="w-8 h-8 text-cyber-green animate-pulse" />
                            </div>
                        </div>
                        
                        {/* Text information */}
                        <div className="text-center space-y-3">
                            <div className="text-cyber-green text-lg font-terminal tracking-widest animate-pulse">
                                INITIALIZING{'.'.repeat(dots)}
                            </div>
                            <div className="text-cyber-purple/70 text-xs font-terminal">
                                SYS://ESTABLISHING_CONNECTION
                            </div>
                        </div>
                        
                        {/* Simulated code lines */}
                        <div className="mt-6 text-xs font-terminal text-cyber-green/60 max-w-xs">
                            <div className="animate-typing overflow-hidden whitespace-nowrap">LOADING_WALLET_MODULE...</div>
                            <div className="animate-typing-delay-1 overflow-hidden whitespace-nowrap">SYNCING_BLOCKCHAIN_DATA...</div>
                            <div className="animate-typing-delay-2 overflow-hidden whitespace-nowrap">PREPARING_ASSETS...</div>
                        </div>
                    </div>
                    
                    {/* Decorative corner elements */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyber-green/40"></div>
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyber-green/40"></div>
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyber-green/40"></div>
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyber-green/40"></div>
                </div>
            </main>
        </>
    );
};